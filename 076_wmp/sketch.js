// https://stackoverflow.com/questions/17242144/javascript-convert-hsb-hsv-color-to-rgb-accurately
function HSVtoRGB(h, s, v) {
  var r, g, b, i, f, p, q, t;
  if (arguments.length === 1) {
      s = h.s, v = h.v, h = h.h;
  }
  i = Math.floor(h * 6);
  f = h * 6 - i;
  p = v * (1 - s);
  q = v * (1 - f * s);
  t = v * (1 - (1 - f) * s);
  switch (i % 6) {
      case 0: r = v, g = t, b = p; break;
      case 1: r = q, g = v, b = p; break;
      case 2: r = p, g = v, b = t; break;
      case 3: r = p, g = q, b = v; break;
      case 4: r = t, g = p, b = v; break;
      case 5: r = v, g = p, b = q; break;
  }
  return {
      r: r,
      g: g,
      b: b
  };
}

var s = function (p) {
  let name;
  let transformFunc;
  let startFrame;
  let pg;
  let wavePg;
  let frontPg, backPg;
  let shader, feedbackShader;

  p.setup = function () {
    name = p.folderName;
    p.createCanvas(800, 800);
    p.frameRate(30);
    startFrame = p.frameCount;

    pg = p.createGraphics(p.width, p.height);
    frontPg = p.createGraphics(p.width, p.height, p.P3D);
    backPg = p.createGraphics(p.width, p.height, p.P3D);
    wavePg = p.createGraphics(100, 100);
    shader = p.loadShader(p.sketchPath(name + "/frag.glsl"));
    feedbackShader = p.loadShader(p.sketchPath(name + "/feedback.glsl"));
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
    pg.fill(0, 255);
    pg.noStroke();
    pg.rect(0, 0, pg.width, pg.height);
    pg.pushMatrix();
    pg.translate(p.width * 0.5, p.height * 0.5);
    pg.noFill();

    pg.stroke(255, p.noise(t * 10.0) * 255);
    pg.strokeWeight(4);
    for(let j = 0; j < 4; j++) {
      pg.pushMatrix();
      transformFunc(t, j);

      pg.beginShape();
      pg.vertex(0, 0);
      for(let i = 1; i < 100; i++) {
        let x = i * 4 * 1.414;
        let y = (p.noise(((i*0.1 - t * 5.0)), t * -0.0) - 0.5) * 100;
        pg.vertex(x, y);
      }
      pg.endShape();
      pg.popMatrix();
    }
    pg.popMatrix();
    pg.endDraw();
    // p.image(pg, 0, 0);

    wavePg.beginDraw();
    wavePg.strokeWeight(1);
    for(let i = 1; i < 100; i++) {
      let y = Math.pow((p.noise(((i*0.1 - t * 2.0)), t * -0.0)), 4.0) * 250;
      wavePg.stroke(y);
      wavePg.line(i, 0, i, 100);
    }
    wavePg.endDraw();

    shader.set("iTime", t);
    shader.set("vMirror", p.mouseX/800.0);
    let centerDirection = 0.99;//p.map(Math.sin(t * 0.1), -1, 1, 0.99, 1.0);
    shader.set("centerDirection", centerDirection);
    let rgb = HSVtoRGB((t * 0.1) % 1.0, 1.0, 1.0);
    shader.set("bgColor", rgb.r, rgb.g, rgb.b);
    shader.set("pgTex", pg);
    shader.set("waveTex", wavePg);
    shader.set("backTex", backPg);
    // p.resetShader();
    frontPg.beginDraw();
    frontPg.filter(shader);
    frontPg.endDraw();

    p.image(frontPg, 0, 0);

    // feedbackShader.set("frontTex", frontPg);
    // p.filter(feedbackShader);

    let intermediatePg = frontPg;
    frontPg = backPg;
    backPg = intermediatePg;
  }
};

var p076 = new p5(s);