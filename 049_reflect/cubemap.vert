uniform mat4 transform;
uniform mat4 modelview;
uniform mat3 normalMatrix;

attribute vec4 vertex;
attribute vec3 normal;

varying vec3 reflectDir;

void main() {
  gl_Position = transform * vertex;
  
  mat4 inv = inverse(modelview);
  vec3 ecNormal = normalize(vec3(vec4(normal, 1.0))); // Vertex in eye coordinates
  vec3 ecVertex = vec3(vertex); // Normal vector in eye coordinates
  vec3 eyeDir = ecVertex.xyz;
  reflectDir = reflect(eyeDir, ecNormal);
}
