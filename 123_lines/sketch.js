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

var S123 = function (p) {
  let pg, pgTex1;

  pg = p.createGraphics(800, 800, p.P3D);
  pgTex1 = p.createGraphics(800, 800, p.P3D);

  let colors = [
    [0xdb, 0x27, 0x63],
    [0xb0, 0xdb, 0x43],
    [0x12, 0xea, 0xea],
    [0xbc, 0xe7, 0xfd],
    [0xc4, 0x92, 0xb1]
  ];

  let points = [];
  for(let i = 0; i < 5; i++) {
    for(let j = 0; j < 5; j++) {
      let po = p.createVector((j-2)*150, (i-2)*150);
      let v = p5.Vector.random2D();
      v.mult(p.random(0.5, 3));
      points.push({p: po, v: v, vTarget: p.createVector(0, 0), index: {j: j, i: i}});
    }
  }
  let lastTime = -100;
  let nGrid = 10;
  let heights = [];
  for(let i = 0; i <= nGrid; i++) {
    heights[i] = [];
    for(let j = 0; j <= nGrid; j++) {
      heights[i][j] = p.random(300);
    }
  }
  this.hhat = 0;
  this.click = 0;
  this.blink = {t: -1000};
  this.onOsc = function (type, t) {
    if(type == "sig") {
      this.blink.t = t;
    }
    else if(type == "hhat") {
      this.hhat = 1;
    }
    else if(type == "click") {
      this.click = 1;
    }
  }
  this.drawPgTex = function(pgTex, t, add) {
    let self = this;
    this.spike = 0;
    let b = p.map(t - this.blink.t, 0.0, 0.5, 1, 0);
    if(b > 1) b = 0;
    if(b < 0) b = 0;

    this.spike = b;

    pgTex.beginDraw();
    pgTex.background(0);

    pgTex.translate(pgTex.width * 0.5, pgTex.height * 0.5);
    pgTex.pushMatrix();
    pgTex.blendMode(p.BLEND);
    pgTex.strokeWeight(1);
    function drawLine (x0, y0, x1, y1, alpha) {
      pgTex.pushMatrix();
      let xm = p.lerp(x0, x1, 0.5);
      let ym = p.lerp(y0, y1, 0.5);
      pgTex.translate(xm, ym);
      let angle = Math.atan2(y1 - y0, x1 - x0);
      pgTex.rotate(angle);
      let s = Math.sqrt((x0 - x1) * (x0 - x1) + (y0 - y1) * (y0 - y1));
      pgTex.scale(s, s);
      pgTex.strokeWeight(16.0 / s);
      pgTex.noStroke();

      let amount = p.map(Math.abs((y0 + y1) * 0.5), 0, 400, 2, 0);
      let spike = 0;
      let b = p.map(t - self.blink.t - (xm + 400) * 0.001, 0.0, 0.1, 1, 0);
      if(b > 1) b = 0;
      if(b < 0) b = 0;
  
      spike = Math.max(b);
      let h = 0.05 * 5 * spike;
      for(let n = 0; n < 2; n++) {
        pgTex.beginShape();
        for(let x = -0.5; x <= 0.5; x += 0.02) {
          let sig = Math.cos(x * Math.PI * amount * 4 + t + xm * 0.01);
          sig = Math.max(sig, 0);
          let env = Math.cos(x * Math.PI) * alpha * alpha;
          let y = sig * env * h;
          let c = Math.floor(p.map(x, -0.5, 0.5, 0, 1) + t + (xm + 600) * 0.01) % colors.length;
          if(add) {
            pgTex.stroke(colors[c][0], colors[c][1], colors[c][2], 1 * 255);
          }
          else {
            pgTex.stroke(colors[c][0], colors[c][1], colors[c][2], 1 * 255);
          }
          pgTex.vertex(x, y * (n > 0 ? -1 : 1), 0);
        }
        pgTex.endShape();
      }
      pgTex.popMatrix();
    }
    pgTex.strokeWeight(3);
    pgTex.noFill();
    for(let i = 0; i < points.length; i++) {
      for(let j = i; j < points.length; j++) {
        let alpha = 1 - points[i].p.dist(points[j].p) / 300.0;
        if(alpha > 0) {
          if(p.frameCount % 240 > 120) {
            let v = points[i].p.copy();
            v.sub(points[j].p);
            v.mult(0.0002);
            points[j].vTarget.add(v);

            v = points[j].p.copy();
            v.sub(points[i].p);
            v.mult(0.0002);
            points[i].vTarget.add(v);
          }
          alpha = Math.min(alpha * 2.0, 1.0);
          drawLine(points[i].p.x, points[i].p.y, points[j].p.x, points[j].p.y, alpha);
        }
      }
    }
    pgTex.strokeWeight(10);
    pgTex.stroke(255);
    for(let i = 0; i < points.length; i++) {
      pgTex.point(points[i].p.x, points[i].p.y)
    }
    pgTex.popMatrix();
    pgTex.endDraw();
  }
  this.drawPg = function(pg, t) {
    this.click = p.lerp(this.click, 0, 0.1);
    this.hhat = p.lerp(this.hhat, 0, 0.1);

    for(let i = 0; i < points.length; i++) {
      if(p.frameCount % 480 < 120) {
        points[i].p.lerp(p.createVector((points[i].index.j - 2) * 180, (points[i].index.i - 2) * 180), 0.12 * this.hhat);
      }
      let dp = p5.Vector.random2D();
      dp.mult(p.map(this.click, 0, 1, 0.0, 10.0));
      points[i].p.add(dp);
    }

    for(let i = 0; i < points.length; i++) {
      points[i].vTarget.mult(0.99);
      points[i].v.lerp(points[i].vTarget, 0.1);

      points[i].p.add(points[i].v);
      points[i].p.x = (points[i].p.x + 1200 * 1.5) % 1200 - 1200 * 0.5;
      points[i].p.y = (points[i].p.y + 1200 * 1.5) % 1200 - 1200 * 0.5;
    }

    this.drawPgTex(pgTex1, t, false);

    pg.beginDraw();
    pg.textureMode(p.NORMAL);
    pg.background(255);

    pg.fill(255, 128);

    pg.translate(pg.width * 0.5, pg.height * 0.5);
    pg.pushMatrix();

    lastTime = t;
    pg.image(pgTex1, -pg.width * 0.5, -pg.height * 0.5);

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
  
  let s123 = new S123(p);

  p.setup = function () {
    name = p.folderName;

    p.createCanvas(800, 800);
    p.frameRate(60);

    startTime = p.millis();
  }

  function getTime() { return (p.millis() - startTime) * 0.001 };

  p.draw = function () {
    t = getTime();

    s123.draw(t);
  }

  p.oscEvent = function (m) {
    let path = m.addrPattern().split("/");
    if(path.length >= 3) {
      s123.onOsc(path[2], getTime());
    }
  }

  p.mousePressed = function () {
  }
};

p = new p5(s);
