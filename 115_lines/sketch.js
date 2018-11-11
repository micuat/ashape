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

var S115 = function (p) {
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
  
    // -Z "back" face
    pg.vertex( 1, -1, -1, x0, y0);
    pg.vertex(-1, -1, -1, x1, y0);
    pg.vertex(-1,  1, -1, x1, y1);
    pg.vertex( 1,  1, -1, x0, y1);
  
    // +Y "bottom" face
    pg.vertex(-1,  1,  1, x0, y0);
    pg.vertex( 1,  1,  1, x1, y0);
    pg.vertex( 1,  1, -1, x1, y1);
    pg.vertex(-1,  1, -1, x0, y1);
  
    // -Y "top" face
    pg.vertex(-1, -1, -1, x0, y0);
    pg.vertex( 1, -1, -1, x1, y0);
    pg.vertex( 1, -1,  1, x1, y1);
    pg.vertex(-1, -1,  1, x0, y1);
  
    // +X "right" face
    pg.vertex( 1, -1,  1, x0, y0);
    pg.vertex( 1, -1, -1, x1, y0);
    pg.vertex( 1,  1, -1, x1, y1);
    pg.vertex( 1,  1,  1, x0, y1);
  
    // -X "left" face
    pg.vertex(-1, -1, -1, x0, y0);
    pg.vertex(-1, -1,  1, x1, y0);
    pg.vertex(-1,  1,  1, x1, y1);
    pg.vertex(-1,  1, -1, x0, y1);
  
    pg.endShape();
  }

  let colors = [
    [170, 143, 102],
    [237, 155, 64],
    [255, 238, 219],
    [97, 201, 168],
    [186, 59, 70]
  ];

  let points = [];
  for(let i = 0; i < 20; i++) {
    let po = p.createVector(p.random(-400, 400), p.random(-400, 400));
    let v = p5.Vector.random2D();
    points.push({p: po, v: v});
  }
  this.drawPg = function(pg, t) {
    pgTex.beginDraw();
    pgTex.pushMatrix();
    pgTex.background(255);
    pgTex.translate(pgTex.width * 0.5, pgTex.height * 0.5);
    pgTex.popMatrix();
    pgTex.endDraw();

    pg.beginDraw();
    pg.textureMode(p.NORMAL);
    pg.background(0, 0, 0);

    pg.translate(pg.width * 0.5, pg.height * 0.5);
    pg.pushMatrix();

    pg.strokeWeight(1);
    function drawLine (x0, y0, x1, y1, alpha) {
      pg.pushMatrix();
      let xm = p.lerp(x0, x1, 0.5);
      let ym = p.lerp(y0, y1, 0.5);
      pg.translate(xm, ym);
      let angle = Math.atan2(y1 - y0, x1 - x0);
      pg.rotate(angle);
      let s = Math.sqrt((x0 - x1) * (x0 - x1) + (y0 - y1) * (y0 - y1));
      pg.scale(s, s);
      pg.strokeWeight(5.0 / s);
      pg.noStroke();

      let amount = p.map(Math.abs((y0 + y1) * 0.5), 0, 400, 2, 0);
      for(let i = 0; i < 3; i++) {
        let h = 0.05 * (i + 1);
        for(let n = 0; n < 2; n++) {
          pg.beginShape();
          for(let x = -0.5; x <= 0.5; x += 0.02) {
            let sig0 = Math.cos(x * Math.PI * amount + t * 4);
            let sig1 = p.random(1);
            let pt = EasingFunctions.easeInOutCubic(Math.sin(t + x0 * 0.01) * 0.5 + 0.5);
            let sig = p.lerp(sig0, sig1, pt);
            let env = Math.cos(x * Math.PI);
            let y = sig * env * h;
            let c = Math.floor(p.map(x, -0.5, 0.5, 0, colors.length) + t * 4) % colors.length;
            pg.fill(colors[c][0], colors[c][1], colors[c][2], alpha * 255);
            pg.vertex(x, y);
          }
          pg.endShape();
          pg.scale(1, -1);
        }
      }
      pg.popMatrix();
    }
    for(let i = 0; i < points.length; i++) {
      pg.point(points[i].p.x, points[i].p.y);
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
  
  let s115 = new S115(p);

  p.setup = function () {
    name = p.folderName;

    p.createCanvas(800, 800);
    p.frameRate(60);

    startTime = p.millis();
  }

  function getTime() { return (p.millis() - startTime) * 0.001 };

  p.draw = function () {
    t = getTime();

    s115.draw(t);
  }

  p.oscEvent = function (m) {
    let path = m.addrPattern().split("/");
    if (path.length >= 3 && path[1] == "sc3p5") {
      s115.onOsc(path[2]);
    }
  }

  p.mousePressed = function () {
  }
};

p = new p5(s);
