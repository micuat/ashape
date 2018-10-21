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

var S102 = function (p) {
  let pg;
  let remoteLocation = new Packages.netP5.NetAddress("127.0.0.1", 57110);

  let points = [];
  let ribbon = [];

  pg = p.createGraphics(800, 800, p.P3D);

  this.metro = function(_x, _y, _z) {
    let r = pg.width * 0.5;
    let x = r * _x;
    let y = r * _y;
    let z = r * _z * 0.2;
    points.push({x: x, y: y, z: z});

    let x0 = x, y0 = y, z0 = z, x1 = x, y1 = y, z1 = z;
    let w = 20;
    if(ribbon.length > 3) {
      let pt0 = points[points.length - 3];
      let pt1 = points[points.length - 2];
      let pt2 = points[points.length - 1];
      let p0 = p.createVector(pt0.x, pt0.y, pt0.z);
      let p1 = p.createVector(pt1.x, pt1.y, pt1.z);
      let p2 = p.createVector(pt2.x, pt2.y, pt2.z);
      let dir0 = p1.copy();
      dir0.sub(p0);
      dir0.normalize();
      let dir1 = p2.copy();
      dir1.sub(p1);
      dir1.normalize();
      let cross = dir0.cross(dir1);
      // let cross = dir1;
      // cross.sub(dir0);
      cross.normalize();
      cross.mult(w);
      x0 -= cross.x;
      y0 -= cross.y;
      z0 -= cross.z;
      x1 += cross.x;
      y1 += cross.y;
      z1 += cross.z;
    }
    else {
      x0 -= w;
      x1 += w;
    }
    ribbon.push({x0: x0, y0: y0, z0: z0,
      x1: x1, y1: y1, z1: z1});
    if(points.length > 200) {
      points.shift();
      ribbon.shift();
    }
  }

  function drawPg(pg, t) {
    pg.beginDraw();
    pg.blendMode(p.BLEND);
    pg.background(0);

    pg.translate(pg.width * 0.5, pg.height * 0.5);
    let lastPt = points[points.length - 1];
    pg.translate(-lastPt.x, -lastPt.y, -lastPt.z);
    pg.rotateX(Math.PI * 0.25);

    // pg.stroke(255);
    // pg.noFill();
    // pg.beginShape();
    // for(let i = 0; i < points.length; i++) {
    //   let pt = points[i];
    //   pg.vertex(pt.x, pt.y, pt.z);
    // }
    // pg.endShape();
    pg.lights();
    pg.fill(255);
    pg.noStroke();
    pg.beginShape(p.TRIANGLE_STRIP);
    for(let i = 0; i < ribbon.length; i++) {
      let r = ribbon[i];
      pg.vertex(r.x0, r.y0, r.z0);
      pg.vertex(r.x1, r.y1, r.z1);
    }
    pg.endShape();

    pg.endDraw();
  }

  this.draw = function (t) {
    drawPg(pg, t);
    p.image(pg, 0, 0);
  }
};

var s = function (p) {
  let startTime;
  
  let s102 = new S102(p);

  p.setup = function () {
    name = p.folderName;

    p.createCanvas(800, 800);
    p.frameRate(30);

    startTime = p.millis();
  }

  function getTime() { return (p.millis() - startTime) * 0.001 };

  p.draw = function () {
    t = getTime();

    s102.draw(t);
  }

  p.oscEvent = function (m) {
    if (m.checkAddrPattern("/sc3p5/lfo")) {
      let x = m.get(0).floatValue();
      let y = m.get(1).floatValue();
      let z = m.get(2).floatValue();
      s102.metro(x, y, z);
    }
  }
};

var p = new p5(s);
