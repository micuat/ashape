var s = function (p) {
  let name;
  let rfont, rfontc;
  let xs = [];
  let ys = [];
  let pg;
  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(30);

    Packages.geomerative.RCommand.setSegmentLength(5); // 5 = many points; 125 = only a few points
    Packages.geomerative.RCommand.setSegmentator(Packages.geomerative.RCommand.UNIFORMLENGTH);

    rfontc = new Packages.geomerative.RFont("assets/l_10646.ttf", 60, p.CENTER);

    pg = p.createGraphics(p.width, p.height, p.P3D);
  }

  let curveFunction;
  let letterFunction;
  let rotationFunction;
  let pgBackgroundFunction;
  p.draw = function () {
    p.background(0);

    // let t = p.millis() * 0.001;
    let t = (p.frameCount / 30.0);

    if (curveFunction == null || p.frameCount % (30 * 4) == 0) {
      let funcs = [
        function (i) { return Math.cos(i / 10 * Math.PI * 0.5) },
        function (i) { return Math.cos(i / 10 * Math.PI) }
      ];
      curveFunction = p.random(funcs);

      funcs = [
        function (x0, y0, t) {
          // let x1 = p.lerp(x0-400, x0, 1 - Math.pow(1 - Math.min(t % 2.0, 1), 4.0));
          let x1 = x0;
          let y1 = p.lerp(y0 - 400, y0, 1 - Math.pow(1 - Math.min(t % 2.0, 1), 4.0));
          if (Math.abs(y0 - y1) < 1.5) y1 = y0;
          // let y1 = y0;
          // let x1 = x0 + p.random(-400,400) * (1.0 - t % 1.0);
          // let y1 = y0 + p.random(-400,400) * (1.0 - t % 1.0);
          p.line(x0, y0, x1, y1 - 3);
          // p.line(x0, y0, x0 + 2, y0);
        }
        ,
        function (x0, y0, t) {
          let tween = 1 - Math.pow(1 - Math.min(t % 2.0, 1), 4.0);
          tween = Math.max((tween * 4.0) - 3.0, 0.0);
          let xn = Math.floor(p.noise(x0 / 100, y0, 0) * 18 - 9) * 100;
          let yn = Math.floor(p.noise(y0 / 100, x0, 0) * 18 - 9) * 100;
          let x1 = 0 + p.lerp(xn, x0, tween);
          let y1 = 0 + p.lerp(yn, y0, tween);
          // if(Math.pow(p.random(1.0), 4.0) > t % 1.0)
          // if (Math.abs(x0 - x1) < 1) x1 = x0;
          // if (Math.abs(y0 - y1) < 1) y1 = y0;
          p.line(x0, y0, x1, y1 - 3);
        }
      ];
      letterFunction = p.random(funcs);

      funcs = [
        function (t) { }
        ,
        function (t) { pg.rotateZ(Math.pow(Math.min(t * 2.0, 1.0), 0.25) * Math.PI * 0.5); }
        ,
        function (t) { pg.rotateY(t * Math.PI * 0.5); }
        ,
        function (t) { pg.rotateY(Math.pow(Math.min(t, 1.0), 0.5) * Math.PI); }
        ,
        function (t) { pg.rotateX(Math.pow(Math.min(t, 1.0), 0.5) * Math.PI * 0.5); }
      ];
      rotationFunction = p.random(funcs);

      funcs = [
        function () { pg.background(0); }
        ,
        function () { pg.background(0); }
        ,
        function () { pg.background(0); }
        ,
        function () {
          pg.noStroke();
          pg.fill(0, 10);
          pg.rect(0, 0, pg.width, pg.height);
        }
      ];
      pgBackgroundFunction = p.random(funcs);

      pg.beginDraw();
      pg.background(0);
      pg.endDraw();

      for (let i = 0; i < 21; i++) {
        xs[i] = ys[i] = 0;
      }
    }

    pg.beginDraw();
    pgBackgroundFunction();
    pg.endDraw();

    if (t % 4 >= 1) {
      let n = 300;
      let dn = n / 10;
      for (let i = -10; i <= 10; i++) {
        let dl = n * curveFunction(i);
        // dl = Math.min(dl, 180);
        xs[i + 10] = p.lerp(xs[i + 10], dl, 0.1);
      }
      for (let j = -10; j <= 10; j++) {
        let dl = n * Math.cos(j / 10 * Math.PI * 0.5);
        ys[j + 10] = p.lerp(ys[j + 10], dl, 0.1);
      }
      function drawSystem(broken) {
        for (let i = -10; i <= 10; i++) {
          let i1 = p.floor(p.random(-10, 11));
          if (!broken || p.random(1) < 0.9) i1 = i;
          let dl0 = xs[i + 10];
          let dl1 = xs[i1 + 10];
          pg.line(-dl0, i * dn, dl1, i1 * dn);
        }
        for (let j = -10; j <= 10; j++) {
          let dl = ys[j + 10];
          pg.line(j * dn, -dl, j * dn, dl);
        }
      }

      pg.beginDraw();
      pg.stroke(255);
      pg.translate(pg.width / 2, pg.height / 2);
      rotationFunction((t - 1) % 4.0);
      pg.pushMatrix();
      pg.translate(-pg.width / 4, 0);
      pg.rotateY(Math.PI * 0.25);
      drawSystem(false);
      pg.popMatrix();

      pg.pushMatrix();
      pg.translate(pg.width / 4, 0);
      pg.rotateY(Math.PI * -0.25);
      drawSystem(true);
      pg.popMatrix();
      pg.endDraw();
    }

    p.image(pg, 0, 0)

    p.push();
    p.translate(p.width / 2, p.height / 2);
    if (t % 4 < 2) {
      p.push();
      p.translate(0, 30);
      p.stroke(255, 255 * Math.min(1.0, (t % 2.0) * 8.0));
      p.strokeWeight(1);

      let grp0, grp1;
      grp0 = rfontc.toGroup('wresting equations');
      grp1 = rfontc.toGroup('from the event');
      function drawText(grp) {
        let rpoints = grp.getPoints();
        for (let i = 0; i < rpoints.length; i++) {
          let x0 = p.lerp(rpoints[i].x, 0, 0);
          let y0 = p.lerp(rpoints[i].y, 0, 0);
          letterFunction(x0, y0, t);
        }
      }
      p.translate(0, -50);
      drawText(grp0);
      p.translate(0, 100);
      drawText(grp1);
      p.pop();
    }
    p.pop();
  }
};

var p058 = new p5(s);