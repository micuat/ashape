// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
Webcam Image Classification using MobileNet and p5.js
This example uses a callback pattern to create the classifier
=== */

let classifier;
let video;
let label = "";
let labelIntermediate = "";
let labelErased = true;

function preload() {
  video = createVideo('assets/clip.mp4', () => {
    console.log("ready")
    setupPromise();
  });
}

function setup() {
  noLoop();
}

function setupPromise() {
  // noCanvas();
  createCanvas(400, 400);
  // Create a camera input
  // video = createCapture(VIDEO);
  video.size(width, height);
  video.speed(0.5);
  video.loop();
  video.play();
  video.hide();
  // Initialize the Image Classifier method with MobileNet and the video as the second argument
  classifier = ml5.imageClassifier('MobileNet', video, modelReady);  
}

function modelReady() {
  loop();
  // Change the status of the model once its ready
  // select('#status').html('Model Loaded');
  // Call the classifyVideo function to start classifying the video
  setInterval(classifyVideo, 2000);
}

// Get a prediction for the current video frame
function classifyVideo() {
  classifier.predict(gotResult);
}

// When we get a result
function gotResult(err, results) {
  label = results[0].className.split(",")[0];
  if(label != labelIntermediate)
    labelErased = false;
  // The results are in an array ordered by probability.
  // select('#result').html(results[0].className);
  // select('#probability').html(nf(results[0].probability, 0, 2));
  // classifyVideo();
}

function draw() {
  image(video, 0, 0);

  if(frameCount % 5 == 0) {
    if(labelErased == false) {
      if(labelIntermediate.length == 0) {
        labelErased = true;
      }
      else {
        labelIntermediate = labelIntermediate.substring(0, labelIntermediate.length - 1)
        if(labelIntermediate.length == 0) {
          labelErased = true;
        }
      }
    }
    else {
      if(label.length > labelIntermediate.length) {
        labelIntermediate += label.substring(labelIntermediate.length, labelIntermediate.length + 1);
      }
    }
  }

  translate(width / 2, height / 2);
  noStroke();
  fill(0,100);
  rectMode(CENTER);
  rect(0, 0, width, 50);
  fill(255);
  textSize(20);
  textAlign(CENTER, CENTER);
  text(labelIntermediate + " as the apparatus that", 0, -10);
  text("allow the " + "thought" + " to form", 0, 10);
}