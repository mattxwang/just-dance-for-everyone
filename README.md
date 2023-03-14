# just dance for everyone!

This is a course project for CS205, by Disha & Matt. The quick pitch is Just Dance *as a service*: given arbitrary songs, we generate dance moves (from a select pool) and sync them to the song; then, users can play a Just Dance-like game where they have to mirror the on-frame dancer!

It uses a smattering of technology, but mostly relies on MediaPipe (a Google productized version of BlazePose). The Python version of the library is used to process videos from the AIST++ dance dataset, and generate landmark keypoints + keyframes. This is passed on to the frontend, which uses the webcam to generate live landmark keypoints for the user, and then diffs it against the ground truth. This runs in a frame loop on a `<canvas>` element and usually doesn't dip below 30fps. The dance video + moves are synced to the song with a BPM heuristic based on some simple frequency analysis.

This is more of a proof of concept and less of a productionized codebase. Sorry in advance!

## Dev Setup

The entire app runs in an Astro frontend. You'll use the typical node setup:

```
$ npm install
...
$ npm run dev
```

Normally, you'd then package this with `npm run build`, but unfortunately, MediaPipe's JS library can't properly be bundled by Astro (some sort of CJS incompatability, and ... the library *requires* an internet connection for dynamic module resolution??????????). So, **you can only run the app locally** (or with some running server).

There are some assorted python scripts in `bin/`; they're runnable in a `venv` with `requirements.txt`.
