// instance mode by Naoto Hieda

var shader, depthShader;
var pos = [];
var pg;
var pgColor;
var name = "033_spiral";

var s = function (p) {
  let myFont;
  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(30);

    pg = p.createGraphics(800, 800, p.P3D);
    pgColor = p.createGraphics(800, 800, p.P3D);
    shader = shaderHelper.load(p, name + "/frag.glsl");
    depthShader = p.loadShader(name + "/depthFrag.glsl", name + "/depthVert.glsl");

    myFont = p.createFont("assets/HelveticaNeue-Medium.ttf", 150);
    p.textFont(myFont);
  }

  let time = 0;
  p.draw = function () {
    if (p.frameCount % 60 == 0) {
      // shader = shaderHelper.load(p, name + "/frag.glsl");
      // depthShader = p.loadShader(name + "/depthFrag.glsl", name + "/depthVert.glsl");
      print(p.frameRate());
    }

    let t = p.millis() * 0.001;
    if(t % 4 < 1) {
      time -= 1.0 / 30.0 * 2;
    }
    else {
      time += 1.0 / 30.0;      
    }

    function drawScene(pgraphics, mode) {
      pgraphics.textFont(myFont);
      pgraphics.textAlign(p.CENTER, p.CENTER);

      pgraphics.blendMode(p.REPLACE);
      pgraphics.noStroke();
      pgraphics.pushMatrix();
      pgraphics.translate(pgraphics.width * 0.5, pgraphics.height * 0.5);
      pgraphics.translate(0, 0, 0);
      let noise = p.noise(p.millis() * 0.01, 0.1, 0.1);
      pgraphics.fill(128);
      pgraphics.translate(0, 0, 150);
      pgraphics.translate(0, 0, 100);
      pgraphics.text("TILTED", 0, 0);
      pgraphics.popMatrix();
    }

    pgColor.beginDraw();
    pgColor.background(230);
    pgColor.lights();
    drawScene(pgColor, 1);
    pgColor.endDraw();

    pg.beginDraw();
    pg.background(0);
    pg.shader(depthShader);
    depthShader.set("iTime", t);
    drawScene(pg, 0);
    pg.endDraw();

    p.image(pg, 0, 0);

    shader.set("u_depth", pg);
    shader.set("u_color", pgColor);

    p.background(0);

    shader.set("iTime", t);

    p.filter(shader);

    // p.image(pg, 0, 0);
    // p.rect(0, 0, p.width, p.height)
  }

};

var p033 = new p5(s);