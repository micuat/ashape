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
  function Agent (index) {
    let lastSeq = -1;
    this.index = index;
    this.feedback = p.map(index, -1, 1, 0.001, 0.2);

    let transFuncs = [
      {
        f: function (pg, tween) {
          let y = p.map(EasingFunctions.easeInQuad(tween), 0, 1, 0, -pg.width / 3.0);
          pg.translate(0, y);
        },
        name: "up",
        audio: {
          freq: p.map(index, -1, 1, 1760, 1760 * 2)
        }
      },
      {
        f: function (pg, tween) {
          let y = p.map(EasingFunctions.easeInQuad(tween), 0, 1, 0, pg.width / 3.0);
          pg.translate(0, y);
        },
        name: "down",
        audio: {
          freq: p.map(index, -1, 1, 440, 440 * 2)
        }
      },
      {
        f: function (pg, tween) {
          let y = p.map(EasingFunctions.easeInQuad(tween), 0, 1, 0, Math.PI / 2);
          pg.rotate(y);
        },
        name: "none",
        audio: {
          freq: 0
        }
      },
    ];
    let transFunc = transFuncs[0];
    let boxFuncs = [
      {
        f: function (pg, tween) {
          pg.stroke(255);
          pg.fill(255);
          let x = pg.width / 8.0;
          let r = x * 0.1;
          pg.ellipse(-x, 0, r, r);
          pg.ellipse( x, 0, r, r);
          pg.line(-x, 0, x, 0);
        },
        f0: function (pg, tween, tfunc) {
          pg.noStroke();
          pg.fill(255 * tween);
          let x = pg.width / 8.0;
          let y = pg.width / 3.0;
          if(tfunc.name == "up") {
            pg.rect(-x, -y, x*2, -pg.width);
          }
          else if(tfunc.name == "down") {
            pg.rect(-x, y, x*2, pg.width);
          }
        },
        audio: {
        }
      },
      {
        f: function (pg, tween) {
          pg.stroke(255);
          pg.fill(255);
          let x = pg.width / 8.0;
          let r = x * 0.1;
          pg.ellipse(-x, 0, r, r);
          pg.ellipse( x, 0, r, r);
          pg.line(-x, 0, x, 0);
        },
        f0: function (pg, tween, tfunc) {
          pg.noStroke();
          pg.fill(255 * tween);
          let x = pg.width / 8.0;
          let y = pg.width / 3.0;
          if(tfunc.name == "up") {
            pg.rect(-x, -y, x*2, -pg.width);
          }
          else if(tfunc.name == "down") {
            pg.rect(-x, y, x*2, pg.width);
          }
        },
        audio: {
        }
      },
    ];
    let boxFunc = boxFuncs[0];

    this.draw = function (pg, t) {
      let tmod = t / 1.0;
      let seq = Math.floor(tmod * 2.0);
      tmod = tmod % 1.0;
      if(seq != lastSeq) {
        if (seq % 2 == 0) {
          transFunc = transFuncs[Math.floor(p.random(transFuncs.length))];
          boxFunc = boxFuncs[Math.floor(p.random(boxFuncs.length))];
        }
        if (seq % 2 == 1) {
          if(transFunc.name != "none") {
            let m = new Packages.oscP5.OscMessage("/s_new");
            m.add("withProc");
            m.add(-1);
            m.add(0);
            m.add(0);
            for(let key in transFunc.audio) {
              m.add(key);
              p.addFloat(m, transFunc.audio[key]);
            }
            for(let key in boxFunc.audio) {
              m.add(key);
              p.addFloat(m, boxFunc.audio[key]);
            }
            m.add("feedback");
            p.addFloat(m, this.feedback);
            m.add("pos");
            p.addFloat(m, 0.0);
            m.add("delay");
            p.addFloat(m, 0.012);
            p.oscP5.send(m, remoteLocation);
          }
          else {
            let m = new Packages.oscP5.OscMessage("/s_new");
            m.add("perc");
            m.add(-1);
            m.add(0);
            m.add(0);
            m.add("freq");
            p.addFloat(m, p.map(this.index, -1, 1, 500, 10000));
            p.oscP5.send(m, remoteLocation);
          }
        }
      }
  
      pg.pushMatrix();
      pg.translate(pg.width / 2, pg.height / 2);
  
      pg.translate(pg.width / 4 * index, 0);

      pg.line(-pg.width / 2, -pg.height / 3, pg.width / 2, -pg.height / 3);
      pg.line(-pg.width / 2, pg.height / 3, pg.width / 2, pg.height / 3);
  
      let tween = tmod;
      if(tween > 0.5) tween = 1 - tween;
      tween *= 2;
      let bTween = tween;
      if(seq % 2 == 0) bTween = 0;
      boxFunc.f0(pg, bTween, transFunc);
      transFunc.f(pg, tween);
      boxFunc.f(pg, tween);

      pg.popMatrix();

      lastSeq = seq;
    }
  }

  let agents = [];

  p.setup = function () {
    name = p.folderName;

    p.createCanvas(800, 800);
    p.frameRate(30);

    startTime = p.millis();

    pg = p.createGraphics(800, 800, p.P3D);

    for (let i = -1; i <= 1; i++) {
      agents.push(new Agent(i));
    }
  }

  function getTime() { return (p.millis() - startTime) * 0.001 };


  function drawPg(pg, t) {
    pg.beginDraw();
    pg.background(0);

    for(let i = 0; i < agents.length; i++) {
      let agent = agents[i];
      agent.draw(pg, t*0.25*Math.pow(2, p.map(i,-1,1,0,2)))// + i * 0.02);
    }

    pg.endDraw();
  }

  p.draw = function () {
    t = getTime();

    drawPg(pg, t);
    p.image(pg, 0, 0);
  }
};

var p091 = new p5(s);
