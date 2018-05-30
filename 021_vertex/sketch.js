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

    let t = p.millis() * 0.001;

    pg.beginDraw();
    pg.background(0);
    pg.noStroke();
    pg.shader(depthShader);
    pg.pushMatrix();
    pg.translate(pg.width * 0.5, pg.height * 0.5);
    pg.rotateY(t*0.2);
    pg.translate(0, 0, -400);
    pg.rotate(t);
    for (let j = 0; j < 8; j++) {
      pg.translate(0, 0, 100);
      pg.rotate(0.4);
      for (let i = 0; i < 16; i++) {
        let phi = p.map(i+0.5, 0, 16, 0, p.TWO_PI);
        let phi1 = p.map(i, 0, 16, 0, p.TWO_PI);
        let phi2 = p.map(i + 1, 0, 16, 0, p.TWO_PI);
        let r = 400;
        let r1 = 300 + 300 * p.noise(i, t * 2);
        let r2 = 300 + 100 * p.noise(i + 1, t);
        pg.fill(128 * p.sin(i + t) + 128);
        pg.beginShape();
        pg.vertex(r1 * p.cos(phi) * 0.5, r1 * p.sin(phi) * 0.5, -200 + 400 * p.noise(i * 5, t));
        pg.vertex(r * p.cos(phi1), r * p.sin(phi1), 0);
        pg.vertex(r * p.cos(phi2), r * p.sin(phi2), 0);
        pg.endShape();
      }
    } pg.popMatrix();
    pg.endDraw();
    p.image(pg, 0, 0);
    shader.set("u_depth", pg);

    let tpi = t * p.PI * 2;
    p.background(0);

    shader.set("iTime", t);

    p.filter(shader);

    // p.image(pg, 0, 0);
    // p.rect(0, 0, p.width, p.height)
  }

};

var p021 = new p5(s);