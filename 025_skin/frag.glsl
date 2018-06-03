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

float get(vec2 v) {

    return sin(pow(length(v-vec2(0.5, 0.7)) * 0.8, 2.0 + sin(iTime * 0.5)*0.5)*30.0);
//    return length(sin(v*50.0)) * length(sin(v*50.0));
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord/iResolution.y*2.0;
    uv.x+=0.2;
    uv += simplex3d(vec3(uv, iTime*0.1))*0.4;

    // Time varying pixel color
    vec3 cola = vec3(1.0, 0.75, 0.5);
    vec3 colb = vec3(1.0, 0.25, 0.5);
    vec3 colc = vec3(1.0, 0.75, 0.75);
    
    float rate = length(uv-vec2(0.5, 0.7));
    vec3 col;
    if(rate < 0.5)
        col = mix(cola, colb, rate * 2.0);
    else
        col = mix(colb, colc, (rate - 0.5) * 2.0);
    
	vec2 d = vec2(2.0) / iResolution.xy;
	float coln = get(uv + vec2(0, -d.y));
	float cols = get(uv + vec2(0, d.y));
	float colw = get(uv + vec2(-d.x, 0));
	float cole = get(uv + vec2(d.x, 0));

	vec3 normal = normalize(vec3(-coln + cols, -colw + cole, 3));
        
    normal = normalize(normal);

    
    vec3 vCam = vec3(0,0, 2);
	vec3 vLight = vec3(cos(iTime)*0.5+0.5, sin(iTime)*0.5+0.5, 1);
	vec3 vHalf = normalize(vCam + vLight);
	float spec = pow(max(dot(vHalf, normal), 0.0), 8.0) / 1.0;
    //if(spec > 0.5) spec = 0.5;
    col = mix(col, vec3(0.9, 0.9, 1.0), 1.0-spec);
	//col *= spec;

    // Output to screen
    fragColor = vec4(col,1.0);
}