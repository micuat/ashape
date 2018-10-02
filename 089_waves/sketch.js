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
  
  p.setup = function () {
    name = p.folderName;

    p.createCanvas(800, 800);
    p.frameRate(30);

    startTime = p.millis();

    pg = p.createGraphics(800, 800, p.P3D);
  }

  function getTime() { return (p.millis() - startTime) * 0.001 };
  let lastSeq = -1;
  let remoteLocation = new Packages.netP5.NetAddress("127.0.0.1", 57110);

  let transFuncs = [
    function (pg, tween) {
      let y = p.map(EasingFunctions.easeInQuad(tween), 0, 1, 0, -pg.width / 3.0);
      pg.translate(0, y);
    },
    function (pg, tween) {
      let y = p.map(EasingFunctions.easeInQuad(tween), 0, 1, 0, pg.width / 3.0);
      pg.translate(0, y);
    },
  ];
  let transFuncIndex = 0;
  let boxFuncs = [
    function (pg, tween) {
      pg.stroke(255);
      pg.fill(255);
      pg.ellipse(0, 0, 30, 30);
    },
    function (pg, tween) {
      pg.stroke(255);
      pg.fill(255);
      let x = p.map(EasingFunctions.easeInQuad(tween), 0, 1, 0, pg.width / 3.0);
      pg.ellipse(-x, 0, 30, 30);
      pg.ellipse( x, 0, 30, 30);
      pg.line(-x, 0, x, 0);
    },
  ];
  let boxFuncIndex = 0;
  function drawPg(pg, t) {
    let tmod = t / 1.0;
    let seq = Math.floor(tmod * 2.0);
    tmod = tmod % 1.0;
    if(seq != lastSeq) {
      if (seq % 2 == 0) {
        transFuncIndex = Math.floor(p.random(transFuncs.length));
        boxFuncIndex = Math.floor(p.random(boxFuncs.length));
      }
      if (seq % 2 == 1) {
        let m = new Packages.oscP5.OscMessage("/s_new");
        m.add("withProc");
        m.add(-1);
        m.add(0);
        m.add(0);
        m.add("freq");
        p.addFloat(m, 880 + 880 * transFuncIndex);
        m.add("pos");
        p.addFloat(m, 0.0);
        m.add("delay");
        p.addFloat(m, 0.012);
        m.add("feedback");
        p.addFloat(m, 0.001 + 0.2 * (boxFuncIndex));
        p.oscP5.send(m, remoteLocation);
      }
    }

    pg.beginDraw();
    pg.background(0);

    pg.translate(pg.width / 2, pg.height / 2);

    let tween = tmod;
    if(tween > 0.5) tween = 1 - tween;
    tween *= 2;
    transFuncs[transFuncIndex](pg, tween);
    boxFuncs[boxFuncIndex](pg, tween);

    pg.endDraw();

    lastSeq = seq;
  }

  p.draw = function () {
    t = getTime();

    drawPg(pg, t);
    p.image(pg, 0, 0);
  }
};

var p084 = new p5(s);
