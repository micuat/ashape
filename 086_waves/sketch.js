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

  let mode = 1;

  let agents = [];

  let iTween0125;

  function Agent () {
    this.rotate = 0;
    this.i = 0;
  }

  p.setup = function () {
    name = p.folderName;

    p.createCanvas(800, 800);
    p.frameRate(30);

    startFrame = p.frameCount;
    startTime = p.millis();

    pg = p.createGraphics(800, 800, p.P3D);

    for(let i = 0; i < 8; i++) {
      agents.push(new Agent());
      agents[i].i = i;
    }

    for(let i = 0; i < 1; i += 0.01) {
      if(EasingFunctions.easeInOutCubic(i) > 0.125) {
        iTween0125 = i;
        break;
      }
    }
  }

  function getTime() { return (p.millis() - startTime) * 0.001 };

  function preparePoints() {
    let n = 3;
    let points = [];
    for (let i = 0; i < n; i++) {
      let r = pg.width * 0.4;//p.map(p.noise(i * 0.5, t * 0.1), 0, 1, 0.3, 0.5);
      let angle = 2 * Math.PI / n * i;
      let x = r * Math.sin(angle);
      let y = r * Math.cos(angle);
      points.push({ x: x, y: y, z: 0 });
    }
    return points;
  }

  function drawPoints(points) {
    pg.beginShape();
    for (let i = 0; i < points.length; i++) {
      let p0 = points[i];
      pg.vertex(p0.x, p0.y, p0.z);
    }
    pg.endShape(p.CLOSE);
  }

  function getInside(points, tween) {
    let newPoints = [];
    for (let i = 0; i < points.length; i++) {
      let p0 = points[i];
      let p1 = points[(i + 1) % points.length];
      let x = p.lerp(p0.x, p1.x, tween);// * 0.95;
      let y = p.lerp(p0.y, p1.y, tween);// * 0.95;
      let z = p0.z + 10;
      newPoints.push({ x: x, y: y, z: z });
    }
    return newPoints;
  }

  function drawPg(pg, t) {
    let nextMode = mode;
    pg.beginDraw();
    pg.background(0);

    pg.pushMatrix();
    pg.translate(pg.width / 2, pg.height / 2);

    pg.rotateX(Math.PI / 4);

    pg.stroke(255);
    pg.strokeWeight(3);

    let points = preparePoints();

    // pg.hint(p.DISABLE_DEPTH_TEST);
    // pg.blendMode(p.ADD);
    for (let i = 0; i < agents.length; i++) {
      pg.pushMatrix();
      pg.pushStyle();
      pg.noFill();
      let po = 5 - i;
      if (po < 1) po = 1;
      let tween = 0;
      if (mode == 0) {
        let modt = (t / Math.pow(2, po)) % 1.0;
        tween = EasingFunctions.easeInOutCubic(modt);
        if(i == 0 && (t / Math.pow(2, po)) >= 1.0) {
          nextMode = mode + 1;
          startTime = p.millis();
        }
      }
      else if (mode == 1) {
        let modt = (t / (8 - i));
        if(modt > iTween0125) {
          modt = iTween0125;
          if(i == 0) {
            nextMode = mode + 1;
          }
        }
        tween = EasingFunctions.easeInOutCubic(modt);
      }
      else if (mode == 2) {
        tween = EasingFunctions.easeInOutCubic(iTween0125);
        pg.translate(0,0,10*i);
        pg.rotateZ(0.125 * Math.PI / 3 * i);
        pg.rotateY(EasingFunctions.easeInOutCubic(agents[i].rotate) * 2 * Math.PI);
        pg.rotateZ(-0.125 * Math.PI / 3 * i);
        pg.translate(0,0,-10*i);
        agents[i].rotate += 0.025 / (i+1);
        if(agents[i].rotate > 1) {
          agents[i].rotate = 1;
          if(i == agents.length - 1) {
            nextMode = mode + 1;
            startTime = p.millis();
          }
        }
        // pg.fill(25 * agents[i].rotate);
      }
      else if (mode == 3) {
        let modt = (t / (8 - i));
        if(modt > iTween0125) {
          modt = iTween0125;
          if(i == 0) {
            nextMode = mode + 1;
          }
        }
        tween = EasingFunctions.easeInOutCubic(iTween0125-modt);
      }
      drawPoints(points);
      points = getInside(points, tween);
      pg.popStyle();
      pg.popMatrix();
    }

    pg.popMatrix();
    pg.endDraw();

    mode = nextMode;
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
