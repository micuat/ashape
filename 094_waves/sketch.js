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

var S094 = function (p) {
  let startTime;
  let pg;
  let lastSeq;
  let cycle = 2.0;
  let mode = 0;
  let rot = 0;
  let line = 0;
  
  let remoteLocation = new Packages.netP5.NetAddress("127.0.0.1", 57110);

  pg = p.createGraphics(800, 800, p.P3D);

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
    let ph = EasingFunctions.easeOutQuad(phase) * 2.0;
    if (ph > 1.0) ph = 2.0 - ph;
    // ph = EasingFunctions.easeInQuad(ph);

    if(rot == 1) {
      pg.rotate(ph * Math.PI);
    }

    let points = [];
    for (let i = 0; i <= n; i++) {
      let x, y;
      x = p.map(i, 0, 100, -pg.width / 3.0, pg.width / 3.0);
      let c = Math.sin(i / n * Math.PI) * ph;
      if(mode == 0.0) {
        y = p.random(-1, 1) * pg.width * 0.2 * c;
      }
      else if (mode == 1.0) {
        let angle = i / n * 2 * Math.PI * 4;
        y = Math.sin(angle) * pg.width * 0.2 * c;
      }
      else if (mode == 2.0) {
        y = 0.0;
      }
      points.push({x: x, y: y});
    }


    pg.beginShape(p.LINE_STRIP);
    pg.strokeWeight(1);
    if(line) {
      pg.stroke(255);
    }
    else {
      pg.stroke(255 * (1 - p.constrain(ph * 2.0, 0, 1)));
    }
    for(let i in points) {
      pg.vertex(points[i].x, points[i].y);
    }
    pg.endShape();

    if(line == 0) {
      pg.beginShape(p.POINTS);
      pg.strokeWeight(p.map(p.constrain(ph * 2.0, 0, 1), 0, 1, 1, 6));
      pg.stroke(255 * p.constrain(ph * 2.0, 0, 1));
      for(let i in points) {
        pg.vertex(points[i].x, points[i].y);
      }
      pg.endShape();
    }

    if (mode == 0.0 && phase < 0.5) {
      let m = new Packages.oscP5.OscMessage("/s_new");
      m.add("grain");
      m.add(-1);
      m.add(0);
      m.add(0);
      m.add("freq");
      let freq = p.random(0, 100);
      if(rot) {
        freq += p.map(ph, 0, 1, 3000, 10000);
      }
      else {
        freq += 3000;
      }
      if(line == 0) {
        freq += 1000;
      }
      p.addFloat(m, freq);
      m.add("pan");
      p.addFloat(m, 0);
      let decay = 0.5;
      if(line == 0) {
        decay = 0.1;
      }
      m.add("decay");
      p.addFloat(m, decay);
      p.oscP5.send(m, remoteLocation);
    }
    else if (mode == 1.0 && seq != lastSeq) {
      let m = new Packages.oscP5.OscMessage("/s_new");
      m.add("signal");
      m.add(-1);
      m.add(0);
      m.add(0);
      let freq0 = 0;
      let freq1 = 0;
      if(rot) {
        freq0 = 100;
        freq1 = 400;
      }
      else {
        freq0 = 2000;
        freq1 = 200;
      }
      m.add("freq0");
      p.addFloat(m, freq0);
      m.add("freq1");
      p.addFloat(m, freq1);
      let feedback = 0.2;
      if(line == 0) {
        feedback = 0.02;
      }
      m.add("feedback");
      p.addFloat(m, feedback);
      m.add("pos");
      p.addFloat(m, 0.0);
      let delay = 0.012;
      m.add("delay");
      p.addFloat(m, delay);
      p.oscP5.send(m, remoteLocation);
    }
    
    // if (rot == true && phase < 0.1) {
    //   let m = new Packages.oscP5.OscMessage("/s_new");
    //   m.add("grain");
    //   m.add(-1);
    //   m.add(0);
    //   m.add(0);
    //   m.add("freq");
    //   p.addFloat(m, p.random(0, 100) + 10000);
    //   m.add("decay");
    //   p.addFloat(m, 0.4);
    //   m.add("pan");
    //   p.addFloat(m, 0);
    //   p.oscP5.send(m, remoteLocation);
    // }

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
  
  let s094 = new S094(p);

  p.setup = function () {
    name = p.folderName;

    p.createCanvas(800, 800);
    p.frameRate(30);

    startTime = p.millis();
  }

  function getTime() { return (p.millis() - startTime) * 0.001 };

  p.draw = function () {
    t = getTime();

    s094.draw(t);
  }
};

var p = new p5(s);
