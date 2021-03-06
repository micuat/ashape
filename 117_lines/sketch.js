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

var S117 = function (p) {
  let pg, pgTex;

  pg = p.createGraphics(800, 800, p.P3D);
  pgTex = p.createGraphics(800, 800, p.P3D);

  this.TexturedCube = function (pg, tex, x0, y0, x1, y1) {
    pg.beginShape(p.QUADS);
    pg.texture(tex);

    // +Z "front" face
    pg.vertex(-1, -1,  1, x0, y0);
    pg.vertex( 1, -1,  1, x1, y0);
    pg.vertex( 1,  1,  1, x1, y1);
    pg.vertex(-1,  1,  1, x0, y1);
  
    // // -Z "back" face
    // pg.vertex( 1, -1, -1, x0, y0);
    // pg.vertex(-1, -1, -1, x1, y0);
    // pg.vertex(-1,  1, -1, x1, y1);
    // pg.vertex( 1,  1, -1, x0, y1);
  
    // // +Y "bottom" face
    // pg.vertex(-1,  1,  1, x0, y0);
    // pg.vertex( 1,  1,  1, x1, y0);
    // pg.vertex( 1,  1, -1, x1, y1);
    // pg.vertex(-1,  1, -1, x0, y1);
  
    // // -Y "top" face
    // pg.vertex(-1, -1, -1, x0, y0);
    // pg.vertex( 1, -1, -1, x1, y0);
    // pg.vertex( 1, -1,  1, x1, y1);
    // pg.vertex(-1, -1,  1, x0, y1);
  
    // // +X "right" face
    // pg.vertex( 1, -1,  1, x0, y0);
    // pg.vertex( 1, -1, -1, x1, y0);
    // pg.vertex( 1,  1, -1, x1, y1);
    // pg.vertex( 1,  1,  1, x0, y1);
  
    // // -X "left" face
    // pg.vertex(-1, -1, -1, x0, y0);
    // pg.vertex(-1, -1,  1, x1, y0);
    // pg.vertex(-1,  1,  1, x1, y1);
    // pg.vertex(-1,  1, -1, x0, y1);
  
    pg.endShape();
  }

  let colors = [
    [58, 64, 90],
    [174, 197, 235],
    [249, 222, 201],
    [233, 175, 163],
    [104, 80, 68],
  ];

  let points = [];
  for(let i = 0; i < 20; i++) {
    let po = p.createVector(p.random(-400, 400), p.random(-400, 400));
    let v = p5.Vector.random2D();
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

  this.drawPg = function(pg, t) {
    pgTex.beginDraw();
    pgTex.background(0, 0);

    pgTex.translate(pgTex.width * 0.5, pgTex.height * 0.5);
    pgTex.pushMatrix();

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
      for(let i = 0; i < 3; i++) {
        let h = 0.05 * (i + 1);
        for(let n = 0; n < 2; n++) {
          pgTex.beginShape();
          for(let x = -0.5; x <= 0.5; x += 0.02) {
            let sig0 = Math.cos(x * Math.PI * amount + t * 4);
            let sig1 = p.noise(t, x * 10);
            let pt = EasingFunctions.easeInOutCubic(Math.sin(t + x0 * 0.01) * 0.5 + 0.5);
            let sig = p.lerp(sig0, sig1, pt);
            let env = Math.cos(x * Math.PI);
            let y = sig * env * h;
            let c = Math.floor(p.map(x, -0.5, 0.5, 0, colors.length) + t * 4) % colors.length;
            pgTex.fill(colors[c][0], colors[c][1], colors[c][2], alpha * 255);
            pgTex.vertex(x, y);
          }
          pgTex.endShape();
          pgTex.scale(1, -1);
        }
      }
      pgTex.popMatrix();
    }
    for(let i = 0; i < points.length; i++) {
      pgTex.point(points[i].p.x, points[i].p.y);
      for(let j = i; j < points.length; j++) {
        let alpha = 1 - points[i].p.dist(points[j].p) / 400.0;
        if(alpha > 0) {
          alpha = Math.min(alpha * 2.0, 1.0);
          drawLine(points[i].p.x, points[i].p.y, points[j].p.x, points[j].p.y, alpha);
        }
      }
    }
    for(let i = 0; i < points.length; i++) {
      points[i].p.add(points[i].v);
      points[i].p.x = (points[i].p.x + 1200 * 1.5) % 1200 - 1200 * 0.5;
      points[i].p.y = (points[i].p.y + 1200 * 1.5) % 1200 - 1200 * 0.5;
      // points[i].p.x = (points[i].p.x + pg.width * 1.5) % pg.width - pg.width * 0.5;
      // points[i].p.y = (points[i].p.y + pg.width * 1.5) % pg.width - pg.width * 0.5;
    }

    pgTex.popMatrix();
    pgTex.endDraw();

    pg.beginDraw();
    pg.textureMode(p.NORMAL);
    pg.background(255);

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
    pg.image(pgTex, -pg.width * 0.5, -pg.height * 0.5);
    pg.noStroke();
    for(let i = 0; i < nGrid; i++) {
      pg.beginShape(p.TRIANGLE_STRIP);
      pg.texture(pgTex);
      for(let j = 0; j <= nGrid; j++) {
        let x = p.map(j, 0, nGrid, -pg.width / 2, pg.width / 2);
        let y0 = p.map(i, 0, nGrid, -pg.height / 2, pg.height / 2);
        let y1 = p.map(i + 1, 0, nGrid, -pg.height / 2, pg.height / 2);
        let ease = EasingFunctions.easeInQuart(Math.sin(((t / 4) % 1) * Math.PI));
        let h0 = heights[i][j] * ease;
        let h1 = heights[i + 1][j] * ease;
        pg.vertex(x, y0, h0, j / nGrid, i / nGrid);
        pg.vertex(x, y1, h1, j / nGrid, (i + 1) / nGrid);
      }
      pg.endShape();
    }

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
  
  let s117 = new S117(p);

  p.setup = function () {
    name = p.folderName;

    p.createCanvas(800, 800);
    p.frameRate(60);

    startTime = p.millis();
  }

  function getTime() { return (p.millis() - startTime) * 0.001 };

  p.draw = function () {
    t = getTime();

    s117.draw(t);
  }

  p.oscEvent = function (m) {
    let path = m.addrPattern().split("/");
    if (path.length >= 3 && path[1] == "sc3p5") {
      s117.onOsc(path[2]);
    }
  }

  p.mousePressed = function () {
  }
};

p = new p5(s);
