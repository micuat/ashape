var s = function (p) {
  let name;
  let startFrame;
  let cycle = 8.0;

  p.setup = function () {
    name = p.folderName;

    p.createCanvas(800, 800);
    p.frameRate(30);

    startFrame = p.frameCount;
  }

  function getCount() { return p.frameCount - startFrame };

  function drawLine(i, n, rotTween, expTween, strokeTween) {
    let r = 0.25 * p.width;
    let angle = i / n + (rotTween + expTween) / n;
    let x = Math.cos(angle * 2 * Math.PI) * r;
    let y = Math.sin(angle * 2 * Math.PI) * r;
    let xy = [[0, -p.height / 2], [0, p.height / 2], [p.width / 2, 0], [-p.width / 2, 0]];
    for(let j in xy) {
      let x0 = xy[j][0];
      let y0 = xy[j][1];
      p.stroke(255, strokeTween * p.constrain(p.map(p.dist(x, y, x0, y0), p.width / 2, p.width * 0.75, 1, 0), 0, 1) * 255);
      p.line(x, y, x0, y0);
    }
  }

  p.draw = function () {
    t = (getCount() / 30.0);

    let cycle = 4.0;
    let seq = Math.floor(t / 2.0) % cycle; // every 2 cycle
    let phase = Math.floor(t) % 2; // every cycle

    p.background(0);
    p.fill(255);
    p.stroke(255);

    let n = Math.pow(2.0, seq + 2);
    let nNext = Math.pow(2.0, seq + 2 + 1);

    p.translate(p.width / 2, p.height / 2);

    let tween = (t) % 1.0;
    if(tween < 0.5) {
      tween = Math.pow(tween * 2.0, 4.0) * 0.5;
    }
    else {
      tween = 1.0 - Math.pow(2.0 - tween * 2.0, 4.0) * 0.5;
    }

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

    for (let i = 0; i < nNext; i++) {
      let strokeTween = 1.0;
      let toStart = false;
      if(seq == cycle - 1 && phase == 1) {
        toStart = true;
        if(i % (nNext / 8) != 0)
          strokeTween = 1.0 - expTween;
      }
      drawLine(i, n, rotTween, 0, strokeTween);
      strokeTween *= expTween;
      if(i % 2 == 0 && toStart == false) {
        drawLine(i, n, rotTween, expTween * 0.5, strokeTween);
        drawLine(i, n, rotTween, expTween * -0.5, strokeTween);
      }
    }
  }
};

var p084 = new p5(s);
