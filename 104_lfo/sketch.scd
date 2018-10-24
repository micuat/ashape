s.boot;

n = NetAddr("127.0.0.1", 7000);  // open 7000 on localhost server

(
SynthDef("bg", { arg freq = 440, mul = 0.22, dur = 1.0;
	var s = Ringz.ar(SinOsc.ar(freq, 0, Decay.ar(Impulse.ar(8), 0.1) * mul), 100, dur);
    Out.ar(
        0,
		Pan2.ar(s, 0.0)
    )
}).add;
)

(
~bgSynth = Synth("bg", [\freq, 440, \mul, 0.01]);
{
	var x = 0.0, y = 0.0;
	var count = 0.0;
	true.while({
		x = cos(count*0.001 * 10);
		y = sin(count*0.001 * 10);
		z = (sin(count*0.001 * 1) * 0.5 + 0.5);
		// n.sendMsg("/sc3p5/control/bx", x);
		n.sendMsg("/sc3p5/control/bx", (1-abs(x) * abs(x)) * 5000);
		n.sendMsg("/sc3p5/control/bz", (1-z) * 30);
		if(count % 400 == 0, {
			// n.sendMsg("/sc3p5/metro");
		});

		~bgSynth.set(\freq, 100+50*x, \dur, z * z * 4 + 0.1);
		count = count + 1.0;
		0.01.wait;
	});
}.fork;
)
