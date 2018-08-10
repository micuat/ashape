// https://www.shadertoy.com/view/4llGWM

#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

varying vec3 vertNormal;
varying vec3 vertLightDir;
varying vec4 vertColor;
varying vec4 vertTexCoord;

uniform float iTime;

uniform sampler2D texture;
uniform sampler2D frontTex;
uniform sampler2D backTex;

float PI = 3.14159265359;

void main() {
    vec2 fragCoord = vertTexCoord.st;
	vec2 nFragCoord = fragCoord.st - vec2(0.5);

	vec4 frontCol = texture(frontTex, fragCoord);
	vec4 backCol = texture(backTex, fragCoord);
	vec4 finalColor = mix(backCol, frontCol, 0.5);
	gl_FragColor = finalColor;
}
