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
    intensity = 1.0f;
    px = 1*width/3;
    py = 0;
    radius = 200;
    r = 0.0f;
    g = 0.3f;
    b = 1.0f;
    fluid.addDensity(px, py, radius, r, g, b, intensity);

    if ((fluid.simulation_step) % 200 < 2) {
      temperature = 30f;
      fluid.addTemperature(px, py, radius, temperature);
    }

    // add impulse: density + temperature
    float animator = sin(fluid.simulation_step*0.01f);

    intensity = 1.0f;
    px = 2*width/3f;
    py = 150;
    radius = 50;
    r = 1.0f;
    g = 0.0f;
    b = 0.3f;
    fluid.addDensity(px, py, radius, r, g, b, intensity);

    temperature = animator * 50f;
    fluid.addTemperature(px, py, radius, temperature);
  }
}


int viewport_w = 1080;//800;
int viewport_h = 1920;//800;
int fluidgrid_scale = 1;

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

public void settings() {
  size(viewport_w, viewport_h, P2D);
  smooth(2);
}

public void setup() {

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
    //shader = context.createShader(shader, dataPath("frag.glsl"));
  }


  float t = millis() * 0.001;

  // obstacle
  pg_obstacles.beginDraw();
  pg_obstacles.clear();
  // circle-obstacles
  pg_obstacles.noStroke();
  pg_obstacles.fill(64);
  float radius, r;
  radius = 150;
  float y = (t) % 4;
  y = 1;

  if(y < 2) {
    if(y < 1) y = 1 - y;
    if(y >= 1) y = y - 1;
    r = radius * sqrt(1.0 - y * y);
    pg_obstacles.ellipse(2*width/3f, 2*height/4f, r, r);
    radius = 200;
    r = radius * sqrt(1.0 - y * y);
    pg_obstacles.ellipse(1*width/3f, 1*height/4f, r, r);
  }
  else {
    
  }
  // border-obstacle
  pg_obstacles.strokeWeight(20);
  pg_obstacles.stroke(64);
  pg_obstacles.noFill();
  pg_obstacles.rect(0, 0, pg_obstacles.width, pg_obstacles.height);
  pg_obstacles.endDraw();

  
  // update simulation
  if (UPDATE_FLUID) {
    fluid.addObstacles(pg_obstacles);
    fluid.update();
  }

  background(0);

  context.begin();
  shader.begin();
  shader.uniformTexture("u_depth", fluid.tex_density    .src);
  shader.uniform1f("iTime", t);
  shader.drawFullScreenQuad();
  shader.end();
  context.endDraw();
  context.end("Fluid.renderFluidTextures");
  
  saveFrame("capture/record-######.png");
}