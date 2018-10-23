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

  this.lfo = function(_x, _y, _z) {
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

  let camPos = {x: 0.0, y: 0.0, z: 0.0};
  let blocks = [];
  for(let i = 0; i < 21; i++) {
    blocks.push({index: i - 10, x: 0.0, y: 0.0, z: 0.0, r: 0.0});
  }
  let yFuncs = [
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
  let yFunc = yFuncs[0];
  let zFunc = yFuncs[0];
  let rTarget = 0;

  this.metro = function () {
    yFunc = p.random(yFuncs);
    zFunc = p.random(yFuncs);
    rTarget = p.random(-Math.PI, Math.PI);
  }
  
  function drawPg(pg, t) {
    pg.beginDraw();
    pg.blendMode(p.BLEND);
    pg.background(0);

    pg.translate(pg.width * 0.5, pg.height * 0.5);
    let lastPt = points[points.length - 1];
    camPos.x = p.lerp(camPos.x, -lastPt.x, 0.1);
    camPos.y = p.lerp(camPos.y, -lastPt.y, 0.1);
    camPos.z = p.lerp(camPos.z, -lastPt.z, 0.1);
    pg.translate(camPos.x, camPos.y, camPos.z);
    pg.rotateX(Math.PI * 0.25);

    pg.lights();
    // pg.pointLight(255, 255, 255, 0, -500, 500);
    // pg.stroke(255);
    let n = 10;
    for(let i = 0; i < blocks.length; i++) {
      let b = blocks[i];
      b.y = p.lerp(b.y, yFunc(b.index), 0.1);
      b.z = p.lerp(b.z, zFunc(b.index), 0.1);
      b.r = p.lerp(b.r, rTarget, 0.1);

      let w = pg.width * 10;
      pg.pushMatrix();
      pg.rotate(b.r);
      pg.translate(0, b.y, b.z);
      pg.box(w, 20, 20);
      pg.popMatrix();
      // pg.line(-x, y, x, y);

      // y = pg.width * 10;
      // x = pg.width * i * 0.4;
      // pg.line(x, -y, x, y);
    }
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
      s102.lfo(x, y, z);
    }
    else if (m.checkAddrPattern("/sc3p5/metro")) {
      s102.metro();
    }
  }
};

var p = new p5(s);
