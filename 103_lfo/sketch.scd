s.boot;

n = NetAddr("127.0.0.1", 7000);  // open 7000 on localhost server

(
{
	var x = 0.0, y = 0.0;
	var count = 0.0;
	true.while({
		x = cos(count*0.001 * 10);
		y = sin(count*0.001 * 10);
		z = cos(count*0.001 * 50);
		n.sendMsg("/sc3p5/lfo", x, y, z);
		if(count % 400 == 0, {
			n.sendMsg("/sc3p5/metro");
		});

		count = count + 1.0;
		0.01.wait;
	});
}.fork;
)
