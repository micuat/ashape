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

  p.draw = function () {
    t = (getCount() / 30.0);

    let seq = Math.floor(t) % 4;

    p.background(0);
    p.fill(255);
    p.stroke(255);

    let n = Math.pow(2.0, seq + 2);

    p.translate(p.width / 2, p.height / 2);

    let tween = (t / 1.0) % 1.0;
    if(tween < 0.5) {
      tween = Math.pow(tween * 2.0, 4.0) * 0.5;
    }
    else {
      tween = 1.0 - Math.pow(2.0 - tween * 2.0, 4.0) * 0.5;
    }

    for (let i = 0; i < n; i++) {
      let r = 0.25 * p.width;
      let angle = i / n + tween / n;
      let x = Math.cos(angle * 2 * Math.PI) * r;
      let y = Math.sin(angle * 2 * Math.PI) * r;
      let xy = [[0, -p.height / 2], [0, p.height / 2], [p.width / 2, 0], [-p.width / 2, 0]];
      p.ellipse(x, y, 4, 4);
      for(let j in xy) {
        let x0 = xy[j][0];
        let y0 = xy[j][1];
        p.stroke(255, p.constrain(p.map(p.dist(x, y, x0, y0), p.width / 2, p.width * 0.75, 1, 0), 0, 1) * 255);
        p.line(x, y, x0, y0);
      }
    }
  }
};

var p084 = new p5(s);
