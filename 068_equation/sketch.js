function PRect() {
  this.rl;
  this.rr;
  this.rt;
  this.rb;
}
PRect.prototype.draw = function () {
  p068.rect(this.rl, this.rt, this.rr - this.rl, this.rb - this.rt);
}
var rect = new PRect();

function Arm() {
  this.x0;
  this.x1;
  this.y0;
  this.y1;
  this.f;
  this.a;
  this.b;
}
Arm.prototype.update = function (pos) {
  // y = ax + b
  this.a = (this.y1 - this.y0) / (this.x0 - this.x1);
  this.b = this.y0 - this.a * this.x0;
}
Arm.prototype.inside = function (pos) {
  let d = 20;
  if(pos.x < Math.min(this.x0, this.x1) - d) return false;
  if(pos.x > Math.max(this.x0, this.x1) + d) return false;
  if(pos.y < Math.min(this.y0, this.y1) - d) return false;
  if(pos.y > Math.max(this.y0, this.y1) + d) return false;
  let c = pos.y - this.a * pos.x - this.b;
  return Math.abs(c) < d;
}
Arm.prototype.draw = function () {
  p068.line(this.x0, this.y0, this.x1, this.y1);
}
var arm = new Arm();

function Particle(x, y) {
  this.pos = p068.createVector(x, y);
  // this.pos.mult(100);
  this.vel = p068.createVector(0, 0);
  this.acc = p068.createVector(0, 0);
  this.R = 16;
  this.r = 4; // render
}

Particle.prototype.attractedTo = function (other) {

  let d = p068.dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
  if (d < this.R + other.R) {
    let attraction = p068.createVector(other.pos.x, other.pos.y);
    attraction.sub(this.pos);
    attraction.mult(5.0 / (attraction.mag() * attraction.mag() + 10.0));
    if(d < (this.R + other.R) * 0.1) {
      attraction.mult(-0.1);
    }
    this.acc.add(attraction);
  }
  else {
  }
}

Particle.prototype.move = function () {
  if(arm.inside(this.pos)) {
    this.acc.add(arm.f);
  }

  this.acc.x += p068.random(-1, 1) * 0.1;
  this.acc.y += p068.random(-1, 1) * 0.1;
  this.vel.add(this.acc);
  this.pos.add(this.vel);
  this.vel.mult(0.9);
  this.acc.mult(0.7);

  if(this.pos.x < 0) {
    this.pos.x += p068.width;
  }
  else if(this.pos.x > p068.width) {
    this.pos.x -= p068.width;
  }
  if(this.pos.y < 0) {
    this.pos.y += p068.height;
  }
  else if(this.pos.y > p068.height) {
    this.pos.y -= p068.height;
  }
}

Particle.prototype.render = function () {
  p068.noStroke();
  p068.fill(255);

  p068.ellipse(this.pos.x, this.pos.y, this.r * 2);
}

function Point(x, y, userData) {
  this.x = x;
  this.y = y;
  this.userData = userData;
}

function Rectangle(x, y, w, h) {
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
}

Rectangle.prototype.contains = function (point) {
  return (point.x >= this.x - this.w &&
    point.x <= this.x + this.w &&
    point.y >= this.y - this.h &&
    point.y <= this.y + this.h);
}


Rectangle.prototype.intersects = function (range) {
  return !(range.x - range.w > this.x + this.w ||
    range.x + range.w < this.x - this.w ||
    range.y - range.h > this.y + this.h ||
    range.y + range.h < this.y - this.h);
}



// circle class for a circle shaped query
function Circle(x, y, r) {
  this.x = x;
  this.y = y;
  this.r = r;
  this.rSquared = this.r * this.r;
}

Circle.prototype.contains = function (point) {
  // check if the point is in the circle by checking if the euclidean distance of
  // the point and the center of the circle if smaller or equal to the radius of
  // the circle
  let d = Math.pow((point.x - this.x), 2) + Math.pow((point.y - this.y), 2);
  return d <= this.rSquared;
}

Circle.prototype.intersects = function (range) {

  var xDist = Math.abs(range.x - this.x);
  var yDist = Math.abs(range.y - this.y);

  // radius of the circle
  var r = this.r;

  var w = range.w;
  var h = range.h;

  var edges = Math.pow((xDist - w), 2) + Math.pow((yDist - h), 2);

  // no intersection
  if (xDist > (r + w) || yDist > (r + h))
    return false;

  // intersection within the circle
  if (xDist <= w || yDist <= h)
    return true;

  // intersection on the edge of the circle
  return edges <= this.rSquared;
}

function QuadTree(boundary, capacity) {
  if (!boundary) {
    throw TypeError('boundary is null or undefined');
  }
  if (!(boundary instanceof Rectangle)) {
    throw TypeError('boundary should be a Rectangle');
  }
  if (typeof capacity !== 'number') {
    throw TypeError('capacity should be a number but is a' + typeof capacity);
  }
  if (capacity < 1) {
    throw RangeError('capacity must be greater than 0');
  }
  this.boundary = boundary;
  this.capacity = capacity;
  this.points = [];
  this.divided = false;
}

QuadTree.prototype.subdivide = function () {
  let x = this.boundary.x;
  let y = this.boundary.y;
  let w = this.boundary.w / 2;
  let h = this.boundary.h / 2;

  let ne = new Rectangle(x + w, y - h, w, h);
  this.northeast = new QuadTree(ne, this.capacity);
  let nw = new Rectangle(x - w, y - h, w, h);
  this.northwest = new QuadTree(nw, this.capacity);
  let se = new Rectangle(x + w, y + h, w, h);
  this.southeast = new QuadTree(se, this.capacity);
  let sw = new Rectangle(x - w, y + h, w, h);
  this.southwest = new QuadTree(sw, this.capacity);

  this.divided = true;
}

QuadTree.prototype.insert = function (point) {
  if (!this.boundary.contains(point)) {
    return false;
  }

  if (this.points.length < this.capacity) {
    this.points.push(point);
    return true;
  }

  if (!this.divided) {
    this.subdivide();
  }

  if (this.northeast.insert(point) || this.northwest.insert(point) ||
    this.southeast.insert(point) || this.southwest.insert(point)) {
    return true;
  }
}

QuadTree.prototype.query = function (range, found) {
  if (!found) {
    found = [];
  }

  if (!range.intersects(this.boundary)) {
    return found;
  }

  for (let i in this.points) {
    let p = this.points[i];
    if (range.contains(p)) {
      found.push(p);
    }
  }
  if (this.divided) {
    this.northwest.query(range, found);
    this.northeast.query(range, found);
    this.southwest.query(range, found);
    this.southeast.query(range, found);
  }

  return found;
}

var s = function (p) {
  let name;
  let startFrame;
  let cycle = 8.0;
  let particles = [];

  p.setup = function () {
    name = p.folderName;

    p.createCanvas(800, 800);
    p.frameRate(30);

    font = p.createFont("assets/Avenir.otf", 60);
    startFrame = p.frameCount;

    for (let i = 0; i < 200; i++) {
      particles[i] = new Particle(p.random(p.width), p.random(p.height));
    }
  }

  function getCount() { return p.frameCount - startFrame };

  p.draw = function () {
    t = (getCount() / 30.0);
    if (getCount() % (30 * cycle) == 0) {

    }

    p.background(0);

    p.background(0);


    let boundary = new Rectangle(300, 200, 600, 400);
    let qtree = new QuadTree(boundary, 4);

    p.stroke(255);
    p.noFill();
    let rcx = p.width * 0.5 + 200 * Math.cos(t * Math.PI / 2);
    let rcy = p.height * 0.5;
    arm.x0 = rcx + 100 * Math.cos(t * Math.PI);
    arm.y0 = rcy + 100 * Math.sin(t * Math.PI);
    arm.x1 = rcx + 0;
    arm.y1 = rcy + 0;
    arm.f = p.createVector(0, 0)
    arm.f.x = -10 * Math.sin(t * Math.PI);
    arm.f.y = 10 * Math.cos(t * Math.PI);
    arm.update();
    arm.draw();

    for (let i in particles) {
      let pt = particles[i];
      let point = new Point(pt.pos.x, pt.pos.y, pt);
      qtree.insert(point);


      pt.move();
      pt.render();
    }

    for (let i in particles) {
      let pt = particles[i];
      let range = new Circle(pt.pos.x, pt.pos.y, pt.r * 2);
      let points = qtree.query(range);
      for (let i in points) {
        let point = points[i];
        let other = point.userData;
        if (pt !== other) {
          pt.attractedTo(other);
        }
      }
    }

    p.textFont(font, 32);
    // p.text("Janine's text makes me think of structures", 0, 98);
    // p.text("rather than colors or textures", 0, 98+l);
    // p.text("more specifically it's the rules of structures", 0, 98+l*2);
    // p.text("that can be implemented in several ways", 0, 98+l*3);
    if (getCount() % 15 == 0) {
      // p.saveFrame(name + "/capture/######.png");
    }

  }

};

var p068 = new p5(s);
