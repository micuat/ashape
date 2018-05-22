// instance mode by Naoto Hieda

var shader;

var x;
var y;

var pg;

var s = function (p) {

  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(30);

    x = 400;
    y = 400;

    shader = shaderHelper.load(p, "016_randomwalk/frag.glsl");

    pg = p.createGraphics(800, 800);
    pg.beginDraw();
    pg.background(0);
    pg.endDraw();
    p.background(0);
  }

  let angle = 0;
  p.draw = function () {
    if (p.frameCount % 60 == 0) {
      // shader = shaderHelper.load(p, "016_randomwalk/frag.glsl");
      print(p.frameRate());
    }

    let t = p.millis() * 0.001;
    let tpi = t * p.PI * 2;
    // p.background(0);

    shader.set("iTime", t);

    let dg = 1.0;
    let itr = 30.0;
    
    if (t % 8 < 8) {
      angle += 0.0125;
    }
    else {
      // pg = 0.5;
      angle -= 0.1;
    }

    let camr = p.map(Math.sin(angle*0.5), -1.0, 1.0, 4.0, 10.0);
    let cx;
    let cy;//3.0;
    let cz;

    cx = Math.cos(angle) * camr;
    cy = 5.0;
    cz = Math.sin(angle) * camr;

    shader.set("cameraPosition", cx, cy, cz);

    shader.set("iteration", itr);
    shader.set("dGlitch", dg);
    // p.image(tex, 0, 0, p.width, p.height);

    pg.beginDraw();
    if(p.frameCount % 120 == 0) {
      pg.background(0);
      x=y=400;
    }
    pg.stroke(255, 10);
    pg.strokeWeight(3);
    for(let i = 0; i < 50; i++) {
      pg.point(x, y);
      var r = p.floor(p.random(4));

      switch (r) {
        case 0:
          x = x + 1;
          break;
        case 1:
          x = x - 1;
          break;
        case 2:
          y = y + 1;
          break;
        case 3:
          y = y - 1;
          break;
      }
    }  
    pg.endDraw();

    p.image(pg, 0, 0);
    // p.ellipse(400,400, 100);

    p.filter(shader);
    // p.rect(0, 0, p.width, p.height)
  }

};

var p005 = new p5(s);