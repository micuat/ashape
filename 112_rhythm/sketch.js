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

var S112 = function (p) {
  let pg;

  pg = p.createGraphics(800, 800, p.P3D);

  this.click = function () {
    let l = p.random(["lx", "ly", "lz"]);
    this[l] = this.lorg * 2;
  }

  this.sig = function () {
    this.rotXTarget = p.random(-Math.PI, Math.PI);
    this.rotYTarget = p.random(-Math.PI, Math.PI);
  }

  this.hhat = function () {
    this.shake = 1;
  }

  this.shake = 0;
  this.rotX = 0.0;
  this.rotY = 0.0;
  this.rotXTarget = 0.0;
  this.rotYTarget = 0.0;

  this.lx = 200;
  this.ly = 200;
  this.lz = 200;
  this.lorg = 200;

  this.drawPg = function(pg, t) {
    pg.beginDraw();
    pg.background(0);

    pg.translate(pg.width * 0.5, pg.height * 0.5);
    pg.rotateX(this.rotX);
    pg.rotateY(this.rotY);
    this.rotX = p.lerp(this.rotX, this.rotXTarget, 0.3);
    this.rotY = p.lerp(this.rotY, this.rotYTarget, 0.3);

    pg.pushMatrix();

    pg.noFill();
    pg.stroke(255);
    pg.translate(this.shake * p.random(-1, 1) * 30, 0);
    this.shake = p.lerp(this.shake, 0, 0.3);
    pg.box(this.lx, this.lorg, this.lorg);
    pg.box(this.lorg, this.ly, this.lorg);
    pg.box(this.lorg, this.lorg, this.lz);
    this.lx = p.lerp(this.lx, this.lorg, 0.3);
    this.ly = p.lerp(this.ly, this.lorg, 0.3);
    this.lz = p.lerp(this.lz, this.lorg, 0.3);
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
  
  let s112 = new S112(p);

  p.setup = function () {
    name = p.folderName;

    p.createCanvas(800, 800);
    p.frameRate(60);

    startTime = p.millis();
  }

  function getTime() { return (p.millis() - startTime) * 0.001 };

  p.draw = function () {
    t = getTime();

    s112.draw(t);
  }

  p.oscEvent = function (m) {
    let path = m.addrPattern().split("/");
    if (path.length >= 3 && path[1] == "sc3p5" && path[2] == "click") {
      s112.click();
    }
    else if (path.length >= 3 && path[1] == "sc3p5" && path[2] == "sig") {
      s112.sig();
    }
    else if (path.length >= 3 && path[1] == "sc3p5" && path[2] == "hhat") {
      s112.hhat();
    }
  }

  p.mousePressed = function () {
  }
};

p = new p5(s);
