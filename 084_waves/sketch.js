var s = function (p) {
  let name;
  let startFrame, startTime;
  let seq, phase, cycle;
  let xy;
  let r;
  let pg;

  p.setup = function () {
    name = p.folderName;

    p.createCanvas(800, 800);
    p.frameRate(30);

    startFrame = p.frameCount;
    startTime = p.millis();

    pg = p.createGraphics(800, 800);
    xy = [[0, -pg.height / 2], [pg.width / 2, 0], [0, pg.height / 2], [-pg.width / 2, 0]];
    r = 0.25 * pg.width;
  }

  function getCount() { return p.frameCount - startFrame };
  function getTime() { return (p.millis() - startTime) * 0.001 };

  function drawLine(pg, i, n, rotTween, expTween, strokeTween) {
    let angle = i / n + (rotTween + expTween) / n;
    let x = Math.cos(angle * 2 * Math.PI) * r;
    let y = Math.sin(angle * 2 * Math.PI) * r;
    for(let j = 0; j < xy.length; j++) {
      let x0 = xy[j][0];
      let y0 = xy[j][1];
      pg.stroke(255, strokeTween * p.constrain(p.map(p.dist(x, y, x0, y0), pg.width / 2, pg.width * 0.75, 1, 0), 0, 1) * 255);
      pg.line(x, y, x0, y0);
    }
  }

  function drawPg(pg, n, tween) {
    let rotTween, expTween;
    if(phase == 0)
    {
      rotTween = tween;
      expTween = 0;
    }
    else {
      rotTween = 0;
      expTween = tween;
    }
    pg.beginDraw();
    pg.background(0);

    pg.stroke(255);
    pg.translate(pg.width / 2, pg.height / 2);
    for (let i = 0; i < n; i++) {
      let strokeTween = 1.0;
      let toStart = false;
      if(seq == cycle - 1 && phase == 1) {
        toStart = true;
        if(i % (n / 2) != 0)
          strokeTween = 1.0 - expTween;
      }
      drawLine(pg, i, n, rotTween, 0, strokeTween);
      strokeTween *= expTween;
      if(i % 2 == 0 && toStart == false) {
        drawLine(pg, i, n, rotTween, expTween * 0.5, strokeTween);
        drawLine(pg, i, n, rotTween, expTween * -0.5, strokeTween);
      }
    }
    pg.endDraw();
  }

  p.draw = function () {
    // t = (getCount() / 30.0);
    t = getTime();

    cycle = 4.0;
    seq = Math.floor(t / 2.0) % cycle; // every 2 cycle
    phase = Math.floor(t) % 2; // every cycle

    let n = Math.pow(2.0, seq + 1);

    let tween = (t) % 1.0;
    if(tween < 0.5) {
      tween = Math.pow(tween * 2.0, 4.0) * 0.5;
    }
    else {
      tween = 1.0 - Math.pow(2.0 - tween * 2.0, 4.0) * 0.5;
    }

    drawPg(pg, n, tween);
    p.image(pg, 0, 0);
  }
};

var p084 = new p5(s);
