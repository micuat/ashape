// instance mode by Naoto Hieda

var shader;

var s = function (p) {
  let shaders = [];

  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(30);

    // shader = shaderHelper.load(p, "012_beesandbombs/frag.glsl");

    shaders.push(shaderHelper.load(p, "009_bubbles/frag.glsl"));
    shaders.push(shaderHelper.load(p, "012_beesandbombs/frag.glsl"));
    shader = shaders[0];
  }

  let angle = 0;
  p.draw = function () {
    if (p.frameCount % 120 == 0) {
      // shader = shaderHelper.load(p, "009_bubbles/frag.glsl");
      print(p.frameRate());
    }
    if (p.frameCount % 120 == 60) {
      // shader = shaderHelper.load(p, "012_beesandbombs/frag.glsl");
      print(p.frameRate());
    }

    let t = p.millis() * 0.001;
    let tpi = t * p.PI * 2;
    p.background(0);

    if (t % 8 < 8) {
      angle += 0.0025;
    }
    else {
      pg = 0.5;
      angle -= 0.1;
    }

    let camr = p.map(Math.sin(angle*5), -1, 1, 4.0, 20.0);
    let x;
    let y;//3.0;
    let z;

    if(p.frameCount % 120 < 30 && p.frameCount % 2 < 1) {
      shader = shaders[0];
      x = Math.cos(angle) * 2.0;
      y = 0.0;
      z = Math.sin(angle) * 2.0;
    }
    else {
      shader = shaders[1];
      x = Math.cos(angle) * camr;
      y = camr;//3.0;
      z = Math.sin(angle) * camr;
    }

    shader.set("iTime", t);

    let pg = 0.0;
    let dg = 1.0;
    let itr = 30.0;
    
    shader.set("lightCoeff", p.map(Math.sin(angle*5), -1, 1, 20.0, 150.0));
    shader.set("cameraPosition", x, y, z);

    shader.set("iteration", itr);
    shader.set("dGlitch", dg);
    p.filter(shader);
  }

};

var p005 = new p5(s);