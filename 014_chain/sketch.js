// instance mode by Naoto Hieda


function DP() {
  this.r1 = 2.0;
  this.r2 = 1.0;
  this.m1 = 40;
  this.m2 = 10;
  this.a1 = 0;
  this.a2 = 0;
  this.a1_v = 0;
  this.a2_v = 0;
  this.g = 0.01;

  this.a1 = Math.PI / 2;
  this.a2 = Math.PI / 3;
  this.cx = 0;
  this.cy = 0;

  this.px = [];
  this.py = [];
  this.x1;
  this.x2;
  this.y1;
  this.y2;
}

DP.prototype.update = function () {
  let num1 = -this.g * (2 * this.m1 + this.m2) * Math.sin(this.a1);
  let num2 = -this.m2 * this.g * Math.sin(this.a1 - 2 * this.a2);
  let num3 = -2 * Math.sin(this.a1 - this.a2) * this.m2;
  let num4 = this.a2_v * this.a2_v * this.r2 + this.a1_v * this.a1_v * this.r1 * Math.cos(this.a1 - this.a2);
  let den = this.r1 * (2 * this.m1 + this.m2 - this.m2 * Math.cos(2 * this.a1 - 2 * this.a2));
  let a1_a = (num1 + num2 + num3 * num4) / den;

  num1 = 2 * Math.sin(this.a1 - this.a2);
  num2 = (this.a1_v * this.a1_v * this.r1 * (this.m1 + this.m2));
  num3 = this.g * (this.m1 + this.m2) * Math.cos(this.a1);
  num4 = this.a2_v * this.a2_v * this.r2 * this.m2 * Math.cos(this.a1 - this.a2);
  den = this.r2 * (2 * this.m1 + this.m2 - this.m2 * Math.cos(2 * this.a1 - 2 * this.a2));
  let a2_a = (num1 * (num2 + num3 + num4)) / den;

  // p013.push();
  // p013.translate(p013.width/2, p013.height/2);
  // p013.translate(this.cx, this.cy);
  // p013.stroke(255, 100);
  // p013.strokeWeight(2);

  let x1 = this.r1 * Math.sin(this.a1) * 400;
  let y1 = this.r1 * Math.cos(this.a1) * 400;

  let x2 = x1 + this.r2 * Math.sin(this.a2) * 400;
  let y2 = y1 + this.r2 * Math.cos(this.a2) * 400;

  this.x1 = this.r1 * Math.sin(this.a1) * 1;
  this.y1 = this.r1 * Math.cos(this.a1) * 1;

  this.x2 = this.x1 + this.r2 * Math.sin(this.a2) * 1;
  this.y2 = this.y1 + this.r2 * Math.cos(this.a2) * 1;


  // p013.line(0, 0, x1, y1);
  // // p013.noStroke();
  // // p013.fill(0);
  // // p013.ellipse(x1, y1, 15);

  // p013.line(x1, y1, x2, y2);
  // p013.noStroke();
  // p013.fill(255, 150);
  // if (Math.cos(this.a2) > 0.5 || Math.abs(this.a2_v) > 0.05) {
  //   p013.ellipse(x2, y2, 15);
  //   this.px.push(x2);
  //   this.py.push(y2);
  // }
  // else {
  //   this.px.push(-1000);
  //   this.py.push(-1000);
  // }
  // if (this.px.length > 10) this.px.shift();
  // if (this.py.length > 10) this.py.shift();

  // for(let i in this.px) {
  //   p013.ellipse(this.px[i], this.py[i], 15);
  // }
  // p013.pop();

  this.a1_v += a1_a;
  this.a2_v += a2_a;
  this.a1 += this.a1_v;
  this.a2 += this.a2_v;
}

var shader;
var pos = [];

var s = function (p) {
  let dp;

  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(30);

    shader = shaderHelper.load(p, "014_chain/frag.glsl");

    for (let i = 0; i < 4; i++) {
      pos.push(p.createVector(0, 0));
    }

    dp = new DP();
  }

  let angle = 0;
  p.draw = function () {
    if (p.frameCount % 60 == 0) {
      // shader = shaderHelper.load(p, "014_chain/frag.glsl");
      print(p.frameRate());
    }

    let t = p.millis() * 0.001;
    let tpi = t * p.PI * 2;
    p.background(0);

    shader.set("iTime", t);

    let pg = 0.0;
    let dg = 1.0;
    let itr = 60.0;
    
    if (t % 8 < 8) {
      angle += 0.025;
    }
    else {
      pg = 0.5;
      angle -= 0.1;
    }

    let x = Math.cos(angle) * 3.0;
    let y = 0.0;//3.0;
    let z = Math.sin(angle) * 3.0;

    shader.set("cameraPosition", x, y, z);

    pos[0].x = dp.x1;
    pos[0].y = 1-dp.y1;
    pos[1].x = dp.x2;
    pos[1].y = 1-dp.y2;

    let floatArray = Java.type("float[]");
    let bpos = new floatArray(3 * 4);
    for (let i = 0; i < 4; i++) {
      bpos[i * 3 + 0] = pos[i].x;
      bpos[i * 3 + 1] = pos[i].y;
      bpos[i * 3 + 2] = pos[i].z;
    }
    shader.set("bpos", bpos, 3);
    shader.set("bangle", dp.a1, dp.a2);

    shader.set("iteration", itr);
    shader.set("dGlitch", dg);
    p.filter(shader);
    // p.rect(0, 0, p.width, p.height)

    dp.update();
  }

};

var p013 = new p5(s);