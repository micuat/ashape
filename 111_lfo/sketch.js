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

function Particle (p, x, y) {
  this.x = x;
  this.y = y;
  this.p = p;
  this.startTime = this.p.millis() * 0.001;
  this.lifeTime = 3;
}

Particle.prototype.draw = function (pg) {
  pg.point(this.x, this.y);
}

Particle.prototype.isAlive = function () {
  return this.p.millis() * 0.001 - this.startTime < this.lifeTime;
}

var S111 = function (p) {
  let pg;

  pg = p.createGraphics(800, 800, p.P3D);

  let props = [];
  let rotFuncs = [
    function (pg, rad) {
      pg.rotateX(rad);
    },
    function (pg, rad) {
      pg.rotateY(rad);
    },
    function (pg, rad) {
      pg.rotateZ(rad);
    },
  ]
  for(let j = 0; j < 8; j++) {
    let propj = [];
    for(let i = 0; i < 4; i++) {
      let prop = {
        rot: p.random(rotFuncs),
        freq: Math.floor(p.random(1, 5)),
        tBreak: Math.floor(p.random(0, 4)),
        particles: []
      }
      if(i == 0) prop.rot = rotFuncs[2];
      propj.push(prop);
    }
    props.push(propj);
  }

  this.drawPg = function(pg, t) {
    pg.beginDraw();
    pg.background(0);
    // pg.background(this.back);

    pg.translate(pg.width * 0.5, pg.height * 0.5);

    pg.pushMatrix();

    pg.noStroke();
    pg.fill(255);
    // pg.noFill();
    pg.pointLight(255, 255, 255, 0, -200, 300);

    pg.rotateX(Math.PI * 0.25);

    function drawBox(l, yratio, zratio) {
      if(yratio == undefined) yratio = 1;
      if(zratio == undefined) zratio = 1;
      pg.pushMatrix();
      pg.translate(0, 0, l / 4 * zratio);
      pg.box(l, l * yratio, l / 4 * zratio);
      pg.popMatrix();
      pg.pushMatrix();
      pg.translate(0, 0, -l / 4 * zratio);
      pg.box(l, l * yratio, l / 4 * zratio);
      pg.popMatrix();
    }
    let l = 100;
    pg.pushMatrix();
    drawBox(2000, 0.04, 0.08);
    for(let jj in props) {
      let j = (jj) % props.length;
      pg.pushMatrix();
      let tt = (t / 2) % 8;
      let tn = Math.floor(tt);
      let tf = tt - tn;
      tf = EasingFunctions.easeInOutCubic(tf);
      pg.translate((j * 200 + (tn + tf) * 200) % 1600 - 800, 0);
      pg.rotateY(Math.PI / 2 * 3);
      for(let i in props[j]) {
        let tb = (t / props[j][i].freq / 2) % (props[j][i].tBreak + 1);
        if(tb > 1) tb = 0;
        if(tb > 0.5) tb = 1 - tb;
        tb *= 2;
        props[j][i].rot(pg, EasingFunctions.easeInOutCubic(tb) * Math.PI * 0.5);
        pg.translate(l, 0);
        pg.scale(0.5);
        drawBox(l);
      }
      pg.popMatrix();
    }
    pg.popMatrix();

    // pg.pushStyle();
    // pg.stroke(255);
    // pg.strokeWeight(4);
    // if(p.random(1) > 0.5) {
    //   particles.push(new Particle(p, p.random(-200, 200), 0));
    // }
    // for(let i = particles.length - 1; i >= 0; i--) {
    //   particles[i].draw(pg);
    //   if(particles[i].isAlive() == false) {
    //     particles.splice(i, 1);
    //   }
    // }
    // pg.popStyle();

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
  
  let s111 = new S111(p);

  p.setup = function () {
    name = p.folderName;

    p.createCanvas(800, 800);
    p.frameRate(30);

    startTime = p.millis();
  }

  function getTime() { return (p.millis() - startTime) * 0.001 };

  p.draw = function () {
    t = getTime();

    s111.draw(t);
  }

  p.oscEvent = function (m) {
    let path = m.addrPattern().split("/");
    if (path.length >= 3 && path[1] == "sc3p5" && path[2] == "spawn") {
    }
  }

  p.mousePressed = function () {
  }
};

p = new p5(s);
