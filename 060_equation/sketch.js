var s = function (p) {
  let name;
  let font;
  let pg;
  p.setup = function () {
    name = p.folderName;
    p.createCanvas(800, 800);
    p.frameRate(30);

    font = p.createFont("assets/Avenir.otf", 60);
    pg = p.createGraphics(p.width, p.height, p.P3D);
  }

  p.draw = function () {
    p.background(0);
    let t = (p.frameCount / 60.0);

    if (p.frameCount % (30 * 8) == 0) {
      pg.beginDraw();
      pg.background(255);
      pg.endDraw();
    }

    if (t % 4 >= 1) {
      pg.beginDraw();
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

    if(p.frameCount % 60 == 0) {
      // p.saveFrame(name + "/capture/######.png");
    }
  }
};

var p060 = new p5(s);