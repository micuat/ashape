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
    if (getCount() % (30 * cycle) == 0) {

    }

    p.background(0);
    p.fill(255);
    p.stroke(255);

    let n = 128;
    let l = p.width / n;
    let dn = 16.0;
    let f = 1.0 / 60;
    let h = [];
    p.colorMode(p.HSB, dn * 8, dn/2, dn/2);
    for(let i = 0; i < n; i++) {
      let x = i * p.width / n;
      p.beginShape(p.LINES);
      p.vertex(x, 0);
      for(let j = 0; j <= dn; j++) {
        p.stroke(j,dn-j,j);
        p.strokeWeight(2);
        let y = j / dn * p.height;
        if(j != 0 && j != dn)
          y += Math.sin(Math.pow(-1,j)*getCount() / 300.0 * j / dn * 32.0 + i / n * 16.0) * 30.0;
        p.vertex(x, y);
        p.vertex(x, y+10);
      }
      p.vertex(x, p.height);
      p.endShape();
    }
  }
};

var p082 = new p5(s);
