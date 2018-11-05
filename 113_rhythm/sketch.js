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

var S113 = function (p) {
  let pg;

  pg = p.createGraphics(800, 800, p.P3D);

  this.click = function () {
    let b = p.random(this.boxes);
    b.ly = b.lorg * 20;
  }

  this.sig = function () {
    this.rotXTarget = p.random(-Math.PI, Math.PI);
    this.rotYTarget = p.random(-Math.PI, Math.PI);
    this.sine = 1.0;
  }

  this.hhat = function () {
    this.shake = 1;
  }

  this.shake = 0.0;
  this.rotX = 0.0;
  this.rotY = 0.0;
  this.rotXTarget = 0.0;
  this.rotYTarget = 0.0;
  this.sine = 0.0;

  function Box(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;

    this.lorg = 800.0 / 36.0;
    this.lx = 800.0 / 36.0;
    this.ly = 800.0 / 36.0;
    this.lz = 800.0 / 36.0;

    this.draw = function (pg) {
      pg.pushMatrix();

      pg.translate(this.x, this.y, this.z);
      pg.box(this.lorg, this.ly, this.lorg * 16);
      this.lx = p.lerp(this.lx, this.lorg, 0.3);
      this.ly = p.lerp(this.ly, this.lorg, 0.3);
      this.lz = p.lerp(this.lz, this.lorg, 0.3);
      pg.popMatrix();
  
    }
  }
  this.boxes = [];
  for(let i = -16; i <= 16; i++) {
    this.boxes.push(new Box(i * 800.0 / 32.0, 0, 0));
  }

  this.drawPg = function(pg, t) {
    pg.beginDraw();
    pg.background(0);

    pg.translate(pg.width * 0.5, pg.height * 0.5);
    pg.pointLight(255, 255, 255, 0, 0, 400);
    pg.rotateZ(this.rotX);
    pg.rotateY(this.rotY);
    this.rotX = p.lerp(this.rotX, this.rotXTarget, 0.3);
    this.rotY = p.lerp(this.rotY, this.rotYTarget, 0.3);

    // pg.noFill();
    // pg.stroke(255);
    pg.fill(200);
    pg.noStroke();
    for(let i in this.boxes) {
      let box = this.boxes[i];
      pg.pushMatrix();
      let y = this.shake * p.random(-1, 1) * 30 + this.sine * Math.sin(box.x * 0.01) * 300;
      pg.translate(0, y);
      box.draw(pg);
      pg.popMatrix();
    }
    this.shake = p.lerp(this.shake, 0, 0.3);
    this.sine = p.lerp(this.sine, 0, 0.1);

    pg.endDraw();
  }

  this.draw = function (t) {
    this.drawPg(pg, t);
    p.image(pg, 0, 0);
  }
};

var s = function (p) {
  let startTime;
  
  let s113 = new S113(p);

  p.setup = function () {
    name = p.folderName;

    p.createCanvas(800, 800);
    p.frameRate(60);

    startTime = p.millis();
  }

  function getTime() { return (p.millis() - startTime) * 0.001 };

  p.draw = function () {
    t = getTime();

    s113.draw(t);
  }

  p.oscEvent = function (m) {
    let path = m.addrPattern().split("/");
    if (path.length >= 3 && path[1] == "sc3p5" && path[2] == "click") {
      s113.click();
    }
    else if (path.length >= 3 && path[1] == "sc3p5" && path[2] == "sig") {
      s113.sig();
    }
    else if (path.length >= 3 && path[1] == "sc3p5" && path[2] == "hhat") {
      s113.hhat();
    }
  }

  p.mousePressed = function () {
  }
};

p = new p5(s);
