/* World Woodshed — runs the time-stretch off the main thread, streaming the result back in blocks so
   playback can start with the first one. A job is cancelled by terminating the worker. */
import Stretch from './stretch.js';

self.onmessage = function (e) {
  const m = e.data;
  try {
    for (const b of Stretch.stream(m.channels, m.sr, m.speed, m.semitones, m.first, m.block)) {
      if (b) self.postMessage({ id: m.id, type: 'chunk', channels: b }, b.map(c => c.buffer));
    }
    self.postMessage({ id: m.id, type: 'done' });
  } catch (err) {
    self.postMessage({ id: m.id, type: 'done', error: String(err && err.message || err) });
  }
};
