
const tcgdex = new TCGdex('en');


const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const startBtn = document.getElementById('videoStart');
const endBtn = document.getElementById("videoEnd")
const snapBtn = document.getElementById("snap")
const prev = document.getElementById("preview")

//API Base URL
const url = '/.netlify/functions'

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
let snapFrame = false;

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

  console.log("DetectCardRunning: " + snapFrame)
  if (intervalID_fetch_detect || snapFrame){

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
  console.log("getResults: " + snapFrame)

  if (!isScanning || !cardPresent){
    if (!snapFrame){
      return
    }
  }

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

      for (const match of data.Matches){
        const card = await createMatchElement(match);
        matchesContainer.appendChild(card);
      }

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
async function createMatchElement(match) {
  const card = document.createElement("div");
  card.className = "match-card";

  const pricing = await getCardPricingElement(match.id);

  pricingElement = ``;

  if (pricing.Error !== undefined){
    pricingElement = `No Pricing Data Found`;  
  } else{

    n = ``;
    h = ``;
    rH = ``;

    if (pricing.normal !== "no data"){
      n = `Normal- ${pricing.normal} `;
    }
    if (pricing.holofoil !== "no data"){
      h = `Holo- ${pricing.holofoil} `;
    }
    if (pricing.reverseHolofoil !== "no data"){
      rH = `Rev Holo- ${pricing.reverseHolofoil} `;
    }

    pricingElement = n + h + rH
    console.log(pricingElement)

  }

  card.innerHTML = `
    <img class="match-img" src="${match.image}" alt="${match.name || 'Card image'}" />
    <div class="match-info">
      <h3>${match.name || 'Unknown Card'}</h3>
      <div style="display: flex; align-items: center; justify-content: flex-start; gap: 30px;">
        <p><strong>ID:</strong> ${match.id}</p>
        <p><strong>Market Values:</strong> ${pricingElement}</p>
      </div>
      <p><strong>Score:</strong> ${match.score?.toFixed(3) || 'N/A'}</p>
      
    </div>
  `;

   return card;
}

//-----------------------------------------------------------------------------------------------
// Function to render each match as a styled card with image and details

async function getCardPricingElement(cardId) {
  const container = document.createElement('div');
  container.className = 'card-pricing';

  try {
    const card = await tcgdex.fetch('cards', cardId);

    if (!card?.pricing?.tcgplayer) {
      return {"Error" : "No Data"}
    }

    const prices = card.pricing.tcgplayer;
    const getPrice = (key) =>
      prices?.[key]?.marketPrice !== undefined
        ? `$${prices[key].marketPrice}`
        : 'no data';

    const holofoil = getPrice('holofoil');
    const normal = getPrice('normal');
    const reverseHolofoil = getPrice('reverse-holofoil');

    return {"holofoil" : holofoil, "normal" : normal, "reverseHolofoil" : reverseHolofoil}

  } catch (err) {
    console.error("Couldn't get pricing:", err);
    return {"Error" : "No Data"}
  }
}

//-----------------------------------------------------------------------------------------------
//Event listener for the start scan button starts the scan by setting intervals for video frame
//collection and api call functions 
startBtn.addEventListener('click', async () => {

  snapFrame = false;

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

  snapFrame = false;

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

//-----------------------------------------------------------------------------------------------
//Event listener for the snap scan button takes and processes just a snapshot
snapBtn.addEventListener('click', async() => {

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

  snapFrame = true;

  updateFrame();
  detectCard();
  getResults();

});

//-----------------------------------------------------------------------------------------------
//Event listener for the Preview button that just displays the camera content
prev.addEventListener('click', async() => {
  
  if (streamStarted) return;

  await startCamera(); 

});

