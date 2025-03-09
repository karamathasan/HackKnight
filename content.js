navigator.mediaDevices.getUserMedia({video: true}).then(stream => {
    const video = document.createElement("video");
    video.srcObject = stream;
    video.play();

    video.style.position = "fixed";
    video.style.top = "10px";
    video.style.right = "10px";
    video.style.width = "300px";
    video.style.height = "200px";
    video.style.border = "2px solid black";
    video.style.zIndex = "999999";
    document.body.appendChild(video);

    setInterval(()=>{
        getFrame(video)
    }, 5000)
});

function getFrame(videm){
    const canvas = document.createElement("canvas");
    canvas.width = videm.videoWidth;
    canvas.height = videm.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videm, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(function(blob) {
        const reader = new FileReader();
        reader.onloadend = function() {
            const arrayBuffer = reader.result;
            const uint8Array = new Uint8Array(arrayBuffer);
    
            fetchLandmarks(uint8Array)
        };
        reader.readAsArrayBuffer(blob);
    }, "image/jpeg"); 
}

async function fetchLandmarks(input){
    fetch('http://127.0.0.1:5000/hands', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/octet-stream'
        },
        body: input
    }).then((data)=>{
        return data.json()
    }).then((out)=>{
        console.log(out)
    })
}

// (async function () {
//     try {
//         const videoElement = document.createElement("video");
//         videoElement.style.position = "fixed";
//         videoElement.style.top = "10px";
//         videoElement.style.right = "10px";
//         videoElement.style.width = "300px";
//         videoElement.style.height = "200px";
//         videoElement.style.border = "2px solid black";
//         videoElement.style.zIndex = "999999";
//         document.body.appendChild(videoElement);

//         const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//         videoElement.srcObject = stream;
//         videoElement.play();
//     } catch (error) {
//         console.error("Webcam access denied: ", error);
//     }
// })();
