// instance mode by Naoto Hieda

var shader, depthShader;
var pos = [];
var pg;
var name = "029_points";

var s = function (p) {

  p.setup = function () {
    let w = 1080;
    let h = 1920;
    p.createCanvas(w, h);
    p.frameRate(30);

    pg = p.createGraphics(w, h, p.P3D);
    pgColor = p.createGraphics(w, h, p.P3D);
    shader = shaderHelper.load(p, name + "/frag.glsl");
    depthShader = p.loadShader(name + "/depthFrag.glsl", name + "/depthVert.glsl");
  }

  let angle = 0;
  p.draw = function () {
    if (p.frameCount % 60 == 0) {
      // shader = shaderHelper.load(p, name + "/frag.glsl");
      // depthShader = p.loadShader(name + "/depthFrag.glsl", name + "/depthVert.glsl");
      print(p.frameRate());
    }

    // let t = p.millis() * 0.001;
    let t = p.frameCount / 30.0;

    pg.beginDraw();
    pg.background(0);
    pg.noStroke();
    pg.shader(depthShader);
    pg.pushMatrix();
    pg.translate(pg.width * 0.5, pg.height * 0.5);
    pg.translate(0, 0, 500);
    // pg.rotateY(t * 0.1);
    for(let i = 0; i < 100; i++) {
      pg.pushMatrix();
      let angle = i * Math.PI / 50 * 1.5 + t*0.25;
      pg.translate(p.cos(angle*1) * 300, 50-p.sin(angle*10) * 40 * (1-p.pow(p.sin(t*0.5+angle),2.0)), p.sin(angle*1) * 300);
      pg.fill(i / 100.0 * 128 + 128);
      pg.rotateY(angle*1);
      pg.rotateX(angle*2);
      pg.sphere(50);
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

    // p.saveFrame("capture/record-######.png");
    
    // p.image(pg, 0, 0);
    // p.rect(0, 0, p.width, p.height)
  }

};

var p029 = new p5(s);