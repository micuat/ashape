if(curSlide == undefined) {
  var curSlide = 0;
}
if(images == undefined) {
  var images = {};
}

var windowWidth = 1024;
var windowHeight = 768;

function PLorenz(p) {
  let x = 0.02;
  let y = 0;
  let z = 0;
  
  let a = 10;
  let b = 28;
  let c = 8.0 / 3.0;
  
  let points = new Array();
  let pg = p.createGraphics(windowWidth, windowHeight, p.P3D);

  this.draw = function () {
    pg.beginDraw();
    pg.background(0);

    for (let it = 0; it < 20; it++) {
      let dt = 0.001;
      let dx = (a * (y - x)) * dt;
      let dy = (x * (b - z) - y) * dt;
      let dz = (x * y - c * z) * dt;
      x = x + dx;
      y = y + dy;
      z = z + dz;

      let vel = dx * dx + dy * dy + dz * dz;
      vel = Math.sqrt(vel) * 10;

      for (let i = 0; i < 5; i++) {
        let x1 = x + p.randomGaussian() * 0.1 * vel;
        let y1 = y + p.randomGaussian() * 0.1 * vel;
        let z1 = z + p.randomGaussian() * 0.1 * vel;
        points.push(new p5.Vector(x1, y1, z1));
      }

      if(points.length > 10000) {
        for (let i = 0; i < 5; i++) {
          points.shift();
        }
      }
    } 

    pg.translate(pg.width / 2, pg.height / 2, -80);
    pg.scale(10);
    pg.stroke(255, 100);
    pg.strokeWeight(0.2);
    pg.noFill();

    let hu = 0;
    pg.beginShape(p.POINTS);

    for (let i in points) {
      let v = points[i];
      pg.vertex(v.x, v.y, v.z);

      hu += 1;
      if (hu > 255) {
        hu = 0;
      }
    }
    pg.endShape();
    pg.endDraw();
    p.image(pg, -p.width / 2, -p.height / 2);
  }
};

function PTenPrint(p) {
  let x = 0;
  let y = 0;
  let spacing = 32;
  let pg = p.createGraphics(windowWidth, windowHeight);
  this.draw = function () {
    pg.beginDraw();
    pg.stroke(255);
    if (p.random(1) < 0.5) {
      pg.line(x, y, x + spacing, y + spacing);
    } else {
      pg.line(x, y + spacing, x + spacing, y);
    }
    x = x + spacing;
    if (x > pg.width) {
      x = 0;
      y = y + spacing;
    }
    pg.endDraw();
    p.image(pg, -p.width / 2, -p.height / 2);
  }
}

var s = function (p) {
  let name;
  let startFrame;
  let cycle = 8.0;

  p.setup = function () {
    name = p.folderName;

    p.createCanvas(windowWidth, windowHeight);
    p.frameRate(30);

    font = p.createFont("assets/Avenir.otf", 60);
    startFrame = p.frameCount;

    let assetPath = "assets/slides";
    let files = (new java.io.File(p.sketchPath(assetPath))).listFiles();
    for(let i = 0; i < files.length; i++) {
      let f = files[i];
      if(images[f.getName()] == undefined) {
        print("loading " + f.getName())
        images[f.getName()] = p.loadImage(assetPath + "/" + f.getName());
      }
    }
  }

  function getCount() { return p.frameCount - startFrame };
  function drawImage(name, tint) {
    let im = images[name];
    let aspect = im.width / im.height;
    p.pushStyle();
    if(tint == undefined) {
    }
    else {
      p.tint(255, 255 * tint);
    }
    p.imageMode(p.CENTER);
    if(aspect > windowWidth/windowHeight) {
      let h = windowHeight;
      let w = aspect * h;
      p.image(im, 0, 0, w, h);
    }
    else {
      let w = windowWidth;
      let h = w / aspect;
      p.image(im, 0, 0, w, h);
    }
    p.popStyle();
  }
  let pLorenz = new PLorenz(p);
  let pTenPrint = new PTenPrint(p);

  let funcs = [
    function () {
      p.textAlign(p.CENTER, p.CENTER);
      p.translate(p.width / 2, p.height / 2);

      pLorenz.draw();
  
      p.textSize(64);
      p.text("Processing and Generative Art", 0, -50);
      p.textSize(48);
      p.text("Naoto Hieda", 0, 50);
      p.textSize(32);
      p.text("Seoul Art Space Geumcheon", 0, 100);
    },
    function () {
      p.textAlign(p.CENTER, p.CENTER);
      p.translate(p.width / 2, p.height / 2);
  
      drawImage("nano.png");
      p.fill(0);
      p.textSize(48);
      p.text("Who am I", 0, -50);
    },
    function () {
      p.translate(p.width / 2, p.height / 2);
      drawImage("bizarrege.png");
    },
    function () {
      p.translate(p.width / 2, p.height / 2);
      drawImage("miniw.png");
    },
    function () {
      p.translate(p.width / 2, p.height / 2);
      drawImage("telus.png");
    },
    function () {
      p.translate(p.width / 2, p.height / 2);
      drawImage("pl.png");
    },
    function () {
      p.translate(p.width / 2, p.height / 2);
      drawImage("ts.png");
    },
    function () {
      p.textAlign(p.CENTER, p.CENTER);
      p.translate(p.width / 2, p.height / 2);
      p.textSize(48);
      p.text("Made with Processing", 0, 0);
    },
    function () {
      p.textAlign(p.CENTER, p.CENTER);
      p.translate(p.width / 2, p.height / 2);
      drawImage("sasg.png");
      p.textSize(48);
      p.text("alc_freeliner by MaxD", 0, 100);
    },
    function () {
      p.textAlign(p.CENTER, p.CENTER);
      p.translate(p.width / 2, p.height / 2);
      drawImage("bc.png");
      p.textSize(48);
      p.text("Performance", 0, 0);
    },
    function () {
      p.textAlign(p.CENTER, p.CENTER);
      p.translate(p.width / 2, p.height / 2);
      drawImage("pathrefinder.jpg");
      p.textSize(48);
      p.text("Pathfinder by Mio Loclair", 0, 0);
    },
    function () {
      p.textAlign(p.CENTER, p.CENTER);
      p.translate(p.width / 2, p.height / 2);
      drawImage("pf.jpg");
      p.textSize(48);
      p.text("PixelFlow by Thomas Diewald", 0, 0);
    },
    function () {
      p.textAlign(p.CENTER, p.CENTER);
      p.translate(p.width / 2, p.height / 2);
      drawImage("mano.jpg");
      p.textSize(48);
      p.text("@manoloidee", 0, 0);
    },
    function () {
      p.textAlign(p.CENTER, p.CENTER);
      p.translate(p.width / 2, p.height / 2);
  
      p.textSize(48);
      p.text("Generative art is not a new idea", 0, 0);
    },
    function () {
      p.textAlign(p.CENTER, p.CENTER);
      p.translate(p.width / 2, p.height / 2);
  
      pTenPrint.draw();
      p.textSize(48);
      p.text("10 PRINT (1982)", 0, 0);
      p.textSize(24);
      p.text("10 PRINT CHR$(205.5+RND(1)); : GOTO 10", 0, 150);
    },
    function () {
      p.textAlign(p.CENTER, p.CENTER);
      p.translate(p.width / 2, p.height / 2);
      drawImage("laban.jpg", 0.5);

      p.fill(255);
      p.textSize(48);
      p.text("Labanotation (1928)", 0, 0);
      p.textSize(24);
      p.text("image taken from pinterest", 0, 150);
    },
    function () {
      p.textAlign(p.CENTER, p.CENTER);
      p.translate(p.width / 2, p.height / 2);
  
      drawImage("weaving.jpg", 0.5);

      p.fill(255);
      p.textSize(48);
      p.text("Weaving", 0, 0);
      p.textSize(24);
      p.text("A Handweaver's Pattern Book", 0, 150);
    },
    function () {
      p.textAlign(p.CENTER, p.CENTER);
      p.translate(p.width / 2, p.height / 2);
  
      drawImage("dan.jpg", 0.4);
      p.textSize(64);
      p.text("Coding Challenge!", 0, 0);
    },
  ]
  p.draw = function () {
    t = (getCount() / 30.0);
    if (getCount() % (30 * cycle) == 0) {

    }

    p.background(0);
    p.fill(255);
    p.stroke(255);

    p.textFont(font);
    funcs[curSlide]();
  }

  p.keyPressed = function() {
    if(p.keyCode == p.LEFT) {
      curSlide = Math.max(0, curSlide - 1);
    }
    else if(p.keyCode == p.RIGHT) {
      curSlide = Math.min(funcs.length - 1, curSlide + 1);
    }
  }

};

var pSnue = new p5(s);
