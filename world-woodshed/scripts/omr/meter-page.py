"""The test page for a time that changes from bar to bar (test/omr.test.js): drawn notes on two staves, time
signatures in a bold text font (as Finale and Sibelius print them) before bars of 4/4, 5/4 and 7/4, a courtesy
4/4 after the last bar line, a triplet under an italic 3 with its bracket, and a sharp that a flag runs into.

    python3 scripts/omr/meter-page.py test/fixtures/omr/meter

Writes OUT.pgm.gz and OUT.json. Needs Pillow and Liberation Serif."""
import gzip, sys
from PIL import Image, ImageDraw, ImageFont

OUT = sys.argv[1]
SP, W, H = 20, 1800, 520
FONT = '/usr/share/fonts/truetype/liberation/LiberationSerif-'
im = Image.new('L', (W, H), 255)
dr = ImageDraw.Draw(im)


def glyph(font, ch, height):
    f = ImageFont.truetype(FONT + font + '.ttf', 200)
    g = Image.new('L', (300, 300), 255)
    ImageDraw.Draw(g).text((50, 20), ch, font=f, fill=0)
    g = g.crop(Image.eval(g, lambda v: 255 - v).getbbox())
    return g.resize((max(1, round(g.width * height / g.height)), round(height)), Image.LANCZOS)


def paste(g, x, y):
    im.paste(0, (round(x), round(y)), Image.eval(g, lambda v: 255 - v))
    return g.width


def staff(top):
    for i in range(5):
        dr.rectangle([60, top + i * SP, W - 60, top + i * SP + 1], fill=0)


def time(top, x, num, den):
    w = 0
    for ch, y0 in ((num, top), (den, top + 2 * SP)):
        w = max(w, paste(glyph('Bold', ch, SP * 1.95), x, y0 + 1))
    return x + w


def y_of(top, pos):
    return top + 4 * SP - pos * SP / 2


def note(top, x, pos, up=True, flag=False):
    y = y_of(top, pos)
    dr.ellipse([x - 12, y - 9, x + 12, y + 9], fill=0)
    if up:
        dr.rectangle([x + 10, y - 70, x + 12, y], fill=0)
        if flag:  # a flag curling down to the right from the stem's top
            for k in range(36):
                dr.ellipse([x + 11 + k * 0.7 - 3, y - 70 + k * 1.1 - 3, x + 11 + k * 0.7 + 3, y - 70 + k * 1.1 + 3], fill=0)
    else:
        dr.rectangle([x - 12, y, x - 10, y + 70], fill=0)


def bar(top, x):
    dr.rectangle([x, top, x + 2, top + 4 * SP + 1], fill=0)


def sharp(top, x, pos):
    y = y_of(top, pos)
    dr.rectangle([x - 5, y - 26, x - 4, y + 30], fill=0)
    dr.rectangle([x + 4, y - 30, x + 5, y + 26], fill=0)
    for dy in (-8, 8):
        dr.polygon([(x - 10, y + dy + 2), (x + 10, y + dy - 4), (x + 10, y + dy + 1), (x - 10, y + dy + 7)], fill=0)


# staff 1: 4/4 | 5/4 | 7/4 with a triplet | and a courtesy 4/4 at the end
t = 100
staff(t)
x = time(t, 90, '4', '4') + 40
for p in (4, 5, 6, 5):
    note(t, x, p); x += 60
bar(t, x - 20); x = time(t, x, '5', '4') + 40
for p in (2, 3, 4, 5, 6):
    note(t, x, p); x += 60
bar(t, x - 20); x = time(t, x, '7', '4') + 40
first = x
for p in (6, 7, 8):  # three quarters in the time of two, under a 3 and its bracket
    note(t, x, p, up=False); x += 60
last = x - 60
by = t - 2.2 * SP
dr.rectangle([first - 12, by, first - 11, by + 8], fill=0)
dr.rectangle([first - 12, by, (first + last) / 2 - 14, by + 1], fill=0)
dr.rectangle([(first + last) / 2 + 14, by, last + 12, by + 1], fill=0)
dr.rectangle([last + 11, by, last + 12, by + 8], fill=0)
paste(glyph('BoldItalic', '3', SP * 0.95), (first + last) / 2 - 7, by - 9)
for p in (4, 3, 2, 1, 0):
    note(t, x, p); x += 60
bar(t, x - 20)
time(t, x, '4', '4')

# staff 2: 4/4 with an eighth whose flag runs into the next note's sharp, then 3/4
t = 330
staff(t)
x = time(t, 90, '4', '4') + 40
note(t, x, 2, flag=True)
sharp(t, x + 40, 3)
note(t, x + 74, 3, flag=True)
x += 134
for p in (4, 5, 6):
    note(t, x, p); x += 60
bar(t, x - 20); x = time(t, x, '3', '4') + 40
for p in (3, 3, 4):
    note(t, x, p); x += 60
bar(t, x - 20)

with gzip.open(OUT + '.pgm.gz', 'wb') as f:
    f.write(b'P5\n%d %d\n255\n' % (W, H) + im.tobytes())
with open(OUT + '.json', 'w') as f:
    f.write('{ "meta": { "times": ["4/4", "5/4", "7/4", "4/4", "3/4"], "made": "scripts/omr/meter-page.py" } }\n')
