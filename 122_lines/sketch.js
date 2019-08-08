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

var S122 = function (p) {
  let pg, pgTex1;

  pg = p.createGraphics(800, 800, p.P3D);
  pgTex1 = p.createGraphics(800, 800, p.P3D);

  let colors = [
    [0xbd, 0xe4, 0xa8],
    [0x9c, 0xc6, 0x9b],
    [0xff, 0xee, 0xdb],
    [0x79, 0xb4, 0xa9],
    [0x67, 0x6f, 0x54]
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
  this.blinks = [];
  this.onOsc = function (type, t) {
    // print(type)
    if(type.freq > 0) {

    }
    else {
      this.blinks.push({t: t + type.delay * 0.5 + 0.4, type: type, y: Math.floor(p.random(8)) * 100});
      if(this.blinks.length > 20) this.blinks.shift();
    }
  }
  this.drawPgTex = function(pgTex, t, add) {
    let self = this;
    this.spike = 0;
    for(let i in this.blinks) {
      let we = this.blinks[i].type.whatever;
      let b = p.map(t - this.blinks[i].t, 0.0, 0.5, 1, 0);
      if(b > 1) b = 0;
      if(b < 0) b = 0;

      this.spike = Math.max(b, this.spike);
    }

    pgTex.beginDraw();
    pgTex.background(255);

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
      pgTex.strokeWeight(5.0 / s);
      pgTex.noStroke();

      let amount = p.map(Math.abs((y0 + y1) * 0.5), 0, 400, 2, 0);
      let spike = 0;
      for(let i in self.blinks) {
        let bl = self.blinks[i];
        if(bl == undefined) continue;
        let b = p.map(t - bl.t - (xm + 400) * 0.001, 0.0, 0.1, 1, 0);
        if(b > 1) b = 0;
        if(b < 0) b = 0;
  
        spike = Math.max(b, spike);
      }
      let h = 0.05 * 3 * spike;
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
    pgTex.strokeWeight(10);
    pgTex.stroke(0);
    for(let i = 0; i < points.length; i++) {
      pgTex.point(points[i].p.x, points[i].p.y)
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
    pgTex.popMatrix();
    pgTex.endDraw();
  }
  this.drawPg = function(pg, t) {
    if(p.frameCount % 480 < 60) {
      for(let i = 0; i < points.length; i++) {
        points[i].p.lerp(p.createVector((points[i].index.j - 2) * 180, (points[i].index.i - 2) * 180), 0.12);
        // points[i].vTarget = p5.Vector.random2D();
        // points[i].vTarget.mult(p.random(1.5, 5));
      }
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
  
  let s122 = new S122(p);

  p.setup = function () {
    name = p.folderName;

    p.createCanvas(800, 800);
    p.frameRate(60);

    startTime = p.millis();
  }

  function getTime() { return (p.millis() - startTime) * 0.001 };

  p.draw = function () {
    t = getTime();

    s122.draw(t);
  }

  p.oscEvent = function (m) {
    let path = m.addrPattern().split("/");
    // print(m)
    if (path[1] == "g_new") {
      // print(m.get(2).intValue())
      // print(m.typetag(), m.get(1).intValue());
    }
    else if (path[1] == "s_new" && m.typetag().length > 10) {
      let res = {};
      let ress = "";
      for(let i = 4; i < m.typetag().length - 1; i++) {
        if(m.typetag()[i] == "s" && m.typetag()[i+1] == "f") {
          res[m.get(i).stringValue()] = m.get(i+1).floatValue();
          ress += m.get(i).stringValue() + " " + m.get(i+1).floatValue() + " ";
        }
      }
      // print(ress)
      s122.onOsc(res, getTime());
    }
  }

  p.mousePressed = function () {
  }
};

p = new p5(s);
