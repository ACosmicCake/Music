#!/usr/bin/env python3
"""Test pages for score recognition (src/omr/): random scores written as MusicXML, engraved with Verovio
in one of its SMuFL fonts, and saved as grey images, with a second image that colours every glyph by what
it is (for training the symbol classifier) and the notes as JSON (for measuring accuracy).

    pip install verovio cairosvg pillow numpy scipy
    python3 scripts/omr/make-pages.py OUT_DIR COUNT [--seed N] [--photo] [--hand] [--marks]

--photo makes each page look photographed (turned, bent, blurred, uneven light, JPEG); --hand makes it
look hand-copied (the Petaluma font, every glyph nudged, wobbly lines). --marks adds ties between repeated
notes and repeat signs around a few bars (in the JSON as tieStart per note and meta.repeats). Nothing here
ships with the app.
"""
import io, json, os, random, re, sys
import numpy as np
from PIL import Image, ImageFilter
import verovio, cairosvg

FONTS = ['Bravura', 'Leland', 'Leipzig', 'Gootville', 'Petaluma']
# SMuFL code → classifier class
GLYPH_CLASS = {
    'E050': 'clefG', 'E052': 'clefG', 'E053': 'clefG', 'E062': 'clefF', 'E05C': 'clefC',
    'E262': 'sharp', 'E260': 'flat', 'E261': 'natural', 'E263': 'dsharp', 'E264': 'dflat',
    'E4E3': 'restW', 'E4E4': 'restH', 'E4E5': 'rest4', 'E4E6': 'rest8', 'E4E7': 'rest16', 'E4E8': 'rest32',
    'E08A': 'common', 'E08B': 'cut',
    'E1E7': 'dot',
}
for d in range(10): GLYPH_CLASS['E08%X' % d] = 't%d' % d
NOTE_GLYPHS = {'E0A2', 'E0A3', 'E0A4', 'E240', 'E241', 'E242', 'E243', 'E244', 'E245', 'E246', 'E247'}
CLASSES = sorted(set(GLYPH_CLASS.values())) + ['note']

STEPS = 'CDEFGAB'; PC = [0, 2, 4, 5, 7, 9, 11]
SHARPS = 'FCGDAEB'; FLATS = 'BEADGCF'

def key_alters(fifths):
    a = {s: 0 for s in STEPS}
    for i in range(abs(fifths)):
        a[(SHARPS if fifths > 0 else FLATS)[i]] = 1 if fifths > 0 else -1
    return a

def midi_of(step, alter, octave): return (octave + 1) * 12 + PC[STEPS.index(step)] + alter

TYPES = {48: ('whole', 0), 36: ('half', 1), 24: ('half', 0), 18: ('quarter', 1), 12: ('quarter', 0), 9: ('eighth', 1), 6: ('eighth', 0), 3: ('16th', 0)}
DIV = 12

def beat_patterns(beat):
    """Ways to fill one beat (in divisions) with notes; each a list of lengths."""
    if beat == 12:
        return [[12], [12], [6, 6], [6, 6], [9, 3], [3, 3, 6], [6, 3, 3], [3, 3, 3, 3]]
    if beat == 18:
        return [[18], [12, 6], [6, 6, 6], [6, 6, 6], [9, 3, 6], [6, 12]]
    return [[beat]]

def make_score(rng, opts):
    time = rng.choice(['4/4', '4/4', '3/4', '2/4', '6/8', '2/2', '12/8', '3/8', '9/8', '5/4', '6/4', '3/2', '7/8', '5/8'])
    num, den = map(int, time.split('/'))
    compound = den == 8 and num % 3 == 0 and num > 3
    beat = 18 if compound else 48 // den * (1 if den != 2 else 1)
    if den == 2: beat = 24
    if time == '3/8': beat = 6
    bar = num * 48 // den
    fifths = rng.randint(-5, 5)
    grand = opts.get('grand', rng.random() < 0.2)
    staves = [('G', 2)] if not grand else [('G', 2), ('F', 4)]
    if not grand and rng.random() < 0.15: staves = [('F', 4)]
    n_bars = rng.randint(8, 20)
    alters = key_alters(fifths)
    gt = []
    parts_xml = []
    for si, (sign, line) in enumerate(staves):
        lo, hi = (midi_of('A', 0, 3), midi_of('C', 0, 6)) if sign == 'G' else (midi_of('E', 0, 2), midi_of('E', 0, 4))
        cur = (lo + hi) // 2
        meas = []
        for m in range(n_bars):
            events = []
            t = 0
            # whole bar note or rest sometimes
            if rng.random() < 0.08 and bar in TYPES:
                lens = [bar]
            else:
                lens = []
                b = beat if beat <= bar else bar
                while t < bar:
                    if beat == 24:  # cut time: half notes, or quarters / eighths in halves
                        pat = rng.choice([[24], [12, 12], [12, 6, 6], [6, 6, 12], [18, 6]])
                    elif rng.random() < 0.2 and t % (2 * beat) == 0 and t + 2 * beat <= bar and 2 * beat in TYPES:
                        pat = [2 * beat]
                    elif rng.random() < 0.08 and t % (2 * beat) == 0 and t + 3 * beat <= bar and 3 * beat in TYPES and not compound:
                        pat = [3 * beat]
                    else:
                        pat = rng.choice(beat_patterns(b))
                    lens += pat; t += sum(pat)
                t = 0
            ev_t = 0
            for L in lens:
                rest = rng.random() < 0.12
                ev = {'t': ev_t, 'len': L, 'rest': rest}
                if not rest:
                    cur = max(lo, min(hi, cur + rng.choice([-4, -3, -2, -1, -1, 1, 1, 2, 3, 4, 0])))
                    # snap to a scale step of the key, sometimes chromatic
                    letter_steps = []
                    for o in range(1, 8):
                        for s in STEPS:
                            letter_steps.append((midi_of(s, alters[s], o), s, alters[s], o))
                    base = min(letter_steps, key=lambda x: abs(x[0] - cur))
                    m0, s, a, o = base
                    if rng.random() < 0.1:
                        a2 = a + rng.choice([-1, 1])
                        if -1 <= a2 <= 1: a = a2
                    pitches = [(s, a, o)]
                    if rng.random() < 0.15:
                        # add a third and maybe a fifth above, in the key
                        si2 = STEPS.index(s)
                        for k in ([2] if rng.random() < 0.5 else [2, 4]):
                            j = si2 + k; oo = o + j // 7; ss = STEPS[j % 7]
                            pitches.append((ss, alters[ss], oo))
                    ev['pitches'] = pitches
                events.append(ev); ev_t += L
            meas.append(events)
        if opts.get('marks'):
            # ties: a note held on into the next one (same pitches), across a beat or a bar line
            flat = [e for ev in meas for e in ev]
            for a, b in zip(flat, flat[1:]):
                if not a['rest'] and not b['rest'] and not b.get('tieStop') and rng.random() < 0.14:
                    b['pitches'] = list(a['pitches']); a['tieStart'] = True; b['tieStop'] = True
        parts_xml.append(meas)
    repeats = []
    if opts.get('marks'):
        a = rng.randint(0, max(0, n_bars - 4)); b = min(n_bars - 1, a + rng.randint(1, 4))
        repeats.append([a, b])
        if b + 2 < n_bars - 1 and rng.random() < 0.5:
            c = rng.randint(b + 1, n_bars - 2); repeats.append([c, min(n_bars - 1, c + rng.randint(1, 3))])
    rep_start = {a for a, b in repeats}; rep_end = {b for a, b in repeats}
    # beams: eighths and shorter grouped within a beat
    def beam_groups(events):
        groups = []; cur = []
        for e in events:
            short = not e['rest'] and e['len'] < 12
            bstart = (e['t'] // beat) if beat else 0
            if short and cur and (cur[-1]['t'] // beat) == bstart:
                cur.append(e)
            else:
                if len(cur) > 1: groups.append(cur)
                cur = [e] if short else []
        if len(cur) > 1: groups.append(cur)
        return groups

    xml = ['<?xml version="1.0" encoding="UTF-8"?>', '<score-partwise version="3.1">', '<part-list><score-part id="P1"><part-name></part-name></score-part></part-list>', '<part id="P1">']
    for m in range(n_bars):
        xml.append('<measure number="%d">' % (m + 1))
        if m in rep_start and m > 0: xml.append('<barline location="left"><bar-style>heavy-light</bar-style><repeat direction="forward"/></barline>')
        if m == 0:
            xml.append('<attributes><divisions>%d</divisions><key><fifths>%d</fifths></key>' % (DIV, fifths))
            if time == '4/4' and rng.random() < 0.3: xml.append('<time symbol="common"><beats>4</beats><beat-type>4</beat-type></time>')
            elif time == '2/2' and rng.random() < 0.4: xml.append('<time symbol="cut"><beats>2</beats><beat-type>2</beat-type></time>')
            else: xml.append('<time><beats>%d</beats><beat-type>%d</beat-type></time>' % (num, den))
            xml.append('<staves>%d</staves>' % len(staves))
            for si, (sign, line) in enumerate(staves):
                xml.append('<clef number="%d"><sign>%s</sign><line>%d</line></clef>' % (si + 1, sign, line))
            xml.append('</attributes>')
        for si in range(len(staves)):
            if si: xml.append('<backup><duration>%d</duration></backup>' % bar)
            events = parts_xml[si][m]
            beams = {}
            for g in beam_groups(events):
                for i, e in enumerate(g):
                    b1 = 'begin' if i == 0 else 'end' if i == len(g) - 1 else 'continue'
                    bs = [(1, b1)]
                    if e['len'] <= 3:
                        prev = g[i - 1]['len'] <= 3 if i else False
                        nxt = g[i + 1]['len'] <= 3 if i < len(g) - 1 else False
                        bs.append((2, 'continue' if prev and nxt else 'begin' if nxt else 'end' if prev else ('forward hook' if i == 0 else 'backward hook')))
                    beams[id(e)] = bs
            state = dict(alters)
            for e in events:
                L = e['len']
                whole_bar = L == bar and bar not in (48,) and e['rest']
                typ, dots = TYPES.get(L, ('whole', 0)) if not whole_bar else ('whole', 0)
                gt.append({'staff': si, 'm': m, 't': e['t'] / DIV, 'len': L / DIV, 'rest': e['rest'],
                           'midi': [] if e['rest'] else sorted(midi_of(*p) for p in e['pitches']), 'tieStart': bool(e.get('tieStart'))})
                if e['rest']:
                    meas_attr = ' measure="yes"' if L == bar else ''
                    xml.append('<note><rest%s/><duration>%d</duration><voice>%d</voice>%s%s<staff>%d</staff></note>' % (
                        meas_attr, L, si + 1, '' if L == bar else '<type>%s</type>' % typ, '<dot/>' * dots if L != bar else '', si + 1))
                    continue
                for k, (s, a, o) in enumerate(e['pitches']):
                    acc = ''
                    if state.get((s, o), alters[s]) != a:
                        acc = '<accidental>%s</accidental>' % {1: 'sharp', -1: 'flat', 0: 'natural'}[a]
                        state[(s, o)] = a
                    bm = ''.join('<beam number="%d">%s</beam>' % b for b in beams.get(id(e), [])) if k == 0 else ''
                    tie = ('<tie type="stop"/>' if e.get('tieStop') else '') + ('<tie type="start"/>' if e.get('tieStart') else '')
                    tied = ('<tied type="stop"/>' if e.get('tieStop') else '') + ('<tied type="start"/>' if e.get('tieStart') else '')
                    xml.append('<note>%s<pitch><step>%s</step>%s<octave>%d</octave></pitch><duration>%d</duration>%s<voice>%d</voice><type>%s</type>%s%s<staff>%d</staff>%s%s</note>' % (
                        '<chord/>' if k else '', s, '<alter>%d</alter>' % a if a else '', o, L, tie, si + 1, typ, '<dot/>' * dots, acc, si + 1, bm,
                        '<notations>%s</notations>' % tied if tied else ''))
        if m in rep_end: xml.append('<barline location="right"><bar-style>light-heavy</bar-style><repeat direction="backward"/></barline>')
        xml.append('</measure>')
    xml += ['</part>', '</score-partwise>']
    meta = {'time': time, 'fifths': fifths, 'staves': [s for s, _ in staves], 'bars': n_bars, 'repeats': repeats}
    return '\n'.join(xml), gt, meta

def colour_svg(svg):
    """Each glyph filled with a colour naming its class; everything else stays black."""
    def rep(m):
        code = m.group(1)
        cls = 'note' if code in NOTE_GLYPHS else GLYPH_CLASS.get(code)
        if not cls: return m.group(0)
        k = CLASSES.index(cls)
        return '<use fill="rgb(%d,200,50)" xlink:href="#%s-' % (10 + k * 5, code)
    return re.sub(r'<use xlink:href="#([0-9A-F]{4})-', rep, svg)

def photo(img, rng):
    a = np.asarray(img, dtype=np.float32)
    h, w = a.shape
    # uneven light and a grey paper
    yy, xx = np.mgrid[0:h, 0:w]
    light = 0.75 + 0.25 * (np.cos((xx / w - rng.random()) * 2.5) * np.cos((yy / h - rng.random()) * 2.0))
    a = a * light * rng.uniform(0.8, 1.0) + rng.uniform(0, 20)
    a = np.clip(a + np.random.normal(0, rng.uniform(2, 8), a.shape), 0, 255)
    im = Image.fromarray(a.astype(np.uint8))
    im = im.rotate(rng.uniform(-3, 3), resample=Image.BICUBIC, expand=True, fillcolor=int(a.mean()))
    # a gentle bend: rows shifted by a smooth curve
    b = np.asarray(im, dtype=np.float32); h, w = b.shape
    amp = rng.uniform(0, 6)
    shift = (amp * np.sin(np.linspace(0, np.pi, w) * rng.uniform(0.5, 1.5))).astype(int)
    out = np.empty_like(b)
    for x in range(w): out[:, x] = np.roll(b[:, x], shift[x])
    im = Image.fromarray(out.astype(np.uint8)).filter(ImageFilter.GaussianBlur(rng.uniform(0.3, 1.2)))
    buf = io.BytesIO(); im.save(buf, 'JPEG', quality=rng.randint(45, 85)); buf.seek(0)
    return Image.open(buf).convert('L')

def hand(img, rng):
    from scipy.ndimage import gaussian_filter, map_coordinates
    a = np.asarray(img, dtype=np.float32); h, w = a.shape
    alpha, sigma = rng.uniform(8, 16), rng.uniform(10, 18)
    dx = gaussian_filter(np.random.uniform(-1, 1, (h, w)), sigma) * alpha * sigma / 3
    dy = gaussian_filter(np.random.uniform(-1, 1, (h, w)), sigma) * alpha * sigma / 3
    yy, xx = np.mgrid[0:h, 0:w]
    out = map_coordinates(a, [yy + dy, xx + dx], order=1, mode='nearest')
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))

def main():
    out, count = sys.argv[1], int(sys.argv[2])
    seed = int(sys.argv[sys.argv.index('--seed') + 1]) if '--seed' in sys.argv else 1
    rng = random.Random(seed); np.random.seed(seed)
    os.makedirs(out, exist_ok=True)
    for i in range(count):
        xml, gt, meta = make_score(rng, {'marks': '--marks' in sys.argv})
        font = 'Petaluma' if '--hand' in sys.argv else rng.choice(FONTS)
        tk = verovio.toolkit()
        tk.setOptions({'font': font, 'pageWidth': 2100, 'pageHeight': 8000, 'scale': 40, 'adjustPageHeight': True,
                       'footer': 'none', 'header': 'none', 'breaks': 'auto', 'spacingSystem': rng.randint(6, 14)})
        tk.loadData(xml)
        svg = tk.renderToSVG(1)
        width = rng.choice([2400, 2800, 3200]) if '--photo' in sys.argv or '--hand' in sys.argv else rng.choice([1100, 1300, 1500, 1700, 2000])
        g = Image.open(io.BytesIO(cairosvg.svg2png(bytestring=svg.encode(), background_color='white', output_width=width))).convert('L')
        col = Image.open(io.BytesIO(cairosvg.svg2png(bytestring=colour_svg(svg).encode(), background_color='white', output_width=width))).convert('RGB')
        name = '%s/p%03d' % (out, i)
        if '--hand' in sys.argv: g = hand(g, rng)
        if '--photo' in sys.argv: g = photo(g, rng)
        g.save(name + '.pgm')
        if '--photo' not in sys.argv and '--hand' not in sys.argv: col.save(name + '.label.ppm')
        with open(name + '.musicxml', 'w') as f: f.write(xml)
        n_pages = tk.getPageCount()
        meta.update({'font': font, 'width': width, 'pages': n_pages})
        with open(name + '.json', 'w') as f: json.dump({'meta': meta, 'notes': gt, 'classes': CLASSES}, f)
        print(name, font, meta['time'], meta['fifths'], meta['staves'], 'pages', n_pages)

if __name__ == '__main__':
    main()
