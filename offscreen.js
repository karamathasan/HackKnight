// Runs in a hidden offscreen document that background.js opens while Enable is on.
// It owns the camera and streams frames to the gesture server; closing the document stops it.
//
// Load is kept low three ways:
//  - small, compressed frames (WIDTH / QUALITY)
//  - one request at a time, with a pause *after* each response, so a slow server
//    slows the loop down instead of being hammered back to back
//  - a slow poll (IDLE_MS) until the server reports a hand, then a faster one (ACTIVE_MS)
const WIDTH = 320       // frames are downscaled to this width before upload
const QUALITY = 0.6     // JPEG quality, 0-1
const ACTIVE_MS = 150   // pause between requests while a hand is in view (~5 fps)
const IDLE_MS = 500     // pause between requests while no hand is seen (~2 fps)
const ERROR_MS = 2000   // back off when the server is unreachable

const canvas = document.createElement("canvas")
const ctx = canvas.getContext("2d")

navigator.mediaDevices.getUserMedia({
    video: { width: { ideal: WIDTH }, height: { ideal: 240 }, frameRate: { ideal: 15 } }
}).then(stream => {
    const video = document.getElementById("cam")
    video.srcObject = stream
    video.play()
    tick(video)
}).catch(err => {
    console.error("Handsy: camera unavailable", err)
})

async function tick(video){
    let wait = IDLE_MS
    try {
        if (video.videoWidth) {
            const out = await sendFrame(await captureFrame(video))
            wait = out.hand ? ACTIVE_MS : IDLE_MS
        }
    } catch (err) {
        console.error("Handsy: server unreachable", err)
        wait = ERROR_MS
    }
    setTimeout(() => tick(video), wait)
}

function captureFrame(video){
    canvas.width = WIDTH
    canvas.height = Math.round(WIDTH * video.videoHeight / video.videoWidth)
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    return new Promise(resolve => canvas.toBlob(resolve, "image/jpeg", QUALITY))
}

async function sendFrame(blob){
    const res = await fetch('http://127.0.0.1:5000/hands', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/octet-stream'
        },
        body: blob
    })
    return res.json()
}
