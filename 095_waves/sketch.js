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
  
  let remoteLocation = new Packages.netP5.NetAddress("127.0.0.1", 57110);

  pg = p.createGraphics(800, 800, p.P3D);

  function Agent(i, j) {
    this.i = i;
    this.j = j;
    this.n = 4;
    this.isTriggered = false;
    this.isChanged = false;
    this.bounce = 0;
    this.init = function () {
      this.n = p.random([3, 4, 5]);
    }
    this.init();
    this.trigger = function () {
      if(this.isTriggered == false) {
        this.isTriggered = true;
        this.isChanged = false;
        this.bounce = p.millis() * 0.001;
      }
    }
    this.update = function (t) {
      if(Math.floor((t * 9 / cycle) % 9) == this.i * 3 + this.j) {
        this.trigger();
      }
    }
    this.draw = function (seq) {
      let h1 = -pg.width * 0.3;
      let h00 = pg.width * 0.3;
      let h0 = h00;
      if(this.isTriggered) {
        let t = p.millis() * 0.001 - this.bounce;
        if(t > 1) {
          this.isTriggered = 0;
        }
        if(t < 0.5) {
          let m = new Packages.oscP5.OscMessage("/s_new");
          m.add("grain");
          m.add(-1);
          m.add(0);
          m.add(0);
          m.add("freq");
          p.addFloat(m, p.random(0, 500) + 3000);
          m.add("pan");
          p.addFloat(m, 0);
          m.add("vol");
          let vol = Math.cos(t * 2 * Math.PI);
          if(vol < 0) vol = 0;
          p.addFloat(m, vol);
          p.oscP5.send(m, remoteLocation);  
        }
        if(t > 0.5) {
          if(this.isChanged == false) {
            this.init();
            this.isChanged = true;
            let m = new Packages.oscP5.OscMessage("/s_new");
            m.add("signal");
            m.add(-1);
            m.add(0);
            m.add(0);
            let freq0 = 10000 - this.n * 1000;
            m.add("freq0");
            p.addFloat(m, freq0);
            let feedback = 0.001;
            m.add("feedback");
            p.addFloat(m, feedback);
            m.add("pos");
            p.addFloat(m, 0.0);
            let delay = 0.012;
            m.add("delay");
            p.addFloat(m, delay);
            m.add("vol");
            let vol = 0.1;
            p.addFloat(m, vol);
            p.oscP5.send(m, remoteLocation);
          }
        }
        h0 = p.map(Math.cos(t * Math.PI * 2), 1, -1, h00, h1);
      }

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
      digits[i][j] = new Agent(i, j);
    }
  }

  function drawPg(pg, t) {
    let seq = Math.floor(t / cycle);
    pg.beginDraw();
    pg.blendMode(p.BLEND);
    pg.background(0);

    pg.translate(pg.width * 0.5, pg.height * 0.5);

    if (seq != lastSeq) {
      mode = p.random([0, 1]);
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
          digits[i][j].update(t);
        }
      }    
    }

    pg.stroke(255);
    pg.strokeWeight(2);
    pg.fill(128);
    pg.rotateX(Math.PI / 3);
    pg.rotateZ(ph * Math.PI * 2.0);
    pg.lights();
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
      pg.box(pg.width * 0.6, pg.width * 0.2 * 0.8, 10)
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
