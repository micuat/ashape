var s = function (p) {
  let name;
  let startFrame;
  let cycle = 8.0;

  p.setup = function () {
    name = p.folderName;

    p.createCanvas(800, 800);
    p.frameRate(30);

    font = p.createFont("assets/Avenir.otf", 60);
    startFrame = p.frameCount;
  }

  function getCount() { return p.frameCount - startFrame };

  p.draw = function () {
    t = (getCount() / 30.0);
    if (getCount() % (30 * cycle) == 0) {

    }

    p.background(0);
    p.fill(255);
    p.stroke(255);

    let n = 64;
    let l = p.width / n;
    for(let i = 1; i < n; i++) {
      let x = i * p.width / n;
      let h0 = p.height / 8 * Math.sin((getCount() / 120.0 + i / n) * 2.0 * Math.PI) + p.height / 2;
      p.line(x, h0, x, p.height);
      let dx = l * 0.2;
      let h1 = p.height / 8 * Math.sin((-getCount() / 600.0 + i / n) * 2.0 * Math.PI) + p.height / 2;
      p.line(x + dx, p.height - h1, x + dx, 0);
      let dth = p.height / 64.0;
      let d = Math.abs(h0 + h1 - p.height);
      if(d < dth) {
        let r = (dth - d) * 2;
        p.ellipse(x, h0, r, r);
      }
    }
  }

};

var p063 = new p5(s);
