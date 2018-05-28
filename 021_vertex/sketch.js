// instance mode by Naoto Hieda

var shader, depthShader;
var pos = [];
var pg;

var s = function (p) {
  let nn;
  let nn_move;
  let training_data;
  let training_move;
  let cam_z;

  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(30);

    pg = p.createGraphics(800, 800, p.P3D);
    shader = shaderHelper.load(p, "021_vertex/frag.glsl");
    depthShader = p.loadShader("021_vertex/depthFrag.glsl", "021_vertex/depthVert.glsl");
    nn = new synaptic.Architect.Perceptron(2, 3, 3);
    nn_move = new synaptic.Architect.Perceptron(1, 3, 3, 2);

    for (let i = 0; i < 4; i++) {
      pos.push(p.createVector(0, 0));
    }
  }

  let angle = 0;
  p.draw = function () {
    if (p.frameCount % 60 == 0) {
      // shader = shaderHelper.load(p, "021_vertex/frag.glsl");
      // depthShader = p.loadShader("021_vertex/depthFrag.glsl", "021_vertex/depthVert.glsl");
      print(p.frameRate());
    }

    pg.beginDraw();
    pg.background(0);
    pg.noStroke();
    pg.shader(depthShader);
    pg.pushMatrix();
    pg.translate(pg.width * 0.5, pg.height * 0.5);
    for (let i = 0; i < 16; i++) {
      pg.beginShape();
      pg.vertex(p.noise(i * 0.1, 0.1, p.millis() * 0.001) * 900 - 400,
        p.noise(i * 0.1, 0.2, p.millis() * 0.0012) * 900 - 400,
        p.noise(i * 0.1, 0.3, p.millis() * 0.0011) * 900 - 400);
      pg.vertex(p.noise(i * 0.1, 0.4, p.millis() * 0.0015) * 900 - 400,
        p.noise(i * 0.1, 0.5, p.millis() * 0.0012) * 900 - 400,
        p.noise(i * 0.1, 0.6, p.millis() * 0.0014) * 900 - 400);
      pg.vertex(p.noise(i * 0.1, 0.7, p.millis() * 0.0008) * 900 - 400,
        p.noise(i * 0.1, 0.8, p.millis() * 0.0011) * 900 - 400,
        p.noise(i * 0.1, 0.9, p.millis() * 0.0009) * 900 - 400);
      pg.endShape();
    }
    pg.popMatrix();
    pg.endDraw();
    p.image(pg, 0, 0);
    shader.set("u_depth", pg);

    let t = p.millis() * 0.001;
    let tpi = t * p.PI * 2;
    p.background(0);

    shader.set("iTime", t);

    p.filter(shader);

    // p.image(pg, 0, 0);
    // p.rect(0, 0, p.width, p.height)
  }

};

var p021 = new p5(s);