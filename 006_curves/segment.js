// Daniel Shiffman
// http://codingtra.in
// http://patreon.com/codingtrain
// Video: https://youtu.be/RTc6i-7N3ms

function Segment() {
  this.a;
  this.angle = 0;
  this.len;
  this.b = new p5.Vector();
  this.parent = null;
  this.child = null;
  this.sw = 0;

  if (arguments.length == 4) {
    //Segment(float x, float y, float len_, float i) {
    let x = arguments[0];
    let y = arguments[1];
    let len_ = arguments[2];
    let i = arguments[3];
    this.a = new p5.Vector(x, y);
    this.sw = p064.map(i, 0, 20, 1, 10);
    this.len = len_;
    this.calculateB();
  }

  if (arguments.length == 3) {
    // Segment(Segment parent_, float len_, float i) {
    let parent_ = arguments[0];
    let len_ = arguments[1];
    let i = arguments[2];
    this.parent = parent_;
    this.sw = p064.map(i, 0, 20, 1, 10);
    this.a = parent_.b.copy();
    this.len = len_;
    this.calculateB();
  }
}

Segment.prototype.setA = function (pos) {
  this.a = pos.copy();
}

Segment.prototype.attachA = function () {
  this.setA(this.parent.b);
}

Segment.prototype.follow = function (tx, ty) {
  if (tx === undefined) {
    let targetX = this.child.a.x;
    let targetY = this.child.a.y;
    this.follow(targetX, targetY);
  }
  else {
    let target = new p5.Vector(tx, ty);
    let dir = p5.Vector.sub(target, this.a);
    this.angle = dir.heading();
    dir.setMag(this.len);
    dir.mult(-1);
    this.a = p5.Vector.add(target, dir);
  }
}

Segment.prototype.calculateB = function () {
  let dx = this.len * p064.cos(this.angle);
  let dy = this.len * p064.sin(this.angle);
  this.b.set(this.a.x + dx, this.a.y + dy);
}

Segment.prototype.update = function () {
  this.calculateB();
}


Segment.prototype.show = function () {
  p064.stroke(255);
  p064.line(this.a.x, this.a.y, this.b.x, this.b.y);
}
