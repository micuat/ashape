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

    let n = 24;
    let l = p.width / n;
    for(let i = 1; i < n; i++) {
      let x = i * p.width / n;
      let h = 200 * Math.sin((getCount() / 60.0 + i / n) * 2.0 * Math.PI) + p.height / 2;
      p.line(x, h, x, p.height);
    }
  }

};

var p063 = new p5(s);
