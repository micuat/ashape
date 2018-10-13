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

var S098 = function (p) {
  let startTime;
  let pg;
  let lastSeq;
  let cycle = 4.0;
  
  let remoteLocation = new Packages.netP5.NetAddress("127.0.0.1", 57110);

  pg = p.createGraphics(800, 800, p.P3D);

  let curPoints = [];
  let lines = [];
  let coeffs = [];
  function drawPg(pg, t) {
    let seq = Math.floor(t / cycle);
    pg.beginDraw();
    pg.blendMode(p.BLEND);
    pg.background(0);

    pg.translate(pg.width * 0.5, pg.height * 0.5);

    let phase = t / cycle % 1.0;

    pg.fill(255);
    pg.noStroke();
    let points = [
      [
        {x: -150, y: -200},
        {x: -30, y: -220},
        {x: 90, y: -200},
        {x: 200, y: -150},
        {x: 220, y: 50},
        {x: 120, y: 250},
        {x: -150, y: 210},
        {x: -200, y: 160},
        {x: -250, y: 0},
        {x: -180, y: -70},
      ],
      [
        {x: -250, y: -10},
        {x: -185, y: -75},
        {x: -200, y: -180},
        {x: -230, y: -180},
        {x: -260, y: -150},
      ],
      [
        {x: -150, y: -210},
        {x: -70, y: -220},
        {x: -75, y: -270},
        {x: -140, y: -265},
      ],
      [
        {x: -60, y: -230},
        {x: 20, y: -220},
        {x: 20, y: -270},
        {x: -50, y: -280},
      ],
      [
        {x: 30, y: -220},
        {x: 110, y: -210},
        {x: 110, y: -260},
        {x: 45, y: -270},
      ],
      [
        {x: 120, y: -200},
        {x: 200, y: -170},
        {x: 195, y: -230},
        {x: 140, y: -250},
      ],
    ];
    for(let i = 0; i < points.length; i++) {
      pg.beginShape();
      for(let j = 0; j < points[i].length; j++) {
        let c = points[i][j];
        pg.vertex(c.x + 40 * (p.noise(i*0.1, j*0.1+p.millis()*0.0003)-0.5),
        c.y + 40 * (p.noise(i*0.2, j*0.15+p.millis()*0.0003)-0.5));
      }
      pg.endShape();
    }

    pg.fill(255);
    pg.stroke(128);
    let anchors = [
      [
        {x: -150, y: -50},
        {x: -140, y: -70},
        {x: -130, y: -120},
        {x: -60, y: -180},
        {x: 70, y: -170},
      ],
      [
        {x: -20, y: 0},
        {x: 10, y: -65},
        {x: 15, y: -50},
        {x: -5, y: -50},
        {x: -25, y: 0},
      ],
      [
        {x: -90, y: 150},
        {x: 160, y: 20},
        {x: 160, y: -70},
        {x: 90, y: -160},
        {x: 20, y: 170},
      ]
    ];

    // for(let i in anchors[0]) {
    //   let c0 = anchors[0][i];
    //   let c1 = anchors[1][i];
    //   let c2 = anchors[2][i];
    //   pg.ellipse(c0.x, c0.y, 10, 10);
    //   pg.ellipse(c2.x, c2.y, 10, 10);
    //   pg.line(c0.x, c0.y, c1.x, c1.y);
    //   pg.line(c2.x, c2.y, c1.x, c1.y);
    // }

    if (seq != lastSeq || curPoints.length == 0) {
      curPoints = [];
      lines = [];
      coeffs = [];
      for(let i in anchors[0]) {
        curPoints.push(anchors[0][i]);
        coeffs.push(p.random(0.5, 1.0));
      }
    }

    for(let i = 0; i < curPoints.length; i++) {
      let c = curPoints[i];
      // pg.ellipse(c.x, c.y, 10, 10);
      c.x = p.lerp(c.x, p.lerp(anchors[2][i].x, anchors[1][i].x, (1-phase) * coeffs[i]), 0.05);
      c.y = p.lerp(c.y, p.lerp(anchors[2][i].y, anchors[1][i].y, (1-phase) * coeffs[i]), 0.05);
      for(let j = 0; j < 2; j++) {
        let dx = p.randomGaussian(0, 4);//p.random(-10, 10);
        let dy = p.randomGaussian(0, 4);//p.random(-10, 10);
        lines.push({x0: c.x - dx, y0: c.y - dy, x1: c.x + dx, y1: c.y + dy});
      }
    }

    pg.strokeWeight(1);
    pg.stroke(0);
    for(let i in lines) {
      let l = lines[i];
      pg.line(l.x0, l.y0, l.x1, l.y1);
      // pg.point(l.x0, l.y0);
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
  
  let s098 = new S098(p);

  p.setup = function () {
    name = p.folderName;

    p.createCanvas(800, 800);
    p.frameRate(30);

    startTime = p.millis();
  }

  function getTime() { return (p.millis() - startTime) * 0.001 };

  p.draw = function () {
    t = getTime();

    s098.draw(t);
  }
};

var p = new p5(s);
