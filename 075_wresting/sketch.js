var s = function (p) {
  let name;
  let font;
  let xs = [];
  let ys = [];
  let pg;
  p.setup = function () {
    name = p.folderName;
    p.createCanvas(800, 800);
    p.frameRate(30);

    font = p.createFont("assets/Avenir.otf", 60);

    pg = p.createGraphics(p.width, p.height, p.P3D);
  }

  let curveFunctionX;
  let curveFunctionY;
  let rotationFunction;
  let pgBackgroundFunction;
  let doDoubleDraw;
  let displaceN;
  p.draw = function () {
    p.background(0);

    // let t = p.millis() * 0.001;
    let t = (p.frameCount / 30.0);

    if (curveFunctionX == null || p.frameCount % (30 * 4) == 0) {
      let funcs = [
        function (i) { return Math.cos(i / 10 * Math.PI * 0.5) }
        ,
        function (i) { return Math.cos(i / 10 * Math.PI * 2.0) }
        ,
        function (i) { return Math.sin(i / 10 * Math.PI * 0.25) }
        ,
        function (i) { return 1.0 }
      ];
      curveFunctionX = p.random(funcs);
      curveFunctionY = p.random(funcs);

      funcs = [
        function (t) { }
        ,
        function (t) {
          pg.rotateZ(Math.pow(Math.min(t * 1.0, 1.0), 0.25) * Math.PI * 0.5);
        }
        ,
        function (t) {
          pg.rotateY(t * Math.PI * 0.25);
        }
        ,
        function (t) {
          pg.rotateY(Math.pow(Math.min(t, 1.0), 0.5) * Math.PI);
        }
        ,
        function (t) {
          pg.rotateX(Math.pow(Math.min(t, 1.0), 0.5) * Math.PI * 0.5);
        }
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

      displaceN = Math.floor(p.random(0, 3));

      doDoubleDraw = false;//p.random(1.0) > 0.7 ? true : false;

      pg.beginDraw();
      pg.background(0);
      pg.endDraw();

      for (let i = 0; i < 21; i++) {
        xs[i] = 0;
        ys[i] = 0;
      }
    }

    pg.beginDraw();
    pgBackgroundFunction();
    pg.endDraw();

    if (true||t % 4 >= 1) {
      let n = 280;
      let dn = n / 10;
      for (let i = -10; i <= 10; i++) {
        let dl = n * curveFunctionX(i);
        xs[i + 10] = p.lerp(xs[i + 10], dl, 0.1);
      }
      for (let j = -10; j <= 10; j++) {
        let dl = n * curveFunctionY(j);
        ys[j + 10] = p.lerp(ys[j + 10], dl, 0.1);
      }
      function drawSystem(broken) {
        for (let i = -10; i <= 10; i++) {
          let dlx0, dly1;
          let i0 = i, i1 = i;
          if (!broken || p.random(1) > ((t - 1.0) % 4.0) * 0.02) {
            dlx0 = xs[i0 + 10];
            dlx1 = xs[i1 + 10];
            dly0 = ys[i0 + 10];
            dly1 = ys[i1 + 10];
            }
          else {
            i1 = Math.floor(p.map(p.noise(i * 0.1, t * 2.0), 0.0, 1.0, -10.0, 11.0));
            dlx0 = xs[i0 + 10];
            dlx1 = xs[i1 + 10];
            dly0 = ys[i0 + 10];
            dly1 = ys[i1 + 10];
          }
          pg.line(-dlx0, i0 * dn, dlx1, i1 * dn);
          pg.line(i0 * dn, -dly0, i1 * dn, dly1);
        }
      }

      pg.beginDraw();

      // pg.translate(p.mouseX * 2 - 800, p.mouseY * 2 - 800, -800);

      if (t % 4 < 1.0) {
        let z = Math.cos((t % 1.0) * Math.PI) * displaceN;
        z = z % 1.0;
        z *= 600 * Math.sqrt(2.0);
        pg.translate(0, 0, z);
      }

      pg.stroke(100);
      pg.translate(pg.width / 2, pg.height / 2);
      if (t % 4 < 20) {
        // rotationFunction((t - 1) % 4.0);
        // pg.rotateY(t)

        pg.pushMatrix();
        pg.rotateY(Math.PI * 0.25);
        pg.noFill();
        let nn = 3;
        for(let i = -0; i <= nn; i++) {
          for(let j = -nn; j <= nn; j++) {
            for(let k = -nn; k <= 0; k++) {
              pg.pushMatrix();
              pg.translate(i * 600, j * 600, k * 600);
              pg.box(600);
              pg.popMatrix();
            }
          }
        }
        pg.popMatrix();
      }

      pg.stroke(255);
      if (t % 4 >= 1) {

        // if(doDoubleDraw)
        //   pg.translate(0, 0, -pg.width / 4);
        pg.translate(0, 0, -pg.width / 4);
        for(let i = 0; i < 2; i++) {
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

          if(doDoubleDraw) {
            pg.translate(0, 0, pg.width / 2);
            pg.scale(1, 1, -1);
          }
          else {
            break;
          }
        }
      }
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
      p.fill(255, 255 * tweena);

      p.textFont(font, 60);
      p.textAlign(p.CENTER, p.CENTER);
      p.text('wresting equations', 0, -80);
      p.text('from the event', 0, 20);

      p.pop();
    }
    p.pop();

    if(p.frameCount % 60 == 0) {
      // p.saveFrame(name + "/capture/######.png");
    }
  }
};

var p075 = new p5(s);