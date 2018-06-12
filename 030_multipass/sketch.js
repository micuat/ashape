// instance mode by Naoto Hieda

var shader, depthShader;
var pos = [];
var pg;
var pgColor;
var name = "030_multipass";

var s = function (p) {

  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(30);

    pg = p.createGraphics(800, 800, p.P3D);
    pgColor = p.createGraphics(800, 800, p.P3D);
    shader = shaderHelper.load(p, name + "/frag.glsl");
    depthShader = p.loadShader(name + "/depthFrag.glsl", name + "/depthVert.glsl");
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
      pgraphics.noStroke();
      pgraphics.pushMatrix();
      pgraphics.translate(pgraphics.width * 0.5, pgraphics.height * 0.5);
      pgraphics.translate(0, 0, 0);
      for(let i = 0; i < 100; i++) {
        pgraphics.pushMatrix();
        let angle = i * Math.PI / 50 + time*0.25;
        pgraphics.translate(p.cos(angle*1) * 300, 50, p.sin(angle*1) * 300);
        if(mode == 0)
          pgraphics.fill(i / 100.0 * 128 + 128);
        else if(mode == 1)
          pgraphics.fill(100);
        pgraphics.rotateY(angle*2);
        pgraphics.rotateX(angle*5);
        if(mode == 0) {
          let h = 300;
          pgraphics.box(25, 25, h);
        }
        else {
          pgraphics.box(25, 25, 300);
        }
        pgraphics.popMatrix();
      }
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

var p030 = new p5(s);