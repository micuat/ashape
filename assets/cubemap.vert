uniform mat4 transform; 
uniform mat4 modelview; 
uniform mat3 normalMatrix; 

attribute vec4 vertex; 
attribute vec4 color; 
attribute vec3 normal; 

varying vec4 vertColor;
varying vec3 vNormal;
varying vec3 vPosition;
varying float lightIntensity;
varying vec3 vertOrg;

varying vec3 reflectDir;

void main() {
  vec3 lightDirection = vec3(0, 1, 0);
  vertColor = color;
  vec4 vPosition4 = modelview * vertex; // Get vertex position in model view space
  vNormal = normalize(normalMatrix * normal); // Get normal direction in model view space
  lightIntensity = 0.5 + dot(-lightDirection, vNormal) * 0.75; 
  gl_Position = transform * vertex;
  vPosition = gl_Position.xyz / gl_Position.w;
  vertOrg = vertex.xyz;

  vec3 ecNormal = normalize(vec3(vec4(normal, 1.0))); // Vertex in eye coordinates
  vec3 ecVertex = vec3(vertex); // Normal vector in eye coordinates
  vec3 eyeDir = ecVertex.xyz;
  reflectDir = reflect(eyeDir, ecNormal);
}
