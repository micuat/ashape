// instance mode by Naoto Hieda

var lightDir;
var defaultShader;
var shadowMap;
var pgColor;

var s = function (p) {
  let name;

  let Agent = function (x, y, j, i) {
    this.x = x;
    this.y = y;
    this.vx = p.random(-1, 1);
    this.vy = p.random(-1, 1);
    this.ax = 0;
    this.ay = 0;
    this.j = j;
    this.i = i;
    this.c = 0;
    this.theta = 0;
    this.vtheta = 0;
    this.age = 0;
    this.trace = [];
    this.wx = x;
    this.wy = y;
  }
  let agent = new Agent(0, 0, 0, 0);
  let wagent = new Agent(0, 0, 0, 0);
  let grids = [];
  let anchors = [];
  let path = [];
  let command = "";
  let orth = true;

  p.setup = function () {
    name = p.folderName;

    p.createCanvas(800, 800);
    p.frameRate(30);

    defaultShader = p.loadShader(name + ("/default.frag"), name + ("/default.vert"));
    p.shader(defaultShader);

    for (let i = 0; i < 8; i++) {
      grids.push([]);
      for (let j = 0; j < 8; j++) {
        grids[i].push(new Agent(0, 0, j, i));
      }
    }
    for (let j = 0; j < 8; j++) {
      anchors.push(grids[0][j]);
    }

  }

  p.draw = function () {
    if (p.frameCount % 120 == 0) {
      // print(p.frameRate());
    }
    defaultShader.set("vLightPosition", 0.0, -100.0, -100.0);
    defaultShader.set("lightDirection", 0.0, 0.0, -1.0);
    defaultShader.set("uLightColor", 1.0, 1.0, 1.0);
    defaultShader.set("uBaseColor", 1.0, 1.0, 1.0);

    defaultShader.set("uSpecular", 0.2);
    defaultShader.set("uLightRadius", 200.0);
    defaultShader.set("uExposure", 50.0);
    defaultShader.set("uGamma", 2.);
    p.shader(defaultShader);

    p.background(0);

    p.camera(0, 500, 300, 0, 0, 0, 0, 1, 0);
    // p.pointLight(255, 255, 255, 0, 0, 400);
    // p.directionalLight(100, 100, 100, 0, 0, -1);
    p.push();
    p.noStroke();
    p.translate(0, 0, -50);
    p.fill(255);
    p.box(2000, 2000, 10);
    p.pop();

    p.translate(-p.width / 2, -p.height / 2);

    let bpm = 60;
    let hz = bpm / 60;
    let seq = (p.millis() / 1000 * hz) % 7;
    let phase = seq - Math.floor(seq);

    p.translate(p.width / 2, p.height / 2);
    p.colorMode(p.RGB, 255);

    p.stroke(128)

    let aclosest;
    let alength = 10000;
    for (let i in grids) {
      let r = grids[i];
      for (let j in r) {
        let a = r[j];
        let xdiff = a.x - (p.mouseX - p.width / 2);
        let ydiff = a.y - (p.mouseY - p.height / 2);
        let length = Math.abs(xdiff) + Math.abs(ydiff);
        if (length < alength) {
          alength = length;
          aclosest = a;
        }
      }
    }

    for (let i in grids) {
      let r = grids[i];
      for (let j in r) {
        let a = r[j];
        p.pushMatrix();
        a.x = (a.j - 3.5) * 100;
        a.y = (a.i - 3.5) * 100;
        a.wx = a.x;
        a.wy = a.y;
        p.stroke(128);
        p.strokeWeight(1);
        if (a == aclosest) {
          p.fill(0);
        }
        else {
          p.noFill();
        }
        p.ellipse(a.x, a.y, 20, 20);

        p.stroke(128);
        if (a.j < 7) {
          let an = r[a.j + 1];
          p.line(a.x, a.y, an.x, an.y);
        }
        if (a.i < 7) {
          let an = grids[a.i + 1][a.j];
          p.line(a.x, a.y, an.x, an.y);
        }

        p.popMatrix();
      }
    }

    // swap them!
    if (command.length == 2) {
      let count = 0;
      for (let i in anchors) {
        let a = anchors[i];
        let x = a.x;
        let y = a.y;
        if (String(a.i) == command.charAt(0)) {
          if (!orth) {
            x = grids[parseInt(command.charAt(1))][a.j].x;
            y = grids[parseInt(command.charAt(1))][a.j].y;
          } else {
            x = grids[a.j][parseInt(command.charAt(1))].x;
            y = grids[a.j][parseInt(command.charAt(1))].y;
          }
        }
        if (String(a.i) == command.charAt(1)) {
          if (!orth) {
            x = grids[parseInt(command.charAt(0))][a.j].x;
            y = grids[parseInt(command.charAt(0))][a.j].y;
          } else {
            x = grids[a.j][parseInt(command.charAt(0))].x;
            y = grids[a.j][parseInt(command.charAt(0))].y;
          }
        }
        a.wx = x;
        a.wy = y;

        count++;
      }
    }

    let count = 0;
    for (let i = 0; i < anchors.length; i++) {
      let a = anchors[i];
      p.fill(128);
      p.noStroke();
      p.ellipse(a.x, a.y, 20, 20);
      if(i + 1 < seq && i + 2 >= seq) {
        p.push();
        p.resetShader();
        // p.translate(0, 0, -phase * 25);
        p.fill(255, (1.0 - phase) * 255);
        let ra = (1 + phase * 10) * 25;
        // p.ellipse(a.x, a.y, ra, ra);
        p.pop();
      }
      p.shader(defaultShader);
      p.noStroke();
      p.fill(128);
      p.pushMatrix();
      p.translate(10, 10);
      p.ellipse(a.wx, a.wy, 20, 20);
      if(i + 1 < seq && i + 2 >= seq) {
        p.push();
        p.resetShader();
        // p.translate(0, 0, -phase * 25);
        p.fill(255, 0, 0, (1.0 - phase) * 255);
        let ra = (1 + phase * 10) * 25;
        p.ellipse(a.wx, a.wy, ra, ra);
        p.pop();
      }
      p.popMatrix();

      p.resetShader();
      p.stroke(0);
      p.textSize(24);
      p.push();
      p.fill(255);
      p.translate(a.x + 10, a.y);
      p.rotateX(Math.PI / -2);
      p.text(String(count + 1), 0, 0);
      p.pop();
      p.pushMatrix();
      p.translate(10, 10);
      p.fill(200, 0, 0);
      p.translate(a.wx + 10, a.wy);
      p.rotateX(Math.PI / -2);
      p.text(String(count + 1), 0, 0);
      p.popMatrix();

      p.shader(defaultShader);

      p.strokeWeight(3);
      p.stroke(255, 50);
      if (count < anchors.length - 1) {
        let an = anchors[count + 1];
        p.line(a.x, a.y, an.x, an.y);
      }
      p.stroke(200, 0, 0, 50);
      p.pushMatrix();
      p.translate(10, 10);
      if (count < anchors.length - 1) {
        let an = anchors[count + 1];
        p.line(a.wx, a.wy, an.wx, an.wy);
      }
      p.popMatrix();
      count++;
    }

    p.strokeWeight(3);
    p.stroke(0);

    function updateAgent(agent, color, isTransposed) {
      let nx = anchors[Math.floor(seq + 1)].x;
      let ny = anchors[Math.floor(seq + 1)].y;
      if (isTransposed) {
        nx = anchors[Math.floor(seq + 1)].wx;
        ny = anchors[Math.floor(seq + 1)].wy;
      }
      let theta = Math.atan2(ny - agent.y, nx - agent.x);
      if (agent.theta - theta > Math.PI) {
        theta += Math.PI * 2;
      }
      else if (agent.theta - theta < -Math.PI) {
        agent.theta += Math.PI * 2;
      }
      agent.theta = p.lerp(agent.theta, theta, 0.1);

      let dx = nx - agent.x;
      let dy = ny - agent.y;
      let v = Math.sqrt(dx * dx + dy * dy) * 0.02;
      agent.vx = p.lerp(agent.vx, Math.cos(agent.theta) * v, 0.2);
      agent.vy = p.lerp(agent.vy, Math.sin(agent.theta) * v, 0.2);
      agent.x += agent.vx;
      agent.y += agent.vy;
      if (seq < 0.05) {
        agent.x = anchors[0].x;
        agent.y = anchors[0].y;
        if (isTransposed) {
          agent.x = anchors[0].wx;
          agent.y = anchors[0].wy;
        }
        agent.vx = 0;
        agent.vy = 0;
        agent.trace = [];
      }
      agent.trace.push({ x: agent.x, y: agent.y });

      p.shader(defaultShader);
      p.pushMatrix();
      if (isTransposed) {
        p.translate(10, 10);
      }
      p.noStroke();
      p.fill(color);
      if (isTransposed) p.fill(255, 0, 0);
      p.push();
      p.translate(agent.x, agent.y, 0);
      p.sphere(50);
      p.pop();
      // p.ellipse(agent.x, agent.y, 30, 30);

      p.pushMatrix();
      p.translate(agent.x, agent.y);
      p.rotate(agent.theta);
      p.line(0, 0, 40, 0);
      p.popMatrix();

      for (let i = 0; i < agent.trace.length - 1; i++) {
        p.line(agent.trace[i].x, agent.trace[i].y, agent.trace[i + 1].x, agent.trace[i + 1].y)
      }
      p.popMatrix();
    }
    updateAgent(agent, 100, false);
    updateAgent(wagent, 200, true);

    p.resetShader();
    p.fill(0)
    let comorth = "ortho";
    if (!orth) comorth = "nonortho"
    // p.text("command:" + command + comorth, 0, 380);
  }

  p.keyPressed = function () {
    if (p.key == 'o') {
      orth = !orth;
      return;
    }

    let aclosest;
    let alength = 10000;
    for (let i in grids) {
      let r = grids[i];
      for (let j in r) {
        let a = r[j];
        let xdiff = a.x - (p.mouseX - p.width / 2);
        let ydiff = a.y - (p.mouseY - p.height / 2);
        let length = Math.abs(xdiff) + Math.abs(ydiff);
        if (length < alength) {
          alength = length;
          aclosest = a;
        }
      }
    }
    if ('1' <= p.key && p.key <= '8') {
      anchors[p.key - '0' - 1] = aclosest;
      return;
    }

    let commandn = -1;
    let commandlist = ["q", "w", "e", "r", "t", "y", "u", "i"];
    for (let count in commandlist) {
      let cl = commandlist[count];
      if (p.key == cl) {
        commandn = count;
        command += String(commandn);
        break;
      }
      count++;
    }
    if (command.length > 2) command = command.substring(command.length - 2);
  }
};

var p055 = new p5(s);