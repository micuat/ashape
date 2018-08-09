var s = function (p) {
  let name;
  let transformFunc;
  let startFrame;
  let pg;
  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(30);
    startFrame = p.frameCount;

    pg = p.createGraphics(p.width, p.height);
  }

  function getCount() { return p.frameCount - startFrame };

  p.draw = function () {
    p.background(0);
    p.stroke(255);

    if(getCount() % 60 == 0) {
      let funcs = [
        function (t, i) {
          pg.rotate(t + Math.PI * i * 0.5);
        }
        ,
        function (t, i) {
          pg.rotate(-t + Math.PI * i * 0.5);
        }
        ,
        function (t, i) {
          let j = i;
          if(i % 2 == 0) {
            j += 1;
          }
          pg.rotate(-t + Math.PI * j * 0.5);
          pg.translate(p.width * 0.25, 0.0);
          pg.rotate(Math.PI * 0.5);
          if(i % 2 == 0) {
            pg.rotate(Math.PI);
          }
          // pg.translate(-p.width * 0.25, 0.0);
        }
      ];
      transformFunc = p.random(funcs);
    }

    let t = getCount() / 30.0;
    pg.beginDraw();
    pg.fill(0, 20);
    pg.noStroke();
    pg.rect(0, 0, pg.width, pg.height);
    pg.pushMatrix();
    pg.translate(p.width * 0.5, p.height * 0.5);
    pg.noFill();

    pg.stroke(255, p.noise(t * 10.0) * 255);
    for(let j = 0; j < 4; j++) {
      pg.pushMatrix();
      transformFunc(t, j);

      pg.beginShape();
      pg.vertex(0, 0);
      for(let i = 1; i < 100; i++) {
        let x = i * 4 * 1.414;
        let y = (p.noise(i * 0.9, t * 10.0) - 0.5) * 50;
        pg.vertex(x, y);
      }
      pg.endShape();
      pg.popMatrix();
    }
    pg.popMatrix();
    pg.endDraw();
    p.image(pg, 0, 0);
  }
};

var p076 = new p5(s);