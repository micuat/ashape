(
SynthDef(\sig, { |out, freq = 440, dfreq = 1, mul = 0.22|
	var o, i;
	var s, du;
	du = Dust.ar(dfreq);
	SendTrig.ar(du, 0, 1);
	//i = Ringz.ar(SinOsc.ar(0.1, mul: 0.25, add: 0.5) - Dust.ar(dfreq),1000);
	// dfreq = MouseX.kr(2, 20);
	i = HPF.ar(Ringz.ar(du,150), 1000);
	//s = Ringz.ar(SinOsc.ar(100, mul: i), 50);
	s = FreeVerb.ar(SinOsc.ar(50, mul: i));
	Out.ar(out, s ! 2)
}).add;
SynthDef(\sig2, { |out, freq = 440, dfreq = 1, mul = 0.22|
	var o, i;
	var s;
	// SendTrig.kr(Impulse.kr(0.1), 1, 1);
	// i = SinOsc.ar(0.1, mul: 0.25, add: 0.5);
	i = dfreq * (dfreq < 1);
	i = (1 - i) * (dfreq < 1);
	//s = Ringz.ar(SinOsc.ar(100, mul: i), 50);
	s = FreeVerb.ar(SinOsc.ar(280, mul: i * mul));
	// s = FreeVerb.ar(SinOsc.ar(150, mul: i) + PinkNoise.ar(mul:0.1*Clip.ar(0.5-i, 0, 1)));
	Out.ar(out, s ! 2)
}).add;
)

(
~sig = Synth(\sig, [\freq, 500, \dfreq, 0]);
~sig2 = Synth(\sig2, [\freq, 500, \dfreq, 0.1, \mul, 0]);
)

(
f = { |msg, time, addr|
    if(msg[0] == '/sensors/bno') {
		// msg[9].postln;
		~sig.set(\dfreq, abs(msg[9] - 90) * 0.3);
		~sig2.set(\dfreq, abs(msg[9] - 90) * 0.1);
		// (abs(msg[9] - 90) * 0.03).postln;
    }
};
thisProcess.addOSCRecvFunc(f)
);

// stop posting.
thisProcess.removeOSCRecvFunc(f);

(
n = NetAddr("127.0.0.1", 7000);  // open 7000 on localhost server
o = OSCFunc({ arg msg, time;
	// [time, msg].postln;
	// msg[3].postln;
	if(msg[2] == 0, {
		n.sendMsg("/sc3p5/dust", msg[3]);
	});
	if(msg[2] == 1, {
		n.sendMsg("/sc3p5/sig", msg[3]);
	});
	if(msg[2] == 2, {
		n.sendMsg("/sc3p5/hhat", msg[3]);
	});
},'/tr', s.addr);
)