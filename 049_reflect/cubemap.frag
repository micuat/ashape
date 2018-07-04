uniform samplerCube cubemap;
varying vec3 reflectDir;

void main() {
  vec3 color = vec3(textureCube(cubemap, vec3(reflectDir.x, -reflectDir.y, reflectDir.z)));
  gl_FragColor = vec4(color, 1.0);      
}
