// instance mode by Naoto Hieda

var shader;

var s = function (p) {

  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(30);

    shader = shaderHelper.load(p, "012_beesandbombs/frag.glsl");
  }

  let angle = 0;
  p.draw = function () {
    if (p.frameCount % 60 == 0) {
      // shader = shaderHelper.load(p, "012_beesandbombs/frag.glsl");
      print(p.frameRate());
    }

    let t = p.millis() * 0.001;
    let tpi = t * p.PI * 2;
    p.background(0);

    shader.set("iTime", t);

    let pg = 0.0;
    let dg = 1.0;
    let itr = 30.0;
    
    if (t % 8 < 8) {
      angle += 0.0025;
    }
    else {
      pg = 0.5;
      angle -= 0.1;
    }

    let x = Math.cos(angle) * 4.0;
    let y = 3.0;//3.0;
    let z = Math.sin(angle) * 4.0;

    shader.set("cameraPosition", x, y, z);

    shader.set("iteration", itr);
    shader.set("dGlitch", dg);
    p.filter(shader);
  }

};

var p005 = new p5(s);