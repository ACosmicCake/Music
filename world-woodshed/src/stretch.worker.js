/* World Woodshed — runs the time-stretch off the main thread */
import Stretch from './stretch.js';

self.onmessage = function (e) {
  const m = e.data;
  try {
    const res = Stretch.process(m.channels, m.sr, m.speed, m.semitones, p => self.postMessage({ id: m.id, type: 'progress', progress: p }));
    self.postMessage({ id: m.id, type: 'done', channels: res }, res.map(c => c.buffer));
  } catch (err) {
    self.postMessage({ id: m.id, type: 'done', error: String(err && err.message || err) });
  }
};
