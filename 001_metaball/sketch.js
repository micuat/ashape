// instance mode by Naoto Hieda

var shader;

var s = function (p) {

  p.setup = function () {
    p.createCanvas(800, 800);
    shader = p.loadShader(p.sketchPath("../001_metaball/frag.glsl"));
  }

  let angle = 0;
  p.draw = function () {
    if (p.frameCount % 120 == 0) {
      // shader = p.loadShader(p.sketchPath("../001_metaball/frag.glsl"));
    }

    let t = p.millis() * 0.001;
    let tpi = t * p.PI;
    p.background(0);

    shader.set("iTime", t);

    let x = Math.cos(angle) * 3.0;
    let y = 3.0;
    let z = Math.sin(angle) * 3.0;
    shader.set("cameraPosition", x, y, z);

    let pg = 0.0;
    let dg = 1.0;
    let itr = 64.0;
    if ((t - 0.5) % 4 < 2) {
      itr = p.map(p.abs((t - 0.5) % 4 - 1), 0, 1, 16, 64);
      // pg = 1.0;
      angle += (1 - p.abs((t - 0.5) % 4 - 1)) * 0.25;
    }
    else {
      angle += 0.025;
      // dg = 0.1;
    }
    shader.set("iteration", itr);
    shader.set("dGlitch", dg);
    p.filter(shader);
  }

};

var p001 = new p5(s);