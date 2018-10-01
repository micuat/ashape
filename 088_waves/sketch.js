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

var s = function (p) {
  let startTime;
  let pg;

  p.setup = function () {
    name = p.folderName;

    p.createCanvas(800, 800);
    p.frameRate(30);

    startTime = p.millis();

    pg = p.createGraphics(800, 800, p.P3D);
  }

  function getTime() { return (p.millis() - startTime) * 0.001 };

  let lines = [];
  let contFreq = 2;

  function drawLine(pg, t, z) {
    let points = [];
    let n = 100;
    let tween = (t / 4.0) % 1.0;
    tween = EasingFunctions.easeInOutQuint(tween);
    for(let i = 0; i <= n + 1; i++) {
      let angle = p.map(i, 0, n, -1 * Math.PI, Math.PI);
      let r = pg.width / 4.0 * EasingFunctions.easeOutQuint((t / 4.0) % 1.0);
      let x, y;
      x = r * Math.cos(angle);
      y = r * Math.sin(angle);
      points.push({x: x, y: y});
    }

    let line = p.createShape();
    line.beginShape();
    line.noFill();
    tween = (t / 4.0) % 1.0;
    if(tween > 0.5) tween = 1.0 - tween;
    tween = EasingFunctions.easeInOutQuad(tween * 2.0);
    if(tween > 1.0) tween = 2.0 - tween;
    for(let i = 0; i < n + 1; i++) {
      let x = 0;
      let y = Math.sin(i / n * Math.PI * contFreq) * pg.width / 16.0 * tween;
      let dx = points[i+1].x - points[i].x;
      let dy = points[i+1].y - points[i].y;
      let v = p.createVector(x, y);
      let theta = Math.atan2(dy, dx);
      v.rotate(theta);
      line.vertex(v.x + points[i].x, v.y + points[i].y, z);
    }
    line.endShape();
    lines.push(line);
  }

  let lastSeq = -1;

  function drawPg(pg, t) {
    let seq = Math.floor(t / 4.0);
    if(seq > lastSeq && seq % 2 == 0) {
      lines = [];
      contFreq = Math.pow(2, Math.floor(p.random(2, 7)));
    }

    pg.beginDraw();
    pg.background(0);

    pg.stroke(255);
    pg.noFill();
    pg.translate(pg.width / 2, pg.height / 2);

    pg.rotateX(Math.PI / 3);
    pg.rotateZ(Math.PI * t * 0.1);
    let tween = (t / 4.0) % 1.0;
    let z = p.map(tween, 0, 1, pg.width / 3.0, -pg.width / 6.0);
    if(p.frameCount % 2 == 0 && seq % 2 == 0) {
      drawLine(pg, t, z);
    }

    for(let i in lines) {
      pg.shape(lines[i]);
    }
    pg.endDraw();

    lastSeq = seq;
  }

  p.draw = function () {
    t = getTime();

    drawPg(pg, t);
    p.image(pg, 0, 0);
  }
};

var p084 = new p5(s);
