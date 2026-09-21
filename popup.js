document.addEventListener("DOMContentLoaded", function() {
    console.log("Popup loaded!");
});

let previewStream = null;

function renderToggle(on) {
    const img = document.getElementById("toggleImg");
    if (img) img.src = on ? "images/ON.png" : "images/OFF.png";
}

async function cameraGranted() {
    try {
        const status = await navigator.permissions.query({ name: "camera" });
        return status.state === "granted";
    } catch (err) {
        return false;
    }
}

// Live preview inside the Webcam box (Webcam.html only). The actual gesture
// streaming runs in the offscreen document, so this is display-only.
async function startPreview() {
    const video = document.getElementById("preview");
    if (!video || previewStream) return;
    try {
        previewStream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = previewStream;
        video.style.display = "block";
    } catch (err) {
        console.error("Preview unavailable", err);
    }
}

function stopPreview() {
    const video = document.getElementById("preview");
    if (previewStream) {
        previewStream.getTracks().forEach(t => t.stop());
        previewStream = null;
    }
    if (video) {
        video.srcObject = null;
        video.style.display = "none";
    }
}

async function setEnabled(on) {
    if (on && !(await cameraGranted())) {
        chrome.tabs.create({ url: chrome.runtime.getURL("permission.html") });
        return false;
    }
    await chrome.storage.local.set({ enabled: on });
    return on;
}

document.addEventListener("DOMContentLoaded", async function () {
    const { enabled } = await chrome.storage.local.get("enabled");
    renderToggle(!!enabled);
    if (enabled) startPreview();
});

document.addEventListener("DOMContentLoaded", function () {
    const page1 = document.getElementById("page1");
    const page2 = document.getElementById("page2");
    const page3 = document.getElementById("page3");
    const Webcam = document.getElementById("Webcam");
    const toggleImg = document.getElementById("toggleImg");
    

    if (page1) {  
        page1.addEventListener("click", () => {
            chrome.action.setPopup({ popup: "popup.html" });
            window.location.href = "popup.html";
        });
    } else {
        console.error("Element #page1 not found");
    }
    if (page2) {  
        page2.addEventListener("click", () => {
            chrome.action.setPopup({ popup: "popup2.html" });
            window.location.href = "popup2.html";
        });
    } else {
        console.error("Element #page2 not found");
    }
    if (page3) {   
        page3.addEventListener("click", () => {
            chrome.action.setPopup({ popup: "popup3.html" });
            window.location.href = "popup3.html";
        });
    } else {
        console.error("Element #page3 not found");
    }
    if (Webcam) {   
        Webcam.addEventListener("click", () => {
            chrome.action.setPopup({ popup: "Webcam.html" });
            window.location.href = "Webcam.html";
        });
    } else {
        console.error("Element #Webcam not found");
    }
    if (toggleImg)
{    toggleImg.addEventListener("click", async () => {
        const { enabled } = await chrome.storage.local.get("enabled");
        const on = await setEnabled(!enabled);
        renderToggle(on);
        if (on) startPreview(); else stopPreview();
        });}

});
