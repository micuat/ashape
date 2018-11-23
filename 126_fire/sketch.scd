(
SynthDef(\pop, { |out, freq = 440, dfreq = 1, mul = 0.22|
	var o, i;
	var s, du;
	dfreq = SinOsc.kr(0.1, mul: 5, add: 6);
	du = Dust.ar(dfreq);
	SendTrig.ar(du, 0, 1);
	//i = Ringz.ar(SinOsc.ar(0.1, mul: 0.25, add: 0.5) - Dust.ar(dfreq),1000);
	i = HPF.ar(Ringz.ar(du,150), 1000);
	//s = Ringz.ar(SinOsc.ar(100, mul: i), 50);
	s = FreeVerb.ar(SinOsc.ar(50, mul: i));
	Out.ar(out, s ! 2)
}).add;
SynthDef(\sig, { |out, freq = 440, dfreq = 1, mul = 0.22|
	var o, i;
	var s;
	dfreq = SinOsc.kr(0.1, mul: -0.5, add: 0.5);
	i = dfreq;
	SendTrig.kr(Impulse.kr(10), 1, i);
	// i = SinOsc.ar(0.1, mul: 0.25, add: 0.5);
	//s = Ringz.ar(SinOsc.ar(100, mul: i), 50);
	s = FreeVerb.ar(SinOsc.ar(180, mul: i * mul) + SinOsc.ar(185, mul: i * mul));
	// s = FreeVerb.ar(SinOsc.ar(150, mul: i) + PinkNoise.ar(mul:0.1*Clip.ar(0.5-i, 0, 1)));
	Out.ar(out, s ! 2)
}).add;
)

(
~pop = Synth(\pop, [\freq, 500, \dfreq, 1]);
~sig = Synth(\sig, [\freq, 500, \dfreq, 0.1, \mul, 0.5]);

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