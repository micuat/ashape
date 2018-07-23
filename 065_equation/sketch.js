var s = function (p) {
  let name;
  let startFrame;
  let cycle = 8.0;
  let selected;
  let n = 16;
  let scapeFunc;

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
      selected = {i: Math.floor(p.random(n/2-2,n/2+3)), j: Math.floor(p.random(n/2-2,n/2+3))};
      scapeFunc = p.random([
        function (i, j) {return (j) % 2 == 0 ? -l : 0}
        ,
        function (i, j) {return (i + j) * -l * 0.5}
        ,
        function (i, j) {return Math.sin((i + j) / n * Math.PI * 2) * l * 2.0}
        ,
        function (i, j) {return p.dist(i, j, n/2, n/2) * l * -0.5}
      ]);
    }

    p.background(0);
    let l = p.width / n;
    // let cameraZ = Math.pow(p.map(p.mouseX, 0.0, 800.0, 0.5, 1.0), 8.0);
    let tween = 1.0;
    if(t % cycle > 7.0) {
      tween = 0.0;
    }
    else if(t % cycle > 2.0) {
      tween = p.map(t % cycle, 2.0, 7.0, 1.0, 0.0)
    }
    let cameraZ = Math.pow(tween, 16.0);
    cameraZ = 300 + cameraZ * 100000;
    let cameraFov = Math.atan2(200, cameraZ) * 2.0;
    p.camera(0, 0, cameraZ, 0, 0, 0, 0, 1, 0);
    p.perspective(cameraFov, 1.0, 100.0, 0.0);

    p.push();
    let tweenStroke = 0.0;
    if(t % cycle < 2.0) {
    }
    else if(t % cycle < 3.0) {
      tweenStroke = p.map(t % cycle, 2, 3, 0, 1);
    }
    else {
      tweenStroke = 1.0;
    }
    p.stroke(255, 255 * tweenStroke);
    p.rotate(Math.PI / 4.0);
    for(let i = 0; i <= n; i++) {
      for(let j = 0; j <= n; j++) {
        let z;
        if(i == selected.i && j == selected.j) {
          p.fill(255, 50);
          z = 0.0;
        }
        else {
          p.noFill();
          z = scapeFunc(i, j);
        }
        p.push();
        let x = p.map(i, 0, n, -p.width / 2, p.width / 2);
        let y = p.map(j, 0, n, -p.height / 2, p.height / 2);
        p.translate(x, y, z);
        p.box(l);
        p.pop();
      }
    }
    p.pop();

    p.textFont(font, 32);
    if (t % cycle < 2) {
      p.push();
      p.translate(0, 30);
      let tweena = Math.min(1.0, p.map(t % 2.0, 0.0, 0.5, 0.0, 1.0));
      if(t % cycle > 1.0)
      tweena = Math.max(0.0, p.map(t % 2.0, 1.5, 2.0, 1.0, 0.0));
      p.fill(255, 255 * tweena);

      p.textFont(font, 30);
      p.textAlign(p.CENTER, p.CENTER);
      p.text('wresting equations', 0, -60);
      p.text('from the event', 0, 0);
      p.pop();
    }
    if (getCount() % 15 == 0) {
      // p.saveFrame(name + "/capture/######.png");
    }

  }

};

var p063 = new p5(s);
