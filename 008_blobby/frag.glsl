#version 120
// https://www.shadertoy.com/view/4llGWM

#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

varying vec3 vertNormal;
varying vec3 vertLightDir;
varying vec4 vertColor;
// varying vec3 vpos;
// varying vec2 texCoord;
// varying vec3 ecNormal;
// varying vec3 lightDir;
varying vec4 vertTexCoord;

uniform float iTime;
uniform vec2 iMouse;//, iResolution;

uniform float mscale;
uniform float mtween;

uniform vec3 bpos[4];

uniform sampler2D texture;

//SuperShape 3d by eiffie based on mickdermack's 2d formula
uniform vec3 cameraPosition;
uniform float iteration;
uniform float phiGlitch;
uniform float dGlitch;
uniform float fragGlitch;

uniform vec4 S1, S2;//m,n1,n2,n3

#pragma include "libs/hg_sdf.glslinc"

/* discontinuous pseudorandom uniformly distributed in [-0.5, +0.5]^3 */
vec3 random3(vec3 c) {
	float j = 4096.0*sin(dot(c,vec3(17.0, 59.4, 15.0)));
	vec3 r;
	r.z = fract(512.0*j);
	j *= .125;
	r.x = fract(512.0*j);
	j *= .125;
	r.y = fract(512.0*j);
	return r-0.5;
}

/* skew constants for 3d simplex functions */
const float F3 =  0.3333333;
const float G3 =  0.1666667;

/* 3d simplex noise */
float simplex3d(vec3 p) {
  /* 1. find current tetrahedron T and it's four vertices */
  /* s, s+i1, s+i2, s+1.0 - absolute skewed (integer) coordinates of T vertices */
  /* x, x1, x2, x3 - unskewed coordinates of p relative to each of T vertices*/
  
  /* calculate s and x */
  vec3 s = floor(p + dot(p, vec3(F3)));
  vec3 x = p - s + dot(s, vec3(G3));
  
  /* calculate i1 and i2 */
  vec3 e = step(vec3(0.0), x - x.yzx);
  vec3 i1 = e*(1.0 - e.zxy);
  vec3 i2 = 1.0 - e.zxy*(1.0 - e);
  
  /* x1, x2, x3 */
  vec3 x1 = x - i1 + G3;
  vec3 x2 = x - i2 + 2.0*G3;
  vec3 x3 = x - 1.0 + 3.0*G3;
  
  /* 2. find four surflets and store them in d */
  vec4 w, d;
  
  /* calculate surflet weights */
  w.x = dot(x, x);
  w.y = dot(x1, x1);
  w.z = dot(x2, x2);
  w.w = dot(x3, x3);
  
  /* w fades from 0.6 at the center of the surflet to 0.0 at the margin */
  w = max(0.6 - w, 0.0);
  
  /* calculate surflet components */
  d.x = dot(random3(s), x);
  d.y = dot(random3(s + i1), x1);
  d.z = dot(random3(s + i2), x2);
  d.w = dot(random3(s + 1.0), x3);
  
  /* multiply d by w^4 */
  w *= w;
  w *= w;
  d *= w;
  
  /* 3. return the sum of the four surflets */
  return dot(d, vec4(52.0));
}

float noise(vec3 m) {
  return 0.5333333*simplex3d(m)
    +0.2666667*simplex3d(2.0*m)
    +0.1333333*simplex3d(4.0*m)
    +0.0666667*simplex3d(8.0*m);
}

//from mickdermack https://www.shadertoy.com/view/MdXXDB
float SuperFormula(float phi, float a, float b, float m, float n1, float n2, float n3){
	return pow((pow(abs(cos(m*phi/4.0)/a),n2) + pow(abs(sin(m*phi/4.0)/b), n3)), -(1.0/n1));
}

float SE(in vec3 p){
	float n = 15;
	float sr = 0.75;
	float d = length(p);
	float sn=p.z/d;//the sine of rho (the angle between z and xy)
	float phi=atan(p.y,p.x),rho=asin(sn);//the angles to feed the formula
	// d = d - sr * (simplex3d(vec3(iTime, phi/3.1415/2*10, rho/3.1415/2*10))*0.5 + 2);
	d = d - sr * (simplex3d(p+vec3(iTime, 0,0))*0.5 + 2);

	return d;
}

float DDE(in vec3 p, in vec3 rd){
	float d=SE(p),s=d*0.5;
	float dr=(d-SE(p+rd*s))/s;
	return d/(1.0+max(dr,0.0));
}

float rnd(vec2 c){return fract(sin(dot(vec2(1.317,19.753),c))*413.7972);}
float rndStart(vec2 fragCoord){
	return 0.5+0.5*rnd(fragCoord.xy+vec2(iTime*217.0));
}
float shadao(vec3 ro, vec3 rd, float px,vec2 fragCoord){//pretty much IQ's SoftShadow
	float res=1.0,d,t=2.0*px*rndStart(fragCoord);
	for(int i=0;i<12;i++){
		d=max(px,DDE(ro+rd*t,rd)*1.5);
		t+=d;
		res=min(res,d/t+t*0.1);
	}
	return res;
}

vec3 L;

vec3 Color(vec3 ro, vec3 rd, float t){
	ro+=rd*t;
	float d=SE(ro);
	vec2 e=vec2(t,0.0);
	vec3 dn=vec3(SE(ro-e.xyy),SE(ro-e.yxy),SE(ro-e.yyx));
	vec3 dp=vec3(SE(ro+e.xyy),SE(ro+e.yxy),SE(ro+e.yyx));
	vec3 N=(dp-dn)/(length(dp-vec3(d))+length(vec3(d)-dn));
	float sh=clamp(shadao(ro,L,t,vec2(0))+0.2,0.0,1.0);
	sh=sh*(0.5+0.5*dot(N,L))*exp(-t*0.125);
	vec3 scol=vec3(sh);
	return scol;
}
mat3 lookat(vec3 fw){
	fw=normalize(fw);vec3 rt=normalize(cross(fw,vec3(0.0,1.0,0.0)));return mat3(rt,cross(rt,fw),fw);
}

void main() {
    vec2 iResolution = vec2(1);
    vec2 fragCoord = vertTexCoord.st;

	L=normalize(vec3(0.4,0.8,-0.6));
	
	vec3 ro=cameraPosition;
	vec3 rd=lookat(vec3(-0.1)-ro)*normalize(vec3(fragCoord.xy - vec2(0.5),1.0));

	float t=DDE(ro,rd)*rndStart(fragCoord),d=0.0,od=10.0;
	vec2 edge=vec2(-1.0);
	bool bGrab=false;
	vec3 col=vec3(0);
	for(int i=0;i<iteration;i++){
		t+=d;
		d=DDE(ro+rd*t,rd);
		if(d>od){
			if(bGrab && od<t && edge.x<0.0){
				edge=vec2(edge.y,t-od);
				bGrab=false;
			}
		}else bGrab=true;
		od=d * 2000 * dGlitch;
		if(t>1000.0 || d<0.00001)break;
	}
	d*=0.02;
	if(d<t && t<1000.0){
		if(edge.x>0.0)edge=edge.yx;
		edge=vec2(edge.y,t);
	}
	for(int i=0;i<2;i++){
		if(edge.y>0.0)col=Color(ro,rd,edge.y);
		edge=edge.yx;
	}
	float spec = 2;
	float grey = pow(col.x, spec) * 10;

	vec3 red = vec3(0.8,0.2,0);//vec3(1) - texture2D(texture, vec2(0, 0)).rgb;
	vec3 blue = vec3(0,0,1);//vec3(1) - texture2D(texture, vec2(1, 1)).rgb;
	if (grey > 0) {
		gl_FragColor = vec4(mix(red, blue, (ro+rd*t).z), 1);
	}
	else {
		gl_FragColor = vec4(mix(vec3(0), vec3(1), grey), 1);
	}
	// gl_FragColor = vec4(vec3(grey), 1.0);
}
