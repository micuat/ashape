s.boot;

n = NetAddr("127.0.0.1", 7000);  // open 7000 on localhost server

(
SynthDef("bg", { arg freq = 440, mul = 0.22, dur = 1.0;
	var o = SinOsc.kr(0.1, 0, 100, 200);
	var s;
	SendTrig.kr(Impulse.kr(100), 0, o);
	s = Ringz.ar(SinOsc.ar(o, 0, Decay.ar(Impulse.ar(8), 0.1) * mul), 100, dur);
    Out.ar(
        0,
		Pan2.ar(s, 0.0)
    )
}).add;
o = OSCFunc({ arg msg, time;
    [time, msg].postln;
	n.sendMsg("/sc3p5/control/bx", msg[0]);
},'/tr', s.addr);
)

Synth("bg", [\mul, 0.01]);
