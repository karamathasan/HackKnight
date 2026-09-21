// One-time camera grant. The popup can't show Chrome's permission prompt reliably
// (it closes when the prompt takes focus), so popup.js opens this page in a tab instead.
const status = document.getElementById("status")

navigator.mediaDevices.getUserMedia({video: true}).then(stream => {
    stream.getTracks().forEach(t => t.stop())
    status.textContent = "Camera access granted. Close this tab, then open Handsy and turn on Enable."
}).catch(err => {
    status.textContent = "Camera access was blocked (" + err.name + "). Allow the camera for this extension in Chrome's site settings, then reload this page."
})
