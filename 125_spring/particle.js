function Particle(params) {
  let p = params.p;
  let x = params.x;
  let y = params.y;
  let z = params.z;
  
  this.particle = new Packages.toxi.physics3d.VerletParticle3D(x, y, z);
  this.get = function () {
    return this.particle;
  }
  this.display = function () {
    p.push();
    p.translate(this.particle.x,this.particle.y,this.particle.z);
    p.noStroke();
    p.fill(255);
    p.ellipse(0, 0, 2, 2);
    p.pop();
  }
}
