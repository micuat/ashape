function Spring(params) {
  let p = params.p;
  let a = params.a;
  let b = params.b;
  this.spring = new Packages.toxi.physics3d.VerletSpring3D(a, b, params.w, params.stiffness);
  this.get = function () {
    return this.spring;
  }
  this.display = function () {
    p.stroke(255);
    p.strokeWeight(2);
    p.line(this.spring.a.x, this.spring.a.y, this.spring.a.z, this.spring.b.x, this.spring.b.y, this.spring.b.z);
  }
}
