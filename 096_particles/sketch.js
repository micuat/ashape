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

var S096 = function (p) {
  let startTime;
  let pg;
  let lastSeq;
  let cycle = 4.0;
  
  let remoteLocation = new Packages.netP5.NetAddress("127.0.0.1", 57110);

  pg = p.createGraphics(800, 800, p.P3D);

  function Particle() {
    this.isDead = true;
    this.init = function () {
      this.pos = p.createVector(0, 0);
      this.vel = p5.Vector.random2D();
      this.vel.mult(p.random(2, 10));
      this.acc = p.createVector(0, 0.1);
    }
    this.init();

    this.spawn = function () {
      if(this.isDead) {
        this.isDead = false;
      }
    } 
    this.update = function () {
      if(this.isDead) return;

      this.vel.add(this.acc);
      this.pos.add(this.vel);

      // bounce
      if(Math.abs(this.pos.x) > pg.width / 8) {
        this.vel.x *= -1;
        let m = new Packages.oscP5.OscMessage("/s_new");
        m.add("grain");
        m.add(-1);
        m.add(0);
        m.add(0);
        m.add("freq");
        p.addFloat(m, p.random(0, 500) + 2000 + 100 * this.vel.y);
        m.add("pan");
        p.addFloat(m, 0);
        m.add("vol");
        let vol = 1.0;
        p.addFloat(m, vol);
        p.oscP5.send(m, remoteLocation);
      }
      
      if(this.pos.y > pg.width / 2) {
        this.isDead = true;
        this.init();
      }
    }
    this.draw = function () {
      if(this.isDead) return;
      pg.ellipse(this.pos.x, this.pos.y, 10, 10);
    }

  }

  let particles = [];
  for(let i = 0; i < 100; i++) {
    particles.push(new Particle());
  }

  function drawPg(pg, t) {
    let seq = Math.floor(t / cycle);
    pg.beginDraw();
    pg.blendMode(p.BLEND);
    pg.background(0);

    pg.translate(pg.width * 0.5, pg.height * 0.5);

    if (seq != lastSeq) {
    }

    let phase = t / cycle % 1.0;

    pg.fill(255);
    pg.noStroke();
    for(let i in particles) {
      if(seq % 2 == 0 && p.random(1) > 0.75) {
        particles[i].spawn();
      }
      particles[i].update();
    }
    for(let i in particles) {
      particles[i].draw();
    }

    lastSeq = seq;
    pg.endDraw();
  }

  this.draw = function (t) {
    drawPg(pg, t);
    p.image(pg, 0, 0);
  }
};

var s = function (p) {
  let startTime;
  
  let s096 = new S096(p);

  p.setup = function () {
    name = p.folderName;

    p.createCanvas(800, 800);
    p.frameRate(30);

    startTime = p.millis();
  }

  function getTime() { return (p.millis() - startTime) * 0.001 };

  p.draw = function () {
    t = getTime();

    s096.draw(t);
  }
};

var p = new p5(s);
