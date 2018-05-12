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

    shader = shaderHelper.load(p, "005_sdf/frag.glsl");
    nn = new synaptic.Architect.Perceptron(2, 3, 3);
    nn_move = new synaptic.Architect.Perceptron(1, 3, 3, 2);

    for (let i = 0; i < 4; i++) {
      pos.push(p.createVector(0, 0));
    }

    reset();
  }

  function reset() {
    training_data = [{
      inputs: [p.random(0, 0.25), p.random(0, 0.25)],
      outputs: [p.random(1), p.random(1), p.random(1)]
    },
    {
      inputs: [p.random(0, 0.25), p.random(0.75, 1)],
      outputs: [p.random(1), p.random(1), p.random(1)]
    },
    {
      inputs: [p.random(0.75, 1), p.random(0, 0.25)],
      outputs: [p.random(1), p.random(1), p.random(1)]
    },
    {
      inputs: [p.random(0.75, 1), p.random(0, 0.25)],
      outputs: [p.random(1), p.random(1), p.random(1)]
    }
    ];

    training_move = [{
      inputs: [p.random(0, 0.25)],
      outputs: [p.random(1), p.random(1)]
    },
    {
      inputs: [p.random(0.4, 0.6)],
      outputs: [p.random(1), p.random(1)]
    },
    {
      inputs: [p.random(0.75, 1)],
      outputs: [p.random(1), p.random(1)]
    }
    ];

    cam_z = p.random(-0.5, 0.5);
  }

  let angle = 0;
  p.draw = function () {
    if (p.frameCount % 60 == 0) {
      // shader = shaderHelper.load(p, "005_sdf/frag.glsl");
      print(p.frameRate());
    }

    let t = p.millis() * 0.001;
    let tpi = t * p.PI * 2;
    p.background(0);

    let framePeriod = 300.0;
    if (p.frameCount % framePeriod == 0) {
      reset();
    }

    // for (let i = 0; i < 50; i++) {
    //   let data = p.random(training_data);
    //   nn.activate(data.inputs);
    //   nn.propagate(0.9, data.outputs)
    // }

    // for (let i = 0; i < 50; i++) {
    //   let data = p.random(training_move);
    //   nn_move.activate(data.inputs);
    //   nn_move.propagate(0.9, data.outputs)
    // }

    // let resolution = 40;
    // let cols = p.width / resolution;
    // let rows = p.height / resolution;
    // for (let i = 0; i < cols; i++) {
    //   for (let j = 0; j < rows; j++) {
    //     let x1 = i / cols;
    //     let x2 = j / rows;
    //     let inputs = [x1, x2];
    //     // print(inputs)
    //     // let y = nn.predict(inputs);
    //     let y = nn.activate(inputs);
    //     p.noStroke();
    //     p.fill(y[0] * 255, y[1] * 255, y[2] * 255);
    //     p.rect(i * resolution, j * resolution, resolution, resolution);
    //   }
    // }

    shader.set("iTime", t);

    let pg = 0.0;
    let dg = 1.0;
    let itr = 50.0;
    
    if (t % 8 < 7) {
      angle += 0.05;
    }
    else {
      pg = 0.5;
      angle -= 0.1;
    }

    let x = Math.cos(angle) * 5.0;
    let y = 3.0;
    let z = Math.sin(angle) * 5.0;

    // {
    //   let period = framePeriod/10;
    //   let ind = p.frameCount % period;
    //   if(ind > period/2) ind = period - ind;
    //   let nnpos = nn_move.activate([ind / (framePeriod/5)]);
    //   pos[0].x = p.map(parseFloat(nnpos[0]), 0, 1, -1, 1);
    //   pos[0].y = 0.0;
    //   pos[0].z = p.map(parseFloat(nnpos[1]), 0, 1, -1, 1);
    // }

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
    p.filter(shader);
    // p.rect(0, 0, p.width, p.height)
  }

};

var p005 = new p5(s);