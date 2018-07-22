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

    let n = 24;
    let l = p.width / n;
    for(let i = 0; i <= n; i++) {
      for(let j = 0; j <= n; j++) {
        p.push();
        p.translate(p.map(i, 0, n, 0, p.width), p.map(j, 0, n, 0, p.height))
        let dm = p.noise(i * 0.3, j * 0.2, t) - 0.5;
        dm = Math.pow(dm, 4.0);
        if(dm > 0)
        p.rotate(dm * 100.0);
        p.line(0, 0, l, 0);

        let dn = p.noise(i * 0.7, j * 0.6, t) - 0.5;
        dn = Math.pow(dn, 4.0);
        if(dn > 0)
        p.rotate(dn * 100.0);
        p.line(0, 0, 0, l);
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
