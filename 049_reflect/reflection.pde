import peasy.*;
import peasy.org.apache.commons.math.*;
import peasy.org.apache.commons.math.geometry.*;

import java.nio.IntBuffer;

PShader cubemapShader, cubemapbackShader;
PShape mesh, meshb;
PeasyCam cam;

void setup() {
  size(800, 800, P3D);
  cam = new PeasyCam(this, 300);

  PGL pgl = beginPGL();
  // create the OpenGL-based cubeMap
  IntBuffer envMapTextureID = IntBuffer.allocate(1);
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
  String cubemapName = "cubemap_texture";
  IntBuffer glTextureId = IntBuffer.allocate(1);

  String[] textureNames = { "posx.jpg", "negx.jpg", "posy.jpg", "negy.jpg", "posz.jpg", "negz.jpg" };
  PImage[] textures = new PImage[textureNames.length];
  for (int i=0; i<textures.length; i++) {
    textures[i] = loadImage("Storforsen/" + textureNames[i]);

    //Uncomment this for smoother reflections. This downsamples the textures
    // textures[i].resize(20,20);
  }

  // put the textures in the cubeMap
  for (int i=0; i<textures.length; i++) {
    int w = textures[i].width;
    int h = textures[i].height;
    textures[i].loadPixels();
    int[] pix = textures[i].pixels;
    pgl.texImage2D(PGL.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, PGL.RGBA, w, h, 0, PGL.RGBA, PGL.UNSIGNED_BYTE, java.nio.IntBuffer.wrap(pix));
  }

  endPGL();

  // Load cubemap shader.
  cubemapShader = loadShader("cubemap.frag", "cubemap.vert");
  cubemapShader.set("cubemap", 1);

  cubemapbackShader = loadShader("cubemapback.frag", "cubemapback.vert");
  cubemapbackShader.set("cubemap", 1);

  mesh = createShape(SPHERE, 100);
  mesh.disableStyle();
  meshb = createShape(BOX, 1000);
  meshb.disableStyle();
}

void draw() {
  background(0);
  rotateY(frameCount * 0.01);
  shader(cubemapbackShader);
  fill(255);
  noStroke();
  shape(meshb);

  //shader(cubemapShader);
  //mesh is a PShape object
  shape(mesh);
  resetShader();
}