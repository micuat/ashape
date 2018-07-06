// var doLoadShader = true;
var cubemapShader, cubemapbackShader, textures;

var s = function (p) {
  let name;
  let mesh, meshb
  let cam;

  function loadShader() {
    let PGL = Packages.processing.opengl.PGL;
    let pgl = p.beginPGL();
    // create the OpenGL-based cubeMap
    let IntBuffer = Packages.java.nio.IntBuffer;
    let envMapTextureID = IntBuffer.allocate(1);
    pgl.genTextures(1, envMapTextureID);
    pgl.activeTexture(PGL.TEXTURE1);
    pgl.enable(PGL.TEXTURE_CUBE_MAP);
    pgl.bindTexture(PGL.TEXTURE_CUBE_MAP, envMapTextureID.get(0));
    pgl.texParameteri(PGL.TEXTURE_CUBE_MAP, PGL.TEXTURE_WRAP_S, PGL.CLAMP_TO_EDGE);
    pgl.texParameteri(PGL.TEXTURE_CUBE_MAP, PGL.TEXTURE_WRAP_T, PGL.CLAMP_TO_EDGE);
    pgl.texParameteri(PGL.TEXTURE_CUBE_MAP, PGL.TEXTURE_WRAP_R, PGL.CLAMP_TO_EDGE);
    pgl.texParameteri(PGL.TEXTURE_CUBE_MAP, PGL.TEXTURE_MIN_FILTER, PGL.LINEAR);
    pgl.texParameteri(PGL.TEXTURE_CUBE_MAP, PGL.TEXTURE_MAG_FILTER, PGL.LINEAR);


    //Load in textures
    let cubemapName = "cubemap_texture";
    let glTextureId = IntBuffer.allocate(1);

    let textureNames = ["posx.jpg", "negx.jpg", "posy.jpg", "negy.jpg", "posz.jpg", "negz.jpg"];
    if(textures == undefined) {
      textures = new Array(textureNames.length);
      for (let i = 0; i < textures.length; i++) {
        textures[i] = p.loadImage(name + "/Storforsen/" + textureNames[i]);

        //Uncomment this for smoother reflections. This downsamples the textures
        // textures[i].resize(20,20);
      }
    }

    // put the textures in the cubeMap
    for (let i = 0; i < textures.length; i++) {
      let w = textures[i].width;
      let h = textures[i].height;
      textures[i].loadPixels();
      let pix = textures[i].pixels;
      pgl.texImage2D(PGL.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, PGL.RGBA, w, h, 0, PGL.RGBA, PGL.UNSIGNED_BYTE, IntBuffer.wrap(pix));
    }

    p.endPGL();

    // Load cubemap shader.
    cubemapShader = p.loadShader(name + "/cubemap.frag", name + "/cubemap.vert");
    cubemapShader.set("cubemap", 1);

    cubemapbackShader = p.loadShader(name + "/cubemapback.frag", name + "/cubemapback.vert");
    cubemapbackShader.set("cubemap", 1);
  }

  p.setup = function () {
    name = p.folderName;

    cam = new Packages.peasy.PeasyCam(pApplet.that, 300);

    p.createCanvas(800, 800);
    p.frameRate(30);

    //if(doLoadShader)
    loadShader();

    meshb = p.createShape(p.BOX, 1000);
    meshb.disableStyle();

  }

  p.draw = function () {
    p.background(0);
    p.rotateY(p.frameCount * 0.01);
    p.shader(cubemapbackShader);
    p.fill(255);
    p.noStroke();
    p.shape(meshb);
  
    p.shader(cubemapShader);

    cubemapShader.set("uLightColor", 1.0, 1.0, 1.0);
    cubemapShader.set("uBaseColor", 0.5, 0.0, 0.0);

    cubemapShader.set("uSpecular", 0.99);
    cubemapShader.set("uLightRadius", 500.0);
    cubemapShader.set("uExposure", 2.0);
    cubemapShader.set("uGamma", 0.6);

    cubemapShader.set("vLightPosition", 0, 100, 0);

    mesh = p.createShape();
    let m = 24.0;
    let t = p.millis() * 0.001;
    let rn = 100 * p.pow(p.map(Math.sin(0.5 * t * Math.PI), -1, 1, 0, 1), 2.0);
    for(let i = 0; i < m; i++) {
      mesh.beginShape(p.TRIANGLE_STRIP);

      let n = 24.0;
      for(let j = 0; j <= n + 1; j++) {
        let r = 100.0;
        let rho = i / m * 1.0 * Math.PI;
        let phi = j / n * 2.0 * Math.PI;
        let x = Math.cos(phi) * Math.sin(rho);
        let y = Math.cos(rho);
        let z = Math.sin(phi) * Math.sin(rho);
        r += p.noise(x * 2, y * 2, t) * rn - rn * 0.5;
        x *= r;
        y *= r;
        z *= r;
        // mesh.normal(x, y, 0);
        mesh.vertex(x, y, z);

        r = 100.0;
        rho = (i + 1) / m * 1.0 * Math.PI;
        x = Math.cos(phi) * Math.sin(rho);
        y = Math.cos(rho);
        z = Math.sin(phi) * Math.sin(rho);
        r += p.noise(x * 2, y * 2, t) * rn - rn * 0.5;
        x *= r;
        y *= r;
        z *= r;
        // mesh.normal(x, 0, z);
        mesh.vertex(x, y, z);
      }

      mesh.endShape();
    }
    mesh.disableStyle();
    p.shape(mesh);
    p.resetShader();
  }

};

var p049 = new p5(s);