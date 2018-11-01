// https://gist.github.com/gre/1650294
EasingFunctions = {
  // no easing, no acceleration
  linear: function (t) { return t },
  // accelerating from zero velocity
  easeInQuad: function (t) { return t * t },
  // decelerating to zero velocity
  easeOutQuad: function (t) { return t * (2 - t) },
  // acceleration until halfway, then deceleration
  easeInOutQuad: function (t) { return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t },
  // accelerating from zero velocity 
  easeInCubic: function (t) { return t * t * t },
  // decelerating to zero velocity 
  easeOutCubic: function (t) { return (--t) * t * t + 1 },
  // acceleration until halfway, then deceleration 
  easeInOutCubic: function (t) { return t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1 },
  // accelerating from zero velocity 
  easeInQuart: function (t) { return t * t * t * t },
  // decelerating to zero velocity 
  easeOutQuart: function (t) { return 1 - (--t) * t * t * t },
  // acceleration until halfway, then deceleration
  easeInOutQuart: function (t) { return t < .5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t },
  // accelerating from zero velocity
  easeInQuint: function (t) { return t * t * t * t * t },
  // decelerating to zero velocity
  easeOutQuint: function (t) { return 1 + (--t) * t * t * t * t },
  // acceleration until halfway, then deceleration 
  easeInOutQuint: function (t) { return t < .5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t }
}

var p;

function Segment() {
  p = arguments[0];
  this.pg = arguments[1];
  this.a;
  this.angle = 0;
  this.len;
  this.b = new p5.Vector();
  this.sw = 0;
  this.target = p.createVector();
  this.width = 20;

  if (arguments.length == 6) {
    let x = arguments[2];
    let y = arguments[3];
    let len_ = arguments[4];
    let i = arguments[5];
    this.a = new p5.Vector(x, y);
    this.sw = p.map(i, 0, 20, 1, 10);
    this.len = len_;
    this.calculateB();
  }

  if (arguments.length == 5) {
    let parent_ = arguments[2];
    let len_ = arguments[3];
    let i = arguments[4];
    this.sw = p.map(i, 0, 20, 1, 10);
    this.a = parent_.b.copy();
    this.len = len_;
    this.calculateB();
  }
}

Segment.prototype.setA = function (pos) {
  this.a = pos.copy();
  this.calculateB();
}

Segment.prototype.follow = function () {
  if (arguments.length == 1) {
    let child = arguments[0];
    let targetX = child.a.x;
    let targetY = child.a.y;
    this.follow(targetX, targetY);
  }
  else if (arguments.length == 2) {
    let tx = arguments[0];
    let ty = arguments[1];
    let target = new p5.Vector(tx, ty);
    this.target = target;
    let dir = p5.Vector.sub(target, this.a);
    this.angle = dir.heading();
    dir.setMag(this.len);
    dir.mult(-1);
    this.a = p5.Vector.add(target, dir);

  }
}

Segment.prototype.calculateB = function () {
  let dx = this.len * Math.cos(this.angle);
  let dy = this.len * Math.sin(this.angle);
  this.b.set(this.a.x + dx, this.a.y + dy);
}

Segment.prototype.update = function () {
  this.calculateB();
}


Segment.prototype.show = function (z) {
  let w = this.width;

  let dir0 = this.a.copy();
  dir0.sub(this.target);
  dir0.normalize();
  let dir1 = this.b.copy();
  dir1.sub(this.a);
  dir1.normalize();
  let cross = dir0.cross(dir1);
  cross.normalize();
  cross.mult(w);

  cross = dir0.cross(p.createVector(0, 0, 1));
  cross.normalize();
  cross.mult(w);

  let pLeft = this.a.copy();
  pLeft.sub(cross);
  let pRight = this.a.copy();
  pRight.add(cross);

  this.pg.vertex(pLeft.x, pLeft.y, pLeft.z + z);
  this.pg.vertex(pRight.x, pRight.y, pRight.z + z);
}

function Tentacle(p, pg, x, y, ex, ey, index) {
  this.p = p;
  this.pg = pg;
  this.segments = new Array(30);
  this.base;
  this.len = 40;
  this.defaultTarget = new p5.Vector(ex, ey);
  this.index = index;

  this.base = new p5.Vector(x, y);
  this.segments[0] = new Segment(p, this.pg, 300, 200, this.len, 0);
  for (let i = 1; i < this.segments.length; i++) {
    this.segments[i] = new Segment(p, this.pg, this.segments[i - 1], this.len, i);
  }

  this.target = p.createVector();

  ////

  this.startTime = 0;
  this.dead = true;
  this.lifeTime = 3;
}

Tentacle.prototype.init = function (v) {
  this.startTime = this.p.millis() * 0.001;
  this.dead = false;

  this.base = v;
  this.segments[0].setA(this.base);

  for (let i = 1; i < this.segments.length; i++) {
    this.segments[i].setA(this.segments[i - 1].b);
  }
}

Tentacle.prototype.update = function (pos) {
  if (this.dead) return;
  if (this.p.millis() * 0.001 - this.startTime > this.lifeTime) {
    this.dead = true;
    return;
  }

  let total = this.segments.length;
  let end = this.segments[total - 1];

  this.target.lerp(pos, 0.1);
  end.follow(this.target.x, this.target.y);
  end.update();

  for (let i = total - 2; i >= 0; i--) {
    this.segments[i].follow(this.segments[i + 1]);
    this.segments[i].update();
  }

  // this.segments[0].setA(this.base);

  for (let i = 1; i < total; i++) {
    this.segments[i].setA(this.segments[i - 1].b);
  }
}

Tentacle.prototype.show = function () {
  if (this.dead) return;

  let c = this.p.map(this.p.millis() * 0.001 - this.startTime, this.lifeTime * 0.7, this.lifeTime, 1, 0);
  c = this.p.constrain(c, 0, 1);
  let d = this.p.map(this.p.millis() * 0.001 - this.startTime, 0, this.lifeTime * 0.1, 0, 1);
  d = this.p.constrain(d, 0, 1);

  this.pg.stroke(255);
  let total = this.segments.length;
  let end = this.segments[total - 1];
  this.pg.beginShape(this.p.TRIANGLE_STRIP);
  for (let i = 0; i < this.segments.length; i++) {
    if (this.segments.length - i < c * this.segments.length
      && i < d * this.segments.length)
      this.segments[i].show((1 - c) * 100 * i);
  }
  this.pg.endShape();
}

var S109 = function (p) {
  let tentacles = [];
  let pg;

  pg = p.createGraphics(800, 800, p.P3D);

  for (let i = 0; i < 32; i++) {
    let x = p.map(i, 0, 31, -400, 400);
    let y = 0;
    let t = new Tentacle(p, pg, x, y, x, p.height, i);
    // t.init(p.createVector(x, y));
    tentacles.push(t);
  }
  
  this.bx = 0;
  this.by = 0;
  this.back = 0;

  this.spawn = function (v) {
    for (let i = 0; i < tentacles.length; i++) {
      let t = tentacles[i];
      if (t.dead) {
        t.init(v);
        return;
      }
    }
  }

  this.drawPg = function(pg, t) {
    // if(p.frameCount % 30 == 0){// && p.key == '0') {
    //   this.spawn(p.createVector(0, 0));
    //   this.spawn(p.createVector(0, 0));
    // }
    pg.beginDraw();
    pg.background(0);
    // pg.background(this.back);

    pg.translate(pg.width * 0.5, pg.height * 0.5);

    pg.pushMatrix();

    // pg.noStroke();
    // pg.fill(255);
    pg.noFill();
    pg.pointLight(255, 255, 255, 0, 0, 100);
    for(let i = 0; i < tentacles.length; i++) {
      let x = p.cos(p.millis() * 0.003) * 400;
      let y = p.sin(p.millis() * 0.001) * 400;
      let v = p.createVector(x, y);
      tentacles[i].update(v);
      tentacles[i].show();
    }

    pg.popMatrix();

    pg.endDraw();
  }

  this.draw = function (t) {
    this.drawPg(pg, t);
    p.image(pg, 0, 0);
  }
};

var s = function (p) {
  let startTime;
  
  let s109 = new S109(p);

  p.setup = function () {
    name = p.folderName;

    p.createCanvas(800, 800);
    p.frameRate(30);

    startTime = p.millis();
  }

  function getTime() { return (p.millis() - startTime) * 0.001 };

  p.draw = function () {
    t = getTime();

    s109.draw(t);
  }

  p.oscEvent = function (m) {
    let path = m.addrPattern().split("/");
    if (path.length >= 3 && path[1] == "sc3p5" && path[2] == "spawn") {
      s109.spawn(p.createVector(m.get(0).floatValue(), 0));
    }
    else if (path.length >= 4 && path[1] == "sc3p5" && path[2] == "control") {
      s109[path[3]] = m.get(0).floatValue();
    }
  }

  p.mousePressed = function () {
  }
};

p = new p5(s);
