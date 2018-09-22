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
  let seq, phase, cycle;
  let pg;

  p.setup = function () {
    name = p.folderName;

    p.createCanvas(800, 800);
    p.frameRate(30);

    startFrame = p.frameCount;
    startTime = p.millis();

    pg = p.createGraphics(800, 800, p.P3D);
  }

  function getTime() { return (p.millis() - startTime) * 0.001 };

  function drawInside(points, tween) {
    let newPoints = [];
    pg.beginShape();
    for (let i = 0; i < points.length; i++) {
      let p0 = points[i];
      let p1 = points[(i + 1) % points.length];
      let x = p.lerp(p0.x, p1.x, tween);// * 0.95;
      let y = p.lerp(p0.y, p1.y, tween);// * 0.95;
      let z = p0.z + 10;
      pg.vertex(x, y, z);
      newPoints.push({ x: x, y: y, z: z });
    }
    pg.endShape(p.CLOSE);
    return newPoints;
  }

  function drawPg(pg, t) {
    pg.beginDraw();
    pg.background(0);

    pg.translate(pg.width / 2, pg.height / 2);

    pg.rotateX(Math.PI / 4);

    let points = [];
    pg.noFill();
    pg.stroke(255);
    pg.strokeWeight(3);
    pg.blendMode(p.BLEND);
    pg.beginShape();
    let n = 3;
    for (let i = 0; i < n; i++) {
      let r = pg.width * 0.4;//p.map(p.noise(i * 0.5, t * 0.1), 0, 1, 0.3, 0.5);
      let angle = 2 * Math.PI / n * i;
      let x = r * Math.sin(angle);
      let y = r * Math.cos(angle);
      pg.vertex(x, y);
      points.push({ x: x, y: y, z: 0 });
    }
    pg.endShape(p.CLOSE);
    for(let i = 0; i < 8; i++) {
      let po = 5 - i;
      if(po < 1) po = 1;
      points = drawInside(points, EasingFunctions.easeInOutCubic((t / Math.pow(2, po)) % 1.0));
    }

    pg.endDraw();
  }

  p.draw = function () {
    t = getTime();

    cycle = 4.0;
    seq = Math.floor(t / 2.0) % cycle; // every 2 cycle
    phase = Math.floor(t) % 2; // every cycle

    drawPg(pg, t);
    p.image(pg, 0, 0);
  }
};

var p085 = new p5(s);
