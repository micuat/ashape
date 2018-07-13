// instance mode by Naoto Hieda

var lightPos;
var defaultShader;
var shadowMap;
var pgColor;

var s = function (p) {
  let name;
  let lightDirection = {x: 0.0, y: 0.0, z: 0.0};
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
  }

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
    lightDirection = {x: lightNormalX / -normalLength, y: lightNormalY / -normalLength, z: lightNormalZ / -normalLength};
    defaultShader.set("lightDirection", lightDirection.x, lightDirection.y, lightDirection.z);
    defaultShader.set("uLightColor", 1.0, 1.0, 1.0);
    defaultShader.set("uBaseColor", 0.5, 0.5, 0.5);

    defaultShader.set("uSpecular", 0.99);
    defaultShader.set("uLightRadius", 500.0);
    defaultShader.set("uExposure", 2.0);
    defaultShader.set("uGamma", 0.6);

    defaultShader.set("vLightPosition", lightPos.x, lightPos.y, lightPos.z);

    // Send the shadowmap to the default shader
    defaultShader.set("shadowMap", shadowMap);
  }

  function renderLandscape(canvas, shader) {
    canvas.pushMatrix();
    let offset = -p.frameCount * 0.01;
    let n = 4.0;

    let x = 0;
    let z = 0;

    n = 2.0;
    function vowel_a (angle) {
      let cos = Math.cos(angle);
      if(cos < 0) cos = 0;
      let x = 50 + 50 * Math.pow(cos, 32.0);
      let z = 100 * Math.sin(angle);
      return {x: x, z: z, cx: -50, cz: 0};
    }
    function vowel_o (angle) {
      let cos = Math.cos(angle);
      if(cos < 0) cos = 0;
      let x = 75 * Math.sin(angle);
      let z = 50 - 50 * Math.pow(cos, 32.0);
      return {x: x, z: z, cx: 0, cz: -50};
    }
    function consonant_ng (angle, pos) {
      let x = 50 * Math.cos(angle) + pos.cx;
      let z = 50 * Math.sin(angle) + pos.cz;
      return {x: x, z: z};
    }

    canvas.fill(120.0, 120.0, 0, 255);
    for(let i = 0; i < n; i++) {
      let phase = Math.PI * i / n * 2.0;
      let angle = p.millis() * 0.0025 + phase;

      let pos = vowel_o(angle);
      canvas.pushMatrix();
      canvas.translate(pos.x, -12, pos.z);
      canvas.sphere(12);
      canvas.popMatrix();

      pos = consonant_ng(angle, pos);
      canvas.pushMatrix();
      canvas.translate(pos.x, -12, pos.z);
      canvas.sphere(12);
      canvas.popMatrix();
    }

    canvas.fill(200, 200, 34, 255);
    canvas.box(360, 5, 360);
    canvas.popMatrix();
  }

  p.draw = function () {
    if (p.frameCount % 60 == 0) {
      print(p.frameRate());
      defaultShader = p.loadShader(name + ("/default.frag"), name + ("/default.vert"));
      p.shader(defaultShader);
    }
    let viewMatrix = new Packages.processing.core.PMatrix3D(
      0.5, 0.0, 0.0, 0.5,
      0.0, 0.5, 0.0, 0.5,
      0.0, 0.0, 0.5, 0.5,
      0.0, 0.0, 0.0, 1.0
    );
    let cameraPosition = {x: 0.0, y: -200.0, z: 150.0};
    viewMatrix.translate(cameraPosition.x, cameraPosition.y, cameraPosition.z);
    defaultShader.set("viewMatrix", new Packages.processing.core.PMatrix3D(
      viewMatrix.m00, viewMatrix.m10, viewMatrix.m20, viewMatrix.m30,
      viewMatrix.m01, viewMatrix.m11, viewMatrix.m21, viewMatrix.m31,
      viewMatrix.m02, viewMatrix.m12, viewMatrix.m22, viewMatrix.m32,
      viewMatrix.m03, viewMatrix.m13, viewMatrix.m23, viewMatrix.m33
    ));
    let modelviewInv = p.g.modelviewInv;
    defaultShader.set("modelviewInv", new Packages.processing.core.PMatrix3D(
      modelviewInv.m00, modelviewInv.m10, modelviewInv.m20, modelviewInv.m30,
      modelviewInv.m01, modelviewInv.m11, modelviewInv.m21, modelviewInv.m31,
      modelviewInv.m02, modelviewInv.m12, modelviewInv.m22, modelviewInv.m32,
      modelviewInv.m03, modelviewInv.m13, modelviewInv.m23, modelviewInv.m33
    ));

    p.camera(cameraPosition.x, cameraPosition.y, cameraPosition.z, 0.0, 0.0, 0, 0, 1, 0);
    p.background(0);

    var lightAngle = p.frameCount * 0.02;
    lightPos.set(10 * Math.cos(lightAngle), -13, 10 * Math.sin(lightAngle));

    // Render shadow pass
    shadowMap.beginDraw();
    shadowMap.camera(lightPos.x, lightPos.y, lightPos.z, lightDirection.x-lightPos.x, lightDirection.y-lightPos.y, lightDirection.z-lightPos.z, 0, 1, 0);
    shadowMap.background(255, 255, 255, 255); // Will set the depth to 1.0 (maximum depth)
    renderLandscape(shadowMap);
    shadowMap.endDraw();
    // shadowMap.updatePixels();

    // Update the shadow transformation matrix and send it, the light
    // direction normal and the shadow map to the default shader.
    updateDefaultShader();

    // Render default pass
    p.background(34, 34, 34, 255);
    p.noStroke();
    renderLandscape(p.g, defaultShader);

    // Render light source
    p.pushMatrix();
    p.fill(255, 255, 255, 255);
    p.translate(lightPos.x, lightPos.y, lightPos.z);
    p.popMatrix();
  }

};

var p056 = new p5(s);