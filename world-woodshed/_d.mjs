import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--autoplay-policy=no-user-gesture-required'] });
const p = await b.newPage();
await p.addInitScript(() => {
  window.__src = [];
  for (const k of ['createBufferSource', 'createOscillator']) {
    const orig = AudioContext.prototype[k];
    AudioContext.prototype[k] = function () {
      const s = orig.call(this), ctx = this, st = s.start.bind(s), sp = s.stop.bind(s);
      const rec = { k: k[6], f: 0 }; window.__src.push(rec);
      s.start = (w, ...r) => { rec.at = w; rec.f = s.frequency ? s.frequency.value : 0; return st(w, ...r); };
      s.addEventListener('ended', () => rec.end = ctx.currentTime);
      return s;
    };
  }
});
await p.goto('http://localhost:5173/');
await p.waitForTimeout(1500);
await p.evaluate(() => location.hash = '#train'); await p.waitForTimeout(800);
await p.getByText('Melodic dictation').first().click();
await p.getByRole('button', { name: 'Drone', exact: true }).first().click();
await p.waitForTimeout(300);
await p.evaluate(() => window.__src.length = 0);
await p.getByRole('button', { name: '▶ Play again' }).click();
await p.waitForTimeout(12000);
const r = await p.evaluate(() => window.__src.filter(x => x.at).map(x => [x.k, x.at.toFixed(2), x.end && x.end.toFixed(2), x.f.toFixed(0)].join(' ')));
console.log(r.join('\n'));
await b.close();
