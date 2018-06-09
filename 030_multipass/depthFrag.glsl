#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif
 
uniform vec4 nearColor = vec4(1.0, 1.0, 1.0, 1.0);
uniform vec4 farColor = vec4(0.0, 0.0, 0.0, 1.0);
uniform float near = 0.0;
uniform float far = 1000.0;
 
varying vec4 vertColor;
varying vec4 vertPos;

varying vec4 vertTexCoord;

void main() {
    float col = mix(nearColor.r, farColor.r, smoothstep(near, far, gl_FragCoord.z / gl_FragCoord.w));
    //gl_FragColor = vec4(col, fract(col*256), fract(col*256*256), 1.0);
    gl_FragColor = vec4(col, (vertTexCoord.xy*1)+vec2(0.0), vertColor.r);
}