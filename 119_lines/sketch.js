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
    if(type.freq > 0) {

    }
    else {
      this.blinks.push({t: t + type.delay * 0.5 + 0.4, type: type, y: Math.floor(p.random(8)) * 100});
      if(this.blinks.length > 20) this.blinks.shift();
    }
  }

  let colors = [
    [58, 64, 90],
    [174, 197, 235],
    [249, 222, 201],
    [233, 175, 163],
    [104, 80, 68],
  ];

  this.drawPg = function(pg, t) {
    if(p.frameCount % 60 == 0) {
    }

    pg.beginDraw();
    pg.background(255);
    pg.colorMode(p.RGB, 255, 255, 255);
    pg.translate(pg.width * 0.5, pg.height * 0.5);
    pg.pushMatrix();
    pg.noStroke();
    pg.rectMode(p.CENTER);
    for(let i in this.blinks) {
      let we = this.blinks[i].type.whatever;
      if(this.blinks[i].type.freq > 10) continue;
      let b = p.map(t - this.blinks[i].t, 0.0, 0.5, 1, 0);
      if(b > 1) b = 0;
      if(b < 0) b = 0;
      // pg.fill(this.blinks[i].type.whatever * 32, 255, 255, 255 - 255 * p.constrain(b, 0, 1));
      pg.fill(colors[we % 5][0], colors[we % 5][1], colors[we % 5][2]);
      pg.rotate(b * Math.PI);
      pg.rect(0, 0, 300 * b, 300 * b);
    }

    pg.fill(255, 128);




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
    // print(m)
    if (path[1] == "g_new") {
      print(m.get(2).intValue())
      // print(m.typetag(), m.get(1).intValue());
    }
    else if (path[1] == "s_new" && m.typetag().length > 10) {
      let res = {};
      let ress = "";
      for(let i = 4; i < m.typetag().length - 1; i++) {
        if(m.typetag()[i] == "s" && m.typetag()[i+1] == "f") {
          res[m.get(i).stringValue()] = m.get(i+1).floatValue();
          ress += m.get(i).stringValue() + " " + m.get(i+1).floatValue() + " ";
        }
      }
      print(ress)
      s119.onOsc(res, getTime());
    }
    // else if (path[1] == "s_new" && m.typetag()[7] == "i") {
    //   print(m.typetag(), m.get(7).intValue());
    // }
  }

  p.mousePressed = function () {
  }
};

p = new p5(s);
