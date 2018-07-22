function DofManager() {

  this.depthShader;
  this.dof;
  this.src;
  this.dest;
  this.depth;

  this.maxDepth = 255.0;
  this.focus;
  this.maxBlur;
  this.aperture;

  this.setup = function (parent, w, h) {
    this.depthShader = parent.loadShader(parent.folderName + "/colorfrag.glsl",
      parent.folderName + "/colorvert.glsl");
    this.depthShader.set("maxDepth", this.maxDepth);

    this.dof = parent.loadShader(parent.folderName + "/dof.glsl");
    this.dof.set("aspect", parseFloat(parent.width) / parent.height);

    this.src = parent.createGraphics(w, h, parent.P3D);
    this.dest = parent.createGraphics(w, h, parent.P3D);
    this.depth = parent.createGraphics(w, h, parent.P3D);
    this.depth.smooth(8);
    this.depth.shader(this.depthShader);
  }

  this.getDepthShader = function () {
    return this.depthShader;
  }

  this.setDepthShader = function (depthShader) {
    this.depthShader = depthShader;
  }

  this.getDof = function () {
    return this.dof;
  }

  this.setDof = function (dof) {
    this.dof = dof;
  }

  this.getSrc = function () {
    return this.src;
  }

  this.setSrc = function (src) {
    this.src = src;
  }

  this.getDest = function () {
    return this.dest;
  }

  this.setDest = function (dest) {
    this.dest = dest;
  }

  this.getDepth = function () {
    return this.depth;
  }

  this.setDepth = function (depth) {
    this.depth = depth;
  }

  this.getMaxDepth = function () {
    return this.maxDepth;
  }

  this.setMaxDepth = function (maxDepth) {
    this.maxDepth = maxDepth;
  }

  this.getFocus = function () {
    return this.focus;
  }

  this.setFocus = function (focus) {
    this.focus = focus;
  }

  this.getMaxBlur = function () {
    return this.maxBlur;
  }

  this.setMaxBlur = function (maxBlur) {
    this.maxBlur = maxBlur;
  }

  this.getAperture = function () {
    return this.aperture;
  }

  this.setAperture = function (aperture) {
    this.aperture = aperture;
  }

  this.draw = function () {

    this.depthShader.set("maxDepth", this.maxDepth);

    this.dest.beginDraw();
    this.dof.set("tDepth", this.depth);
    this.dest.shader(this.dof);

    this.dof.set("maxBlur", this.maxBlur);
    this.dof.set("focus", this.focus);
    this.dof.set("aperture", this.aperture);

    this.dest.image(this.src, 0, 0);
    this.dest.endDraw();
  }

}

var lightPos;
var defaultShader;
var shadowMap;
var pgColor;

var s = function (p) {
  let name;
  let dof;
  let startFrame;
  let iSelected;
  let targetRotateX;
  let targetRotateZ;
  let originRotateX;
  let originRotateZ;
  let noiseFunc;
  let font;
  let textPg;

  p.setup = function () {
    name = p.folderName;

    p.createCanvas(800, 800);
    p.frameRate(30);

    dof = new DofManager();
    dof.setup(p, p.width, p.height);
    dof.maxDepth = 2000.0;
    dof.focus = p.map(p.mouseX, 0, p.width, -0.5, 1.5);
    dof.maxBlur = 0.02;
    dof.aperture = 0.15;

    font = p.createFont("assets/Avenir.otf", 60);
    textPg = p.createGraphics(p.width, p.height, p.P3D);

    startFrame = p.frameCount;
  }

  function getCount() { return p.frameCount - startFrame };

  drawGeometry = function (pg, lights) {
    pg.beginDraw();
    //
    pg.background(0);
    pg.sphereDetail(10);
    if (lights)
      pg.lights();
    pg.pushMatrix();
    pg.translate(pg.width / 2, pg.height / 2);
    pg.noStroke();
    pg.fill(255);
    let ttween = Math.min(t % 4.0, 1.0);
    ttween = 1.0 - Math.pow(1.0 - ttween, 4.0);
    let rx = p.lerp(originRotateX, targetRotateX, ttween);
    let rz = p.lerp(originRotateZ, targetRotateZ, ttween);
    pg.rotateX(rx);
    pg.rotateZ(rz);

    for (let i = -20; i <= 20; i++) {
      pg.pushMatrix();
      pg.translate(i * 20, 0, 0);//p.map(Math.sin(t + i * 0.8), -1, 1, 0, -1000));
      let jStart = -20;
      function isSphere(j) {
        return p.map(j, -20, 20, 0, 1.0) > t % 4.0 - 3.0 &&
        p.map(j, -20, 20, 0, 1.0) < t % 4.0 - 0.0;
      }
      pg.beginShape(p.TRIANGLE_STRIP);
      for (let j = -20; j <= 20; j++) {
        if (i == iSelected && isSphere(j)) {
        }
        else {
          let z = p.map(noiseFunc(t, i, j, false), 0, 1, -50, 100);
          pg.vertex(-5, j * 20, z);
          pg.vertex(5, j * 20, z);
        }
      }
      pg.endShape(p.CLOSE);
      for (let j = -20; j <= 20; j++) {
        if (i == iSelected && isSphere(j)) {
          let z = p.map(noiseFunc(t, i, j, true), 0, 1, -50, 100);
          pg.pushMatrix();
          pg.translate(0, j * 20, z);
          pg.sphere(5);
          pg.popMatrix();
        }
      }
      pg.popMatrix();
    }
    pg.popMatrix();
    pg.endDraw();
  }

  p.draw = function () {
    t = (getCount() / 30.0);
    if (getCount() % (30 * 4) == 0) {
      iSelected = Math.floor(p.random(-20, 21));
      targetRotateX = p.random(0.38, 0.4) * Math.PI;
      targetRotateZ = p.random(-0.4, 0.4) * Math.PI;
      originRotateX = p.random(1.2, 2.0) * Math.PI * (Math.random()>0.5?1:-1);
      originRotateZ = p.random(-1.8, 1.8) * Math.PI;

      noiseFunc = p.random([
        function (t, i, j, accelerate) {
          let tt = t * (accelerate?4.0:1.0);
          return p.noise(-tt + (-j * 0.1), i * 0.2);
        }
        ,
        function (t, i, j, accelerate) {
          let tt = t * (accelerate?8.0:1.0);
          return Math.sin(-tt + (-j * 0.1) + i * 0.2) * 0.25 + 0.25;
        }
        ,
        function (t, i, j, accelerate) {
          let tt = t * (accelerate?0.1:1.0) * (i * 0.5);
          return Math.sin(-tt + (-j * 0.1) + i * 0.2) * 0.25 + 0.25;
        }
      ]);
    }

    p.background(0);

    drawGeometry(dof.getSrc(), true);
    drawGeometry(dof.getDepth(), false);

    dof.draw();

    dof.focus = 0.847;//p.map(p.mouseX, 0, p.width, -0.5, 1.5);
    // dof.focus = Math.max(p.map(t % 4.0, 0, 1, 0.9, 0.65), 0.65);

    p.image(dof.getDest(), 0, 0);

    // textPg.beginDraw();
    // textPg.pushMatrix();
    // textPg.translate(0, 0, -20);
    // // if (t % 4 < 2) 
    // {
    //   textPg.pushMatrix();
    //   textPg.translate(0, 30);
    //   let tweena = Math.min(1.0, p.map(t % 2.0, 0.0, 0.5, 0.0, 1.0));
    //   if(t % 4.0 > 1.0)
    //   tweena = Math.max(0.0, p.map(t % 2.0, 1.5, 2.0, 1.0, 0.0));
    //   // p.fill(128, 255 * tweena);
    //   textPg.fill(100, 0, 0, 255);

    //   textPg.textFont(font, 25);
    //   textPg.textAlign(p.LEFT, p.CENTER);
    //   textPg.text('remainders in movement', -150, -60);
    //   textPg.text('an accusation to form:', -150, -30);
    //   textPg.text('stay relevant, available', -150, 0);
    //   textPg.popMatrix();
    // }
    // textPg.popMatrix();
    // p.image(textPg, 0, 0);

    if (getCount() % 15 == 0) {
      p.saveFrame(name + "/capture/######.png");
    }

  }

};

var p062 = new p5(s);
