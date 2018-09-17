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

    p.background(0);
    p.fill(255);
    p.stroke(255);

    let n = 32;
    let l = p.width / n;
    let dn = 16.0;
    let f = 1.0 / 60;

    p.translate(p.width / 2, p.height / 2);

    for (let i = 1; i < n; i++) {
      let x = Math.cos((i / n + t * 0.008 * i) * 2 * Math.PI) * p.width / 4;
      let y = Math.sin((i / n + t * 0.004 * i) * 2 * Math.PI) * p.width / 4;
      let x0 = p.width * 0.4;
      let y0 = p.height * 0.4;
      p.ellipse(x, y, 4, 4);
      p.ellipse(x, y0, 4, 4);
      p.ellipse(x0, y, 4, 4);
      p.line(x, y, x, y0);
      p.line(x, y, x0, y);
    }
  }
};

var p082 = new p5(s);
