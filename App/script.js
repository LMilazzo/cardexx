const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const startBtn = document.getElementById('videoStart');
const endBtn = document.getElementById("videoEnd")

//The b64 string of the most current raw video frame from the media input
const rawFrame = document.getElementById('rawFrame');

//API Base URL
const url = 'http://127.0.0.1:8000'

//API Call 1 (Card Detection & Cropping)
const detectionEndpoint = url + '/detect-cards'
const apiResponse = document.getElementById('responseFeedback') // Raw Json Response
const frameDetectionBox = document.getElementById('frameDetectionBox') // Frame with bounding box draw b64 string to display as video/image
const frameDetectionCardPresent = document.getElementById('frameDetectionCardPresent') // True or false of wether a card was detected or not
const frameDetectionCrop = document.getElementById('frameDetectionCrop') //Frame with the detected card cropped to the bounding box

//API Call 2 (Card Embedding & Matching)
const fullEndpoint = url + '/pipeline'
const apiResponseFull = document.getElementById('responseFull')
const matches = document.getElementById('matches')
const detectionUsed = document.getElementById('detectionUsed')
const cardDetected = document.getElementById('cardDetected')
const cropUsed = document.getElementById('cropUsed')
const callTime = document.getElementById('callTime')
const matchesContainer = document.getElementById("matches");

let streamStarted = false;
let intervalID_video = null; //Interval for the video FPS 66
let intervalID_fetch_detect = null; //Interval for the card detection api request
let isScanning = false;
let cardPresent = false;
let currentFrameB64 = null

//-----------------------------------------------------------------------------------------------
//A function to start the camera with an available media outlet
async function startCamera() {

  if (streamStarted) return;

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' } },
      audio: false
    });
    video.srcObject = stream;
    streamStarted = true;
  } catch (err) {
    console.error('Camera access error:', err);
    output.textContent = 'Failed to access camera: ' + err.message;
  }
}

//-----------------------------------------------------------------------------------------------
//A function to periodically update the current frame to be processed
function updateFrame() {
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  currentFrameB64 = canvas.toDataURL('image/jpeg');
  rawFrame.textContent = currentFrameB64;
}

//-----------------------------------------------------------------------------------------------
//A function to periodically call the detection api endpoint
function detectCard(){

  if (intervalID_fetch_detect){

    try{

      const detectCards_payload = {
        b64_string: rawFrame.textContent
      };

      fetch(detectionEndpoint, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(detectCards_payload)
      })
      .then(response => {
        if (!response.ok) {
          throw new Error ('Server returned{response.status}');
        }
        return response.json();
      })
      .then(data => {
        apiResponse.textContent = JSON.stringify(data, null, 2);
        frameDetectionBox.src = "data:image/png;base64," + data.Frame.b64_string;
        frameDetectionCardPresent.textContent = "Detected Content For Matching: " + data.Card_Detected;
        if (data.Cropped_Card != null){
          frameDetectionCrop.src = "data:image/png;base64," + data.Cropped_Card.b64_string;
          cardPresent = true;
        }else {cardPresent = false; }

      })
      .catch(error => {
        apiResponse.textContent = 'There was an error with the request';
      })

    }
    catch(error){
      console.error(error)
    }

  }

}

//-----------------------------------------------------------------------------------------------
//A function to periodically call the full process api endpoint
async function getResults() {
  if (!isScanning) return;
  if (!cardPresent) return;

  try {
    const payload = {
      b64_string: rawFrame.textContent
    };

    const response = await fetch(fullEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    apiResponseFull.textContent = JSON.stringify(data, null, 2);
    detectionUsed.src = "data:image/png;base64," + data.Frame.b64_string;
    cardDetected.textContent = "Detected Content: " + data.Card_Detected;

    if (data.Cropped_Card != null) {
      cropUsed.src = "data:image/png;base64," + data.Cropped_Card.b64_string;
    }

    if (data.Matches != null) {
      matches.textContent = JSON.stringify(data.Matches, null, 2);

      matchesContainer.innerHTML = ""; // Clear previous

      data.Matches.forEach(match => {
        const card = document.createElement("div");
        card.className = "match-card";
        card.innerHTML = `
          <span><strong>Name:</strong> ${match.name}</span>
          <span><strong>ID:</strong> ${match.id}</span>
          <span><strong>Score:</strong> ${match.score.toFixed(3)}</span>
        `;
        matchesContainer.appendChild(card);
      });
    }

    callTime.textContent = "Call Duration: " + data.Duration.toFixed(2) + "s";
  } catch (error) {
    console.error("Error in getResults:", error);
    apiResponseFull.textContent = 'There was an error with the request: ' + error.message;
  }

}

async function recurs_getResults() {

  if (!isScanning) return;

  try {
    await getResults(); // waits for everything to finish
  } catch (err) {
    console.error("Error in getResults:", err);
  } finally {
    setTimeout(recurs_getResults, 100); // next call after everything finishes
  }
}


//-----------------------------------------------------------------------------------------------
//Event listener for the start scan button starts the scan by setting intervals for video frame
//collection and api call functions 
startBtn.addEventListener('click', async () => {
  await startCamera(); 

  if (!intervalID_video){
    intervalID_video = setInterval(() => {updateFrame()}, 66);
  } 

  if (!intervalID_fetch_detect){
    intervalID_fetch_detect = setInterval(() => {detectCard()}, 750);
  } 

  if (!isScanning){
    isScanning = true;
    recurs_getResults();
  }


});

//-----------------------------------------------------------------------------------------------
//Event listener for the end scan button that pauses all intervals
endBtn.addEventListener('click', async() => {

  if (video.srcObject) {
    const tracks = video.srcObject.getTracks();
    tracks.forEach(track => track.stop()); // Stop each track (video/audio)
    video.srcObject = null;
  }

  isScanning = false;

  if (intervalID_video) {
    clearInterval(intervalID_video);
    intervalID_video = null;
  }
  if (intervalID_fetch_detect) {
    clearInterval(intervalID_fetch_detect);
    intervalID_fetch_detect = null;
  }

  streamStarted = false;

});