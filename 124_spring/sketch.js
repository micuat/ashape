
var s = function (p) {
  let pgTex;

  let res = 3;
  let cols = 60 / res;
  let rows = 60 / res;
  
  let particles;
  let springs;
  let ptrace;
  
  let w = 15 * res;
  let zoff = 0;
  
  let physics;

  let colors = [{r: 0x61,g: 0x21,b: 0x0f},{r: 0xea,g: 0x2b,b: 0x1f},{r: 0xff,g: 0xee,b: 0xdb},{r: 0xed,g: 0xae,b: 0x49},{r: 0xf9,g: 0xdf,b: 0x74}];
  
  let euler = p.createVector();
  let windx = 0;
  let windy = 1;
  let windz = 0;

  p.setup = function () {
    p.createCanvas(1200, 1200);

    particles = [];
    springs = [];
    ptrace = [];

    gravity = new Packages.toxi.geom.Vec3D(0, 0, -0.5);
    physics = new Packages.toxi.physics3d.VerletPhysics3D();
    physics.setDrag(0.2);
    gb = new Packages.toxi.physics3d.behaviors.GravityBehavior3D(gravity);
    physics.addBehavior(gb);

    let x = -cols * w / 2 - 0;
    for (let i = 0; i < cols; i++) {
      particles[i] = [];
      ptrace[i] = [];
      let y = -rows * w / 2;
      for (let j = 0; j < rows; j++) {
        let pt = new Particle({p: p, x: x, y: y, z: 0});
        particles[i][j] = pt;
        ptrace[i][j] = [];
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

    let w = pgTex.width / cols;
    let h = pgTex.height / rows;
    pcolors = [];
    for (let i = 0; i < cols; i++) {
      pcolors[i] = [];
      for (let j = 0; j < rows; j++) {
        // let windx = (p.mouseX - p.width / 2) / p.width * 2.0;
        // let windy = (p.mouseY - p.height / 2) / p.height * 2.0;
        // let windz = 0;
        let wind = new Packages.toxi.geom.Vec3D(windx, windy, windz);
        particles[i][j].get().addForce(wind);
        let vel = particles[i][j].get().getVelocity();
        // let vx = vel.x * 100;
        // let vy = vel.y * 100;
        // let vz = vel.z * 100;
        let vamp = p.constrain(vel.magnitude(), 0.5, 1);
        let vrx = p.lerp(colors[1].r, colors[3].r, 0.5 + 0.5 * p.constrain(vel.x, -1, 1));
        let vgx = p.lerp(colors[1].g, colors[3].g, 0.5 + 0.5 * p.constrain(vel.x, -1, 1));
        let vbx = p.lerp(colors[1].b, colors[3].b, 0.5 + 0.5 * p.constrain(vel.x, -1, 1));
        let vry = p.lerp(colors[2].r, colors[4].r, 0.5 + 0.5 * p.constrain(vel.y, -1, 1));
        let vgy = p.lerp(colors[2].g, colors[4].g, 0.5 + 0.5 * p.constrain(vel.y, -1, 1));
        let vby = p.lerp(colors[2].b, colors[4].b, 0.5 + 0.5 * p.constrain(vel.y, -1, 1));
        let vxy = Math.abs(vel.y) / Math.sqrt(vel.x * vel.x + vel.y * vel.y + 0.01);
        let vr = p.lerp(vrx, vry, vxy) * vamp;
        let vg = p.lerp(vgx, vgy, vxy) * vamp;
        let vb = p.lerp(vbx, vby, vxy) * vamp;
        pcolors[i][j] = {r: vr, g: vg, b: vb};
        // pcolors[i][j] = {r: vamp, g: vamp, b: vamp};
      }
    }

    // p.background(colors[2].r, colors[2].g, colors[2].b);
    p.background(colors[2].r * 0.2, colors[2].g * 0.2, colors[2].b * 0.2);
    // p.background(0, 0, 0);

    p.pointLight(255, 255, 255, 0, 0, 300);
    p.noStroke();
    p.ambientLight(colors[1].r, colors[1].g, colors[1].b);
    // p.textureMode(p.NORMAL);
    p.fill(colors[3].r, colors[3].g, colors[3].b);
    p.rotateX(Math.PI / 3.0);
    p.translate(0, 0, 100);
    // for (let j = 0; j < rows - 1; j++) {
    //   p.beginShape(p.TRIANGLE_STRIP);
    //   // p.texture(pgTex);
    //   for (let i = 0; i < cols; i++) {
    //     let x1 = particles[i][j].get().x;
    //     let y1 = particles[i][j].get().y;
    //     let z1 = particles[i][j].get().z;
    //     let x2 = particles[i][j + 1].get().x;
    //     let y2 = particles[i][j + 1].get().y;
    //     let z2 = particles[i][j + 1].get().z;
    //     let ii = i + 1;
    //     if(ii >= cols) ii = cols - 1;
    //     let x3 = particles[ii][j].get().x;
    //     let y3 = particles[ii][j].get().y;
    //     let z3 = particles[ii][j].get().z;
    //     // p.fill(pcolors[i][j].r, pcolors[i][j].g, pcolors[i][j].b);
    //     p.normal(z3 - z1, z2 - z1, 1);
    //     p.vertex(x1, y1, z1);
    //     // p.fill(pcolors[i][j + 1].r, pcolors[i][j + 1].g, pcolors[i][j + 1].b);
    //     p.normal(z3 - z1, z2 - z1, 1);
    //     p.vertex(x2, y2, z2);
    //   }
    //   p.endShape();
    // }
    p.stroke(255, 128);
    // p.stroke(colors[0].r, colors[0].g, colors[0].b, 255);
    p.strokeWeight(2);
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        let x1 = particles[i][j].get().x;
        let y1 = particles[i][j].get().y;
        let z1 = particles[i][j].get().z;
        if(j + 1 < rows) {
          let x2 = particles[i][j + 1].get().x;
          let y2 = particles[i][j + 1].get().y;
          let z2 = particles[i][j + 1].get().z;
          p.line(x1, y1, z1, x2, y2, z2);
        }
        if(i + 1 < cols) {
          let x3 = particles[i + 1][j].get().x;
          let y3 = particles[i + 1][j].get().y;
          let z3 = particles[i + 1][j].get().z;
          p.line(x1, y1, z1, x3, y3, z3);
        }
      }
      p.endShape();
    }
    p.strokeWeight(2);
    p.colorMode(p.RGB, 255, 255, 255)
    p.blendMode(p.ADD);
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        // p.stroke(pcolors[i][j].r, pcolors[i][j].g, pcolors[i][j].b);
        let x = particles[i][j].get().x;
        let y = particles[i][j].get().y;
        let z = particles[i][j].get().z;
        let rv = p5.Vector.random3D();
        rv.mult(3 + 0.5 * particles[i][j].get().getVelocity().magnitude());
        x += rv.x;
        y += rv.y;
        z += rv.z;
        let ptr = ptrace[i][j];
        ptr.push({x: x, y: y, z: z, r: pcolors[i][j].r, g: pcolors[i][j].g, b: pcolors[i][j].b});
          for(let k = 0; k < ptr.length - 1; k++) {
            p.stroke(ptr[k].r, ptr[k].g, ptr[k].b, 150);
            // p.point(ptr[k].x, ptr[k].y, ptr[k].z);
            p.line(ptr[k].x, ptr[k].y, ptr[k].z, ptr[k+1].x, ptr[k+1].y, ptr[k+1].z);
        }
        if(ptr.length > 20) {
          ptr.shift();
        }
      }
    }
    // p.stroke(255);
    // p.strokeWeight(4);
    // p.line(-cols * w / 2 - 100, -rows * w / 2, -cols * w / 2 - 100, p.height);

  }

  p.oscEvent = function(m) {
    // print(m)
    if(m.addrPattern() == "/sensors/bno") {
      // print(m.get(6).floatValue(), m.get(7).floatValue(), m.get(8).floatValue());
      // euler.x = m.get(6).floatValue();
      // euler.y = m.get(7).floatValue();
      // euler.z = m.get(8).floatValue();
      // windx = p.constrain(euler.y, -10, 10) * 0.1;
      // windy = (p.constrain(euler.z, 80, 100) - 90) * 0.1;
      // windz = 0;
    }
    else if(m.addrPattern() == "/sensors/wbb") {
      // print(m.get(0).floatValue(), m.get(1).floatValue())
      windx = m.get(0).floatValue() * 0.03;
      windy = m.get(1).floatValue() * -0.03;
      windz = 0;
    }
  }
};

var p = new p5(s);
