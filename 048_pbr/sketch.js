// instance mode by Naoto Hieda

var lightDir;
var defaultShader;
var shadowMap;
var pgColor;

var s = function (p) {
  let name;
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
    lightDir = p.createVector();
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
    let lightNormalX = lightDir.x * modelviewInv.m00 + lightDir.y * modelviewInv.m10 + lightDir.z * modelviewInv.m20;
    let lightNormalY = lightDir.x * modelviewInv.m01 + lightDir.y * modelviewInv.m11 + lightDir.z * modelviewInv.m21;
    let lightNormalZ = lightDir.x * modelviewInv.m02 + lightDir.y * modelviewInv.m12 + lightDir.z * modelviewInv.m22;
    let normalLength = Math.sqrt(lightNormalX * lightNormalX + lightNormalY * lightNormalY + lightNormalZ * lightNormalZ);
    defaultShader.set("lightDirection", lightNormalX / -normalLength, lightNormalY / -normalLength, lightNormalZ / -normalLength);
    defaultShader.set("uLightColor", 1.0, 1.0, 1.0);
    defaultShader.set("uBaseColor", 0.5, 0.0, 0.0);

    defaultShader.set("uSpecular", 0.99);
    defaultShader.set("uLightRadius", 500.0);
    defaultShader.set("uExposure", 2.0);
    defaultShader.set("uGamma", 0.6);

    defaultShader.set("vLightPosition", lightDir.x, lightDir.y, lightDir.z);

    // Send the shadowmap to the default shader
    defaultShader.set("shadowMap", shadowMap);
  }

  function renderLandscape(canvas, shader) {
    canvas.pushMatrix();
    let offset = -p.frameCount * 0.01;
    let n = 4.0;
    if(shader != undefined) {
    }
    for (let x = -n; x <= n; ++x) {
      for (let z = -n; z <= n; ++z) {
        if(shader != undefined) {
          shader.set("uRoughness", Math.sin(z * 0.1 + p.millis() * 0.01) * 0.25 + 0.5);
        }
        canvas.fill(z*0.5/n*120.0+120.0, x*0.5/n*120.0+120.0, 0, 255);
        canvas.pushMatrix();
        let y = Math.sin(x * 1.75 + z * 0.1 - offset * 5);
        y = 30*Math.pow(y, 128.0);
        canvas.translate(x * 24, -y-12, z * 24);
        canvas.sphere(12);
        canvas.popMatrix();
      }
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
    lightDir.set(100 * Math.cos(lightAngle), -100, 100 * Math.sin(lightAngle));

    // Render shadow pass
    shadowMap.beginDraw();
    shadowMap.camera(lightDir.x, lightDir.y, lightDir.z, 0, 0, 0, 0, 1, 0);
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
    p.translate(lightDir.x, lightDir.y, lightDir.z);
    p.popMatrix();
  }

};

var p046 = new p5(s);