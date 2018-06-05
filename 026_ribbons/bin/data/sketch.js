// of.background((of.elapsedTime - Math.floor(of.elapsedTime)) * 255);
of.background(255);

function map(value, low1, high1, low2, high2) {
  return low2 + (value - low1) * (high2 - low2) / (high1 - low1);
}

function Prop (i) {
  this.i = i;
  this.init();
}

Prop.prototype.init = function () {
  // this.r = map(Math.random(), 0, 1, of.windowHeight * 0.25, of.windowHeight * 0.75);
  this.r = i * 100 + 300;
  this.rorg = this.r;
  this.rdest = this.r + Math.floor(Math.random() * 5 - 2) * 100;
  this.dr = 80;
  this.iStart = 0;
  this.iEnd = 0;
  this.iTrans = map(Math.random(), 0, 1, Math.PI * 0.25, Math.PI * 0.75);
  this.state = 0;
  this.inv = Math.random() > 0.5 ? true : false;
}

Prop.prototype.update = function () {
  var vi = Math.PI / 30.0 * 0.5;
  if (this.state == 0) {
    this.iEnd += vi;
    if (this.iEnd - this.iStart > Math.PI * 0.25) {
      this.iStart += vi;
    }
    if (this.iEnd - this.iTrans > Math.PI * 0.025) {
      this.state = 1;
    }
  }
  else if (this.state == 1) {
    this.iStart += vi;
    if (this.iTrans - this.iStart < Math.PI * 0.025) {
      this.state = 2;
    }
  }
  else if (this.state == 2) {
    var rd = 10;
    if (this.rdest > this.r)
    this.r += rd;
    else if (this.rdest < this.r)
    this.r -= rd;
    if (Math.abs(this.r - this.rdest) < rd) {
      this.state = 3;
    }
  }
  else if (this.state == 3) {
    this.iEnd += vi;
    if (this.iEnd - this.iStart > Math.PI * 0.25) {
      this.iStart += vi;
    }
    if (this.iEnd >= Math.PI) {
      this.state = 4;
    }
  }
  else if (this.state == 4) {
    this.iStart += vi;
    if (this.iStart >= Math.PI) {
      this.init();
    }
  }
}

Prop.prototype.draw = function () {
  of.pushMatrix();
  if(this.inv) of.scale(-1, 1, 1);

  of.fill();
  of.setColor(0);
  of.beginShape();
  for (var i = 0; i <= 100;) {
    var angle = map(i, 0, 100, this.iStart, this.iEnd);
    of.vertex(this.r * -Math.cos(angle), -this.r * Math.sin(angle), 0);
    i = Math.floor(i + 1);
  }
  for (var i = 100; i >= 0;) {
    var angle = map(i, 0, 100, this.iStart, this.iEnd);
    of.vertex((this.r + this.dr) * -Math.cos(angle), -(this.r + this.dr) * Math.sin(angle), 0);
    i--;
  }
  of.endShape();

  of.popMatrix();
}

if (isReloaded()) {
  var props = [];
  for(var i = 0; i < 4; i++) {
    props.push(new Prop(i));
  }
}

of.translate(of.windowWidth * 0.5, of.windowHeight * 1.0)

for(var i = 0; i < props.length; i++) {
  props[i].update();
  props[i].draw();
}
