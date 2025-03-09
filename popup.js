document.addEventListener("DOMContentLoaded", function() {
    console.log("Popup loaded!");
});

document.addEventListener("DOMContentLoaded", function () {
    const page1 = document.getElementById("page1");
    const page2 = document.getElementById("page2");
    const page3 = document.getElementById("page3");
    const Webcam = document.getElementById("Webcam");
    
    
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
});
