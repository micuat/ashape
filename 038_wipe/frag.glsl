float pi = 3.14159265359;

float tilt(vec2 uv, vec2 c, float t) {
    return (uv.x - c.x) * -cos(t) + (uv.y - c.y) * sin(t);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord/iResolution.x;

    // Time varying pixel color
    vec3 col = 0.5 + 0.5*cos(iTime+uv.xyx+vec3(0,2,4));
    vec2 cb = vec2(0.5,0.0);
    vec2 ct = vec2(0.5, iResolution.y / iResolution.x);

    float t = iTime * 2.0;
    for(int i = 0; i < 8; i++) {
        if(tilt(uv, cb, t* float(i)/16.0) < 0.0) {
            col = col.gbr;
        }
    }

    for(int i = 0; i < 16; i++) {
        if(tilt(uv, ct, t* float(i)/16.0) < 0.0) {
            col = col.gbr;
        }
    }


    
    //if(fragCoord.x > iResolution.x * 0.5 + iResolution.y * 0.5) col = vec3(0.0);
    //if(fragCoord.x < iResolution.x * 0.5 - iResolution.y * 0.5) col = vec3(0.0);
    
	// Output to screen
    fragColor = vec4(col,1.0);
}