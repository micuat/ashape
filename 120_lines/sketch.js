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

var S120 = function (p) {
  let pg, pgTex0, pgTex1;

  pg = p.createGraphics(800, 800, p.P3D);
  pgTex0 = p.createGraphics(800, 800, p.P3D);
  pgTex1 = p.createGraphics(800, 800, p.P3D);

  let colors = [
    [0xf5, 0x5d, 0x3e],
    [0xff, 0xff, 0xff],
    [0xF7, 0xCB, 0x15],
    [0xff, 0xff, 0xff],
    [0x76, 0xBE, 0xD0],
  ];

  let points = [];
  for(let i = 0; i < 20; i++) {
    let po = p.createVector(p.random(-400, 400), p.random(-400, 400));
    let v = p5.Vector.random2D();
    v.mult(p.random(0.5, 3));
    points.push({p: po, v: v});
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
  this.drawPgTex = function(pgTex, t, add) {
    pgTex.beginDraw();
    if(add) {
    }
    else {
      pgTex.directionalLight(255, 255, 255, 0, 1, -1);
      pgTex.background(0, 0);
    }
    // pgTex.background(255, 50);

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
      let h = 0.05 * 3;
      for(let n = 0; n < 2; n++) {
        pgTex.beginShape(p.TRIANGLE_STRIP);
        for(let x = -0.5; x <= 0.5; x += 0.02) {
          let sig = Math.cos(x * Math.PI * amount + t * 4 + xm * 0.01);
          sig = Math.max(sig, 0);
          let env = Math.cos(x * Math.PI) * alpha * alpha;
          let y = sig * env * h * (n > 0 ? -1 : 1);
          let c = Math.floor(p.map(x, -0.5, 0.5, 0, 1) + t + (xm + 600) * 0.01) % colors.length;
          if(add) {
            pgTex.fill(colors[c][0], colors[c][1], colors[c][2], 1 * 255);
          }
          else {
            pgTex.fill(colors[c][0], colors[c][1], colors[c][2], 1 * 255);
          }
          pgTex.vertex(x, y, 0);
          pgTex.vertex(x, 0, Math.abs(y) * 30);
        }
        pgTex.endShape();
      }
      pgTex.popMatrix();
    }
    for(let i = 0; i < points.length; i++) {
      pgTex.point(points[i].p.x, points[i].p.y);
      for(let j = i; j < points.length; j++) {
        let alpha = 1 - points[i].p.dist(points[j].p) / 400.0;
        if(alpha > 0) {
          if(p.frameCount % 120 < 60) {
            let v = points[i].p.copy();
            v.sub(points[j].p);
            v.mult(0.0002);
            points[j].v.add(v);

            v = points[j].p.copy();
            v.sub(points[i].p);
            v.mult(0.0002);
            points[i].v.add(v);
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
    if(p.frameCount % 60 == 0) {
      for(let i = 0; i < points.length; i++) {
        points[i].v = p5.Vector.random2D();
        points[i].v.mult(p.random(1.5, 5));
      }
    }

    for(let i = 0; i < points.length; i++) {
      points[i].p.add(points[i].v);
      points[i].p.x = (points[i].p.x + 1200 * 1.5) % 1200 - 1200 * 0.5;
      points[i].p.y = (points[i].p.y + 1200 * 1.5) % 1200 - 1200 * 0.5;
      // points[i].p.x = (points[i].p.x + pg.width * 1.5) % pg.width - pg.width * 0.5;
      // points[i].p.y = (points[i].p.y + pg.width * 1.5) % pg.width - pg.width * 0.5;
    }

    this.drawPgTex(pgTex1, t, false);

    pg.beginDraw();
    pg.textureMode(p.NORMAL);
    pg.background(255);

    pg.fill(255, 128);

    pg.translate(pg.width * 0.5, pg.height * 0.5);
    pg.pushMatrix();

    if(Math.floor(t / 4) > Math.floor(lastTime / 4)) {
      for(let i = 0; i <= nGrid; i++) {
        for(let j = 0; j <= nGrid; j++) {
          heights[i][j] = p.random(800);
        }
      }    
    }
    lastTime = t;
    pg.image(pgTex1, -pg.width * 0.5, -pg.height * 0.5);
    // pg.noStroke();
    // for(let i = 0; i < nGrid; i++) {
    //   pg.beginShape(p.TRIANGLE_STRIP);
    //   pg.texture(pgTex);
    //   for(let j = 0; j <= nGrid; j++) {
    //     let x = p.map(j, 0, nGrid, -pg.width / 2, pg.width / 2);
    //     let y0 = p.map(i, 0, nGrid, -pg.height / 2, pg.height / 2);
    //     let y1 = p.map(i + 1, 0, nGrid, -pg.height / 2, pg.height / 2);
    //     let ease = EasingFunctions.easeInQuart(Math.sin(((t / 4) % 1) * Math.PI));
    //     let h0 = heights[i][j] * ease;
    //     let h1 = heights[i + 1][j] * ease;
    //     pg.vertex(x, y0, h0, j / nGrid, i / nGrid);
    //     pg.vertex(x, y1, h1, j / nGrid, (i + 1) / nGrid);
    //   }
    //   pg.endShape();
    // }

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
  
  let s120 = new S120(p);

  p.setup = function () {
    name = p.folderName;

    p.createCanvas(800, 800);
    p.frameRate(60);

    startTime = p.millis();
  }

  function getTime() { return (p.millis() - startTime) * 0.001 };

  p.draw = function () {
    t = getTime();

    s120.draw(t);
  }

  p.oscEvent = function (m) {
    let path = m.addrPattern().split("/");
    if (path.length >= 3 && path[1] == "sc3p5") {
      s120.onOsc(path[2]);
    }
  }

  p.mousePressed = function () {
  }
};

p = new p5(s);
