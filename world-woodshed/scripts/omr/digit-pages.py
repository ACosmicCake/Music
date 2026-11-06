"""Pages of time-signature and tuplet digits in common bold text fonts, for scripts/omr/train-digits.mjs.

Scores from Finale, Sibelius and older engraving software print their time signatures and tuplet numbers in
fonts unlike the SMuFL fonts make-pages.py engraves with (Finale's Maestro digits look like a bold Times).
Each page has staves with stacked time signatures (each digit from a line to the middle line, as printed)
and small italic tuplet numbers above them, and a JSON file with where every digit is.

    python3 scripts/omr/digit-pages.py OUT_DIR

Needs Pillow and the fonts below (any missing one is skipped)."""
import json, os, random, sys
from PIL import Image, ImageDraw, ImageFont

OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)
FONTS = '/usr/share/fonts/truetype/'
TIME_FONTS = ['liberation/LiberationSerif-Bold.ttf', 'dejavu/DejaVuSerif-Bold.ttf', 'freefont/FreeSerifBold.ttf',
              'crosextra/Caladea-Bold.ttf', 'liberation/LiberationSans-Bold.ttf', 'freefont/FreeSansBold.ttf']
TUP_FONTS = ['liberation/LiberationSerif-BoldItalic.ttf', 'freefont/FreeSerifBoldItalic.ttf', 'crosextra/Caladea-BoldItalic.ttf',
             'liberation/LiberationSerif-Italic.ttf' if os.path.exists(FONTS + 'liberation/LiberationSerif-Italic.ttf') else 'liberation/LiberationSerif-BoldItalic.ttf']
SP = 20  # staff space in pixels, as prepare() scales a page to


def glyph(font_path, ch, height):
    """The digit drawn black on white, cropped to its ink and scaled to `height` pixels tall"""
    f = ImageFont.truetype(font_path, 200)
    im = Image.new('L', (300, 300), 255)
    ImageDraw.Draw(im).text((50, 20), ch, font=f, fill=0)
    box = Image.eval(im, lambda v: 255 - v).getbbox()
    g = im.crop(box)
    w = max(1, round(g.width * height / g.height))
    return g.resize((w, round(height)), Image.LANCZOS)


rng = random.Random(3)
page = 0
for fi, fp in enumerate(TIME_FONTS):
    if not os.path.exists(FONTS + fp):
        continue
    for rep in range(4):
        W, H = 2400, 1400
        im = Image.new('L', (W, H), 255)
        dr = ImageDraw.Draw(im)
        items = []
        for row in range(5):
            top = 120 + row * 250
            lt = rng.choice([2, 3])
            for i in range(5):
                dr.rectangle([60, top + i * SP, W - 60, top + i * SP + lt - 1], fill=0)
            x = 120
            for k in range(10):
                num = rng.choice('123456789') if k else '1234567890'[row * 2 + rep] if row * 2 + rep < 10 else '4'
                den = rng.choice('2448816')
                hh = SP * 2 * rng.uniform(0.92, 1.04)
                gw = 0
                for ch, y0 in ((num, top), (den, top + 2 * SP)):
                    g = glyph(FONTS + fp, ch, hh)
                    # (from just inside the lines to just over them: where a digit meets a line, the line's
                    # piece over it stays when the lines are taken out, and can close a 6 at the top)
                    yy = round(y0 + (2 * SP - hh) / 2 + lt / 2 + rng.uniform(-0.12, 0.12) * SP)
                    im.paste(0, (x, yy), Image.eval(g, lambda v: 255 - v))
                    items.append({'kind': 'time', 'd': ch, 'x0': x, 'x1': x + g.width - 1, 'y0': yy, 'y1': yy + g.height - 1})
                    gw = max(gw, g.width)
                # a tuplet number above the staff, in an italic font
                tf = FONTS + TUP_FONTS[(fi + k + rep) % len(TUP_FONTS)]
                if os.path.exists(tf):
                    t = rng.choice('3335567')
                    th = SP * rng.uniform(0.75, 1.05)
                    g = glyph(tf, t, th)
                    ty = top - SP * rng.uniform(1.6, 2.6)
                    im.paste(0, (x + 60, round(ty)), Image.eval(g, lambda v: 255 - v))
                    items.append({'kind': 'tuplet', 'd': t, 'x0': x + 60, 'x1': x + 60 + g.width - 1, 'y0': round(ty), 'y1': round(ty) + g.height - 1})
                x += gw + 160
        name = os.path.join(OUT, 'digits-%02d' % page)
        im.save(name + '.pgm')
        json.dump({'font': fp, 'items': items}, open(name + '.json', 'w'))
        page += 1
print(page, 'pages')
