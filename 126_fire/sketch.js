var s = function (p) {
  let colors = [{r: 0x61,g: 0x21,b: 0x0f},{r: 0xea,g: 0x2b,b: 0x1f},{r: 0xff,g: 0xee,b: 0xdb},{r: 0xed,g: 0xae,b: 0x49},{r: 0xf9,g: 0xdf,b: 0x74}];
  let windx = 0;
  let windy = 0;
  let windz = 0;

  let rotX = 0;
  let rotY = 0;
  let rotXTarget = 0;
  let rotYTarget = 0;

  let particles = [];
  let sig = 0;

  let agents = [];
  function Agent (params) {
    this.col = params.col;
    this.pos = params.pos.copy();
    this.orgPos = params.pos.copy();
    this.poss = [];
    this.vel = params.vel.copy();
    this.updateSpark = function () {
      let phi = (p.noise(this.pos.x, this.pos.y) * 2 - 1) * Math.PI * 2;
      let theta = (p.noise(this.pos.z, this.pos.y) * 2 - 1) * Math.PI * 2;
      this.vel.mult(0.9);
      let v = p.createVector(0, 0, 0);
      v.x += Math.sin(phi) * Math.cos(theta) * 5 + windx * 1;
      v.y += Math.sin(phi) * Math.sin(theta) * 5 + windy * 1;
      v.z += Math.cos(phi) * 5 + windz * 1;
      this.vel.add(v);
      this.pos.add(this.vel);
    }
    this.updateGrid = function (t) {
      this.vel.mult(0.9);
      let v = p.createVector(0, 0, 0);
      let phi = t * 1 + this.orgPos.x * 0.01;
      let theta = t * 0.25 + this.orgPos.y * 0.01;
      v.x += Math.sin(phi) * Math.cos(theta) * 1;
      v.y += Math.sin(phi) * Math.sin(theta) * 1;
      v.z += Math.cos(phi) * 1;
      v.mult(sig * 10.0 + 1.0);
      this.vel = v;
      this.pos.add(this.vel);
      this.pos.lerp(this.orgPos, 0.1);
    }
    this.draw = function () {
      p.point(this.pos.x, this.pos.y, this.pos.z);
      this.poss.push(this.pos.copy());
      if(this.poss.length > 30) this.poss.shift();
      p.beginShape();
      for(let i in this.poss) {
        p.stroke(this.col.r, this.col.g, this.col.b, p.map(i, 0, this.poss.length, 0, 255));
        p.vertex(this.poss[i].x, this.poss[i].y, this.poss[i].z);
      }
      p.endShape();
    }
  }

  spawn = function () {
    let vel = p5.Vector.random3D();
    vel.mult(2);

    agents.push(new Agent({col: p.random(colors), pos: p.random(particles).pos, vel: vel}));
  }

  p.setup = function () {
    p.createCanvas(800, 800);

    for(let i = -3; i <= 3; i++) {
      for(let j = -3; j <= 3; j++) {
        let x = j * 100;
        let y = i * 100;
        particles.push(new Agent({col: colors[2], pos: p.createVector(x, y, 0), vel: p.createVector(0, 0, 0)}));
      }
    }
  }

  p.draw = function () {
    let t = p.millis() * 0.001;
    while(agents.length > 100) agents.shift();

    if(p.frameCount % 480 == 0) {
      rotXTarget = p.random(-Math.PI, Math.PI);
      rotYTarget = p.random(-Math.PI, Math.PI);
    }

    p.background(0);

    p.translate(p.width / 2, p.height / 2);
    p.rotateX(rotX);
    p.rotateY(rotY);

    p.colorMode(p.RGB, 255, 255, 255)
    p.blendMode(p.BLEND);
    p.stroke(255);
    p.strokeWeight(2);
    p.noFill();
    for(let i in agents) {
      agents[i].updateSpark();
      agents[i].draw();
    }
    p.fill(255, 50);
    for(let i in particles) {
      particles[i].updateGrid(t * 16.0);
      particles[i].draw();
    }

    rotX = p.lerp(rotX, rotXTarget, 0.02);
    rotY = p.lerp(rotY, rotYTarget, 0.02);
  }

  // let remoteLocation = new Packages.netP5.NetAddress("127.0.0.1", 57120);
  p.oscEvent = function(m) {
    if(m.addrPattern() == "/sc3p5/dust") {
      spawn();
    }
    else if(m.addrPattern() == "/sc3p5/sig") {
      sig = m.get(0).floatValue();
    }
  }
};

var p = new p5(s);
