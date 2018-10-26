s.boot;


(
n = NetAddr("127.0.0.1", 7000);  // open 7000 on localhost server
SynthDef("bg", { arg freq = 440, mul = 0.22, dur = 1.0;
	var o, i;
	var s;
	o = Decay.ar(Impulse.ar(0.25), 10.0);
	i = Decay.ar(Impulse.ar(0.5), 4.0);
	SendTrig.kr(Impulse.kr(100), 0, o * 400 - 200);
	SendTrig.kr(Impulse.kr(100), 1, i * 1000 - 500);
	s = Ringz.ar(SinOsc.ar(o * 50 + 50, 0, i * mul), 100, dur);
    Out.ar(
        0,
		Pan2.ar(s, 0.0)
    )
}).add;
SynthDef("click", { arg freq = 440, mul = 0.22, dur = 1.0;
	var o, i;
	var s;
	i = Decay.ar(Impulse.ar(0.5, 0.5), 2.0);
	SendTrig.kr(Impulse.kr(100), 2, i * 255);
	s = Ringz.ar(WhiteNoise.ar(i * mul), 100);
    Out.ar(
        0,
		Pan2.ar(s, 0.0)
    )
}).add;
o = OSCFunc({ arg msg, time;
	// [time, msg].postln;
	// msg[3].postln;
	if(msg[2] == 0, {
		n.sendMsg("/sc3p5/control/bx", msg[3]);
	}, {
		if(msg[2] == 1, {
			n.sendMsg("/sc3p5/control/by", msg[3]);
		}, {
			n.sendMsg("/sc3p5/control/back", msg[3]);
		});
	});
},'/tr', s.addr);
Synth("bg", [\mul, 0.002]);
Synth("click", [\mul, 0.5]);
)

