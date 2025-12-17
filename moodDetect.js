// Global Variables
let faceapi;
let detections = [];
let video;
let currentEmotion = "neutral";
let targetEmotion = "neutral";
let emotionCounts = {
  neutral: 0, 
  happy: 0, 
  angry: 0, 
  sad: 0,
  disgusted: 0, 
  surprised: 0, 
  fearful: 0
};
let transitionProgress = 0;
let lastUpdateTime = 0;
let isDetectionActive = true;

//Colour
const emotionColours = {
  neutral: "#ffffff",
  happy: "#ffdc13",
  angry: "#a00c0c",
  sad: "#868686",
  disgusted: "#2a6e19",
  surprised: "#ff89b8",
  fearful: "#6e337a"
};

// Timing
const UPDATE_INTERVAL = 1500;
const TRANSITION_SPEED = 0.05;

// Emotion to Folder Mapping
const emotionToFolderMap = {
  neutral: 1, 
  happy: 2, 
  sad: 3,
  angry: 4, 
  disgusted: 5,
  fearful: 6, 
  surprised: 7
};

//p5
function setup() {
  video = createCapture(VIDEO);
  video.size(320, 240);
  video.hide();

  createCanvas(320, 240).hide();

  faceapi = ml5.faceApi(video, {
      withExpressions: true,
      minConfidence: 0.5
  }, () => faceapi.detect(gotFaces));

  lastUpdateTime = millis();
}

function gotFaces(err, result) {
  if (err) return;
  detections = result;
  if (isDetectionActive) faceapi.detect(gotFaces);
}

//Emotion detection and counting
function updateEmotion() {
  if (!isDetectionActive || detections.length === 0) return;

  const expressions = detections[0].expressions;
  let maxEmotion = "neutral";
  let maxValue = 0;

  for (let e in expressions) {
    if (expressions[e] > maxValue) {
      maxValue = expressions[e];
      maxEmotion = e;
    }
  }

  emotionCounts[maxEmotion]++;

  const now = millis();
  if (now - lastUpdateTime > UPDATE_INTERVAL) {
    let selected = targetEmotion;
    let highest = 0;

    for (let e in emotionCounts) {
      if (emotionCounts[e] > highest) {
        highest = emotionCounts[e];
        selected = e;
      }
      emotionCounts[e] = 0;
    }

    if (selected !== targetEmotion && highest > 3) {
      targetEmotion = selected;
      transitionProgress = 0;
      triggerFolderChange(selected);
    }

    lastUpdateTime = now;
  }
}

// Folder Switching
function triggerFolderChange(emotion) {
  const folderId = emotionToFolderMap[emotion];
  if (!folderId || window.isPlaying) return;

  if (typeof window.selectFolder === "function") {
    window.selectFolder(folderId);
  }
}

// Colour Transition 
function interpolateColour(a, b, amt) {
  return lerpColor(color(a), color(b), amt).toString();
}

function colourTransition() {
  if (currentEmotion === targetEmotion) return;

  transitionProgress += TRANSITION_SPEED;
  if (transitionProgress >= 1) {
    transitionProgress = 1;
    currentEmotion = targetEmotion;
  }

  const col = interpolateColour(
    emotionColours[currentEmotion],
    emotionColours[targetEmotion],
    transitionProgress
  );

  document.documentElement.style.setProperty('--theme-color', col);
  document.body.dataset.emotion = targetEmotion;
}

function pauseDetection() { isDetectionActive = false; }
function resumeDetection() { isDetectionActive = true; }

// p5 Draw Loop
function draw() {
  updateEmotion();
  colourTransition();
}

// Expose control functions
window.moodDetect = {
  pauseDetection,
  resumeDetection
};