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
  
      image = p.loadImage("assets/gogh.jpg");
    }
  
    function getCount() { return p.frameCount - startFrame };
  
    p.draw = function () {
      let t = getCount() / 30.0;
  
      if(t < 0.5) {
        particles = [];
        p.image(image, 0, 0)
        p.loadPixels();
        let xo = (- image.width*1) * 0.5;
        let yo = (- image.height*1) * 0.5;
        for(let i = 0; i < image.height; i+=4) {
          for(let j = ((i/4)%2==0)?2:0; j < image.width; j+=4) {
            particles.push({twc: 0, twd: 0, x: j + xo, y: i + yo, color: p.pixels[i * p.width + j]});
          }
        }
        return;
      }
  
      p.ortho();
      if(t % 1.0 == 0.0) {
        print(p.frameRate());
      }
      p.background(0);
      p.strokeWeight(7.0);
      p.translate(p.width / 2, p.height / 2);
      let tween;
      let cycle = 12.0;
      if(t % cycle <= 6.0) {
        tween = Math.pow((t % cycle) / 6.0, 2.0) / 2.0;
      }
      else {
        tween = p.map(Math.pow(p.map(t % cycle, 6.0, cycle, 1.0, 0.0), 2.0), 1.0, 0.0, 0.5, 1.0);
      }
      p.rotateY(tween * 2.0 * Math.PI);
      let ylerp = Math.pow(1.0 - Math.abs(t % cycle - 6.0)/6.0, 4.0) * 0.95;
      for(let i in particles) {
        let pc = particles[i];
        // p.fill(pc.color);
        p.stroke(pc.color);
  
        // p.push();
        let b = p.brightness(pc.color) - 100;
        let x = pc.x * 2;
        let y = pc.y * 2;
        let z = 2 * b;
        let lerp = ylerp * (1.0 + b * 0.005);
        x = p.lerp(x, lerp * 300 * Math.cos(b / 105.0 * Math.PI * 1.0 + t * 8.0), lerp);
        y = p.lerp(y, lerp * 300 * Math.sin(b / 105.0 * Math.PI * 1.0 + t * 8.0), lerp);
        // z = p.lerp(z, lerp * 300 * Math.cos(b / 105.0 * Math.PI * 2.0 + t * 8.0), lerp);
        // p.translate(x, y, z);
        // p.rotateY(-tween * 2.0 * Math.PI);
        p.point(x, y, z);
        // p.ellipse(0, 0, 7);
        // p.pop();
      }
    }
  };
  
  var p079 = new p5(s);