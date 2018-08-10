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
uniform float vMirror;
uniform float centerDirection;
uniform vec3 bgColor;

uniform sampler2D texture;
uniform sampler2D pgTex;
uniform sampler2D waveTex;
uniform sampler2D backTex;

float PI = 3.14159265359;

void main() {
    vec2 fragCoord = vertTexCoord.st;
	// if(vMirror > 0.5 && fragCoord.t > 0.5) {
	// 	fragCoord.t = 1.0 - fragCoord.t;
	// }
	vec2 nFragCoord = fragCoord.st - vec2(0.5);

	vec4 pgCol = texture(pgTex, fragCoord);
	vec4 backCol = texture(backTex, nFragCoord * centerDirection + vec2(0.5));

	float lfc = length(nFragCoord);
	float afc = atan(nFragCoord.t, nFragCoord.s) / 2.0 - 0.05 * iTime;
	// afc = afc - floor(afc);
	lfc += afc / PI;
	lfc = lfc - floor(lfc);
	
	vec4 fragCol = texture(waveTex, vec2(lfc + 0.01, 0.5));
	fragCol.rgb *= bgColor;

	float alpha = pgCol.r;
	// if(alpha < 0.5) alpha = pow(alpha * 2.0, 4.0) * 0.5;

	vec4 finalColor = pgCol + fragCol * 0.1;
	finalColor.rgb += backCol.rgb * 0.99;
	gl_FragColor = finalColor;
}
