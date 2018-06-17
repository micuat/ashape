uniform float footCount;

// https://www.shadertoy.com/view/4dX3WN
vec3 rgb2hsv(vec3 rgb)
{
	float Cmax = max(rgb.r, max(rgb.g, rgb.b));
	float Cmin = min(rgb.r, min(rgb.g, rgb.b));
    float delta = Cmax - Cmin;

	vec3 hsv = vec3(0., 0., Cmax);
	
	if (Cmax > Cmin)
	{
		hsv.y = delta / Cmax;

		if (rgb.r == Cmax)
			hsv.x = (rgb.g - rgb.b) / delta;
		else
		{
			if (rgb.g == Cmax)
				hsv.x = 2. + (rgb.b - rgb.r) / delta;
			else
				hsv.x = 4. + (rgb.r - rgb.g) / delta;
		}
		hsv.x = fract(hsv.x / 6.);
	}
	return hsv;
}

float chromaKey(vec3 color)
{
	vec3 backgroundColor = vec3(0.157, 0.576, 0.129);
	vec3 weights = vec3(4., 1., 2.);

	vec3 hsv = rgb2hsv(color);
	vec3 target = rgb2hsv(backgroundColor);
	float dist = length(weights * (target - hsv));
	return 1. - clamp(3. * dist - 1.5, 0., 1.);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 fc = vec2(0,0.9) + fragCoord * vec2(1,-1) / iResolution.xy * 0.8;
    vec4 v = texture(iChannel1, fc);
    vec3 col = v.rgb;

    float greendot = chromaKey(col);
    if(greendot > 0.0) {
        // v.rgb = vec3(greendot);
        col = vec3(footCount);
    }

    fragColor = vec4(col,1);
}
