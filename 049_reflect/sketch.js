var s = function (p) {
  let name;
  let cubemapShader, cubemapbackShader;
  let mesh, meshb
  let cam;

  p.setup = function () {
    name = p.folderName;

    cam = new Packages.peasy.PeasyCam(pApplet.that, 300);

    p.createCanvas(800, 800);
    p.frameRate(30);

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
    let textures = new Array(textureNames.length);
    for (let i = 0; i < textures.length; i++) {
      textures[i] = p.loadImage(name + "/Storforsen/" + textureNames[i]);

      //Uncomment this for smoother reflections. This downsamples the textures
      // textures[i].resize(20,20);
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

    mesh = p.createShape(p.SPHERE, 100);
    mesh.disableStyle();
    meshb = p.createShape(p.BOX, 1000);
    meshb.disableStyle();

  }

  function updateDefaultShader() {
    defaultShader.set("uSpecular", 0.99);
    defaultShader.set("uLightRadius", 500.0);
    defaultShader.set("uExposure", 2.0);
    defaultShader.set("uGamma", 0.6);

    defaultShader.set("vLightPosition", lightPos.x, lightPos.y, lightPos.z);

    // Send the shadowmap to the default shader
    defaultShader.set("shadowMap", shadowMap);
  }


  p.draw = function () {
    p.background(0);
    p.rotateY(p.frameCount * 0.01);
    p.shader(cubemapbackShader);
    p.fill(255);
    p.noStroke();
    p.shape(meshb);
  
    //shader(cubemapShader);
    //mesh is a PShape object
    p.shape(mesh);
    p.resetShader();
  }

};

var p049 = new p5(s);