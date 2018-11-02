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

var S111 = function (p) {
  let pg;

  pg = p.createGraphics(800, 800, p.P3D);

  let props = [];
  let rotFuncs = [
    function (pg, rad) {
      pg.rotateX(rad);
    },
    function (pg, rad) {
      pg.rotateY(rad);
    },
    function (pg, rad) {
      pg.rotateZ(rad);
    },
  ]
  for(let j = 0; j < 4; j++) {
    let propj = [];
    for(let i = 0; i < 4; i++) {
      let prop = {
        rot: p.random(rotFuncs),
        freq: Math.floor(p.random(1, 5))
      }
      propj.push(prop);
    }
    props.push(propj);
  }


  this.drawPg = function(pg, t) {
    pg.beginDraw();
    pg.background(0);
    // pg.background(this.back);

    pg.translate(pg.width * 0.5, pg.height * 0.5);

    pg.pushMatrix();

    pg.noStroke();
    pg.fill(255);
    // pg.noFill();
    pg.pointLight(255, 255, 255, 0, 0, 300);

    pg.rotateX(Math.PI * 0.25);

    function drawBox(l) {
      pg.pushMatrix();
      pg.translate(0, 0, l / 4);
      pg.box(l, l, l / 4);
      pg.popMatrix();
      pg.pushMatrix();
      pg.translate(0, 0, -l / 4);
      pg.box(l, l, l / 4);
      pg.popMatrix();
    }
    let l = 200;
    pg.pushMatrix();
    drawBox(l);
    for(let j in props) {
      pg.pushMatrix();
      pg.rotateY(Math.PI / 2 * j);
      for(let i in props[j]) {
        let tb = (t / props[j][i].freq) % 2;
        if(tb > 1) tb = 2 - tb;
        props[j][i].rot(pg, EasingFunctions.easeInOutCubic(tb) * Math.PI * 0.5);
        pg.translate(l, 0);
        pg.scale(0.5);
        drawBox(l);
      }
      pg.popMatrix();
    }
    pg.popMatrix();

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
  
  let s111 = new S111(p);

  p.setup = function () {
    name = p.folderName;

    p.createCanvas(800, 800);
    p.frameRate(30);

    startTime = p.millis();
  }

  function getTime() { return (p.millis() - startTime) * 0.001 };

  p.draw = function () {
    t = getTime();

    s111.draw(t);
  }

  p.oscEvent = function (m) {
    let path = m.addrPattern().split("/");
    if (path.length >= 3 && path[1] == "sc3p5" && path[2] == "spawn") {
    }
  }

  p.mousePressed = function () {
  }
};

p = new p5(s);
