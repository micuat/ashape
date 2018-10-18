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
  let startTime;
  let pg;
  let lastSeq;
  let cycle = 4.0;
  let phase = 0;
  
  let remoteLocation = new Packages.netP5.NetAddress("127.0.0.1", 57110);

  pg = p.createGraphics(800, 800, p.P3D);

  function drawPg(pg, t) {
    let seq = Math.floor(t / cycle);
    pg.beginDraw();
    pg.blendMode(p.BLEND);
    pg.background(0);

    pg.translate(pg.width * 0.5, pg.height * 0.5);

    let phase = t / cycle % 1.0;

    let R = pg.width;

    pg.noFill();
    pg.strokeWeight(3);
    let r = R;

    pg.colorMode(p.HSB, 8, 8, 8);
    for(let i = 0; i < n; i++) {
      pg.pushMatrix();

      coeffs[i] = p.lerp(coeffs[i], targets[i], 0.1);
      pg.stroke(i, 7, 7);

      let W = pg.width / 2;
      let xTarget = W;
      let y = p.map(i, -0.5, n-0.5, -1, 1) * pg.width / 2;
      if(coeffs[i] > 0.5) {
        xTarget = y;
      }
      let xStart, xEnd;
      let dt = t - bangTime;
      if(dt < 1) {
        xStart = -W;
        xEnd = p.map(EasingFunctions.easeOutQuart(dt), 0, 1, -W, xTarget);
      }
      else if(dt < 2) {
        xStart = -W;
        xEnd = xTarget;
      }
      else {
        xStart = p.map(p.constrain(dt, 2, 3), 2, 3, -W, W);
        xEnd = p.map(EasingFunctions.easeInQuart(dt - 2), 0, 1, xTarget, W * 1.5);
      }
      pg.line(xStart, y, xEnd, y);

      pg.stroke(i, 0, 7);
      let x = y;
      let H = pg.height / 2;
      let y1 = p.map(coeffs[i], 0, 1, H, y);
      // pg.line(x, H, x, y1);
      pg.fill(0, 0, 7);
      pg.noStroke();
      pg.ellipse(x, y1, W / 20, W / 20);

      pg.popMatrix();
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
      bangTime = getTime();
    }
  }
};

var p = new p5(s);
