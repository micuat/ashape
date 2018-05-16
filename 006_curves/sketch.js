// Daniel Shiffman
// http://codingtra.in
// http://patreon.com/codingtrain
// Video: https://youtu.be/RTc6i-7N3ms

// instance mode by Naoto Hieda

var end;
var start;
var base;

var shader;


var s = function (p) {

  p.setup = function () {
    p.createCanvas(800, 800);

    start = new Segment(400, 400, 0.15, 0);
    let current = start;

    for (let i = 0; i < 8; i++) {
      let next = new Segment(current, 0.15, i);
      current.child = next;
      current = next;

    }
    end = current;
    base = new p5.Vector(0, 1);
    p.frameRate(30);
    shader = shaderHelper.load(p, "006_curves/frag.glsl");
  }

  p.draw = function () {
    p.background(51);

    p.translate(p.width / 2, p.height / 2);
    p.scale(p.width / 2, p.height / 2);

    if (p.frameCount % 60 == 0) {
      shader = shaderHelper.load(p, "006_curves/frag.glsl");
      print(p.frameRate());
    }

    let t = p.millis() * 0.001;
    let tpi = t * p.PI * 2;
    p.background(0);

    shader.set("iTime", t);

    let pg = 0.0;
    let dg = 1.0;
    let itr = 30.0;
    
    let x = 0.0;//Math.cos(angle) * 5.0;
    let y = 0.0;//3.0;
    let z = 5.0;//Math.sin(angle) * 5.0;

    shader.set("cameraPosition", x, y, z);

    // end.follow(p.mouseX, p.mouseY);
    let fx = 0.5 + 0.5 * Math.cos(p.millis() * 0.0005 * Math.PI);
    let fy = -0.25 + 0.0 * Math.sin(p.millis() * 0.0005 * Math.PI);;
    end.follow(fx, fy);
    end.update();

    let next = end.parent;
    while (next != null) {
      next.follow();
      next.update();
      next = next.parent;
    }

    start.setA(base);
    start.calculateB();
    next = start.child;
    while (next != null) {
      next.attachA();
      next.calculateB();
      next = next.child;
    }

    // end.show();

    let points = [];
    next = end.parent;
    points.push(next.b);
    while (next != null) {
      next.show();
      points.push(next.a);
      next = next.parent;
    }

    let xs = [];
    let ys = [];
    let ps = [];

    // xs.push([-1, 400]);
    // ys.push([-1, 800]);

    p.strokeWeight(10.0 / 400);

    for (let i = 0; i < points.length; i++) {
      p.point(points[i].x, points[i].y);
      xs.push([i, points[i].x]);
      ys.push([i, points[i].y]);
      ps.push([points[i].x, points[i].y]);
    }
    let polyorder = 2;
    let presult = regression.polynomial(ps, { order: polyorder });
    let xresult = regression.polynomial(xs, { order: polyorder });
    let yresult = regression.polynomial(ys, { order: polyorder });
    for (let i = 0; i < xresult.points.length; i+=0.1) {
      // p.point(xresult.points[i][1], yresult.points[i][1])
      let cx = 0;
      let cy = 0;
      let nx = 0;
      let ny = 0;
      for(let j = 0; j < xresult.equation.length; j++) {
        cx += Math.pow(i, polyorder-j) * xresult.equation[j];
        nx += Math.pow(i+0.1, polyorder-j) * xresult.equation[j];
        cy += Math.pow(i, polyorder-j) * yresult.equation[j];
        ny += Math.pow(i+0.1, polyorder-j) * yresult.equation[j];
      }
      p.line(cx, cy, nx, ny);
    }

    let floatArray = Java.type("float[]");
    let bpos = new floatArray(3 * 4);
    for (let i = 0; i < xresult.equation.length; i++) {
      bpos[i * 3 + 0] = presult.equation[i];
      bpos[i * 3 + 1] = yresult.equation[i];
      bpos[i * 3 + 2] = 0;
    }
    shader.set("bpos", bpos, 3);

    shader.set("iteration", itr);
    shader.set("dGlitch", dg);
    p.filter(shader);

  }

};

var p064 = new p5(s);
