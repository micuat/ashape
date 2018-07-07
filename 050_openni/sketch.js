if (context == undefined) {
  var context = null;
}

var doLoadShader = false;
var cubemapShader, cubemapbackShader, textures;

var s = function (p) {

  let zoomF = 0.3;
  let rotX = p.radians(180);  // by default rotate the hole scene 180deg around the x-axis, 
  // the data from openni comes upside down
  let rotY = p.radians(0);
  let points, normals;
  let mesh, meshb;
  let cam;
  let zDefault = 700.0;

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
        textures[i] = p.loadImage("assets" + "/Storforsen/" + textureNames[i]);

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
  }

  p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(30);

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

    points = new Array(context.depthWidth() * context.depthHeight());
    normals = new Array(context.depthWidth() * context.depthHeight());
    for (let i = 0; i < points.length; i++) {
      points[i] = zDefault;
      normals[i] = {x: 0, y: 0, z: 10.0};
    }

    cam = new Packages.peasy.PeasyCam(pApplet.that, 300);
    if(doLoadShader)
      loadShader();
    // Load cubemap shader.
    cubemapShader = p.loadShader("assets" + "/cubemap.frag", "assets" + "/cubemap.vert");
    cubemapShader.set("cubemap", 1);

    cubemapbackShader = p.loadShader("assets" + "/cubemapback.frag", "assets" + "/cubemapback.vert");
    cubemapbackShader.set("cubemap", 1);

    meshb = p.createShape(p.BOX, 3000);
    meshb.disableStyle();
  }

  p.draw = function () {
    p.perspective(p.radians(12),
      parseFloat(p.width) / parseFloat(p.height),
      10, 150000);
    // update the cam
    context.update();

    p.background(0, 0, 0);

    // p.shader(cubemapbackShader);
    // p.fill(255);
    // p.noStroke();
    // p.shape(meshb);
  
    p.shader(cubemapShader);

    cubemapShader.set("uLightColor", 1.0, 1.0, 1.0);
    cubemapShader.set("uBaseColor", 0.75, 0.75, 0.75);

    cubemapShader.set("uRoughness", 0.02);
    cubemapShader.set("uMetallic", 0.97);
    cubemapShader.set("uSpecular", 0.5);
    cubemapShader.set("uLightRadius", 100.0);
    cubemapShader.set("uExposure", 30.0);
    cubemapShader.set("uGamma", 2.0);

    cubemapShader.set("vLightPosition", 0, 100, 100);

    p.push();
    // p.translate(p.width / 2, p.height / 2, 0);
    p.rotateX(rotX);
    p.scale(zoomF);

    let depthMap = context.depthMap();
    let steps = 7;  // to speed up the drawing, draw every third point
    let xOffset = 80;
    let index;
    let realWorldPoint;

    p.translate(0, 0, 500);  // set the rotation center of the scene 1000 infront of the camera
    // p.rotateY(p.millis() * 0.0002);
    p.noStroke();
    // p.stroke(0);

    let realWorldMap = context.depthMapRealWorld();
    let h = context.depthHeight();
    let w = context.depthWidth();
    for (let y = steps; y < h - steps; y += steps) {
      for (let x = xOffset; x < w - xOffset; x += steps) {
        index = x + y * w;
        let zTarget = zDefault;
        let found = false;
        for(let i = 0; i < steps; i+=2) {
          for(let j = 0; j < steps; j+=2) {
            if (depthMap[index - i * w - j] > 0 && depthMap[index - i * w - j] < zDefault) {
              points[index] = p.lerp(points[index], depthMap[index - i * w - j], 0.05);
              found = true;
              break;
            }
          }
        }
        if (!found) {
          points[index] = p.lerp(points[index], zTarget, 0.05);
        }
      }
    }
    for (let y = steps; y < h - steps; y += steps) {
      for (let x = xOffset; x < w - xOffset; x += steps) {
        index = x + y * w;
        normals[index].x = -(points[index - steps] - points[index]);
        normals[index].y = -(points[index + steps * w] - points[index]);
      }
    }
    // draw pointcloud
    mesh = p.createShape();

    p.fill(255);
    p.scale(1, -1);
    p.translate(-w / 2, -h / 2);

    function setNormal (vec) {
      mesh.normal(vec.x, vec.y, vec.z);
    }
    for (let y = steps; y < h - steps; y += steps) {
      mesh.beginShape(p.TRIANGLE_STRIP);
      for (let x = xOffset; x < w - xOffset; x += steps) {
        index = x + y * w;
        mesh.vertex(x, y, points[index]);  // make realworld z negative, in the 3d drawing coordsystem +z points in the direction of the eye
        setNormal(normals[index]);
        mesh.vertex(x, y + steps, points[index + steps * w]);  // make realworld z negative, in the 3d drawing coordsystem +z points in the direction of the eye
        setNormal(normals[index + steps * w]);

        // mesh.vertex(x + steps, y, points[index + steps]);  // make realworld z negative, in the 3d drawing coordsystem +z points in the direction of the eye
        // setNormal(normals[index + steps]);
        // mesh.vertex(x + steps, y + steps, points[index + steps * w + steps]);  // make realworld z negative, in the 3d drawing coordsystem +z points in the direction of the eye
        // setNormal(normals[index + steps * w + steps]);
      }
      mesh.endShape();
    }
    mesh.disableStyle();
    p.shape(mesh);
    p.pop();
    p.resetShader();
    // draw the kinect cam
    // context.drawCamFrustum();
  }
};

var p049 = new p5(s);