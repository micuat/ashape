s.boot;


(
n = NetAddr("127.0.0.1", 7000);  // open 7000 on localhost server
SynthDef("bg", { arg freq = 440, mul = 0.22, dur = 1.0;
	var o, i;
	var s;
	o = SinOsc.kr(0.1, 0, 100, 200);
	i = Decay.ar(Impulse.ar(2), 0.2);
	SendTrig.kr(Impulse.kr(100), 0, i * 200);
	SendTrig.kr(Impulse.kr(100), 1, o);
	s = Ringz.ar(SinOsc.ar(o, 0, i * mul), 100, dur);
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
		n.sendMsg("/sc3p5/control/bz", msg[3]);
	});
},'/tr', s.addr);
Synth("bg", [\mul, 0.002]);
)

