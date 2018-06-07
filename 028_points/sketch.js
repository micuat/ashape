// instance mode by Naoto Hieda

var shader, depthShader;
var pos = [];
var pg;

var s = function (p) {

  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(30);

    pg = p.createGraphics(800, 800, p.P3D);
    shader = shaderHelper.load(p, "028_points/frag.glsl");
    depthShader = p.loadShader("028_points/depthFrag.glsl", "028_points/depthVert.glsl");
  }

  let angle = 0;
  p.draw = function () {
    if (p.frameCount % 60 == 0) {
      // shader = shaderHelper.load(p, "028_points/frag.glsl");
      // depthShader = p.loadShader("028_points/depthFrag.glsl", "028_points/depthVert.glsl");
      print(p.frameRate());
    }

    let t = p.millis() * 0.001;

    pg.beginDraw();
    pg.background(0);
    pg.noStroke();
    pg.shader(depthShader);
    pg.pushMatrix();
    pg.translate(pg.width * 0.5, pg.height * 0.5);
    pg.translate(0, 0, 200);
    // pg.rotateY(t * 0.1);
    for(let i = 0; i < 200; i++) {
      pg.pushMatrix();
      let angle = i * Math.PI / 50 * 0.75 + t;
      pg.translate(p.cos(angle*2.1) * 200, 50-p.sin(angle*0.5) * 150, p.sin(angle*3) * 200);
      pg.fill(i / 100.0 * 128 + 128);
      pg.sphere(20);
      pg.popMatrix();
    }
    // pg.beginShape();
    // pg.vertex(0,0,0,0,0);
    // pg.vertex(0,100,0,0,1);
    // pg.vertex(100,0,0,1,0);
    // pg.endShape();

    pg.popMatrix();
    pg.endDraw();
    p.image(pg, 0, 0);
    shader.set("u_depth", pg);

    p.background(0);

    shader.set("iTime", t);

    p.filter(shader);

    // p.image(pg, 0, 0);
    // p.rect(0, 0, p.width, p.height)
  }

};

var p028 = new p5(s);