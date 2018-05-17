// instance mode by Naoto Hieda

var shader;
var pos = [];

var s = function (p) {
  let nn;
  let nn_move;
  let training_data;
  let training_move;
  let cam_z;

  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(30);

    shader = shaderHelper.load(p, "011_fbo/frag.glsl");
    nn = new synaptic.Architect.Perceptron(2, 3, 3);
    nn_move = new synaptic.Architect.Perceptron(1, 3, 3, 2);

    for (let i = 0; i < 4; i++) {
      pos.push(p.createVector(0, 0));
    }
  }

  let angle = 0;
  p.draw = function () {
    if (p.frameCount % 60 == 0) {
      // shader = shaderHelper.load(p, "011_fbo/frag.glsl");
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
      angle += 0.0125;
    }
    else {
      pg = 0.5;
      angle -= 0.1;
    }

    let x = Math.cos(angle) * 5.0;
    let y = 0.0;//3.0;
    let z = Math.sin(angle) * 5.0;

    shader.set("cameraPosition", x, y, z);

    for (let i = 0; i < 4; i++) {
      let pdest;
      pdest = p.createVector(p.cos(tpi * (i + 1) * 0.2), -0.2 + -0.2 * p.sin(tpi * 0.1 + (i)*p.PI), p.sin(tpi * (i + 1) * 0.2));
      pdest.mult(1.5);
      pos[i].lerp(pdest, 0.9);
    }

    let floatArray = Java.type("float[]");
    let bpos = new floatArray(3 * 4);
    for (let i = 0; i < 4; i++) {
      bpos[i * 3 + 0] = pos[i].x;
      bpos[i * 3 + 1] = pos[i].y;
      bpos[i * 3 + 2] = pos[i].z;
    }
    shader.set("bpos", bpos, 3);

    shader.set("iteration", itr);
    shader.set("dGlitch", dg);
    // p.image(tex, 0, 0, p.width, p.height);
    p.background(0);
    p.stroke(200);
    p.strokeWeight(3);
    for(let i = 0; i < 16; i++) {
      let lfo = Math.sin(i * 0.5 + p.millis() * 0.001 * Math.PI);
      p.fill(p.map(lfo, -1, 1, 60, 128));
      p.rect(i / 16 * p.width, 0, p.width / 32, p.map(lfo, -1, 1, 0, p.height));
    }
    p.filter(shader);
    // p.rect(0, 0, p.width, p.height)
  }

};

var p005 = new p5(s);