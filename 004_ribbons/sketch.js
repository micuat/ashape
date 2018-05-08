// instance mode by Naoto Hieda

var shader;
var pos = [];

var s = function (p) {
  let nn;
  let training_data;

  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(30);
    shader = p.loadShader(p.sketchPath("../004_ribbons/frag.glsl"));
    nn = new synaptic.Architect.Perceptron(2, 3, 3);

    for(let i = 0; i < 4; i++) {
      pos.push(p.createVector(0, 0));
    }

    reset();
    print(training_data[0])
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
    // {
    //   inputs: [0.5, 0.5],
    //   outputs: [p.random(1), p.random(1), p.random(1)]
    // }
    ];
  }

  let angle = 0;
  p.draw = function () {
    if (p.frameCount % 60 == 0) {
      shader = p.loadShader(p.sketchPath("../004_ribbons/frag.glsl"));
      print(p.frameRate());
    }

    let t = p.millis() * 0.001;
    let tpi = t * p.PI;
    p.background(0);

    if(p.frameCount % 300 == 0) {
      reset();
    }

    for (let i = 0; i < 50; i++) {
      let data = p.random(training_data);
      // nn.train(data.inputs, data.outputs);
      nn.activate(data.inputs);
      nn.propagate(0.9, data.outputs)
    }

    let resolution = 40;
    let cols = p.width / resolution;
    let rows = p.height / resolution;
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        let x1 = i / cols;
        let x2 = j / rows;
        let inputs = [x1, x2];
        // print(inputs)
        // let y = nn.predict(inputs);
        let y = nn.activate(inputs);
        p.noStroke();
        p.fill(y[0] * 255, y[1] * 255, y[2] * 255);
        p.rect(i * resolution, j * resolution, resolution, resolution);
      }
    }

    shader.set("iTime", t);

    let x = 0.0;//Math.cos(angle) * 3.0;
    let y = 5.0;
    let z = 0.0;//Math.sin(angle) * 3.0;

    if(p.frameCount % 120 < 30 && p.frameCount % 4 < 2) {
      y = 2.0;
      z = 2.0;
    }
    shader.set("cameraPosition", x, y, z);

    let pg = 0.0;
    let dg = 1.0;
    let itr = 10.0;
    let fg = 0.0;
    if ((t - 0.5) % 4 < 2) {
      // itr = p.map(p.abs((t - 0.5) % 4 - 1), 0, 1, 16, 64);
      // pg = 1.0;
      angle += (1 - p.abs((t - 0.5) % 4 - 1)) * 0.25;
    }
    else {
      angle += 0.025;
      // dg = 0.1;
    }

    for(let i = 0; i < 4; i++) {
      let pdest;
      if(t % 8 < 6.5) {
        pdest = p.createVector(p.cos(tpi * (i+1) * 0.2), 0, p.sin(tpi * (i+1) * 0.2));
        pdest.mult(1.5);
      }
      else {
        // pdest = p.createVector(p.map(i, 0, 3, -1.5, 1.5), 0, 0);
        // pdest.mult(1.5);
        pdest = p.createVector(p.cos(p.PI * (i+1)/2), 0, p.sin(p.PI * (i+1)/2));
        pdest.mult(1.5);
        fg = 1.5*0.5 - p.abs(t % 8 - 6.5 - 1.5*0.5);
      }
      pos[i].lerp(pdest, 0.1);
    }

    let floatArray = Java.type("float[]");
    let bpos = new floatArray(3 * 4);
    for(let i = 0; i < 4; i++) {
      bpos[i * 3 + 0] = pos[i].x;
      bpos[i * 3 + 1] = pos[i].y;
      bpos[i * 3 + 2] = pos[i].z;
    }
    shader.set("bpos", bpos, 3);

    shader.set("iteration", itr);
    shader.set("fragGlitch", fg);
    shader.set("dGlitch", dg);
    p.filter(shader);
  }

};

var p002 = new p5(s);