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

    startFrame = p.frameCount;
  }

  function getCount() {return p.frameCount - startFrame};

  drawGeometry = function (pg, lights) {
    pg.beginDraw();
    //
    pg.background(30);
    if (lights)
      pg.lights();
    pg.pushMatrix();
    pg.translate(pg.width / 2, pg.height / 2);
    pg.noStroke();
    pg.fill(250);
    pg.rotateX(Math.PI * 0.4);
    pg.rotateZ(Math.PI * 0.2);
  
    for (let i = -40; i <= 40; i++) {
      pg.pushMatrix();
      pg.translate(i * 10, 0, 0);//p.map(Math.sin(t + i * 0.8), -1, 1, 0, -1000));
      pg.beginShape(p.TRIANGLE_STRIP);
      for (let j = -20; j <= 20; j++) {
        // pg.rect(0, j * 20, 10, 20);
        let z = p.map(Math.sin(t * (-i * 0.1) + j * 0.2), -1, 1, -50, 100);
        pg.vertex(-5, j * 20, z);
        pg.vertex(5, j * 20, z);
      }
      pg.endShape(p.CLOSE);
      pg.popMatrix();
    }
    pg.popMatrix();
    pg.endDraw();
  }

  p.draw = function () {
    t = (getCount() / 30.0);

    p.background(0);
  
    drawGeometry(dof.getSrc(), true);
    drawGeometry(dof.getDepth(), false);
  
    dof.draw();
  
    dof.focus = 0.7;//p.map(p.mouseX, 0, p.width, -0.5, 1.5);  
  
    p.image(dof.getDest(), 0, 0);

    if(getCount() % 15 == 0) {
      // p.saveFrame(name + "/capture/######.png");
    }

  }

};

var p061 = new p5(s);
