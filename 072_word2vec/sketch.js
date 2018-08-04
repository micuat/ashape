// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
Word2Vec example with p5.js. Using a pre-trained model on common English words.
=== */

let word2Vec;
let myFont;

function modelLoaded() {
  console.log('Model Loaded');
  // select('#status').html('Model Loaded');
}

let marginWord = { s: 'structure' };
let marginWord2 = { s: 'thought' };

function preload() {
  myFont = loadFont('assets/Avenir.otf');
}

function setup() {
  // noLoop();
  createCanvas(400, 600);
  // noCanvas();

  // Create the Word2Vec model with pre-trained file of 10,000 words
  word2Vec = ml5.word2vec('data/wordvecs10000.json', modelLoaded);

  // Findind the average of two words
  // word2Vec.average([word1, word2], 4, (err, average) => {
  //   console.log(average[0].word);
  // })
  function searchNearest(word) {
    word2Vec.nearest(word.s, (err, result) => {
      if (result) {
        for (let i = 0; i < result.length; i++) {
          // console.log(result[i].word);
        }
        word.s = random(result).word;
      }
    });
  }

  setTimeout(() => {
    setInterval(() => {
      searchNearest(marginWord);
    }, 4000);
    setTimeout(() =>
      setInterval(() => {
        searchNearest(marginWord2);
      }, 4000), 2000);
  }, 4000);
}

function draw() {
  background(0);
  // textAlign(CENTER, CENTER)
  textFont(myFont, 20);
  fill(255);
  let correctWord = marginWord.s;
  if (correctWord == 'structure') correctWord += 's';
  else if (correctWord[correctWord.length - 1] != 's') correctWord += 's';
  translate(30, height / 2);
  text(correctWord + ' as the apparatus that', 0, -20);
  text('allow the ' + marginWord2.s + ' to form', 0, 20);
}