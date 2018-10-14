// https://gist.github.com/gre/1650294
EasingFunctions = {
  // no easing, no acceleration
  linear: function (t) { return t },
  // accelerating from zero velocity
  easeInQuad: function (t) { return t * t },
  // decelerating to zero velocity
  easeOutQuad: function (t) { return t * (2 - t) },
  // acceleration until halfway, then deceleration
  easeInOutQuad: function (t) { return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t },
  // accelerating from zero velocity 
  easeInCubic: function (t) { return t * t * t },
  // decelerating to zero velocity 
  easeOutCubic: function (t) { return (--t) * t * t + 1 },
  // acceleration until halfway, then deceleration 
  easeInOutCubic: function (t) { return t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1 },
  // accelerating from zero velocity 
  easeInQuart: function (t) { return t * t * t * t },
  // decelerating to zero velocity 
  easeOutQuart: function (t) { return 1 - (--t) * t * t * t },
  // acceleration until halfway, then deceleration
  easeInOutQuart: function (t) { return t < .5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t },
  // accelerating from zero velocity
  easeInQuint: function (t) { return t * t * t * t * t },
  // decelerating to zero velocity
  easeOutQuint: function (t) { return 1 + (--t) * t * t * t * t },
  // acceleration until halfway, then deceleration 
  easeInOutQuint: function (t) { return t < .5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t }
}

var lightPos;
var defaultShader;
var shadowMap;
var pgColor;

var S097 = function (p) {
  let name = p.folderName;
  let startTime;
  let pg;
  let lastSeq;
  let cycle = 4.0;
  let lightDirection = { x: 0.0, y: 0.0, z: 0.0 };

  let remoteLocation = new Packages.netP5.NetAddress("127.0.0.1", 57110);
  lightPos = p.createVector();

  pg = p.createGraphics(800, 800, p.P3D);

  function initShadowPass() {
    shadowMap = p.createGraphics(2048, 2048, p.P3D);
    shadowMap.noSmooth(); // Antialiasing on the shadowMap leads to weird artifacts
    //shadowMap.loadPixels(); // Will interfere with noSmooth() (probably a bug in Processing)
    shadowMap.beginDraw();
    shadowMap.noStroke();
    shadowMap.shader(p.loadShader(name + ("/shadow.frag"), name + ("/shadow.vert")));
    shadowMap.ortho(-200, 200, -200, 200, 10, 400); // Setup orthogonal view matrix for the directional light
    shadowMap.endDraw();
  }

  function initDefaultPass() {
    defaultShader = p.loadShader(name + ("/default.frag"), name + ("/default.vert"));
  }

  initShadowPass();
  initDefaultPass();

  function updateDefaultShader() {
    // Bias matrix to move homogeneous shadowCoords into the UV texture space
    let shadowTransform = new Packages.processing.core.PMatrix3D(
      0.5, 0.0, 0.0, 0.5,
      0.0, 0.5, 0.0, 0.5,
      0.0, 0.0, 0.5, 0.5,
      0.0, 0.0, 0.0, 1.0
    );

    // Apply project modelview matrix from the shadow pass (light direction)
    shadowTransform.apply(shadowMap.projmodelview);

    // Apply the inverted modelview matrix from the default pass to get the original vertex
    // positions inside the shader. This is needed because Processing is pre-multiplying
    // the vertices by the modelview matrix (for better performance).
    let modelviewInv = p.g.modelviewInv;
    shadowTransform.apply(modelviewInv);

    // Convert column-minor PMatrix to column-major GLMatrix and send it to the shader.
    // PShader.set(String, PMatrix3D) doesn't convert the matrix for some reason.
    defaultShader.set("shadowTransform", new Packages.processing.core.PMatrix3D(
      shadowTransform.m00, shadowTransform.m10, shadowTransform.m20, shadowTransform.m30,
      shadowTransform.m01, shadowTransform.m11, shadowTransform.m21, shadowTransform.m31,
      shadowTransform.m02, shadowTransform.m12, shadowTransform.m22, shadowTransform.m32,
      shadowTransform.m03, shadowTransform.m13, shadowTransform.m23, shadowTransform.m33
    ));

    // Calculate light direction normal, which is the transpose of the inverse of the
    // modelview matrix and send it to the default shader.
    let lightNormalX = lightPos.x * modelviewInv.m00 + lightPos.y * modelviewInv.m10 + lightPos.z * modelviewInv.m20;
    let lightNormalY = lightPos.x * modelviewInv.m01 + lightPos.y * modelviewInv.m11 + lightPos.z * modelviewInv.m21;
    let lightNormalZ = lightPos.x * modelviewInv.m02 + lightPos.y * modelviewInv.m12 + lightPos.z * modelviewInv.m22;
    let normalLength = Math.sqrt(lightNormalX * lightNormalX + lightNormalY * lightNormalY + lightNormalZ * lightNormalZ);
    lightDirection = { x: lightNormalX / -normalLength, y: lightNormalY / -normalLength, z: lightNormalZ / -normalLength };
    defaultShader.set("lightDirection", lightDirection.x, lightDirection.y, lightDirection.z);
    defaultShader.set("uLightColor", 1.0, 1.0, 1.0);
    let g = 0.7;
    defaultShader.set("uBaseColor", g, g, g);

    defaultShader.set("uSpecular", 0.9);
    defaultShader.set("uLightRadius", 300.0);
    defaultShader.set("uExposure", 0.01);
    defaultShader.set("uGamma", 1.0);

    defaultShader.set("vLightPosition", lightPos.x, lightPos.y, lightPos.z);

    // Send the shadowmap to the default shader
    defaultShader.set("shadowMap", shadowMap);
  }

  function renderLandscape(canvas, isShadow) {
    canvas.pushMatrix();
    canvas.fill(255);
    canvas.noStroke();
    // pg.stroke(0);
    // canvas.rotateX(-0.1 * Math.PI);

    let points = [];
    let nj = 20;
    let ni = 20;
    let r = 200;
    for(let i = 0; i < ni; i++) {
      points[i] = [];
      for(let j = 0; j <= nj; j++) {
        let phi = j / nj * 2.0 * Math.PI;
        let theta = i / ni * 1.0 * Math.PI;
        let x = r * Math.cos(phi) * Math.sin(theta);
        let y = r * Math.cos(theta);
        let z = r * Math.sin(phi) * Math.sin(theta);
        points[i][j] = {x: x, y: y, z: z};
      }
    }
    for(let i = 0; i < points.length - 1; i++) {
      canvas.beginShape(p.TRIANGLE_STRIP);
      for(let j = 0; j < points[0].length; j++) {
        canvas.vertex(points[i][j].x, points[i][j].y, points[i][j].z);
        canvas.vertex(points[i+1][j].x, points[i+1][j].y, points[i+1][j].z);
      }
      canvas.endShape();
    }

    canvas.pushMatrix();
    canvas.translate(0, r, 0);
    canvas.box(r * 5, 20, r * 5)
    canvas.popMatrix();
    canvas.popMatrix();
  }

  function drawPg(pg, t) {
    let phase = t / cycle % 1.0;
    let cameraPosition = { x: 0.0, y: 0.0, z: 500.0 };
    lightPos.set(0, -200, -200);
    let viewMatrix = new Packages.processing.core.PMatrix3D(
      0.5, 0.0, 0.0, 0.5,
      0.0, 0.5, 0.0, 0.5,
      0.0, 0.0, 0.5, 0.5,
      0.0, 0.0, 0.0, 1.0
    );
    viewMatrix.translate(cameraPosition.x, cameraPosition.y, cameraPosition.z);

    let seq = Math.floor(t / cycle);

    if (seq != lastSeq) {
    }


    // Render shadow pass
    shadowMap.beginDraw();
    shadowMap.camera(lightPos.x, lightPos.y, lightPos.z, lightDirection.x - lightPos.x, lightDirection.y - lightPos.y, lightDirection.z - lightPos.z, 0, 1, 0);
    shadowMap.background(255, 255, 255, 255); // Will set the depth to 1.0 (maximum depth)
    renderLandscape(shadowMap, true);
    shadowMap.endDraw();

    // Render default pass
    pg.beginDraw();
    pg.camera(cameraPosition.x, cameraPosition.y, cameraPosition.z, 0.0, 0.0, 0, 0, 1, 0);
    pg.perspective(60.0 / 180 * Math.PI, pg.width / pg.height, 10, 1000);
    pg.shader(defaultShader);
    defaultShader.set("viewMatrix", new Packages.processing.core.PMatrix3D(
      viewMatrix.m00, viewMatrix.m10, viewMatrix.m20, viewMatrix.m30,
      viewMatrix.m01, viewMatrix.m11, viewMatrix.m21, viewMatrix.m31,
      viewMatrix.m02, viewMatrix.m12, viewMatrix.m22, viewMatrix.m32,
      viewMatrix.m03, viewMatrix.m13, viewMatrix.m23, viewMatrix.m33
    ));
    // Update the shadow transformation matrix and send it, the light
    // direction normal and the shadow map to the default shader.
    updateDefaultShader();

    // pg.translate(pg.width * 0.5, pg.height * 0.5);
    renderLandscape(pg, false);
    pg.fill(255);
    pg.ellipse(0,0,100,100)
    pg.endDraw();
    
    // pg.lights();

    lastSeq = seq;
    // pg.endDraw();
  }

  this.draw = function (t) {
    p.background(0);
    drawPg(pg, t);
    p.image(pg, 0, 0);
    // p.image(shadowMap, 0, 0, 800, 800);
  }
};

var s = function (p) {
  let startTime;
  
  let s097 = new S097(p);

  p.setup = function () {
    name = p.folderName;

    p.createCanvas(800, 800);
    p.frameRate(30);

    startTime = p.millis();
  }

  function getTime() { return (p.millis() - startTime) * 0.001 };

  p.draw = function () {
    t = getTime();

    s097.draw(t);
  }
};

var p = new p5(s);
