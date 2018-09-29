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

  let mode = 16;

  let agents = [];

  let iTween0125;

  let cells = [];
  let count = 0;

  function Agent() {
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

    for (let i = 0; i < 8; i++) {
      agents.push(new Agent());
      agents[i].i = i;
    }

    for (let i = 0; i <= 16; i++) {
      cells.push([]);
      for (let j = 0; j <= 16; j++) {
        cells[i][j] = {prev: 0,
        next: p.random(1.0) > 0.5 ? 1 : -1}
      }
    }

    for (let i = 0; i < 1; i += 0.01) {
      if (EasingFunctions.easeInOutCubic(i) > 0.125) {
        iTween0125 = i;
        break;
      }
    }
  }

  function getTime() { return (p.millis() - startTime) * 0.001 };

  function preparePoints(np, params) {
    let points = [];
    for (let i = 0; i < np; i++) {
      let angle = 2 * Math.PI / np * i;
      let r = pg.width * 0.4;
      let dr = 0;
      if (params && params.waveFunc) {
        dr = pg.width * 0.04 * params.waveFunc(angle);
        // r += dr;
      }
      let x = r * Math.sin(angle);
      let y = r * Math.cos(angle);
      let z = dr;
      if (params && params.sx != undefined) {
        x *= params.sx;
      }
      if (params && params.sy != undefined) {
        y *= params.sy;
      }
      if (params && params.sz != undefined) {
        z *= params.sz;
      }
      points.push({ x: x, y: y, z: z });
    }
    return points;
  }

  function drawPoints(points, params) {
    if (params && params.xLine) {
      pg.beginShape(p.LINES);
    }
    else if (params && params.point && params.point > 0 && params.point < 0.9) {
      pg.beginShape(p.LINES);
    }
    else if (params && params.point && params.point >= 0.9) {
      pg.beginShape(p.POINTS);
    }
    else {
      pg.beginShape();
    }
    for (let i = 0; i < points.length; i++) {
      let p0 = points[i];
      if (params && params.xLine) {
        pg.vertex(p0.x - pg.width * params.xLine, p0.y, p0.z);
        pg.vertex(p0.x + pg.width * params.xLine, p0.y, p0.z);
      }
      else {
        pg.vertex(p0.x, p0.y, p0.z);
      }
      if (params && params.point && params.point > 0 && params.point < 0.9) {
        let p1 = points[(i + 1) % points.length];
        pg.vertex(p.lerp(p1.x, p0.x, params.point),
          p.lerp(p1.y, p0.y, params.point),
          p.lerp(p1.z, p0.z, params.point));
      }
    }
    pg.endShape(p.CLOSE);
  }

  function getInside(points, tween, dz) {
    let newPoints = [];
    for (let i = 0; i < points.length; i++) {
      let p0 = points[i];
      let p1 = points[(i + 1) % points.length];
      let x = p.lerp(p0.x, p1.x, tween);// * 0.95;
      let y = p.lerp(p0.y, p1.y, tween);// * 0.95;
      let z = p0.z + dz;
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

    pg.stroke(255);
    pg.strokeWeight(3);
    pg.noFill();

    if (mode <= 13 || mode == 19) {
      if (mode < 5 || mode == 19) {
        pg.rotateX(Math.PI / 4);
      }
      else if (mode == 5) {
        let rt = EasingFunctions.easeInOutCubic(t);
        if (rt > 1) {
          rt = 1;
          nextMode = mode + 1;
        }
        pg.rotateX(Math.PI / 4 + Math.PI * rt * 3 / 4);
      }
      else if (mode <= 7) {
        pg.rotateX(Math.PI);
      }
      else if (mode == 8) {
        let rt = EasingFunctions.easeInOutCubic(t);
        if (rt > 1) {
          rt = 1;
          nextMode = mode + 1;
        }
        pg.rotateX(Math.PI - Math.PI * rt * 0.5);
      }
      else if (mode <= 13) {
        pg.rotateX(Math.PI - Math.PI * 0.5);
      }

      let np;
      let params = {};
      if (mode <= 5) {
        np = 3;
      }
      else if (mode == 6) {
        let tween = EasingFunctions.easeInOutCubic(t / 4);
        if (tween > 1) {
          tween = 1;
          nextMode = mode + 1;
        }
        np = p.map(tween * tween, 0, 1, 3, 128);
      }
      else if (mode == 7) {
        np = 128;
        params.waveFunc = function (angle) {
          let twseed = t * 16 - angle * 2;
          if (twseed < 0) twseed = 0;
          let tween = EasingFunctions.easeInOutQuint(twseed);
          if (tween > 1) {
            tween = 1;
          }
          return Math.sin(angle * 16 - t * 4 * Math.PI) * tween * 0.5;
        }
        if (t > 4) {
          nextMode = mode + 1;
        }
      }
      else if (mode == 8) {
        np = 128;
        params.waveFunc = function (angle) {
          return Math.sin(angle * 16 - t * 4 * Math.PI) * 0.5;
        }
      }
      else if (mode == 9) {
        np = 128;
        params.waveFunc = function (angle) {
          return Math.sin(angle * 16 - t * 4 * Math.PI) * 0.5;
        }
      }
      else if (mode <= 10) {
        np = 128;
        params.waveFunc = function (angle) {
          return Math.sin(angle * 16 - t * 4 * Math.PI) * 0.5;
        }
        let tween = EasingFunctions.easeInOutQuint(t / 4.0);
        if (tween > 1) {
          tween = 1;
          nextMode = mode + 1;
        }
        params.sy = p.map(tween, 0, 1, 1, 0);
        params.sz = p.map(tween, 0, 1, 1, 20.0);
      }
      else if (mode <= 11) {
        np = 128;
        let tween = EasingFunctions.easeInOutQuint(t / 4.0);
        if (tween > 1) {
          tween = 1;
          nextMode = mode + 1;
        }
        params.waveFunc = function (angle) {
          return Math.sin(angle * p.map(tween, 0, 1, 16, 4) - t * p.map(tween, 0, 1, 4, 1) * Math.PI) * 0.5;
        }
        params.sy = 0.0;
        params.sz = 20.0;
      }
      else if (mode <= 12) {
        np = 128;
        params.waveFunc = function (angle) {
          return Math.sin(angle * 4 - t * 1 * Math.PI) * 0.5;
        }
        params.sy = 0.0;
        params.sz = 20.0;
      }
      else if (mode <= 13) {
        np = 128;
        let tween = EasingFunctions.easeInOutQuint(t / 8.0);
        if (tween > 1) {
          tween = 1;
          nextMode = mode + 1;
        }
        params.waveFunc = function (angle) {
          return Math.sin(angle * 4 - t * p.map(tween * tween, 0, 1, 1, 0) * Math.PI) * 0.5;
        }
        params.sy = 0.0;
        params.sz = 20.0;
      }
      else if (mode == 19) {
        np = 3;
      }
      let points = preparePoints(np, params);

      // pg.hint(p.DISABLE_DEPTH_TEST);
      // pg.blendMode(p.ADD);
      for (let i = 0; i < agents.length; i++) {
        pg.pushMatrix();
        pg.pushStyle();
        pg.noFill();
        let po = 5 - i;
        if (po < 1) po = 1;
        let tween = 0;  
        if (mode <= 3) {
          if (mode == 0) {
            let modt = (t / Math.pow(2, po)) % 1.0;
            tween = EasingFunctions.easeInOutCubic(modt);
            if (i == 0 && (t / Math.pow(2, po)) >= 1.0) {
              nextMode = mode + 1;
            }
          }
          else if (mode == 1) {
            let modt = (t / (8 - i));
            if (modt > iTween0125) {
              modt = iTween0125;
              if (i == 0) {
                nextMode = mode + 1;
              }
            }
            tween = EasingFunctions.easeInOutCubic(modt);
          }
          else if (mode == 2) {
            tween = EasingFunctions.easeInOutCubic(iTween0125);
            pg.translate(0, 0, 10 * i);
            pg.rotateZ(0.125 * Math.PI / 3 * i);
            pg.rotateY(EasingFunctions.easeInOutCubic(agents[i].rotate) * 2 * Math.PI);
            pg.rotateZ(-0.125 * Math.PI / 3 * i);
            pg.translate(0, 0, -10 * i);
            agents[i].rotate += 0.025 / (i + 1);
            if (agents[i].rotate > 1) {
              agents[i].rotate = 1;
              if (i == agents.length - 1) {
                nextMode = mode + 1;
              }
            }
          }
          else if (mode == 3) {
            let modt = (t / (8 - i));
            if (modt > iTween0125) {
              modt = iTween0125;
              if (i == 0) {
                nextMode = mode + 1;
              }
            }
            tween = EasingFunctions.easeInOutCubic(iTween0125 - modt);
          }
          drawPoints(points);
          points = getInside(points, tween, 10);
        }
        else if (mode == 4) {
          drawPoints(points);
          tween = EasingFunctions.easeInOutCubic(t);
          if (tween > 1) {
            tween = 1;
            nextMode = mode + 1;
          }
          points = getInside(points, 0, p.map(tween, 0, 1, 10, 0));
        }
        else if (mode == 19) {
          drawPoints(points);
          tween = EasingFunctions.easeInOutCubic(t);
          if (tween > 1) {
            tween = 1;
            nextMode = 0;
          }
          points = getInside(points, 0, p.map(tween, 0, 1, 0, 10));
        }
        pg.popStyle();
        pg.popMatrix();
      }

      if (mode <= 4) {
      }
      else if (mode <= 8) {
        drawPoints(points);
      }
      else if (mode == 9) {
        let tween = EasingFunctions.easeInOutCubic(t);
        if (tween > 1) {
          tween = 1;
          nextMode = mode + 1;
        }
        drawPoints(points, { point: tween });
      }
      else if (mode <= 11) {
        drawPoints(points, { point: 1.0 });
      }
      else if (mode <= 12) {
        let tween = EasingFunctions.easeInOutCubic(t / 8);
        if (tween > 1) {
          tween = 1;
          nextMode = mode + 1;
        }
        drawPoints(points, { point: 1.0 });
        drawPoints(points, { xLine: tween });
      }
      else if (mode <= 13) {
        drawPoints(points, { xLine: 1.0 });
      }
    }
    else if (mode == 14) {
      let tween = EasingFunctions.easeInOutQuint(t / 2.0);
      if (tween > 1) {
        tween = 1;
        nextMode = mode + 1;
      }
      for(let i = 0; i <= 16; i++) {
        let y = Math.cos(i * Math.PI * 1 / 16) * 0.5;
        y = p.lerp(y, p.map(i, 0, 16, 0.5, -0.5), tween);
        y *= pg.width * 0.04 * 20;
        pg.line(-pg.width / 2.0, y, pg.width / 2.0, y);
      }
    }
    else if (mode == 15) {
      let tween = EasingFunctions.easeInOutQuint(t / 1.0);
      if (tween > 1) {
        tween = 1;
        nextMode = mode + 1;
      }
      for(let i = 0; i <= 16; i++) {
        let y = p.map(i, 0, 16, 0.5, -0.5);
        y *= pg.width * 0.8;
        let c = p.map(tween, 0, 1, 0.5, 0.4);
        pg.line(-pg.width * c, y, pg.width * c, y);
      }
    }
    else if (mode == 16) {
      let tween = EasingFunctions.easeInOutQuint(t / 1.0);
      if (tween > 1) {
        count++;
        if (count > 2) {
          nextMode = mode + 1;
        }
        tween = 0;
        for(let i = 0; i < cells.length; i++) {
          for(let j = 0; j < cells[0].length; j++) {
            cells[i][j].prev = cells[i][j].next;
            if(count >= 1 && (i + 4) - j == 1 && (i + 4) > 8) {
              cells[i][j].next = -1;
            }
            else if(count >= 1 && (i + 4) + j == 16 && (i + 4) > 8) {
              cells[i][j].next = 1;
            }
            else {
              cells[i][j].next = p.random(1.0) > 0.5 ? 1 : -1;
            }
          }
        }
        startTime = p.millis();
      }
      for(let i = 0; i <= 16; i++) {
        let y = p.map(i, 0, 16, 0.4, -0.4) * pg.width;
        if(i > 0) {
          pg.stroke(255, 255);
          for(let j = 0; j < 16; j++) {
            let x = p.map(j, 0, 16, 0.4, -0.4) * pg.width;
            let w = pg.width * 0.8 / 16;
            let h = w;
            let p0 = cells[i][j].prev == 1 ? h : 0;
            let p1 = cells[i][j].prev == -1 ? h : 0;
            let h0 = cells[i][j].next == 1 ? h : 0;
            let h1 = cells[i][j].next == -1 ? h : 0;
            pg.line(x - w, y + p.lerp(p0, h0, tween), x, y + p.lerp(p1, h1, tween));
          }
        }
        else {
          if (count == 0) {
            pg.stroke(255, 255 * (1 - tween));
            pg.line(-pg.width * 0.4, y, pg.width * 0.4, y);
          }
        }
      }
    }
    else if (mode == 17) {
      let tween = EasingFunctions.easeInOutQuint(t / 2.0);
      if (tween > 1) {
        nextMode = mode + 1;
      }
      for(let i = 1; i <= 16; i++) {
        let y = p.map(i, 0, 16, 0.4, -0.4) * pg.width;
        for(let j = 0; j < 16; j++) {
          pg.pushMatrix();
          let x = p.map(j, 0, 16, 0.4, -0.4) * pg.width;
          let w = pg.width * 0.8 / 16;
          let h = w;
          let p0 = cells[i][j].prev == 1 ? h : 0;
          let p1 = cells[i][j].prev == -1 ? h : 0;
          pg.stroke(255, 255);
          if((i + 4) - j == 1 && (i + 4) > 8) {
          }
          else if((i + 4) + j == 16 && (i + 4) > 8) {
          }
          else {
            pg.translate(pg.width * tween * (1-p0/h), pg.width * tween * (1-p0/h));
            pg.translate(pg.width * tween * (1-p1/h), pg.width * tween * -(1-p1/h));
          }
          pg.line(x - w, y + p0, x, y + p1);
          pg.popMatrix();
        }
        if (i == 12) {
          pg.stroke(255, 255 * tween);
          pg.line(-pg.width * 0.4, y, pg.width * 0.4, y);
        }
      }
    }
    else if (mode == 18) {
      let rt = EasingFunctions.easeInOutCubic(t);
      if (rt > 1) {
        rt = 1;
      }
      pg.rotateX(Math.PI / 4 * rt);

      let tween = EasingFunctions.easeInOutQuint(t / 2.0);
      if (tween > 1) {
        nextMode = mode + 1;
      }
      pg.beginShape();
      let x, y;
      let nx, ny;
      x = 0;
      nx = 0;
      y = p.map(4, 0, 16, 0.4, -0.4) * pg.width;
      ny = pg.width * 0.4 * Math.cos(0 * 2 * Math.PI / 3);
      pg.vertex(x, p.lerp(y, ny, tween));

      x = p.map(0, 0, 16, 0.4, -0.4) * pg.width;
      nx = pg.width * 0.4 * Math.sin(1 * 2 * Math.PI / 3);
      y = p.map(12, 0, 16, 0.4, -0.4) * pg.width;
      ny = pg.width * 0.4 * Math.cos(1 * 2 * Math.PI / 3);
      pg.vertex(p.lerp(x, nx, tween), p.lerp(y, ny, tween));
      pg.vertex(-p.lerp(x, nx, tween), p.lerp(y, ny, tween));

      pg.endShape(p.CLOSE);
    }

    pg.popMatrix();
    pg.endDraw();

    if (mode != nextMode) {
      startTime = p.millis();
      print("to mode " + nextMode);
    }
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

var p086 = new p5(s);
