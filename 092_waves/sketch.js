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

var s = function (p) {
  let startTime;
  let pg;
  
  let remoteLocation = new Packages.netP5.NetAddress("127.0.0.1", 57110);

  p.setup = function () {
    name = p.folderName;

    p.createCanvas(800, 800);
    p.frameRate(30);

    startTime = p.millis();

    pg = p.createGraphics(800, 800, p.P3D);
  }

  function getTime() { return (p.millis() - startTime) * 0.001 };

  function drawPg(pg, t) {
    pg.beginDraw();
    pg.background(0, 30);

    pg.translate(pg.width * 0.5, pg.height * 0.5);
    pg.stroke(255);
    pg.strokeWeight(1);
    let sin = Math.sin(t * 0.25 * Math.PI);
    sin *= EasingFunctions.easeInOutQuint(Math.abs(sin));
    let x = sin * pg.width / 3.0;

    for(let i = 0; i < 30; i++) {
      let y = p.randomGaussian(0, 0.1 * (1 - Math.abs(sin))) * pg.width;
      pg.point(x, y);
      pg.line(-pg.width / 3.0, 0, x, y);
      pg.line(pg.width / 3.0, 0, x, y);
    }
    pg.line(-pg.width / 2.0, 0, -pg.width / 3.0, 0);
    pg.line(pg.width / 2.0, 0, pg.width / 3.0, 0);

    if(p.frameCount % 1 == 0) {
      let m = new Packages.oscP5.OscMessage("/s_new");
      m.add("grain");
      m.add(-1);
      m.add(0);
      m.add(0);
      m.add("freq");
      p.addFloat(m, p.random(0, 100) + p.map(Math.abs(sin), 0, 1, 5000, 100));
      m.add("pan");
      p.addFloat(m, sin);
      p.oscP5.send(m, remoteLocation);
    }

    pg.endDraw();
  }

  p.draw = function () {
    t = getTime();

    drawPg(pg, t);
    p.image(pg, 0, 0);
  }
};

var p092 = new p5(s);
