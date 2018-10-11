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

var S095 = function (p) {
  let startTime;
  let pg;
  let lastSeq;
  let cycle = 4.0;
  let mode = 0;
  let rot = 0;
  let line = 0;
  
  let remoteLocation = new Packages.netP5.NetAddress("127.0.0.1", 57110);

  pg = p.createGraphics(800, 800, p.P3D);

  function Agent() {
    this.n = 4;
    this.draw = function (seq) {
      let points = [];
      for(let i = 0; i < this.n; i++) {
        let angle = i / this.n * 2.0 * Math.PI - Math.PI / this.n + Math.PI / 2;
        let x = Math.cos(angle);
        let y = Math.sin(angle);
        points.push({x: x, y: y});
      }
      let ymin = points[0].y;
      let ymax = points[Math.floor(this.n/2+1)].y;
      let r = pg.width * 0.1 / (ymax - ymin);
      let h1 = -pg.width * 0.3;
      let h00 = pg.width * 0.3;
      let h0 = h00;
      if(seq % 2 == 1) {
        h0 = p.map(Math.sin(p.millis() * 0.003), -1, 1, h00, h1);
      }
      for(let i = 0; i < points.length; i++) {
        pg.beginShape();
        pg.vertex(points[i].x * r, -(points[i].y - ymin + 0.5) * r, h1);
        pg.vertex(points[i].x * r, -(points[i].y - ymin + 0.5) * r, h0);
        pg.vertex(points[(i+1)%this.n].x * r, -(points[(i+1)%this.n].y - ymin + 0.5) * r, h0);
        pg.vertex(points[(i+1)%this.n].x * r, -(points[(i+1)%this.n].y - ymin + 0.5) * r, h1);
        pg.endShape(p.CLOSE);
      }

      pg.beginShape();
      for(let i in points) {
        pg.vertex(points[i].x * r, -(points[i].y - ymin + 0.5) * r, h0);
      }
      pg.endShape(p.CLOSE);
      pg.beginShape();
      for(let i in points) {
        pg.vertex(points[i].x * r, -(points[i].y - ymin + 0.5) * r, h1);
      }
      pg.endShape(p.CLOSE);
    }
  }

  let digits = [];
  for(let i = 0; i < 3; i++) {
    digits.push([]);
    for(let j = 0; j < 3; j++) {
      digits[i][j] = new Agent();
    }
  }

  function drawPg(pg, t) {
    let seq = Math.floor(t / cycle);
    pg.beginDraw();
    pg.blendMode(p.ADD);
    pg.background(0);

    pg.translate(pg.width * 0.5, pg.height * 0.5);
    pg.stroke(255);
    pg.strokeWeight(1);

    if (seq != lastSeq) {
      mode = p.random([0, 1]);
      rot = 0;//p.random([0, 1]);
      line = p.random([0, 1]);
    }

    let phase = t / cycle % 1.0;
    let n = 100;
    let ph;
    if(seq % 2 == 0) {
      ph = EasingFunctions.easeInOutQuint(phase) * 1.0;
    }
    else {
      ph = 0;

      for(let i = 0; i < 3; i++) {
        for(let j = 0; j < 3; j++) {
          if((p.frameCount/5) % 3 == j) {

            if(i == 2) {
              let m = new Packages.oscP5.OscMessage("/s_new");
              m.add("signal");
              m.add(-1);
              m.add(0);
              m.add(0);
              let freq0 = 1000;
              let freq1 = 200;
              m.add("freq0");
              p.addFloat(m, freq0);
              m.add("freq1");
              p.addFloat(m, freq1);
              let feedback = 0.2;
              m.add("feedback");
              p.addFloat(m, feedback);
              m.add("pos");
              p.addFloat(m, 0.0);
              let delay = 0.012 * (digits[0][j] + digits[1][j] + digits[2][j]) / 12.0;
              m.add("delay");
              p.addFloat(m, delay);
              p.oscP5.send(m, remoteLocation);
            }
          }
        }
      }    
    }

    pg.stroke(255);
    pg.strokeWeight(2);
    pg.fill(0);
    pg.rotateX(Math.PI / 3);
    pg.rotateZ(ph * Math.PI * 2.0);
    // pg.lights();
    // pg.pointLight(255, 255, 255, 0, 0, 100);
    for(let k = -1; k <= 1; k++) {
      pg.pushMatrix();
      pg.translate(0, k * pg.width * 0.2);
      for(let j = -1; j <= 1; j++) {
        pg.pushMatrix();
        pg.translate(j * pg.width * 0.2, 0);
        digits[k+1][j+1].draw(seq);
        pg.popMatrix();
      }
      pg.translate(0, 0, -pg.width * 0.3 - 5)
      pg.box(pg.width, pg.width * 0.2 * 0.8, 10)
      pg.popMatrix();  
    }    
    lastSeq = seq;
    pg.endDraw();
  }

  this.draw = function (t) {
    drawPg(pg, t);
    p.image(pg, 0, 0);
  }
};

var s = function (p) {
  let startTime;
  
  let s095 = new S095(p);

  p.setup = function () {
    name = p.folderName;

    p.createCanvas(800, 800);
    p.frameRate(30);

    startTime = p.millis();
  }

  function getTime() { return (p.millis() - startTime) * 0.001 };

  p.draw = function () {
    t = getTime();

    s095.draw(t);
  }
};

var p = new p5(s);
