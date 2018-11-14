var p;

var S119 = function (p) {
  let pg, pgTex0, pgTex1;

  pg = p.createGraphics(800, 800, p.P3D);

  let points = [];
  for(let i = 0; i < 20; i++) {
    let po = p.createVector(p.random(-400, 400), p.random(-400, 400));
    let v = p5.Vector.random2D();
    v.mult(p.random(0.5, 3));
    points.push({p: po, v: v});
  }

  this.blinks = [];
  this.onOsc = function (type, t) {
    // print(type)
    this.blinks.push({t: t, y: Math.floor(p.random(8)) * 100});
    if(this.blinks.length > 20) this.blinks.shift();
  }

  this.drawPg = function(pg, t) {
    if(p.frameCount % 60 == 0) {
    }

    pg.beginDraw();
    pg.background(255);
    for(let i in this.blinks) {
      let b = p.map(t - this.blinks[i].t, 0.4, 1.4, 1, 0);
      if(b > 1) b = 0;
      if(b < 0) b = 0;
      pg.fill(255 - 255 * p.constrain(b, 0, 1));
      pg.rect(0, this.blinks[i].y, 800 * b, 100);
    }

    pg.fill(255, 128);

    pg.translate(pg.width * 0.5, pg.height * 0.5);
    pg.pushMatrix();



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
  
  let s119 = new S119(p);

  p.setup = function () {
    name = p.folderName;

    p.createCanvas(800, 800);
    p.frameRate(60);

    startTime = p.millis();
  }

  function getTime() { return (p.millis() - startTime) * 0.001 };

  p.draw = function () {
    t = getTime();

    s119.draw(t);
  }

  p.oscEvent = function (m) {
    let path = m.addrPattern().split("/");
    print(m)
    if (path[1] == "g_new") {
      s119.onOsc("", getTime());
    }
    // if (path.length >= 3 && path[1] == "sc3p5") {
    //   s119.onOsc(path[2]);
    // }
  }

  p.mousePressed = function () {
  }
};

p = new p5(s);
