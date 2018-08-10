
var s = function (p) {
  let name;
  let startFrame;
  let image;
  let particles = [];

  p.setup = function () {
    name = p.folderName;
    p.createCanvas(800, 800);
    p.frameRate(30);
    startFrame = p.frameCount;

    image = p.loadImage("assets/renoir.jpg");
    p.image(image, 0, 0)
    p.loadPixels();
    let xo = (- image.width*1) * 0.5;
    let yo = (- image.height*1) * 0.5;
    for(let i = 0; i < image.height; i+=4) {
      for(let j = ((i/4)%2==0)?2:0; j < image.width; j+=4) {
        particles.push({twc: 0, twd: 0, x: j + xo, y: i + yo, color: p.pixels[i * p.width + j]});
      }
    }
  }

  function getCount() { return p.frameCount - startFrame };

  p.draw = function () {
    let t = getCount() / 30.0;

    if(t % 1.0 == 0.0) {
      print(p.frameRate());
    }
    p.background(0);
    p.noStroke();
    p.translate(p.width / 2, p.height / 2);
    for(let i in particles) {
      let pc = particles[i];
      p.fill(pc.color);
      
      if(pc.twd > 0) {
        pc.twc = Math.min(1.0, pc.twc += 0.01);
        if(pc.twc >= 1.0) {
          pc.twd = 0.0;
          pc.twc = 0.0;
        }
      }
      if(p.random(1.0) > 0.999) {
        pc.twd = 1.0;
        pc.twc = 0.0;
      }

      p.push();
      p.translate(pc.x * 2, pc.y * 2);
      p.scale(1.0, Math.cos(pc.twc * Math.PI) * 1.0);
      p.ellipse(0, 0, 7);
      p.pop();
    }
  }
};

var p078 = new p5(s);