uniform mat4 transform;
uniform mat4 texMatrix;

attribute vec4 vertex;
attribute vec4 color;
attribute vec2 texCoord;

varying vec4 vertTexCoord;

varying vec4 vertColor;
varying vec4 vertPos;
 
void main() {
    gl_Position = transform * vertex;
    vertColor = color;
    vertPos = vertex;
    vertTexCoord = texMatrix * vec4(texCoord, 1.0, 1.0);
}