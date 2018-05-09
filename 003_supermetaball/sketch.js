// instance mode by Naoto Hieda

var shader;
var pos = [];

var s = function (p) {

  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(30);
    shader = p.loadShader(p.sketchPath("003_supermetaball/frag.glsl"));

    for(let i = 0; i < 4; i++) {
      pos.push(p.createVector(0, 0));
    }
  }

  let angle = 0;
  p.draw = function () {
    if (p.frameCount % 60 == 0) {
      // shader = p.loadShader(p.sketchPath("003_supermetaball/frag.glsl"));
      print(p.frameRate());
    }

    let t = p.millis() * 0.001;
    let tpi = t * p.PI;
    p.background(0);

    shader.set("iTime", t);

    let x = 0.0;//Math.cos(angle) * 3.0;
    let y = 2.0;
    let z = 3.0;//Math.sin(angle) * 3.0;
    shader.set("cameraPosition", x, y, z);

    let m = p.map(Math.cos(tpi * 0.25), -1, 1, 0, 12);
    let n2 = p.map(Math.cos(tpi * 0.125), -1, 1, 1, 12);
    shader.set("S1", m, 5.0, 12.0, 2.0);
    shader.set("S2", m, 1.0, 1.0, 1.0);

    let pg = 0.0;
    let dg = 1.0;
    let itr = 32.0;
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

var p003 = new p5(s);