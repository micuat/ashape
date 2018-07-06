if(context == undefined) {
  var context = null;
}

var s = function (p) {

  let zoomF = 0.3;
  let rotX = p.radians(180);  // by default rotate the hole scene 180deg around the x-axis, 
  // the data from openni comes upside down
  let rotY = p.radians(0);

  p.setup = function () {
    p.createCanvas(1024, 768);

    if (context == null) {
      context = new Packages.SimpleOpenNI.SimpleOpenNI(p.that);
      if (context.isInit() == false) {
        print("Can't init SimpleOpenNI, maybe the camera is not connected!");
        p.exit();
        return;
      }

      // disable mirror
      context.setMirror(false);

      // enable depthMap generation 
      context.enableDepth();
    }

    p.stroke(255, 255, 255);
    p.smooth();
    p.perspective(p.radians(45),
      parseFloat(p.width) / parseFloat(p.height),
      10, 150000);
  }

  p.draw = function () {
    // update the cam
    context.update();

    p.background(0, 0, 0);

    p.translate(p.width / 2, p.height / 2, 0);
    p.rotateX(rotX);
    p.rotateY(rotY);
    p.scale(zoomF);

    let depthMap = context.depthMap();
    let steps = 3;  // to speed up the drawing, draw every third point
    let index;
    let realWorldPoint;

    p.translate(0, 0, -1000);  // set the rotation center of the scene 1000 infront of the camera

    p.stroke(255);

    let realWorldMap = context.depthMapRealWorld();

    // draw pointcloud
    p.beginShape(p.LINES);
    for (let y = 0; y < context.depthHeight(); y += steps) {
      for (let x = 0; x < context.depthWidth(); x += steps) {
        index = x + y * context.depthWidth();
        if (depthMap[index] > 0) {
          // draw the projected point
          //        realWorldPoint = context.depthMapRealWorld()[index];
          realWorldPoint = realWorldMap[index];
          p.vertex(realWorldPoint.x, realWorldPoint.y, realWorldPoint.z);  // make realworld z negative, in the 3d drawing coordsystem +z points in the direction of the eye
        }
        //println("x: " + x + " y: " + y);
      }
    }
    p.endShape();

    // draw the kinect cam
    context.drawCamFrustum();
  }
};

var p049 = new p5(s);