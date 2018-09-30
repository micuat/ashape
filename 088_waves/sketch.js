var s = function (p) {
  let startTime;
  let pg;

  p.setup = function () {
    name = p.folderName;

    p.createCanvas(800, 800);
    p.frameRate(30);

    startTime = p.millis();

    pg = p.createGraphics(800, 800);
  }

  function getTime() { return (p.millis() - startTime) * 0.001 };

  function drawLine(pg) {
    pg.beginShape();
    let n = 100;
    for(let i = 0; i < n; i++) {
      let x = p.map(i, 0, n, -100, 100);
      pg.vertex(x, Math.sin(i / 100 * Math.PI * 4) * 100);
    }
    pg.endShape();
  }

  function drawPg(pg) {
    pg.beginDraw();
    pg.background(0);

    pg.stroke(255);
    pg.noFill();
    pg.translate(pg.width / 2, pg.height / 2);

    drawLine(pg);
    pg.endDraw();
  }

  p.draw = function () {
    t = getTime();

    drawPg(pg);
    p.image(pg, 0, 0);
  }
};

var p084 = new p5(s);
