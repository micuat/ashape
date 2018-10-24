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

var S104 = function (p) {
  let pg;

  pg = p.createGraphics(800, 800, p.P3D);
  
  this.bx = 0;
  this.bz = 0;

  this.drawPg = function(pg, t) {
    pg.beginDraw();
    pg.background(0);

    pg.translate(pg.width * 0.5, pg.height * 0.5);

    pg.pushMatrix();
    pg.pointLight(255, 255, 255, 0, 0, 100);
    pg.rotateX(0.8);

    let n = 10;
    pg.fill(200);
    pg.stroke(100);
    for(let i = -n; i < n; i++) {
      pg.beginShape(p.TRIANGLE_STRIP);
      for(let j = -n; j <= n; j++) {
        let w = 50;
        let c = 0.9;
        let x = j * w;
        let y = i * w;
        let z = (p.noise(i * c, j * c, t) - 0.5) * this.bx + this.bz * (n - Math.abs(j));
        if(i == 0 && j == 0) {
          // x = this.bx;
          // z = this.bz;
        }
        pg.vertex(x, y, z);
        x = j * w;
        z = (p.noise((i+1) * c, j * c, t) - 0.5) * this.bx + this.bz * (n - Math.abs(j));
        if(i + 1 == 0 && j == 0) {
          // x = this.bx;
          // z = this.bz;
        }
        y = (i + 1) * w;
        pg.vertex(x, y, z);

      }
      pg.endShape();
    }
    // pg.translate(this.bz, 0, 0);
    // pg.box(100);
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
  
  let s104 = new S104(p);

  p.setup = function () {
    name = p.folderName;

    p.createCanvas(800, 800);
    p.frameRate(30);

    startTime = p.millis();
  }

  function getTime() { return (p.millis() - startTime) * 0.001 };

  p.draw = function () {
    t = getTime();

    s104.draw(t);
  }

  p.oscEvent = function (m) {
    let path = m.addrPattern().split("/");
    if (path.length >= 4 && path[1] == "sc3p5" && path[2] == "control") {
      s104[path[3]] = m.get(0).floatValue();
    }
  }
};

var p = new p5(s);
