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
  let voxelFunc;
  let font;
  let textPg;
  let cycle = 8.0;
  let ribbons = [];
  let ribbonOrSS;

  p.setup = function () {
    name = p.folderName;

    p.createCanvas(800, 800);
    p.frameRate(30);

    dof = new DofManager();
    dof.setup(p, p.width, p.height);
    dof.maxDepth = 2000.0;
    dof.focus = p.map(p.mouseX, 0, p.width, -0.5, 1.5);
    dof.maxBlur = 0.01;
    dof.aperture = 0.05;

    font = p.createFont("assets/Avenir.otf", 60);
    textPg = p.createGraphics(p.width, p.height, p.P3D);

    startFrame = p.frameCount;
  }

  function getCount() { return p.frameCount - startFrame };

  let a = 1;
  let b = 1;
  let m = 0;
  let mchange = 0;
  let globe = [];
  supershape = function (theta, m, n1, n2, n3) {
    let t1 = Math.abs((1 / a) * Math.cos(m * theta / 4));
    t1 = Math.pow(t1, n2);
    let t2 = Math.abs((1 / b) * Math.sin(m * theta / 4));
    t2 = Math.pow(t2, n3);
    let t3 = t1 + t2;
    let r = Math.pow(t3, - 1 / n1);
    return r;
  }

  function isSphere(j) {
    return p.map(j, -20, 20, 0, 1.0) > t % cycle - 7.0 &&
      p.map(j, -20, 20, 0, 1.0) < t % cycle - 0.0;
  }
  setupGeometry = function () {
    for (let i = -20; i <= 20; i++) {
      let ribbon = p.createShape();
      ribbon.beginShape(p.TRIANGLE_STRIP);
      ribbon.fill(255);
      ribbon.noStroke();
      for (let j = -20; j <= 20; j++) {
        if (i == iSelected && isSphere(j)) {
        }
        else {
          let z = p.map(noiseFunc(t, i, j, false), 0, 1, -50, 100);
          ribbon.vertex(-5, j * 20, z);
          ribbon.vertex(5, j * 20, z);
        }
      }
      ribbon.endShape();
      ribbons[i + 20] = ribbon;
    }
  }
  drawGeometry = function (pg, lights) {
    pg.beginDraw();
    //
    pg.background(255);
    pg.sphereDetail(10);
    if (lights)
      pg.lights();
    pg.pushMatrix();
    pg.translate(pg.width / 2, pg.height / 2, ribbonOrSS * 400);
    pg.noStroke();
    pg.fill(80);
    let ttween = Math.min(t % cycle, 1.0);
    ttween = 1.0 - Math.pow(1.0 - ttween, 4.0);
    let rx = p.lerp(originRotateX, targetRotateX, ttween);
    let rz = p.lerp(originRotateZ, targetRotateZ, ttween);
    pg.rotateX(rx);
    pg.rotateZ(rz);

    let r = 200;

    for (let i = -20; i <= 20; i++) {
      let lat = p.map(i, -20, 20, -p.HALF_PI, p.HALF_PI);
      let r2 = supershape(lat, m + i * 0.1, 0.2, 1.7, 1.7);

      pg.pushMatrix();
      if(ribbonOrSS) {
        pg.rotateY(Math.PI * 0.25);
        pg.beginShape(p.TRIANGLE_STRIP);
      }
      else {
        pg.translate(i * 20, 0, 0);//p.map(Math.sin(t + i * 0.8), -1, 1, 0, -1000));
        pg.beginShape(voxelFunc(0,0,0,0,true));
      }
      for (let j = -20; j <= 20; j++) {
        if (i == iSelected && isSphere(j)) {
        }
        else {
          if (ribbonOrSS) {
            let lon = p.map(j + t * 0.1, -20, 20, -Math.PI, Math.PI);
            let r1 = supershape(lon, m, 0.2, 1.7, 1.7);
            let x = r * r1 * Math.cos(lon) * r2 * Math.cos(lat);
            let y = r * r1 * Math.sin(lon) * r2 * Math.cos(lat);
            let z = r * r2 * Math.sin(lat);
            pg.vertex(x, y, z - 5);
            pg.vertex(x, y, z + 5);
          }
          else {
            let z = p.map(noiseFunc(t, i, j, false), 0, 1, -200, 400);
            voxelFunc(pg, 0, j * 20, z);
          }
        }
      }
      pg.endShape(p.CLOSE);
      for (let j = -20; j <= 20; j++) {
        if (i == iSelected && isSphere(j)) {
          pg.pushMatrix();
          if (ribbonOrSS) {
            let lon = p.map(j, -20, 20, -Math.PI, Math.PI);
            let r1 = supershape(lon, m, 0.2, 1.7, 1.7);
            let x = r * r1 * Math.cos(lon) * r2 * Math.cos(lat);
            let y = r * r1 * Math.sin(lon) * r2 * Math.cos(lat);
            let z = r * r2 * Math.sin(lat);
            pg.translate(x, y - 5, z);
          }
          else {
            let z = p.map(noiseFunc(t, i, j, true), 0, 1, -200, 400);
            pg.translate(0, j * 20, z);
          }
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
    m = p.map(Math.sin(mchange), -1, 1, 0, 7);
    mchange += 0.02;

    t = (getCount() / 30.0);
    if (getCount() % (30 * cycle) == 0) {
      iSelected = Math.floor(p.random(-10, 11));
      targetRotateX = p.random(0.5, 0.511) * Math.PI;
      targetRotateZ = p.random(-0.4, 0.4) * Math.PI;
      originRotateX = p.random(1.2, 2.0) * Math.PI * (Math.random() > 0.5 ? 1 : -1);
      originRotateZ = p.random(-1.8, 1.8) * Math.PI;
      ribbonOrSS = Math.random() > 0.5;

      noiseFunc = p.random([
        function (t, i, j, accelerate) {
          let tt = t * (accelerate ? 4.0 : 1.0);
          return p.noise(-tt + (-j * 0.1), i * 0.2);
        }
        ,
        function (t, i, j, accelerate) {
          let tt = t * (accelerate ? 8.0 : 1.0);
          return Math.sin(-tt + (-j * 0.1) + i * 0.2) * 0.25 + 0.25;
        }
        ,
        function (t, i, j, accelerate) {
          let tt = t * (accelerate ? 0.1 : 1.0) * (i * 0.5);
          return Math.sin(-tt + (-j * 0.1) + i * 0.2) * 0.25 + 0.25;
        }
      ]);

      voxelFunc = p.random([
        function (pg, x, y, z, mode) {
          if(mode) return p.TRIANGLES;
          pg.vertex(x-5, y, z);
          pg.vertex(x+5, y, z);
          pg.vertex(x-5, y + 10, z);

          pg.vertex(x+5, y + 10, z);
          pg.vertex(x-5, y + 10, z);
          pg.vertex(x+5, y, z);
        }
        ,
        function (pg, x, y, z, mode) {
          if(mode) return p.TRIANGLES;
          let yy = y;
          let zz = z;
          for(let k = 0; k < 2; k++) {
            pg.vertex(x-5, yy, zz);
            pg.vertex(x+5, yy, zz);
            pg.vertex(x-5, yy, zz + 10);

            pg.vertex(x+5, yy, zz + 10);
            pg.vertex(x-5, yy, zz + 10);
            pg.vertex(x+5, yy, zz);
            zz += Math.min(Math.pow((t % cycle) * 0.25, 2.0), 1.0) * 20;
          }
        }
        ,
        function (pg, x, y, z, mode) {
          if(mode) return p.TRIANGLE_STRIP;
          pg.vertex(x-5, y, z);
          pg.vertex(x+5, y, z);
        }
        ,
        function (pg, x, y, z, mode) {
          if(mode) return p.TRIANGLE_STRIP;
          pg.vertex(x-2, y, z);
          pg.vertex(x+2, y, z);
        }
      ]);
    }

    p.background(0);

    // if (t % 8.0 < 4) {
    //   dof.focus = 1.025;//
    // }
    // else if (t % 8.0 < 5) {
    //   dof.focus = p.map(t % 8.0, 4, 5, 1.025, 0.8);
    // }
    // else {
    //   dof.focus = 0.8;
    // }

    dof.focus = ribbonOrSS ? 0.817 : 0.9325;
    // dof.focus = p.map(p.mouseX, 0, p.width, -0.5, 1.5);
    // print(dof.focus)

    // setupGeometry();
    drawGeometry(dof.getSrc(), true);
    drawGeometry(dof.getDepth(), false);

    dof.draw();

    p.image(dof.getDest(), 0, 0);

    textPg.beginDraw();
    textPg.clear();
    if (t % cycle < 6) {
      textPg.pushMatrix();
      textPg.translate(0, 30);
      let tweena = 1.0;
      if (t % cycle > 4.0)
        tweena = Math.max(0.0, p.map(t % cycle, 4.0, 4.5, 1.0, 0.0));
        textPg.fill(0, 0, 0, 255 * tweena);
      // pg.fill(255);
      textPg.translate(textPg.width / 2, textPg.height / 2, 300);

      textPg.textFont(font, 30);
      textPg.textAlign(p.LEFT, p.CENTER);
      textPg.text('remainders in movement', -200, -60);
      textPg.text('an accusation to form:', -200, -30);
      textPg.text('stay relevant, available', -200, 0);
      textPg.popMatrix();
    }
    textPg.endDraw();
    p.image(textPg, 0, 0);

    if (getCount() % 15 == 0) {
      // p.saveFrame(name + "/capture/######.png");
    }

  }

};

var p063 = new p5(s);
