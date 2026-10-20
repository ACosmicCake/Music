# Music

## World Woodshed

A phone-friendly practice app for guitar, ear training, rhythm and world music, with a planner that tests you, tracks every skill and builds a daily routine. It lives in [`world-woodshed/`](world-woodshed/).

It is plain HTML and JavaScript with no build step or dependencies. To run it locally:

```sh
cd world-woodshed
python3 -m http.server 8000
# open http://localhost:8000
```

Serve it over HTTP rather than opening `index.html` from disk, because the Transcribe tab runs `stretch.js` as a Web Worker.

The same app is also published as a claude.ai Artifact. Progress saves to `localStorage`, and inside the Artifact it also syncs to the account's private database.
