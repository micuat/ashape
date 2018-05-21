// instance mode by Naoto Hieda

var shader;

var x;
var y;

var s = function (p) {

  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(30);

    x = 400;
    y = 400;

    shader = shaderHelper.load(p, "015_randomwalk/frag.glsl");

    p.background(0);
  }

  let angle = 0;
  p.draw = function () {
    if (p.frameCount % 60 == 0) {
      // shader = shaderHelper.load(p, "015_randomwalk/frag.glsl");
      print(p.frameRate());
    }

    let t = p.millis() * 0.001;
    let tpi = t * p.PI * 2;
    // p.background(0);

    shader.set("iTime", t);

    let pg = 0.0;
    let dg = 1.0;
    let itr = 30.0;
    
    if (t % 8 < 8) {
      angle += 0.0125;
    }
    else {
      pg = 0.5;
      angle -= 0.1;
    }

    let cx = Math.cos(angle) * 5.0;
    let cy = 0.0;//3.0;
    let cz = Math.sin(angle) * 5.0;

    shader.set("cameraPosition", cx, cy, cz);

    shader.set("iteration", itr);
    shader.set("dGlitch", dg);
    // p.image(tex, 0, 0, p.width, p.height);

    p.stroke(255);
    p.strokeWeight(2);
    p.point(x, y);
    // p.ellipse(x, y, 100);

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


    p.filter(shader);
    // p.rect(0, 0, p.width, p.height)
  }

};

var p005 = new p5(s);