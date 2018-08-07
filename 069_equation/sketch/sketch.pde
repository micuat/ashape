/**
 * 
 * PixelFlow | Copyright (C) 2016 Thomas Diewald - http://thomasdiewald.com
 * 
 * A Processing/Java library for high performance GPU-Computing (GLSL).
 * MIT License: https://opensource.org/licenses/MIT
 * 
 */




import com.thomasdiewald.pixelflow.java.DwPixelFlow;
import com.thomasdiewald.pixelflow.java.fluid.DwFluid2D;
import com.thomasdiewald.pixelflow.java.dwgl.DwGLSLProgram;

import processing.core.*;
import processing.opengl.PGraphics2D;

private class MyFluidData implements DwFluid2D.FluidData {

  // update() is called during the fluid-simulation update step.
  @Override
    public void update(DwFluid2D fluid) {

    float px, py, radius, r, g, b, intensity, temperature;

    // add impulse: density + temperature
    intensity = 2.0f;
    px = 1*width/2;
    py = height/2-50;
    radius = min(t % 8.0, 1.0) * 50;
    r = 0.0f;
    g = 0.3f;
    b = 1.0f;

    //if ((fluid.simulation_step) % 200 < 2 && t % 8.0 > 4.0) {
    if (2.0 <= t % 8.0 && t % 8.0 < 6.5) {
      fluid.addDensity(px, py, radius, r, g, b, intensity);
      temperature = 50f;
      fluid.addTemperature(px, py, radius, temperature);
    }

    // add impulse: density + temperature
    float animator = sin(fluid.simulation_step*0.01f);

    intensity = 2.0f;
    px = 1*width/2f;
    py = height/2f+50;
    radius = min(t % 8.0, 1.0) * 50;
    r = 1.0f;
    g = 0.0f;
    b = 0.3f;

    temperature = animator * 50f;
    //fluid.addTemperature(px, py, radius, temperature);
    //if ((fluid.simulation_step+100) % 200 < 2 && t % 8.0 > 4.0) {
    if (2.0 <= t % 8.0 && t % 8.0 < 6.5) {
      fluid.addDensity(px, py, radius, r, g, b, intensity);
      temperature = -50f;
      fluid.addTemperature(px, py, radius, temperature);
    }
  }
}


int viewport_w = 800;
int viewport_h = 800;
int fluidgrid_scale = 2;

int gui_w = 200;
int gui_x = 20;
int gui_y = 20;

DwFluid2D fluid;

//texture-buffer, for adding obstacles
PGraphics2D pg_obstacles;

// some state variables for the GUI/display
int     BACKGROUND_COLOR           = 0;
boolean UPDATE_FLUID               = true;
boolean DISPLAY_FLUID_TEXTURES     = true;
boolean DISPLAY_FLUID_VECTORS      = false;
int     DISPLAY_fluid_texture_mode = 0;

DwGLSLProgram shader;
DwPixelFlow context;

float[][] randThisSequence = new float[8][8];
float t = 0.0;

PFont font;

public void settings() {
  size(viewport_w, viewport_h, P2D);
  smooth(2);
}

public void setup() {
  font = createFont("../../assets/Avenir.otf", 60);
  // main library context
  DwPixelFlow context = new DwPixelFlow(this);
  context.print();
  context.printGL();

  // fluid simulation
  fluid = new DwFluid2D(context, viewport_w, viewport_h, fluidgrid_scale);

  // set some simulation parameters
  fluid.param.dissipation_density     = 0.999f;
  fluid.param.dissipation_velocity    = 0.99f;
  fluid.param.dissipation_temperature = 0.80f;
  fluid.param.vorticity               = 0.10f;

  // interface for adding data to the fluid simulation
  MyFluidData cb_fluid_data = new MyFluidData();
  fluid.addCallback_FluiData(cb_fluid_data);

  // pgraphics for obstacles
  pg_obstacles = (PGraphics2D) createGraphics(viewport_w, viewport_h, P2D);
  pg_obstacles.smooth(0);
  pg_obstacles.beginDraw();
  pg_obstacles.clear();
  pg_obstacles.endDraw();

  this.context = context;
  shader = context.createShader(dataPath("frag.glsl"));
  frameRate(30);
}



public void draw() {
  if (frameCount % 60 == 0) {
    println(frameRate);
    //shader = context.createShader(shader, dataPath("frag.glsl"));
  }

  //float t = millis() * 0.001;
  t = frameCount / 30.0;

  int mode = floor(random(3.0));
  if (t % 8.0 == 0.0) {
    for (int i = 0; i < 8; i++) {
      for (int j = 0; j < 8; j++) {
        if (mode == 0)
          randThisSequence[i][j] = random(1.0);
        else if (mode == 1)
          randThisSequence[i][j] = i % 2;
        else if (mode == 2)
          randThisSequence[i][j] = (i / 2) % 2;
      }
    }
  }

  if (t % 8.0 < 2.0) {
    fluid.param.dissipation_density     = 0.25f;
    fluid.param.dissipation_velocity    = 0.0f;
    fluid.param.dissipation_temperature = 0.25f;
  } else if (t % 8.0 < 7.0) {
    fluid.param.dissipation_density     = 0.9999f;
    fluid.param.dissipation_velocity    = 0.9999f;
    fluid.param.dissipation_temperature = 0.990f;
  } else if (t % 8.0 < 7.25) {
    fluid.param.dissipation_density     = 0.9999f;
    fluid.param.dissipation_velocity    = 0.5f;
    fluid.param.dissipation_temperature = 0.80f;
  } else {
    fluid.param.dissipation_density     = 0.9999f;
    fluid.param.dissipation_velocity    = 0.0f;
    fluid.param.dissipation_temperature = 0.80f;
  }

  // obstacle
  pg_obstacles.beginDraw();
  pg_obstacles.clear();
  pg_obstacles.noStroke();
  pg_obstacles.fill(255);

  for (int i = 0; i < 8; i++) {
    for (int j = 0; j < 8; j++) {
      if (3 <= i && i <= 5 && 3 <= j && j <= 5) {
        continue;
      }
      pg_obstacles.pushMatrix();
      pg_obstacles.translate(j * 100, i * 100);
      pg_obstacles.rectMode(CENTER);
      pg_obstacles.rotate(PI * 0.25);
      if (randThisSequence[i][j] > 0.5) pg_obstacles.rotate(PI * 0.5);
      float tt = t % 8.0;
      if (t % 8.0 > 4.0) tt = 4.0;
      if ((tt / 4.0) % 2.0 < 1.0)
        pg_obstacles.rotate(pow((tt / 4.0) % 1.0, 2.0) * PI * 2.0);
      float w = 1.41 * 100 * pow(constrain((tt / 4.0) % 2.0, 0, 1), 4.0);
      if (t % 8.0 > 7.0) w = 1.41 * 100 * map(t % 8.0, 7.0, 8.0, 1.0, 0.0);
      pg_obstacles.rect(0, 0, w, 4);
      pg_obstacles.popMatrix();
    }
  }

  //if (t % 8.0 < 4.0) {
  //  pg_obstacles.textFont(font, 45);
  //  float alpha;
  //  if (t % 4.0 < 1.0) alpha = map(t % 4.0, 0, 1, 0, 1);
  //  else if (t % 4.0 < 3.0) alpha = 1.0;
  //  else alpha = map(t % 4.0, 3, 4, 1, 0);

  //  pg_obstacles.fill(255, 255 * alpha);
  //  pg_obstacles.textAlign(CENTER, CENTER);
  //  pg_obstacles.translate(400, 400);
  //  pg_obstacles.text("Structures as the apparatus that", 0, -30);
  //  pg_obstacles.text("allow the thought to form", 0, 30);
  //}

  pg_obstacles.endDraw();

  // update simulation
  if (UPDATE_FLUID) {
    fluid.addObstacles(pg_obstacles);
    fluid.update();
  }

  background(0);

  context.begin();
  shader.begin();
  Texture tex_obstacles = pg_obstacles.getTexture();
  shader.uniformTexture("u_depth", fluid.tex_density.src);
  shader.uniformTexture("u_obstacle", tex_obstacles.glName);
  shader.uniform1f("iTime", t);
  shader.drawFullScreenQuad();
  shader.end();
  context.endDraw();
  context.end("Fluid.renderFluidTextures");

  if (frameCount % 15 == 0) {
    //saveFrame("capture/record-######.png");
  }
}
