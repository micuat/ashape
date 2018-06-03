float get(vec2 v) {
    return sin(pow(length(v-vec2(0.5, 0.7)), 2.0 + sin(iTime * 0.5))*30.0);
//    return length(sin(v*50.0)) * length(sin(v*50.0));
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord/iResolution.y;

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