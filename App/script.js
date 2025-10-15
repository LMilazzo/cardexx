const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const startBtn = document.getElementById('videoStart');
const endBtn = document.getElementById("videoEnd")

//API Base URL
const url = ''

//API Call 1 (Card Detection & Cropping)
const detectionEndpoint = url + '/detect-cards'

//API Call 2 (Card Embedding & Matching)
const fullEndpoint = url + '/pipeline'
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
  }
}

//-----------------------------------------------------------------------------------------------
//A function to periodically update the current frame to be processed
function updateFrame() {
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  currentFrameB64 = canvas.toDataURL('image/jpeg');
}

//-----------------------------------------------------------------------------------------------
//A function to periodically call the detection api endpoint
function detectCard(){

  if (intervalID_fetch_detect){

    try{

      const detectCards_payload = {
        b64_string: currentFrameB64
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
        if (data.Cropped_Card != null){
          cardPresent = true;
        }else {cardPresent = false; }

      })
      .catch(error => {
        console.log('There was an error with the request');
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
      b64_string: currentFrameB64
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

    if (data.Cropped_Card != null) {
      cropUsed.src = "data:image/png;base64," + data.Cropped_Card.b64_string;
    }

    if (data.Matches != null) {

      matchesContainer.innerHTML = ""; // Clear previous

      data.Matches.forEach(match => {
        const card = createMatchElement(match);
        matchesContainer.appendChild(card);
      });
    }

    callTime.textContent = "Call Duration: " + data.Duration.toFixed(2) + "s";
  } catch (error) {
    console.error("Error in getResults:", error);
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
// Function to render each match as a styled card with image and details
function createMatchElement(match) {
  const card = document.createElement("div");
  card.className = "match-card";

  card.innerHTML = `
    <img class="match-img" src="${match.image}" alt="${match.name || 'Card image'}" />
    <div class="match-info">
      <h3>${match.name || 'Unknown Card'}</h3>
      <p><strong>ID:</strong> ${match.id}</p>
      <p><strong>Score:</strong> ${match.score?.toFixed(3) || 'N/A'}</p>
    </div>
  `;

  return card;
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