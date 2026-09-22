# Handsy

A Chrome extension that lets you control your browser with hand gestures. A webcam feed is
streamed from the extension to a small local Python server, which uses
[MediaPipe](https://developers.google.com/mediapipe) to detect your hand and MediaPipe's
landmarks to recognize gestures. Right now it supports one gesture end to end: hold up an open
palm to pause whatever video is playing.

## How it works

```
Chrome extension (JS)                     Local server (Python)
┌─────────────────────────┐  JPEG frame   ┌───────────────────────────┐
│ offscreen.js             │ ───POST────▶ │ Flask /hands               │
│  - owns the webcam       │               │  - decodes the frame       │
│  - grabs a frame,        │ ◀──JSON────── │  - MediaPipe Hands finds    │
│    downscales it, sends  │  gesture      │    21 hand landmarks        │
│    it, waits for a reply │               │  - checks the landmarks    │
│  - polls faster/slower   │               │    against a gesture rule  │
│    based on the reply    │               │  - presses Space on pause  │
└─────────────────────────┘               └───────────────────────────┘
```

- [background.js](background.js) is the extension's service worker. It opens or closes a hidden
  offscreen document whenever the Enable toggle changes.
- [offscreen.js](offscreen.js) runs inside that offscreen document. It owns the webcam, captures
  frames, and streams them to the server. It backs off to a slower polling rate when no hand is
  in view, and slows down further if the server is unreachable, so it doesn't overload the
  browser or the machine.
- [server/app.py](server/app.py) is a Flask server. It decodes each frame, runs it through
  MediaPipe Hands, and checks the landmarks against a gesture rule. An open palm (all four
  fingers extended) held for a couple of frames sends a Space keypress via the `keyboard`
  library, with a cooldown so it doesn't fire repeatedly while your hand stays up.
- The popup ([popup.html](popup.html), [popup2.html](popup2.html), [popup3.html](popup3.html),
  [Webcam.html](Webcam.html), all sharing [popup.js](popup.js)) is the extension's UI: an Enable
  toggle, a live camera preview, and a keybind assignment page. Swipe and zoom are shown in the
  UI but aren't wired up to a gesture yet.

## Setup

You need Python 3.9+ and Google Chrome.

**1. Start the server**

```powershell
cd server
pip install -r requirements.txt
python app.py
```

You should see `Running on http://127.0.0.1:5000`. Leave this running — the extension talks to
it over `http://127.0.0.1:5000`, so it must be running locally, not deployed elsewhere.

**2. Load the extension**

1. Open `chrome://extensions`.
2. Turn on **Developer mode** (top right).
3. Click **Load unpacked** and select this project's folder.

**3. Turn it on**

1. Click the Handsy icon, then open the Webcam page.
2. Click the Enable toggle. The first time, Chrome opens a permission tab to grant camera
   access — allow it, close the tab, and toggle again.
3. A live preview appears in the popup, and the Flask console starts printing `POST /hands 200`
   lines.

**4. Try the pause gesture**

Click into a YouTube tab (so the keypress lands on the video, not the popup) and hold up an open
palm facing the camera. The server console prints `pause gesture -> space` when it fires.

## Debugging and tuning

- **`HANDSY_DEBUG=1`** — set this environment variable before starting the server to print the
  per-finger extension ratio on every frame. Useful for checking why a gesture isn't triggering:
  ```powershell
  $env:HANDSY_DEBUG=1
  python server\app.py
  ```
- **Latency** — every `pause gesture -> space` line includes how long the gesture took to act on,
  measured from when the extension captured the frame to when the key was sent.
- **Gesture tuning knobs**, all in [server/app.py](server/app.py):
  - `EXTENDED_RATIO` — how straight a finger must be to count as extended.
  - `PAUSE_HOLD_FRAMES` — how many consecutive open-palm frames are needed before it fires.
  - `PAUSE_COOLDOWN` — minimum seconds between two pause triggers.
- **Performance knobs**, in [offscreen.js](offscreen.js):
  - `WIDTH` / `QUALITY` — frame size and JPEG quality sent to the server.
  - `ACTIVE_MS` / `IDLE_MS` — how often frames are sent while a hand is/isn't in view.

## Known limitations

- Only the pause gesture is implemented; swipe and zoom are UI-only for now.
- The keypress goes to whatever window has OS focus, not necessarily the tab you gestured at.
- The server is meant to run locally on the same machine as the browser — there's no auth on the
  `/hands` endpoint, so don't expose port 5000 to a network.
