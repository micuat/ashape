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

var S114 = function (p) {
  let pg, pgTex;

  pg = p.createGraphics(800, 800, p.P3D);
  pgTex = p.createGraphics(800, 800, p.P3D);

  this.params = {
    click: 0,
    click2: 0,
    sig: 0,
    hhat: 0
  }

  this.hhatCount = 0;
  
  this.onOsc = function (param) {
    this.params[param] = 1;

    if(param == "click") {
      if(p.random(1) > 0.8) {
        this.params.click2 = 1;
      }
    }
    else if(param == "hhat") {
      this.hhatCount = (this.hhatCount + 1) % 4;
    }
  }

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

  this.drawPg = function(pg, t) {
    pgTex.beginDraw();
    pgTex.pushMatrix();
    pgTex.background(255);
    pgTex.translate(pgTex.width * 0.5, pgTex.height * 0.5);
    pgTex.pointLight(255, 255, 255, 0, 0, 400);
    let n = 13;
    // pgTex.rotate(Math.max(this.params.hhat, 0));
    pgTex.noStroke();
    // pgTex.stroke(255);
    pgTex.fill(100);
    for(let i = -n; i <= n; i++) {
      let y = i * 800.0 / n;
      pgTex.pushMatrix();
      pgTex.translate(0, y);
      // pgTex.rotateX(Math.PI / 4);
      let rot = ["rotateZ", "rotateY", "rotateZ", "rotateY"][this.hhatCount];
      pgTex[rot](Math.max(this.params.hhat - (i+n) * 0.01, 0));
      pgTex.box(1500, 10, 10);
      pgTex.popMatrix();
    }
    pgTex.popMatrix();
    pgTex.endDraw();

    pg.beginDraw();
    pg.textureMode(p.NORMAL);
    pg.background(255, 0, 0);

    pg.translate(pg.width * 0.5, pg.height * 0.5);
    pg.pushMatrix();

    // pg.background(this.params.hhat * 255);
    // pg.pointLight(255, 255, 255, 0, 0, 400);
    // pg.pointLight(150 + 100 * this.params.click, 255, 255, 0, 0, 400);

    n = 3;
    pg.fill(255);
    pg.noStroke();
    for(let i = -n; i <= n; i++) {
      for(let j = -n; j <= n; j++) {
        pg.pushMatrix();
        let sc = pg.width / (n * 2 + 1) / 2;
        pg.translate(j * sc * 2, i * sc * 2, 0);//this.params.click * -200 * p.noise(j * 2, i * 2));
        // pg.rotateY(Math.max(this.params.hhat - (i+n) * 0.1, 0));
        pg.rotateZ(Math.max(this.params.click2 * Math.PI * 2, 0));
        pg.rotateX(Math.max(this.params.sig * Math.PI * 2 - (i+n) * 0.05 - 0.02, 0));
        pg.scale(sc, sc, sc);
        let x0 = p.map(j-0.5, -n-1, n+1, 0, 1);
        let y0 = p.map(i-0.5, -n-1, n+1, 0, 1);
        let x1 = p.map(j+0.5, -n-1, n+1, 0, 1);
        let y1 = p.map(i+0.5, -n-1, n+1, 0, 1);
        this.TexturedCube(pg, pgTex, x0, y0, x1, y1);
        // pg.box(100);
        pg.popMatrix();
      }
    }

    pg.popMatrix();
    pg.endDraw();

    for(let i in this.params) {
      this.params[i] = p.lerp(this.params[i], 0, 0.1);
    }
  }

  this.draw = function (t) {
    this.drawPg(pg, t);
    p.image(pg, 0, 0);
  }
};

var s = function (p) {
  let startTime;
  
  let s114 = new S114(p);

  p.setup = function () {
    name = p.folderName;

    p.createCanvas(800, 800);
    p.frameRate(60);

    startTime = p.millis();
  }

  function getTime() { return (p.millis() - startTime) * 0.001 };

  p.draw = function () {
    t = getTime();

    s114.draw(t);
  }

  p.oscEvent = function (m) {
    let path = m.addrPattern().split("/");
    if (path.length >= 3 && path[1] == "sc3p5") {
      s114.onOsc(path[2]);
    }
  }

  p.mousePressed = function () {
  }
};

p = new p5(s);
