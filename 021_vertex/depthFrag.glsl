#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif
 
uniform vec4 nearColor = vec4(1.0, 1.0, 1.0, 1.0);
uniform vec4 farColor = vec4(0.0, 0.0, 0.0, 1.0);
uniform float near = -700.0;
uniform float far = 700.0;
 
varying vec4 vertColor;
 
void main() {
    vec4 col = mix(nearColor, farColor, smoothstep(near, far, gl_FragCoord.z / gl_FragCoord.w));
    gl_FragColor = vec4(vertColor.r, col.gba);
}