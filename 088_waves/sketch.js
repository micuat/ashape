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

    pg = p.createGraphics(800, 800);
  }

  function getTime() { return (p.millis() - startTime) * 0.001 };

  function drawLine(pg, t) {
    let points = [];
    let n = 1000;
    // pg.beginShape();
    let tween = (t / 4.0) % 2.0;
    if(tween > 1.0) tween = 2.0 - tween;
    tween = EasingFunctions.easeInOutQuint(tween);
    let cycle = (t / 8.0) % 2.0; 
    let tmod = p.map(tween, 0, 1, 1, 4);
    for(let i = 0; i <= n + 1; i++) {
      let angle = p.map(i, 0, n, -1 * Math.PI, Math.PI) * tmod + (tmod+1) * Math.PI;
      let r = 200;
      let x, y;
      if(cycle < 1.0) {
        x = r * Math.cos(angle / tmod);
        y = r * Math.sin(angle);
      }
      else {
        x = r * Math.cos(angle);
        y = r * Math.sin(angle / tmod);
      }
      // pg.vertex(x, y);
      points.push({x: x, y: y});
    }

    // pg.endShape();

    pg.beginShape();
    tween *= 2.0;
    if(tween > 1.0) tween = 2.0 - tween;
    for(let i = 0; i < n + 1; i++) {
      let x = 0;
      let y = Math.sin(i / 100 * Math.PI * 8 + t) * 10 * tween;
      let dx = points[i+1].x - points[i].x;
      let dy = points[i+1].y - points[i].y;
      let v = p.createVector(x, y);
      let theta = Math.atan2(dy, dx);
      v.rotate(theta);
      x += points[i].x;
      y += points[i].y;
      pg.vertex(v.x + points[i].x, v.y + points[i].y);
    }
    pg.endShape();

  }

  function drawPg(pg, t) {
    pg.beginDraw();
    pg.background(0);

    pg.stroke(255);
    pg.noFill();
    pg.translate(pg.width / 2, pg.height / 2);

    drawLine(pg, t);
    pg.endDraw();
  }

  p.draw = function () {
    t = getTime();

    drawPg(pg, t);
    p.image(pg, 0, 0);
  }
};

var p084 = new p5(s);
