// instance mode by Naoto Hieda

var lightDir;
var defaultShader;
var shadowMap;
var pgColor;

var s = function (p) {
  let name;
  function initShadowPass() {
    shadowMap = p.createGraphics(2048, 2048, p.P3D);
    shadowMap.noSmooth(); // Antialiasing on the shadowMap leads to weird artifacts
    //shadowMap.loadPixels(); // Will interfere with noSmooth() (probably a bug in Processing)
    shadowMap.beginDraw();
    shadowMap.noStroke();
    shadowMap.shader(p.loadShader(name + ("/shadow.frag"), name + ("/shadow.vert")));
    shadowMap.ortho(-200, 200, -200, 200, 10, 400); // Setup orthogonal view matrix for the directional light
    shadowMap.endDraw();
  }

  function initDefaultPass() {
    p.shader(p.loadShader(name + ("/default.frag"), name + ("/default.vert")));
    p.noStroke();
    p.perspective(60.0 / 180 * Math.PI, p.width / p.height, 10, 1000);
  }

  p.setup = function () {
    name = p.folderName;

    p.createCanvas(800, 800);
    p.frameRate(30);

    initShadowPass();
    initDefaultPass();
    p.camera(0.0, 200.0, 200.0, 0.0, 0.0, 0, 0, -1, 0);
  }

  let time = 0;
  p.draw = function () {
    if (p.frameCount % 60 == 0) {
      // print(p.frameRate());
    }
    p.background(0);
  }

};

var p046 = new p5(s);