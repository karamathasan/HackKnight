// popup.js
let model;

async function loadModel() {
  model = await handpose.load();
  console.log("Handpose model loaded");
}

async function detectHands(videoElement) {
  const predictions = await model.estimateHands(videoElement);
  if (predictions.length > 0) {
    console.log(predictions);
    // Process the landmarks here
  }
}

// Set up the video stream from the webcam
const videoElement = document.createElement("video");
videoElement.width = 640;
videoElement.height = 480;

navigator.mediaDevices
  .getUserMedia({
    video: true,
  })
  .then((stream) => {
    videoElement.srcObject = stream;
    videoElement.play();
  });

videoElement.addEventListener("loadeddata", () => {
  loadModel();
  setInterval(() => detectHands(videoElement), 100); // Run detection every 100ms
});
