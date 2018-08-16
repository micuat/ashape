// https://www.shadertoy.com/view/4llGWM

#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

varying vec3 vertNormal;
varying vec3 vertLightDir;
varying vec4 vertColor;
varying vec4 vertTexCoord;

uniform float iTime, lfo0, lfo1, lfo2, lfo3;
uniform float vMirror;
uniform float centerDirection;
uniform vec3 bgColor0, bgColor1;

uniform sampler2D texture;
uniform sampler2D pgTex;
uniform sampler2D waveTex;
uniform sampler2D backTex;

vec2 iRes = vec2(1280, 560);

float PI = 3.14159265359;

void main() {
  vec2 fragCoord = vertTexCoord.st;//(vertTexCoord.st - vec2(0.5)) * iRes / iRes.y + vec2(0.5);
	// if(vMirror > 0.5 && fragCoord.t > 0.5) {
	// 	fragCoord.t = 1.0 - fragCoord.t;
	// }
	vec2 nFragCoord = fragCoord.st - vec2(0.5);

	float lfc = length(nFragCoord);
	float afc = atan(nFragCoord.t, nFragCoord.s*(lfo0+0.5));// + 0.005 * iTime;

	vec4 pgCol = texture(pgTex, vertTexCoord.st);
	vec4 backCol;
	// backCol = texture(backTex, nFragCoord * centerDirection + vec2(0.5));
  float dth = 0.1 * (lfo2 * 2 - 1);
	backCol = texture(backTex, vec2(0.5) + vec2(lfc*cos(afc + dth), lfc*sin(afc + dth)));

	// afc = afc - floor(afc);
	// lfc += afc / PI;
	// lfc = lfc - floor(lfc);
	
  float y = 1.0 - fragCoord.y;
	vec4 fragCol0 = texture(waveTex, vec2(y, 0.5));
	fragCol0.rgb *= bgColor0;

  y = y * 2.0 - floor(y * 2.0);
	vec4 fragCol1 = texture(waveTex, vec2(y, 0.5));
	fragCol1.rgb *= bgColor1;

	float alpha = pgCol.r;

	vec4 finalColor = pgCol*0.0 + fragCol1 * 0.5 + fragCol1 * 0.5;
	finalColor.rgb += backCol.rgb * 0.95;// * (lfo0 * 0.25 + 0.75);
	gl_FragColor = finalColor;
}
