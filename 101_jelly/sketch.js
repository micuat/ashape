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

var S101 = function (p) {
  let pg;
  
  let remoteLocation = new Packages.netP5.NetAddress("127.0.0.1", 57110);

  pg = p.createGraphics(800, 800, p.P3D);

  function Agent() {
    this.init = function () {
      this.size = pg.width / 10;
      this.tInit = p.random(0, 1);
      this.rate = p.random(0.01, 0.5);
      this.sizes = [];
      this.col = p.random(-1, 1);

      this.angleX = p.random(Math.PI * 2);
      this.angleY = p.random(Math.PI * 2);
      this.velAngleX = p.random(0.002, 0.01);
      
      this.vel = p5.Vector.random2D();
      this.pos = this.vel.copy();
      this.pos.mult(-pg.width / Math.sqrt(2));
      this.vel.mult(p.random(1, 2));
    }
    this.init();

    this.draw = function () {
      this.pos.add(this.vel);

      if(this.pos.mag() > pg.width / Math.sqrt(2) + this.size) {
        this.init();
      }

      {
        // let m = new Packages.oscP5.OscMessage("/s_new");
        // m.add("grain");
        // m.add(-1);
        // m.add(0);
        // m.add(0);
        // m.add("freq");
        // p.addFloat(m, p.random(0, 500) + 2000 + 100 * this.vel.y);
        // m.add("pan");
        // p.addFloat(m, 0);
        // m.add("vol");
        // let vol = 1.0;
        // p.addFloat(m, vol);
        // p.oscP5.send(m, remoteLocation);
      }
      let t = p.millis() * 0.001 - this.tInit;
      let a = Math.sin(t * Math.PI * this.rate);
      let size = this.size + a * this.size * 0.25;
      if(p.frameCount % 2 == 0) {
        this.sizes.push(size);
        if(this.sizes.length > 200)
          this.sizes.shift();
      }
      pg.pushMatrix();
      if(this.col > 0) {
        pg.stroke(this.col * 20, 128, 255);
      }
      else {
        pg.stroke(this.col * 20 + 255, 128, 255);
      }
      pg.translate(this.pos.x, this.pos.y);
      this.angleX += this.velAngleX;
      pg.rotateX(this.angleX);
      // pg.rotateY(this.angleY);
      pg.ellipse(0, 0, size, size);
      for(let i = 0; i < 16; i++) {
        pg.beginShape();
        for(let j = 0; j < this.sizes.length; j++) {
          let x = this.sizes[j] * Math.cos(i * Math.PI / 8) / 2;
          let y = this.sizes[j] * Math.sin(i * Math.PI / 8) / 2;
          pg.vertex(x, y, (this.sizes.length - j - 1) * 2);
        }
        pg.endShape();
      }
      pg.popMatrix();
    }

  }

  let agents = [];
  for(let i = 0; i < 5; i++) {
    agents.push(new Agent());
  }

  function drawPg(pg, t) {
    pg.beginDraw();
    pg.blendMode(p.BLEND);
    pg.background(0);

    pg.translate(pg.width * 0.5, pg.height * 0.5);

    pg.stroke(255);
    pg.colorMode(p.HSB, 255, 255, 255);
    pg.noFill();
    for(let i in agents) {
      agents[i].draw();
    }
    pg.endDraw();
  }

  this.draw = function (t) {
    drawPg(pg, t);
    p.image(pg, 0, 0);
  }
};

var s = function (p) {
  let startTime;
  
  let s101 = new S101(p);

  p.setup = function () {
    name = p.folderName;

    p.createCanvas(800, 800);
    p.frameRate(30);

    startTime = p.millis();
  }

  function getTime() { return (p.millis() - startTime) * 0.001 };

  p.draw = function () {
    t = getTime();

    s101.draw(t);
  }
};

var p = new p5(s);
