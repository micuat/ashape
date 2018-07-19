var s = function (p) {
  let name;
  let font;
  let pg;
  let startFrame;
  p.setup = function () {
    name = p.folderName;
    p.createCanvas(800, 800);
    p.frameRate(30);

    font = p.createFont("assets/Avenir.otf", 60);
    pg = p.createGraphics(p.width, p.height, p.P3D);
    startFrame = p.frameCount;
  }

  function getCount() {return p.frameCount - startFrame};

  p.draw = function () {
    p.background(0);
    let t = (getCount() / 60.0);

    if (getCount() % (30 * 8) == 0) {
      pg.beginDraw();
      pg.background(255);
      pg.endDraw();
    }

    if (t % 4 >= 1) {
      pg.beginDraw();
      pg.noStroke();
      pg.fill(128);
      pg.lights();
      pg.pushMatrix();
      pg.translate(pg.width / 2, pg.height / 2);

      for(let i = -4; i <= 4; i++) {
        pg.pushMatrix();
        pg.translate(i * 100, 0);

        pg.beginShape(p.TRIANGLE_STRIP);
        let w = 20 / 2;
        for(let j = 0; j < 8; j++) {
          pg.vertex(-w, 100 * j);
          pg.vertex(w, 100 * j);
        }
        pg.endShape(p.CLOSE);

        pg.popMatrix();
      }

      pg.popMatrix();
      pg.endDraw();
    }

    p.image(pg, 0, 0)

    p.push();
    p.translate(p.width / 2, p.height / 2);
    if (t % 4 < 2) {
      p.push();
      p.translate(0, 30);
      let tweena = Math.min(1.0, p.map(t % 2.0, 0.0, 0.5, 0.0, 1.0));
      if(t % 4.0 > 1.0)
      tweena = Math.max(0.0, p.map(t % 2.0, 1.5, 2.0, 1.0, 0.0));
      p.fill(128, 255 * tweena);

      p.textFont(font, 40);
      p.textAlign(p.LEFT, p.CENTER);
      p.text('remainders in movement', -320, -90);
      p.text('an accusation to form:', -320, -30);
      p.text('stay relevant, available', -320, 30);
      p.pop();
    }
    p.pop();

    if(getCount() % 60 == 0) {
      // p.saveFrame(name + "/capture/######.png");
    }
  }
};

var p060 = new p5(s);