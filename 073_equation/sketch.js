let rfont, rfontc, font;
let xs = [];
let ys = [];
let pg;

function setup () {
  createCanvas(400, 400);
  frameRate(30);
  // pixelDensity(1);

  // font = createFont("assets/Avenir.otf", 60);

  pg = createGraphics(width, height, WEBGL);
  pg.pixelDensity(1);
}

let curveFunctionX;
let curveFunctionY;
let letterFunction;
let rotationFunction;
let pgBackgroundFunction;
let doDoubleDraw;
function draw () {
  background(0);

  // let t = millis() * 0.001;
  let t = (frameCount / 60.0);

  if (curveFunctionX == null || frameCount % (30 * 8) == 0) {
    let funcs = [
      function (i) { return Math.cos(i / 10 * Math.PI * 0.5) }
      ,
      function (i) { return Math.cos(i / 10 * Math.PI * 2.0) }
      ,
      function (i) { return Math.sin(i / 10 * Math.PI * 0.25) }
      ,
      function (i) { return 1.0 }
    ];
    curveFunctionX = random(funcs);
    curveFunctionY = random(funcs);

    funcs = [
      function (x0, y0, t) {
        // let x1 = lerp(x0-400, x0, 1 - Math.pow(1 - Math.min(t % 2.0, 1), 4.0));
        let x1 = x0;
        let y1 = lerp(y0 - 400, y0, 1 - Math.pow(1 - Math.min(t % 2.0, 1), 4.0));
        if (Math.abs(y0 - y1) < 1.5) y1 = y0;
        // let y1 = y0;
        // let x1 = x0 + random(-400,400) * (1.0 - t % 1.0);
        // let y1 = y0 + random(-400,400) * (1.0 - t % 1.0);
        line(x0, y0, x1, y0 - 3);
        // line(x0, y0, x0 + 2, y0);
      }
      // ,
      // function (x0, y0, t) {
      //   let tween = 1 - Math.pow(1 - Math.min(t % 2.0, 1), 4.0);
      //   tween = Math.max((tween * 4.0) - 3.0, 0.0);
      //   let xn = Math.floor(noise(x0 / 100, y0, 0) * 18 - 9) * 100;
      //   let yn = Math.floor(noise(y0 / 100, x0, 0) * 18 - 9) * 100;
      //   let x1 = 0 + lerp(xn, x0, tween);
      //   let y1 = 0 + lerp(yn, y0, tween);
      //   // if(Math.pow(random(1.0), 4.0) > t % 1.0)
      //   // if (Math.abs(x0 - x1) < 1) x1 = x0;
      //   // if (Math.abs(y0 - y1) < 1) y1 = y0;
      //   line(x0, y0, x1, y1 - 3);
      // }
    ];
    letterFunction = random(funcs);

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
    rotationFunction = random(funcs);

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
    pgBackgroundFunction = random(funcs);

    doDoubleDraw = random(1.0) > 0.7 ? true : false;

    pg.background(0);

    for (let i = 0; i < 21; i++) {
      xs[i] = { n: 0, b: 0 };
      ys[i] = { n: 0, b: 0 };
    }
  }

  pgBackgroundFunction();

  if (t % 4 >= 1) {
    let n = 280;
    let dn = n / 10;
    for (let i = -10; i <= 10; i++) {
      let dl = n * curveFunctionX(i);
      // dl = Math.min(dl, 180);
      xs[i + 10].n = lerp(xs[i + 10].n, dl, 0.1);
      xs[i + 10].b = lerp(xs[i + 10].b, random(-200, 200), 0.1);
    }
    for (let j = -10; j <= 10; j++) {
      let dl = n * curveFunctionY(j);
      ys[j + 10].n = lerp(ys[j + 10].n, dl, 0.1);
      ys[j + 10].b = lerp(ys[j + 10].b, dl * 0, 0.1);
    }
    function drawSystem(broken) {
      for (let i = -10; i <= 10; i++) {
        let dlx0, dly1;
        let i0 = i, i1 = i;
        if (!broken || random(1) > ((t - 1.0) % 4.0) * 0.02) {
          dlx0 = xs[i0 + 10].n;
          dlx1 = xs[i1 + 10].n;
          dly0 = ys[i0 + 10].n;
          dly1 = ys[i1 + 10].n;
        }
        else {
          i1 = Math.floor(map(noise(i * 0.1, t * 2.0), 0.0, 1.0, -10.0, 11.0));
          dlx0 = xs[i0 + 10].n;
          dlx1 = xs[i1 + 10].n;
          dly0 = ys[i0 + 10].n;
          dly1 = ys[i1 + 10].n;
        }
        pg.line(-dlx0, i0 * dn, dlx1, i1 * dn);
        pg.line(i0 * dn, -dly0, i1 * dn, dly1);
      }
    }

    pg.push();
    pg.scale(0.5, 0.5, 0.5);
    pg.stroke(255);
    pg.strokeWeight(1);
    // pg.translate(pg.width / 2, pg.height / 2);
    rotationFunction((t - 1) % 4.0);

    if (doDoubleDraw)
      pg.translate(0, 0, -pg.width / 4);
    for (let i = 0; i < 2; i++) {
      pg.push();
      pg.translate(-pg.width / 4, 0);
      pg.rotateY(Math.PI * 0.25);
      drawSystem(false);
      pg.pop();

      pg.push();
      pg.translate(pg.width / 4, 0);
      pg.rotateY(Math.PI * -0.25);
      drawSystem(true);
      pg.pop();

      if (doDoubleDraw) {
        pg.translate(0, 0, pg.width / 2);
        pg.scale(1, 1, -1);
      }
      else {
        break;
      }
    }
    pg.pop();
  }

  image(pg, 0, 0)

  push();
  translate(width / 2, height / 2);
  if (t % 4 < 2) {
    push();
    translate(0, 30);
    let tweena = Math.min(1.0, map(t % 2.0, 0.0, 0.5, 0.0, 1.0));
    if (t % 4.0 > 1.0)
      tweena = Math.max(0.0, map(t % 2.0, 1.5, 2.0, 1.0, 0.0));
    fill(255, 255 * tweena);
    // strokeWeight(1);

    // textFont(font, 60);
    textSize(30);
    textAlign(CENTER, CENTER);
    text('wresting equations', 0, -40);
    text('from the event', 0, 10);
    pop();
  }
  pop();

  if (frameCount % 60 == 0) {
    // saveFrame(name + "/capture/######.png");
  }
}

