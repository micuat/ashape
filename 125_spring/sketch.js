
var s = function (p) {
  let res = 2;
  let cols = 40 / res;
  let rows = 40 / res;
  
  let particles;
  let springs;
  let points;
  
  let w = 15 * res;
  
  let physics;

  let colors = [{r: 0x61,g: 0x21,b: 0x0f},{r: 0xea,g: 0x2b,b: 0x1f},{r: 0xff,g: 0xee,b: 0xdb},{r: 0xed,g: 0xae,b: 0x49},{r: 0xf9,g: 0xdf,b: 0x74}];

  let rotX = 0;
  let rotY = 0;
  let rotXTarget = 0;
  let rotYTarget = 0;
  let oscSpeed = 1;
  let oscAmp = 1;
  let selectFuncs = [
    function (i, j) {
      return i == cols / 2;
    },
    function (i, j) {
      return j == rows / 2;
    },
    function (i, j) {
      return true;
    }
  ];
  let selectFunc = selectFuncs[0];
  
  p.setup = function () {
    p.createCanvas(800, 800);

    particles = [];
    springs = [];
    points = [];

    // gravity = new Packages.toxi.geom.Vec3D(0, 0, -0.5);
    physics = new Packages.toxi.physics3d.VerletPhysics3D();
    physics.setDrag(0.1);
    // gb = new Packages.toxi.physics3d.behaviors.GravityBehavior3D(gravity);
    // physics.addBehavior(gb);

    let x = -(cols - 1) * w / 2 - 0;
    for (let i = 0; i < cols; i++) {
      particles[i] = [];
      points[i] = [];
      let y = -(rows - 1) * w / 2;
      for (let j = 0; j < rows; j++) {
        let pt = new Particle({p: p, x: x, y: y, z: 0});
        particles[i][j] = pt;
        points[i][j] = p.createVector(x, y, 0);
        physics.addParticle(pt.get());
        y = y + w;
      }
      x = x + w;
    }

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        let a = particles[i][j];
        if (i != cols - 1) {
          let b1 = particles[i + 1][j];
          let s1 = new Spring({p: p, a: a.get(), b: b1.get(), w: w, stiffness: 1});
          springs.push(s1);
          physics.addSpring(s1.get());
        }
        if (j != rows - 1) {
          let b2 = particles[i][j + 1];
          let s2 = new Spring({p: p, a: a.get(), b: b2.get(), w: w, stiffness: 1});
          springs.push(s2);
          physics.addSpring(s2.get());
        }
      }
    }

    // for (let i = 0; i < particles[0].length; i += 1) {
    //   particles[i][0].get().lock();
    // }
    particles[0][0].get().lock();
    particles[cols - 1][0].get().lock();
    particles[0][rows - 1].get().lock();
    particles[cols - 1][rows - 1].get().lock();
  }

  p.draw = function () {
    if(p.frameCount % 240 == 0) {
      rotXTarget = p.random(-Math.PI, Math.PI);
      rotYTarget = p.random(-Math.PI, Math.PI);
      selectFunc = p.random(selectFuncs);
      oscSpeed = p.random(0.5, 4.0);
      oscAmp = p.random(2, 15);
    }
    p.background(0);

    p.translate(p.width / 2, p.height / 2);
    physics.update();

    let t = p.millis() * 0.001;
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        let v = p.createVector(particles[i][j].get().x, particles[i][j].get().y, particles[i][j].get().z);
        if(p.frameCount % 480 < 240) {
          points[i][j].lerp(v, 0.1);
        }
        else {
          let x = p.map(i + 0.5, 0, cols, -0.5, 0.5) * w * cols;
          let y = p.map(j + 0.5, 0, rows, -0.5, 0.5) * w * rows;
          let l = p.map(Math.pow(x * x + y * y, 0.5), 0, 300, 1, 0);
          l = p.constrain(l, 0, 1);
          let z = Math.sin(t * oscSpeed * Math.PI + l * oscAmp) * l * 500;
          points[i][j].lerp(p.createVector(x, y, z), 0.05);
        }
        let windx = 0;
        let windy = 0;//Math.sin(t * Math.PI * 2.0) * 0.75;
        let windz = Math.sin(t * Math.PI * 0.5) * 10;
        let wind = new Packages.toxi.geom.Vec3D(windx, windy, windz);
        if(p.frameCount % 480 < 200 && selectFunc(i, j)) {
          particles[i][j].get().addForce(wind);
        }
      }
    }

    // p.background(colors[2].r * 0.2, colors[2].g * 0.2, colors[2].b * 0.2);

    p.translate(0, 0, -200);
    p.rotateX(rotX);
    p.rotateY(rotY);
    p.stroke(255, 255);
    p.strokeWeight(1);

    function drawGrid() {
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          let x1 = points[i][j].x;
          let y1 = points[i][j].y;
          let z1 = points[i][j].z;
          if(j + 1 < rows) {
            let x2 = points[i][j + 1].x;
            let y2 = points[i][j + 1].y;
            let z2 = points[i][j + 1].z;
            p.line(x1, y1, z1, x2, y2, z2);
          }
          if(i + 1 < cols) {
            let x3 = points[i + 1][j].x;
            let y3 = points[i + 1][j].y;
            let z3 = points[i + 1][j].z;
            p.line(x1, y1, z1, x3, y3, z3);
          }
        }
      }
    }
    p.pushMatrix();
    for(let i = 0; i < 4; i++) {
      p.pushMatrix();
      p.rotateX(Math.PI / 2 * i);
      p.translate(0, 0, w * (cols - 1) / 2);
      drawGrid();
      p.popMatrix();
    }
    for(let i = 0; i < 2; i++) {
      p.pushMatrix();
      p.rotateY(Math.PI / 2 * (i * 2 + 1));
      p.translate(0, 0, w * (cols - 1) / 2);
      drawGrid();
      p.popMatrix();
    }
    p.popMatrix();

    rotX = p.lerp(rotX, rotXTarget, 0.1);
    rotY = p.lerp(rotY, rotYTarget, 0.1);
  }

  p.oscEvent = function(m) {
  }
};

var p = new p5(s);
