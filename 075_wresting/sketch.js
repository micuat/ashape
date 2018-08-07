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
  let logoRotationFunction;
  let pgBackgroundFunction;
  let doDoubleDraw;
  let displaceN;
  let curRotX = 0;
  let destRotX = 0;
  let curRotY = 0;
  let destRotY = 0;
  p.draw = function () {
    p.background(0);

    // let t = p.millis() * 0.001;
    let t = (p.frameCount / 30.0);

    if (curveFunctionX == null || p.frameCount % (30 * 4) == 0) {
      let funcs = [
        function (i) { return Math.sqrt(Math.cos(i / 10 * Math.PI * 0.5)) }
        ,
        function (i) { return i * 0.1 }
        ,
        // function (i) { return i * 0.05 + 0.5 }
        // ,
        function (i) { return 1.0 }
      ];
      curveFunctionX = p.random(funcs);
      curveFunctionY = p.random(funcs);

      funcs = [
        function (t) { }
        ,
        function (t) {
          pg.rotateZ(Math.pow(Math.min(t * 1.0, 1.0), 0.25) * Math.PI);
        }
        ,
        function (t) {
          pg.rotateY(Math.pow(Math.min(t * 0.5, 1.0), 0.5) * Math.PI);
        }
        ,
        function (t) {
          pg.rotateY(Math.pow(Math.min(t, 1.0), 0.5) * Math.PI);
        }
        ,
        function (t) {
          pg.rotateX(Math.pow(Math.min(t, 1.0), 0.5) * Math.PI);
        }
      ];
      rotationFunction = p.random(funcs);

      funcs = [
        function (t) { }
        ,
        function (t) {
          p.rotateX(p.map((t * 2.0) % 4.0, 0.5, 2.0, 0.0, Math.PI * 0.5));
        }
        ,
        function (t) {
          p.rotateX(-p.map((t * 2.0) % 4.0, 0.5, 2.0, 0.0, Math.PI * 0.5));
        }
      ];
      logoRotationFunction = p.random(funcs);

      funcs = [
        function () { pg.background(0); }
        // ,
        // function () { pg.background(0); }
        // ,
        // function () { pg.background(0); }
        // ,
        // function () {
        //   pg.noStroke();
        //   pg.fill(0, 10);
        //   pg.rect(0, 0, pg.width, pg.height);
        // }
      ];
      pgBackgroundFunction = p.random(funcs);

      displaceN = Math.floor(p.random(-3, 3));

      destRotX = Math.floor(p.random(-3, 3)) * Math.PI * 0.25;
      destRotY = Math.floor(p.random(-3, 3)) * Math.PI * 0.25;

      doDoubleDraw = p.random(1.0) > 0.7 ? true : false;

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

    {
      let n = 280;
      let dn = n / 10;
      if (t % 4 < 1) {
      }
      else if (t % 4 < 3) {
        for (let i = -10; i <= 10; i++) {
          let dl = n * curveFunctionX(i);
          xs[i + 10] = p.lerp(xs[i + 10], dl, 0.1);
        }
        for (let j = -10; j <= 10; j++) {
          let dl = n * curveFunctionY(j);
          ys[j + 10] = p.lerp(ys[j + 10], dl, 0.1);
        }
      }
      else {
        for (let i = -10; i <= 10; i++) {
          let dl = 0;
          xs[i + 10] = p.lerp(xs[i + 10], dl, 0.1);
        }
        for (let j = -10; j <= 10; j++) {
          let dl = 0;
          ys[j + 10] = p.lerp(ys[j + 10], dl, 0.1);
        }
      }
      function drawSystem(broken) {
        for (let i = -10; i <= 10; i++) {
          let dlx0, dly1;
          let i0 = i, i1 = i;
          if (!broken){//} || p.noise(i * 0.8, t * 5.0) > 0.5) {
            dlx0 = xs[i0 + 10];
            dlx1 = xs[i1 + 10];
            dly0 = ys[i0 + 10];
            dly1 = ys[i1 + 10];
            pg.line(-dlx0, i0 * dn, dlx1, i1 * dn);
            pg.line(i0 * dn, -dly0, i1 * dn, dly1);
          }
          else {
            // i1 = Math.floor(p.map(p.noise(i * 0.1, t * 2.0), 0.0, 1.0, -10.0, 11.0));
            dlx0 = xs[i0 + 10] * p.noise(i * 0.8, t * 5.0);
            dlx1 = xs[i1 + 10] * p.noise(i * 0.8, t * 5.0);
            dly0 = ys[i0 + 10];
            dly1 = ys[i1 + 10];
            pg.line(-dlx0, i0 * dn, dlx1, i1 * dn);
            pg.line(i0 * dn * p.noise(i * 0.8, t * 5.0), -dly0, i1 * dn * p.noise(i * 0.8, t * 5.0), dly1);
          }
        }
      }

      pg.beginDraw();

      if (t % 4 < 1.0) {
        let z = Math.cos((t % 1.0) * Math.PI) * displaceN;
        z = z % 1.0;
        z *= 600 * Math.sqrt(2.0);
        pg.translate(0, 0, z);
      }

      pg.stroke(155);
      pg.translate(pg.width / 2, pg.height / 2);
      curRotX = p.lerp(curRotX, destRotX, 0.1);
      if(Math.abs(curRotX - destRotX) < 0.01) curRotX = destRotX;
      curRotY = p.lerp(curRotY, destRotY, 0.1);
      if(Math.abs(curRotY - destRotY) < 0.01) curRotY = destRotY;
      pg.rotateX(curRotX);
      pg.rotateY(curRotY);
      rotationFunction((t - 1) % 4.0);
      if (t % 4 < 20) {
        // pg.rotateY(t)

        pg.pushMatrix();
        pg.rotateY(Math.PI * 0.25);
        pg.noFill();
        let nn = 3;
        for(let i = -nn; i <= nn; i++) {
          for(let j = -nn; j <= nn; j++) {
            for(let k = -nn; k <= nn; k++) {
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
    p.translate(p.width / 2, p.height / 2, 50);
    if (t % 4 < 2) {
      p.push();
      let tweena = Math.min(1.0, p.map((t * 2.0) % 4.0, 0.0, 0.5, 0.0, 1.0));
      if(t % 4.0 > 0.5) {
        logoRotationFunction(t);
        tweena = Math.max(0.0, p.map((t * 2.0) % 4.0, 1.5, 2.0, 1.0, 0.0));
      }
      p.fill(255, 255 * tweena);

      p.textFont(font, 40);
      p.textAlign(p.CENTER, p.CENTER);
      p.text('wresting equations from the event', 0, -0);

      p.pop();
    }
    p.pop();

    if(p.frameCount % 15 == 0) {
      // p.saveFrame(name + "/capture/######.png");
    }
  }
};

var p075 = new p5(s);