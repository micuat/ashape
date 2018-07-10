// instance mode by Naoto Hieda

var lightDir;
var defaultShader;
var shadowMap;
var pgColor;
var cam;

var s = function (p) {
  let name;
  let n = 16 + 1;
  let currents = [];
  function initShadowPass() {
    shadowMap = p.createGraphics(2048, 2048, p.P3D);
    shadowMap.noSmooth(); // Antialiasing on the shadowMap leads to weird artifacts
    //shadowMap.loadPixels(); // Will interfere with noSmooth() (probably a bug in Processing)
    shadowMap.beginDraw();
    shadowMap.noStroke();
    shadowMap.shader(p.loadShader(name + ("/shadow.frag"), name + ("/shadow.vert")));
    shadowMap.ortho(-200, 200, -200, 200, 10, 2000); // Setup orthogonal view matrix for the directional light
    shadowMap.endDraw();
  }

  function initDefaultPass() {
    defaultShader = p.loadShader(name + ("/default.frag"), name + ("/default.vert"));
    p.shader(defaultShader);
    p.noStroke();
    p.perspective(60.0 / 180 * Math.PI, parseFloat(p.width) / p.height, 10, 2000);
  }

  p.setup = function () {
    name = p.folderName;

    p.createCanvas(800, 800);
    p.frameRate(30);

    initShadowPass();
    initDefaultPass();
    // p.camera(0.0, 200.0, 200.0, 0.0, 0.0, 0, 0, -1, 0);
    lightDir = p.createVector();
    if(cam == null)
      cam = new Packages.peasy.PeasyCam(pApplet.that, 500);
    for(let k = 0; k < 20; k++) {
      currents.push(p.floor(p.random(n * n)));
    }
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

    defaultShader.set("vLightPosition", lightDir.x, lightDir.y, lightDir.z);

    // Send the shadowmap to the default shader
    defaultShader.set("shadowMap", shadowMap);
  }

  function renderLandscape(canvas) {
    let theta = p.frameCount / 30.0 * 0.25 * 2 * Math.PI;
    for(let i = 0; i < n; i++) {
      for(let j = 0; j < n; j++) {
        let l = 20 / 2.0;
        let hl = l * 0.5;
        canvas.pushMatrix();
        canvas.translate((j + 0) * l, (i + 0) * l);

        for(let k in currents) {
          if(i * n + j == currents[k]) {
            // l *= 1.0 - p.pow(1.0 - p.map(Math.cos(theta), -1, 1, 0, 1), 4.0);
            canvas.rotateZ(p.pow((theta % Math.PI) / Math.PI, 4.0) * Math.PI * 0.5);
            break;
          }
        }

        let t = 0.5;
        canvas.box(l, t, t);
        canvas.box(t, l, t);
        canvas.popMatrix();
      }
    }
    canvas.fill(100, 255);
    canvas.box(600, 5, 600);
  }

  p.draw = function () {
    if(p.frameCount % 120 == 0) {
      // print(p.frameRate());
      currents = [];
      for(let k = 0; k < 20; k++) {
        currents.push(p.floor(p.random(n * n)));
      }
    }
    
    p.background(0);

    var lightAngle = Math.PI *0.1;//p.frameCount * 0.02;
    lightDir.set(Math.sin(lightAngle) * 160, 160, Math.cos(lightAngle) * 160);

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
    p.background(90, 255);
    p.noStroke();
    renderLandscape(p.g);

    // Render light source
    p.pushMatrix();
    p.fill(255, 255, 255, 255);
    p.translate(lightDir.x, lightDir.y, lightDir.z);
    // p.box(5);
    p.popMatrix();
  }

};

var p053 = new p5(s);