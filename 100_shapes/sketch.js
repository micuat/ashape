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

var n = 8;
var targets = [];
var coeffs = [];
var bangTime = 0;

for(let i = 0; i < n; i++) {
  targets[i] = 0;
  coeffs[i] = 0;
}

var S100 = function (p) {
  let pg;
  let lastSeq = -1;
  let cycle = 2.0;
  
  let remoteLocation = new Packages.netP5.NetAddress("127.0.0.1", 57110);

  pg = p.createGraphics(800, 800, p.P3D);

  function Barrier(x, y) {
    this.pos = p.createVector(x, y);
    this.init = function (x, y) {
      this.targetPos = p.createVector(x, y);
      this.isMoving = true;
      this.size = 20;
      this.vel = 20;
    }
    this.init(x, y);
    this.update = function () {
      if(this.isMoving == true) {
        if(this.targetPos.y < this.pos.y) {
          this.pos.y -= this.vel;
        }
        else {
          this.pos.y += this.vel;
        }
        if(Math.abs(this.pos.y - this.targetPos.y) <= this.vel) {
          this.pos.y = this.targetPos.y;
          this.isMoving = false;
        }
      }
    }
    this.draw = function (pg) {
      pg.pushMatrix();
      pg.translate(this.pos.x, this.pos.y);
      pg.box(10, this.size * 2, this.size * 2);
      pg.popMatrix();
    }
  }
  function Laser(x, y) {
    this.init = function () {
      this.banged = false;
      this.startPos = p.createVector(pg.width * -0.5, y);
      this.posRight = this.startPos.copy();
      this.posLeft = this.startPos.copy();
      this.endPos = p.createVector(pg.width * 0.5, y);
      this.vel = p.createVector(5, 0);
      this.minLength = 50;
      this.hit = false;
    }
    this.init();

    this.update = function (banged) {
      let hit = false;
      for(let i in barriers) {
        if(barriers[i].isMoving == false) {
          if(this.posRight.x >= barriers[i].pos.x
            && (Math.abs(this.posRight.y - barriers[i].pos.y) < barriers[i].size)) {
            if(this.hit == false) {
              // first time
              this.hit = true;

              let m = new Packages.oscP5.OscMessage("/s_new");
              m.add("blip");
              m.add(-1);
              m.add(0);
              m.add(0);
              m.add("freq");
              p.addFloat(m, 0 + (x + pg.width * 0.5) * 0.5);
              m.add("dur");
              p.addFloat(m, this.posRight.dist(this.posLeft) * 0.002);
              p.oscP5.send(m, remoteLocation);      
            }
            hit = true;
          }
        }
      }

      if(hit) {
        if(banged || this.banged) {
          this.posLeft.add(this.vel);
          this.banged = true;
        }
      }
      else {
        this.posRight.add(this.vel);
        let length = this.posRight.dist(this.posLeft);
        if(length > this.minLength && (banged || this.banged)) {
          this.posLeft.add(this.vel);
          this.banged = true;
        }
      }
      if(this.posRight.x < this.posLeft.x || this.posLeft.x > this.endPos.x) {
        this.init();
      }
    }
    this.draw = function (pg) {
      pg.pushMatrix();
      let x = (this.posLeft.x + this.posRight.x) * 0.5;
      let y = (this.posLeft.y + this.posRight.y) * 0.5;
      let w = (this.posRight.x - this.posLeft.x) * 0.5;
      pg.translate(x, y);
      pg.box(w, 10, 10);
      pg.popMatrix();
    }
  }
  let barriers = [];
  for(let i = 0; i < 16; i++) {
    let x = pg.width * p.map(i + 0.5, 0, 16, -0.5, 0.5);
    let y = x;
    barriers.push(new Barrier(x, y));
  }
  let lasers = [];
  for(let i = 0; i < 16; i++) {
    let x = pg.width * p.map(i + 0.5, 0, 16, -0.5, 0.5);
    let y = x;
    lasers.push(new Laser(x, y));
  }

  let funcs = [
    function(index) {
      return index * pg.width * 0.5;
    },
    function(index) {
      return index * pg.width * -0.5;
    },
    function(index) {
      return ((((index + 1) * 3) % 2) - 1) * pg.width * 0.5;
    },
    function(index) {
      return 0;
    }
  ]
  let indexFunc = funcs[0];
  this.metro = function(mode) {
    indexFunc = funcs[mode];

    for(let i = 0; i < barriers.length; i++) {
      let index = p.map(i + 0.5, 0, barriers.length, -1, 1);
      barriers[i].init(barriers[i].pos.x, indexFunc(index));
    }
  }
  function drawPg(pg, t) {
    let seq = Math.floor(t / cycle);

    pg.beginDraw();
    pg.blendMode(p.BLEND);
    pg.background(0);

    let banged = false;
    if(t - bangTime > 1) {
      banged = true;
    }
    for(let i in barriers) {
      barriers[i].update();
    }
    for(let i in lasers) {
      lasers[i].update(banged);
    }

    pg.translate(pg.width * 0.5, pg.height * 0.5);
    pg.rotateY(p.map(p.mouseX, 0, p.width, -Math.PI, Math.PI));
    pg.rotateX(p.map(p.mouseY, 0, p.height, -Math.PI, Math.PI));

    pg.lights();
    pg.noStroke();
    pg.fill(200);
    for(let i in barriers) {
      barriers[i].draw(pg);
    }
    for(let i in lasers) {
      lasers[i].draw(pg);
    }

    pg.endDraw();
    lastSeq = seq;
  }

  this.draw = function (t) {
    drawPg(pg, t);
    p.image(pg, 0, 0);
  }
};

var s = function (p) {
  let startTime;
  
  let s100 = new S100(p);

  p.setup = function () {
    name = p.folderName;

    p.createCanvas(800, 800);
    p.frameRate(30);

    startTime = p.millis();
  }

  function getTime() { return (p.millis() - startTime) * 0.001 };

  p.draw = function () {
    t = getTime();

    s100.draw(t);
  }

  p.oscEvent = function (m) {
    if (m.checkAddrPattern("/sc3p5") && m.checkTypetag("ffffffff")) {
      for(let i = 0; i < 8; i++) {
        targets[i] = m.get(i).floatValue() > 0.5 ? 1 : 0;
      }
    }
    if (m.checkAddrPattern("/sc3p5/bang")) {
      s100.metro(m.get(0).intValue());
      bangTime = getTime();
    }
  }
};

var p = new p5(s);
