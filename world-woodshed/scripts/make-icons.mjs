// Renders the PNG app icons from public/icons/icon.svg with Playwright's Chromium.
// Run with `npm run icons` after changing the SVG.
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

const svg = readFileSync(new URL('../public/icons/icon.svg', import.meta.url), 'utf8');
// Maskable icons are cropped to a circle or squircle, so they get a full-bleed background
// and the mark shrinks into the safe zone.
const maskable = svg.replace(/rx="\d+"/, 'rx="0"').replace('<circle', '<g transform="translate(256 256) scale(.78) translate(-256 -256)"><circle').replace('</svg>', '</g></svg>');
const jobs = [
  ['icon-192.png', 192, svg], ['icon-512.png', 512, svg],
  ['icon-maskable-512.png', 512, maskable], ['apple-touch-icon.png', 180, maskable]
];
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const page = await browser.newPage();
for (const [name, size, src] of jobs) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<style>html,body{margin:0;background:transparent}svg{display:block;width:${size}px;height:${size}px}</style>${src}`);
  await page.screenshot({ path: new URL('../public/icons/' + name, import.meta.url).pathname, omitBackground: true });
}
await browser.close();
