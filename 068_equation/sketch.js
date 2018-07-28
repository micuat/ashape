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
    attraction.mult(3.0 / (attraction.mag() + 100.0));
    if(d < (this.R + other.R) * 0.1) {
      attraction.mult(-0.01);
    }
    this.acc.add(attraction);
  }
  else {
  }
}

Particle.prototype.move = function () {
  // if(arm.inside(this.pos)) {
  //   this.acc.add(arm.f);
  // }

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
  // p068.push();
  // p068.translate(this.pos.x, this.pos.y);
  // p068.sphere(this.r);
  // p068.pop();
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

QuadTree.prototype.draw = function () {
  if(this.divided) {
    this.northwest.draw();
    this.northeast.draw();
    this.southwest.draw();
    this.southeast.draw();
  }
  else {
    p068.rect(this.boundary.x, this.boundary.y, 2 * this.boundary.w, 2 * this.boundary.h);
  }
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
  let initPositions = [];

  p.setup = function () {
    name = p.folderName;

    p.createCanvas(800, 800);
    p.frameRate(30);

    font = p.createFont("assets/Avenir.otf", 60);
    startFrame = p.frameCount;
    for (let i = 0; i < 100; i++) {
      // particles[i] = new Particle(p.random(p.width), p.random(p.height));
      particles[i] = new Particle(0, 0);
      initPositions[i] = {x: 0, y: 0};
    }
  }

  function getCount() { return p.frameCount - startFrame };

  p.draw = function () {
    t = (getCount() / 30.0);
    if (getCount() % (30 * cycle) == 0) {
      // particles = [];
      let x, y, w, h;
      function assign() {
        x = Math.floor(p.random(1, 7)) * 100 + 50;
        y = Math.floor(p.random(1, 7)) * 100 + 50;
        switch (Math.floor(p.random(0, 3))) {
          case 0:
          w = 25;
          h = Math.floor(p.random(4, 8)) * 50;
          break;
          case 1:
          w = Math.floor(p.random(4, 8)) * 50;
          h = 25;
          break;
          case 2:
          w = 3 * 50;
          h = 3 * 50;
          break;
        }
      }
      assign();
      let i = 0;
      let res = 20;
      for (; i < particles.length / 2; i++) {
        // particles[i] = new Particle(p.random(p.width), p.random(p.height));
        particles[i].pos.x = Math.floor(p.random(-w/2, w/2) / res) * res+x;
        particles[i].pos.y = Math.floor(p.random(-h/2, h/2) / res) * res+y;
        initPositions[i].x = particles[i].pos.x;
        initPositions[i].y = particles[i].pos.y;
      }
      assign();
      for (; i < particles.length; i++) {
        // particles[i] = new Particle(p.random(p.width), p.random(p.height));
        particles[i].pos.x = Math.floor(p.random(-w/2, w/2) / res) * res+x;
        particles[i].pos.y = Math.floor(p.random(-h/2, h/2) / res) * res+y;
        initPositions[i].x = particles[i].pos.x;
        initPositions[i].y = particles[i].pos.y;
      }
    }

    p.background(0);

    p.fill(128);
    p.noStroke();
    for(let i in initPositions) {
      p.ellipse(initPositions[i].x, initPositions[i].y, 8);
    }

    let boundary = new Rectangle(400, 400, p.width, p.height);
    let qtree = new QuadTree(boundary, 4);

    for (let i in particles) {
      let pt = particles[i];
      let point = new Point(pt.pos.x, pt.pos.y, pt);
      qtree.insert(point);

      if(t % cycle > 2.0) {
        pt.move();
      }
      pt.render();
    }

    p.rectMode(p.CENTER);
    p.noFill();
    p.stroke(255);
    // qtree.draw();

    if(t % cycle > 4.0) {
      for (let i in particles) {
        let pt = particles[i];
        let range = new Circle(pt.pos.x, pt.pos.y, pt.r * 2);
        let points = qtree.query(range);
        for (let j in points) {
          let point = points[j];
          let other = point.userData;
          if (pt !== other) {
            pt.attractedTo(other);
            // break;
          }
        }
      }
    }

    if(t % cycle < 2.0) {
      let alpha = 1.0;
      if(t % cycle > 1.0) {
        alpha = p.map(t % cycle, 1, 2, 1, 0);
      }
      p.fill(255, 255 * alpha);
      p.textFont(font, 48);
      p.textAlign(p.CENTER);
      p.translate(p.width / 2, p.height / 2);
      p.text("Structures as the apparatus that", 0, -30);
      p.text("allow the thought to form", 0, 30);
    }

    if (getCount() % 15 == 0) {
      // p.saveFrame(name + "/capture/######.png");
    }

  }

};

var p068 = new p5(s);
