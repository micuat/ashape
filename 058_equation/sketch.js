var s = function (p) {
  let name;
  let font;
  let rfont, rfontc;
  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(30);
    font = p.createFont("assets/Avenir.otf", 120);
    rfont = new Packages.geomerative.RFont("assets/l_10646.ttf", 60, p.LEFT);
    rfontc = new Packages.geomerative.RFont("assets/l_10646.ttf", 120, p.CENTER);
  }

  p.draw = function () {
    p.background(255, 255, 200);

    let t = p.millis() * 0.001;

    Packages.geomerative.RCommand.setSegmentLength(5); // 5 = many points; 125 = only a few points
    Packages.geomerative.RCommand.setSegmentator(Packages.geomerative.RCommand.UNIFORMLENGTH);

    {
      p.push();
      p.translate(p.width / 2, p.height / 2);
      p.translate(0, 30);
      p.stroke(0);
      p.strokeWeight(4);
      let grp0 = rfontc.toGroup('@call.stack');
      let grp1 = rfontc.toGroup('2018/07/16-');
      let rpoints0 = grp0.getPoints();
      let rpoints1 = grp1.getPoints();
      for (let i = 0; i < rpoints0.length * 1.0; i++) {
        let dp = 0.05
        let rot = (Math.pow(Math.sin(t * Math.PI * 0.125), 3.0) * 0.5 + 0.5) * (1.0 - dp);
        // p.point(rpoints[i].x + 100, rpoints[i].y + 100);
        // let rad = p.dist(0, 0, rpoints[i].x, rpoints[i].y);
        let i0 = i % rpoints0.length;
        let i1 = i % rpoints1.length;
        let x0 = p.lerp(rpoints0[i0].x, rpoints1[i1].x, rot);
        let y0 = p.lerp(rpoints0[i0].y, rpoints1[i1].y+50, rot);
        let x1 = p.lerp(rpoints0[i0].x, rpoints1[i1].x, rot + dp);
        let y1 = p.lerp(rpoints0[i0].y, rpoints1[i1].y+50, rot + dp);
        p.line(x0, y0, x1, y1);
      }
      p.pop();
    }
  }
};

var p058 = new p5(s);