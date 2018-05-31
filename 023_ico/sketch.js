// instance mode by Naoto Hieda

var shader, depthShader;
var pos = [];
var pg;

var s = function (p) {

  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(30);

    pg = p.createGraphics(800, 800, p.P3D);
    shader = shaderHelper.load(p, "023_ico/frag.glsl");
    depthShader = p.loadShader("023_ico/depthFrag.glsl", "023_ico/depthVert.glsl");

    // ico = new p.Icosahedron(75);
    print(p.ico)

    for (let i = 0; i < 4; i++) {
      pos.push(p.createVector(0, 0));
    }
  }

  let angle = 0;
  p.draw = function () {
    if (p.frameCount % 60 == 0) {
      shader = shaderHelper.load(p, "023_ico/frag.glsl");
      depthShader = p.loadShader("023_ico/depthFrag.glsl", "023_ico/depthVert.glsl");
      print(p.frameRate());
    }

    let t = p.millis() * 0.001;

    pg.beginDraw();
    pg.background(0);
    pg.noStroke();
    pg.shader(depthShader);
    pg.pushMatrix();
    pg.translate(pg.width * 0.5, pg.height * 0.5);
    pg.translate(0, 0, -100);
    pg.scale(4, 4, 4);
    // pg.rotateY(t*0.2);
    pg.rotateY(0.2);

    // https://gist.github.com/gre/1650294
    function eio (tt) { return tt<.5 ? 2*tt*tt : -1+(4-2*tt)*tt }
    pg.pushMatrix();
    if(t % 8 < 4)
    pg.rotateZ(eio((t % 4)/4) * p.TWO_PI);
    p.ico.create(pg);
    pg.popMatrix();

    pg.pushMatrix();
    pg.rotateX(-eio(((t+2) % 8)/8) * p.TWO_PI);
    p.ico.create(pg);
    pg.popMatrix();

    pg.popMatrix();
    pg.endDraw();
    p.image(pg, 0, 0);
    shader.set("u_depth", pg);

    let tpi = t * p.PI * 2;
    p.background(0);

    shader.set("iTime", t);

    p.filter(shader);

    // p.image(pg, 0, 0);
    // p.rect(0, 0, p.width, p.height)
  }

};

var p023 = new p5(s);