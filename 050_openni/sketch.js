if (context == undefined) {
  var context = null;
}

var s = function (p) {

  let zoomF = 0.3;
  let rotX = p.radians(180);  // by default rotate the hole scene 180deg around the x-axis, 
  // the data from openni comes upside down
  let rotY = p.radians(0);
  let points;

  p.setup = function () {
    p.createCanvas(800, 800);

    if (context == null) {
      context = new Packages.SimpleOpenNI.SimpleOpenNI(p.that);
      if (context.isInit() == false) {
        print("Can't init SimpleOpenNI, maybe the camera is not connected!");
        p.exit();
        return;
      }

      // disable mirror
      context.setMirror(true);

      // enable depthMap generation 
      context.enableDepth();
    }

    p.stroke(255, 255, 255);
    p.smooth();

    points = new Array(context.depthWidth() * context.depthHeight());
    for (let i = 0; i < points.length; i++) {
      points[i] = 0.0;
    }
  }

  p.draw = function () {
    p.perspective(p.radians(15),
      parseFloat(p.width) / parseFloat(p.height),
      10, 150000);
    // update the cam
    context.update();

    p.background(0, 0, 0);

    p.translate(p.width / 2, p.height / 2, 0);
    p.rotateX(rotX);
    p.rotateY(rotY);
    p.scale(zoomF);

    let depthMap = context.depthMap();
    let steps = 4;  // to speed up the drawing, draw every third point
    let index;
    let realWorldPoint;

    p.translate(0, 0, -1000);  // set the rotation center of the scene 1000 infront of the camera

    p.stroke(255);
    p.strokeWeight(5);

    let realWorldMap = context.depthMapRealWorld();

    for (let y = 0; y < context.depthHeight(); y += steps) {
      for (let x = 0; x < context.depthWidth(); x += steps) {
        index = x + y * context.depthWidth();
        if (depthMap[index] > 0 && depthMap[index] < 1000) {
          points[index] = p.lerp(points[index], realWorldMap[index].z, 0.05);
        }
      }
    }
    // draw pointcloud
    p.noFill();
    for (let y = 0; y < context.depthHeight() - steps; y += steps) {
      for (let x = 0; x < context.depthWidth() - steps; x += steps) {
        index = x + y * context.depthWidth();
        if (depthMap[index] > 10 && depthMap[index] < 1000) {
          if (depthMap[index + steps] > 10 &&
            depthMap[index + steps] < 1000) {
            if (depthMap[index + steps * context.depthWidth()] > 10 &&
              depthMap[index + steps * context.depthWidth()] < 1000) {
              if (depthMap[index + steps * context.depthWidth() + steps] > 10 &&
                depthMap[index + steps * context.depthWidth() + steps] < 1000) {
                // draw the projected point
                //        realWorldPoint = context.depthMapRealWorld()[index];
                p.beginShape(p.TRIANGLE_STRIP);
                realWorldPoint = realWorldMap[index + steps * context.depthWidth()];
                p.vertex(realWorldPoint.x, realWorldPoint.y, points[index + steps * context.depthWidth()]);  // make realworld z negative, in the 3d drawing coordsystem +z points in the direction of the eye
                realWorldPoint = realWorldMap[index];
                p.vertex(realWorldPoint.x, realWorldPoint.y, points[index]);  // make realworld z negative, in the 3d drawing coordsystem +z points in the direction of the eye
                realWorldPoint = realWorldMap[index + steps * context.depthWidth() + steps];
                p.vertex(realWorldPoint.x, realWorldPoint.y, points[index + steps * context.depthWidth() + steps]);  // make realworld z negative, in the 3d drawing coordsystem +z points in the direction of the eye
                realWorldPoint = realWorldMap[index + steps];
                p.vertex(realWorldPoint.x, realWorldPoint.y, points[index + steps]);  // make realworld z negative, in the 3d drawing coordsystem +z points in the direction of the eye
                p.endShape();
              }
            }
          }
        }
        //println("x: " + x + " y: " + y);
      }
    }

    // draw the kinect cam
    // context.drawCamFrustum();
  }
};

var p049 = new p5(s);