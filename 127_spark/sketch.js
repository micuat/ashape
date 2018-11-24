var S127 = function (p) {
  let pg, pgTex;
  let colorScheme = [
    [{r: 0xfc,g: 0xef,b: 0xef},{r: 0x7f,g: 0xd8,b: 0xbe},{r: 0xa1,g: 0xfc,b: 0xdf},{r: 0xfc,g: 0xd2,b: 0x9f},{r: 0xfc,g: 0xab,b: 0x64}],
    [{r: 0x04,g: 0xe7,b: 0x62},{r: 0xf5,g: 0xb7,b: 0x00},{r: 0x00,g: 0xa1,b: 0xe4},{r: 0xdc,g: 0x00,b: 0x73},{r: 0x89,g: 0xfc,b: 0x00}]
  ];
  let colors = colorScheme[1];
  let bgColor = 0;
  let attractForce = 0.0;
  let lightsOn = false;
  let wire = false;

  pg = p.createGraphics(800, 800, p.P3D);
  pg.beginDraw();
  pg.background(colors[0].r, colors[0].g, colors[0].b);
  pg.endDraw();

  pgTex = p.createGraphics(800, 800, p.P3D);
  pgTex.beginDraw();
  pgTex.background(colors[0].r, colors[0].g, colors[0].b);
  pgTex.endDraw();

  let agents = [];
  function Agent (params) {
    this.col = params.col;
    this.pos = params.pos.copy();
    this.orgPos = params.pos.copy();
    this.poss = [];
    this.vel = params.vel.copy();
    this.life = 0;
    this.lifeEnd = 200.0;
    this.updateSpark = function () {
      this.pos.add(this.vel);

      this.life += 1;

      let nc = 0.3;
      let phi = (Math.sin(this.vel.x * nc + this.vel.y * nc) * 2 - 1) * Math.PI * 2;
      let theta = (Math.sin(this.vel.z * nc + this.vel.y * nc) * 2 - 1) * Math.PI * 4;
      // let phi = (p.noise(this.vel.x * nc, this.vel.y * nc) * 2 - 1) * Math.PI * 2;
      // let theta = (p.noise(this.vel.z * nc, this.vel.y * nc) * 2 - 1) * Math.PI * 4;
      this.vel.mult(0.95);
      let v = p.createVector(0, 0, 0);
      let nv = 4;
      v.x += Math.sin(phi) * Math.cos(theta) * nv;
      v.y += Math.sin(phi) * Math.sin(theta) * nv;
      v.z += Math.cos(phi) * nv;
      this.vel.add(v);

      v = this.pos.copy();
      v.mult(attractForce);
      this.vel.add(v);
    }
    this.draw = function (pg) {
      this.poss.push(this.pos.copy());
      if(this.poss.length > 30) this.poss.shift();
      pg.beginShape(p.TRIANGLE_FAN);
      let alpha = p.constrain(p.map(this.life, this.lifeEnd/2, this.lifeEnd, 1, 0), 0, 1);
      alpha *= 0.8;
      for(let i in this.poss) {
        let gr = p.map(i, 0, this.poss.length, 0, 1);
        if(wire) {
          pg.stroke(this.col.r, this.col.g, this.col.b);//, gr * 255 * alpha);
        }
        else {
          pg.fill(this.col.r, this.col.g, this.col.b);//, gr * 255 * alpha);
        }
        pg.vertex(this.poss[i].x, this.poss[i].y, this.poss[i].z, 0, gr);
      }
      pg.endShape();
    }
  }
  
  this.drawPg = function(pg, t) {
    let curFrame = p.frameCount % 240;
    if(curFrame == 210) {
      colors = colorScheme[1];//p.random(colorScheme);
      bgColor = Math.floor(p.random(colors.length));
      attractForce = p.random([-0.02, -0.01, -0.001]);
      lightsOn = p.random(1) > 0.75;
      if(lightsOn) {
        wire = false;
      }
      else {
        wire = p.random(1) > 0.5;
      }
    }
    if(curFrame < 60 && p.random(1) > 0.5) {
      let index = Math.floor(p.random(colors.length));
      let vel = p.createVector(1, 0, 0);
      vel.mult(20);
      vel.rotate(index * Math.PI * 2.0 / colors.length + p.random(0.1));
      agents.push(new Agent({col: colors[index], pos: p.createVector(0, 0, 0), vel: vel}));
      while(agents.length > 100) agents.shift();
    }
    else if (curFrame < 210) {
    }
    else {
      agents = [];
    }

    for(let i in agents) {
      agents[i].updateSpark();
    }

    pgTex.beginDraw();
    pgTex.translate(pg.width * 0.5, pg.height * 0.5);
    if(curFrame < 210) {
      pgTex.pushMatrix();
      if(wire) {
        pgTex.strokeWeight(1);
        pgTex.noFill();
      }
      else {
        pgTex.noStroke();
      }
      if(lightsOn) {
        pgTex.lights();
      }
      for(let i in agents) {
        agents[i].draw(pgTex);
      }
      pgTex.popMatrix();
    }
    else {
      pgTex.noStroke();
      pgTex.fill(colors[bgColor].r, colors[bgColor].g, colors[bgColor].b, p.map(curFrame, 210, 239, 10, 255));
      pgTex.rect(-400, -400, 800, 800);
    }
    pgTex.endDraw();

    pg.beginDraw();
    pg.background(colors[bgColor].r, colors[bgColor].g, colors[bgColor].b);
    pg.background(0);
    pg.translate(pg.width * 0.5, pg.height * 0.5);
    pg.pushMatrix();
    // pg.translate(0, 0, -3000);
    // pg.scale(5.33, 5.33);
    pg.imageMode(p.CENTER);
    pg.image(pgTex, 0, 0);
    pg.popMatrix();
    // pg.pushMatrix();
    // pg.noStroke();
    // for(let i in agents) {
    //   agents[i].draw(pg);
    // }
    // pg.popMatrix();

    pg.endDraw();
  }

  this.draw = function (t) {
    this.drawPg(pg, t);
    p.image(pg, 0, 0);
  }
};

var s = function (p) {
  let startTime;
  
  let s127 = new S127(p);

  p.setup = function () {
    name = p.folderName;

    p.createCanvas(800, 800);
    p.frameRate(30);

    startTime = p.millis();
  }

  function getTime() { return (p.millis() - startTime) * 0.001 };

  p.draw = function () {
    t = getTime();

    s127.draw(t);
  }

  p.oscEvent = function (m) {
    // let path = m.addrPattern().split("/");
    // if (path.length >= 4 && path[1] == "sc3p5" && path[2] == "control") {
    //   s127[path[3]] = m.get(0).floatValue();
    // }
  }
};

var p = new p5(s);
