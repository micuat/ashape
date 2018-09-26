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
  let seq, phase, cycle;
  let pg;
  let freqs;

  p.setup = function () {
    name = p.folderName;

    p.createCanvas(800, 800);
    p.frameRate(30);

    startFrame = p.frameCount;
    startTime = p.millis();

    pg = p.createGraphics(800, 800, p.P3D);

    freqs = new Array(11);
    for(let i = 0; i < 11; i++) {
      freqs[i] = new Array(11);
      for(let j = 0; j < 11; j++) {
        freqs[i][j] = 100.0 / Math.floor(p.random(10, 100));
      }
    }
  }

  function getTime() { return (p.millis() - startTime) * 0.001 };

  function drawCell(pg, t, f) {
    let colors = [[255, 0, 0], [0, 255, 0], [0, 0, 255]];
    pg.noStroke();
    pg.fill(30);
    // pg.ellipse(0, 0, 65, 65);
    for(let j = 0; j < colors.length; j++) {
      if((Math.floor(t / f)) % 3 != j) continue;

      // pg.stroke(colors[j][0], colors[j][1], colors[j][2]);
      let n = 8 * (j + 1);
      for(let i = 0; i < n; i++) {
        let r = 10 * (j + 1);
        let x = r * Math.cos(i * Math.PI * 2 / n);
        let y = r * Math.sin(i * Math.PI * 2 / n);
        pg.stroke(colors[j][0], colors[j][1], colors[j][2], 50);
        pg.strokeWeight(8);
        pg.point(x, y);
        pg.strokeWeight(3);
        pg.stroke(colors[j][0], colors[j][1], colors[j][2], 200);
        pg.point(x, y);
      }
    }
  }

  function drawPg(pg, t) {
    pg.beginDraw();
    pg.background(0);

    pg.stroke(255);
    pg.strokeWeight(2);
    pg.pushMatrix();
    pg.translate(pg.width / 2, pg.height / 2);

    for(let i = 0; i < freqs.length; i++) {
      for(let j = 0; j < freqs[i].length; j++) {
        pg.pushMatrix();
        pg.translate((j - 5) * 70, (i - 5) * 70);
        drawCell(pg, t, freqs[i][j])
        pg.popMatrix();
      }
    }

    pg.popMatrix();
    pg.endDraw();
  }

  p.draw = function () {
    t = getTime();

    cycle = 4.0;
    seq = Math.floor(t / 2.0) % cycle; // every 2 cycle
    phase = Math.floor(t) % 2; // every cycle

    drawPg(pg, t);
    p.image(pg, 0, 0);
  }
};

var p085 = new p5(s);
