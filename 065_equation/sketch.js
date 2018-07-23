var s = function (p) {
  let name;
  let startFrame;
  let cycle = 8.0;

  p.setup = function () {
    name = p.folderName;

    p.createCanvas(800, 800);
    p.frameRate(30);

    font = p.createFont("assets/Avenir.otf", 60);
    startFrame = p.frameCount;
  }

  function getCount() { return p.frameCount - startFrame };

  p.draw = function () {
    t = (getCount() / 30.0);
    if (getCount() % (30 * cycle) == 0) {

    }

    p.background(0);
    p.noFill();
    let n = 8;
    let l = p.width / n;
    let cameraZ = Math.pow(p.map(p.mouseX, 0.0, 800.0, 0.5, 1.0), 8.0);
    cameraZ = 100 + cameraZ * 100000;
    let cameraFov = Math.atan2(400, cameraZ) * 2.0;
    p.camera(0, 0, cameraZ, 0, 0, 0, 0, 1, 0);
    p.perspective(cameraFov, 1.0, 100.0, 0.0);
    for(let i = 0; i <= n; i++) {
      for(let j = 0; j <= n; j++) {
        p.push();
        let x = p.map(i, 0, n, -p.width / 2, p.width / 2);
        let y = p.map(j, 0, n, -p.height / 2, p.height / 2);
        p.translate(x, y, (j) % 2 == 0 ? -l : 0);
        p.box(l);
        p.pop();
      }
    }
    p.textFont(font, 32);
    // p.text("Janine's text makes me think of structures", 0, 98);
    // p.text("rather than colors or textures", 0, 98+l);
    // p.text("more specifically it's the rules of structures", 0, 98+l*2);
    // p.text("that can be implemented in several ways", 0, 98+l*3);
    if (getCount() % 15 == 0) {
      // p.saveFrame(name + "/capture/######.png");
    }

  }

};

var p063 = new p5(s);
