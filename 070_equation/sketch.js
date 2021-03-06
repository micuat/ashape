// instance mode by Naoto Hieda

var lightPos;
var defaultShader;
var shadowMap;
var pgColor;

var s = function (p) {
  let name;
  let font;
  let pg;
  let startFrame;
  let lightDirection = { x: 0.0, y: 0.0, z: 0.0 };
  let t = 0;
  let nonRelevant = { i: 0, k: 0 };
  let direction0;
  let direction1;
  let sequencing;
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
    p.shader(defaultShader);
    p.noStroke();
    p.perspective(60.0 / 180 * Math.PI, p.width / p.height, 10, 1000);
  }

  p.setup = function () {
    name = p.folderName;

    p.createCanvas(800, 800);
    p.frameRate(30);

    initShadowPass();
    initDefaultPass();
    lightPos = p.createVector();

    font = p.createFont("assets/Avenir.otf", 60);
    pg = p.createGraphics(p.width, p.height, p.P3D);
    startFrame = p.frameCount;
  }

  function getCount() { return p.frameCount - startFrame };

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
    defaultShader.set("uLightRadius", 500.0);
    defaultShader.set("uExposure", 2.0);
    defaultShader.set("uGamma", 0.6);

    defaultShader.set("vLightPosition", lightPos.x, lightPos.y, lightPos.z);

    // Send the shadowmap to the default shader
    defaultShader.set("shadowMap", shadowMap);

    defaultShader.set("iTime", t % 4.0);
  }

  function renderLandscape(canvas, isShadow) {
    canvas.noStroke();
    canvas.fill(0, 200, 0, 255);
    canvas.pushMatrix();
    // canvas.translate(pg.width / 2, pg.height / 2);

    canvas.pushMatrix();
    for (let k = 0; k < 1; k++) {
      // canvas.arc(0, 0, 100, 100, 0, Math.PI / 2);
      for (let i = 0; i < 13; i++) {
        canvas.pushMatrix();
        // canvas.translate(0, 0, 5 + i * 5);
        let angle = (t % 8.0 - i*4.0/13.0) / 4.0;// * (i + 1);
        angle = p.constrain(angle, 0.0, 1.0);
        angle = Math.pow(angle, 2.0);
        angle = p.map(angle, 0.0, 1.0, i * 0.1, 1.0);

        if(t % 8.0 >= 7.0) {
          angle = p.map(t % 8.0, 7.0, 8.0, 1.0, i * 0.1);
        }
        angle *= Math.PI * 2.0;
        // angle += i;
        canvas.rotate(angle);
        for (let jj = 0; jj < 2; jj++) {
          canvas.beginShape(p.TRIANGLE_STRIP);
          let r0 = 50.0 + i * 15;
          let r1 = 60.0 + i * 15;
          let t0 = Math.atan(25 / r0);
          let t1 = Math.atan(25 / r1);
          for (let j = 0; j <= 20 + i; j++) {
            let jt0 = p.map(j, 0, 20 + i, t0, -t0+Math.PI)
            let jt1 = p.map(j, 0, 20 + i, t1, -t1+Math.PI)
            canvas.vertex(Math.cos(jt0) * r0, Math.sin(jt0) * r0, 0);
            canvas.vertex(Math.cos(jt1) * r1, Math.sin(jt1) * r1, 0);
          }
          canvas.endShape();
          canvas.rotate(Math.PI);
        }
        canvas.popMatrix();
      }
    }
    canvas.popMatrix();

    // canvas.box(100);
    canvas.fill(50, 200, 0, 255);
    canvas.translate(0, 0, -30);
    canvas.box(1000, 1000, 5);
    canvas.popMatrix();
  }

  p.draw = function () {
    t = (getCount() / 60.0);
    if (getCount() % (60 * 4) == 0) {
      nonRelevant.i = Math.floor(p.random(-3, 4));
      nonRelevant.k = Math.floor(p.random(0, 2));

      let funcs = [
        function (pg) { },
        function (pg) { pg.scale(1, -1, 1) }
      ];
      direction0 = p.random(funcs);
      direction1 = p.random(funcs);

      sequencing = p.random([
        function (i) { return i / 8 },
        function (i) { return ((i % 2) / 4.0) },
        function (i) { return (Math.cos(i / 8.0 * Math.PI) * 0.35) }
      ]);
    }

    let cameraPosition = { x: 0.0, y: 0.0, z: 300.0 };

    let viewMatrix = new Packages.processing.core.PMatrix3D(
      0.5, 0.0, 0.0, 0.5,
      0.0, 0.5, 0.0, 0.5,
      0.0, 0.0, 0.5, 0.5,
      0.0, 0.0, 0.0, 1.0
    );
    viewMatrix.translate(cameraPosition.x, cameraPosition.y, cameraPosition.z);
    defaultShader.set("viewMatrix", new Packages.processing.core.PMatrix3D(
      viewMatrix.m00, viewMatrix.m10, viewMatrix.m20, viewMatrix.m30,
      viewMatrix.m01, viewMatrix.m11, viewMatrix.m21, viewMatrix.m31,
      viewMatrix.m02, viewMatrix.m12, viewMatrix.m22, viewMatrix.m32,
      viewMatrix.m03, viewMatrix.m13, viewMatrix.m23, viewMatrix.m33
    ));
    p.camera(cameraPosition.x, cameraPosition.y, cameraPosition.z, 0.0, 0.0, 0, 0, 1, 0);
    p.background(0);

    lightPos.set(20, 30, 100);

    // Render shadow pass
    shadowMap.beginDraw();
    shadowMap.camera(lightPos.x, lightPos.y, lightPos.z, lightDirection.x - lightPos.x, lightDirection.y - lightPos.y, lightDirection.z - lightPos.z, 0, 1, 0);
    shadowMap.background(255, 255, 255, 255); // Will set the depth to 1.0 (maximum depth)
    renderLandscape(shadowMap, true);
    shadowMap.endDraw();

    // Update the shadow transformation matrix and send it, the light
    // direction normal and the shadow map to the default shader.
    updateDefaultShader();

    // Render default pass
    p.background(34, 34, 34, 255);
    p.noStroke();
    renderLandscape(p.g, false);

    p.push();
    p.translate(0, 0, -20);
    // if (t % 4 < 2) {
    p.push();
    p.translate(0, 30);
    let tweena = Math.min(1.0, p.map(t % 2.0, 0.0, 0.5, 0.0, 1.0));
    if (t % 4.0 > 1.0)
      tweena = Math.max(0.0, p.map(t % 2.0, 1.5, 2.0, 1.0, 0.0));
    // p.fill(128, 255 * tweena);
    p.fill(100, 0, 0, 255);

    p.textFont(font, 25);
    p.textAlign(p.CENTER, p.CENTER);
    p.text("Structures as the apparatus that", 0, -50);
    p.text("allow the thought to form", 0, -20);
    p.pop();
    // }
    p.pop();

    if (getCount() % 15 == 0) {
      // p.saveFrame(name + "/capture/######.png");
    }

  }

};

var p060 = new p5(s);
