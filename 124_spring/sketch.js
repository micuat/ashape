
var s = function (p) {
  let pgTex;

  let res = 2;
  let cols = 40 / res;
  let rows = 40 / res;
  
  let particles;
  let springs;
  
  let w = 15 * res;
  let zoff = 0;
  
  let physics;
  
  p.setup = function () {
    p.createCanvas(800, 800);

    particles = [];
    particles = particles;

    springs = [];
    springs = springs;

    gravity = new Packages.toxi.geom.Vec3D(0, 0, -0.5);
    physics = new Packages.toxi.physics3d.VerletPhysics3D();
    physics = physics;
    gb = new Packages.toxi.physics3d.behaviors.GravityBehavior3D(gravity);
    physics.addBehavior(gb);

    let x = -cols * w / 2 - 0;
    for (let i = 0; i < cols; i++) {
      particles[i] = [];
      let y = -rows * w / 2;
      for (let j = 0; j < rows; j++) {
        let pt = new Particle({p: p, x: x, y: y, z: 0});
        particles[i][j] = pt;
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
          let s1 = new Spring({p: p, a: a.get(), b: b1.get(), w: w, stiffness: 0.3});
          springs.push(s1);
          physics.addSpring(s1.get());
        }
        if (j != rows - 1) {
          let b2 = particles[i][j + 1];
          let s2 = new Spring({p: p, a: a.get(), b: b2.get(), w: w, stiffness: 0.3});
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

    pgTex = p.createGraphics(800, 800);
    pgTex.beginDraw();
    pgTex.background(0);
    pgTex.endDraw();
  }

  p.draw = function () {
    p.background(0);

    p.translate(p.width / 2, p.height / 2);
    physics.update();

    pgTex.beginDraw();
    pgTex.stroke(255);
    // pgTex.noStroke();
    let xoff = 0;
    let w = pgTex.width / cols;
    let h = pgTex.height / rows;
    for (let i = 0; i < cols; i++) {
      let yoff = 0;
      for (let j = 0; j < rows; j++) {
        //particles[i][j].display();
        // let windy = p.map(p.noise(xoff, yoff, zoff), 0, 1, 0, 3);
        // let windx = p.map(p.noise(xoff + 5000, yoff + 5000, zoff), 0, 1, -0.5, 0);
        // let windz = p.map(p.noise(xoff + 3000, yoff + 3000, zoff), 0, 1, -1, 1);
        // let wind = new Packages.toxi.geom.Vec3D(windx*2, windy*2, windz*2);
        let t = p.millis() * 0.001;
        let windx = (p.mouseX - p.width / 2) / p.width * 2.0;
        let windy = (p.mouseY - p.height / 2) / p.height * 2.0;
        let windz = 0;
        let wind = new Packages.toxi.geom.Vec3D(windx, windy, windz);
        particles[i][j].get().addForce(wind);
        let vx = particles[i][j].get().getVelocity().x * 100;// + 50;
        let vy = particles[i][j].get().getVelocity().y * 100;// + 50;
        let vz = particles[i][j].get().getVelocity().z * 100;// + 50;
        pgTex.fill(vx, vy, vz);
        // pgTex.fill(windx*-500, windy*100, windz*100+100);
        pgTex.rect(w*i, h*j, w, h)
        yoff += 0.02;
      }
      xoff += 0.02;
    }
    zoff += 0.02;
    pgTex.endDraw();

    // p.pointLight(255, 255, 255, 0, 0, 300);
    p.noFill();
    p.noStroke();
    p.textureMode(p.NORMAL);
    p.rotateX(Math.PI / 3.0);
    for (let j = 0; j < rows - 1; j++) {
      p.beginShape(p.TRIANGLE_STRIP);
      p.texture(pgTex);
      for (let i = 0; i < cols; i++) {
        let x1 = particles[i][j].get().x;
        let y1 = particles[i][j].get().y;
        let z1 = particles[i][j].get().z;
        let u = p.map(i, 0, cols - 1, 0, 1);
        let v1 = p.map(j, 0, rows - 1, 0, 1);
        p.vertex(x1, y1, z1, u, v1);
        let x2 = particles[i][j + 1].get().x;
        let y2 = particles[i][j + 1].get().y;
        let z2 = particles[i][j + 1].get().z;
        let v2 = p.map(j + 1, 0, rows - 1, 0, 1);
        p.vertex(x2, y2, z2, u, v2);
      }
      p.endShape();
    }

    // p.stroke(255);
    // p.strokeWeight(4);
    // p.line(-cols * w / 2 - 100, -rows * w / 2, -cols * w / 2 - 100, p.height);

  }

};

var p = new p5(s);
