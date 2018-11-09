(
SynthDef(\sig, { arg freq0=440, freq1=440, pos=0, delay=0.048, feedback=0.12;
	var s, z, y, trig;
	trig = Impulse.ar(0.25) + Dust.ar(0.25);
	SendTrig.ar(trig, 0, 1);

	s = Mix.ar(Array.fill(10, { LPF.ar(WhiteNoise.ar(Decay.ar(trig * 0.01, 0.25), 0), 400, 4)}) );
	// reverb predelay time :
	z = DelayN.ar(s, delay);
	// 7 length modulated comb delays in parallel :
	y = Mix.ar(Array.fill(7,{ CombL.ar(z, 0.1, LFNoise1.kr(0.1, 0.04, 0.05), 15) }));
	// two parallel chains of 4 allpass delays (8 total) :
	4.do({ y = AllpassN.ar(y, 0.050, [0.050.rand, 0.050.rand], 1) });
	// add original sound to reverb and play it :
	Out.ar(0, Pan2.ar(s+(feedback*y), pos));
}).add;
SynthDef(\sig2, { |out, freq = 440, mul = 0.22, dur = 1.0, sustain = 1|
	var o, i;
	var s, trig;
	trig = Impulse.ar(0.25, 0.5) + Dust.ar(0.25);
	SendTrig.ar(trig, 1, 1);
	i = HPF.ar(Saw.ar(60) * Decay.ar(trig, 1.2), 100);
	s = Ringz.ar(Saw.ar(20, i * mul), 10, 1, 0.2);
	Out.ar(out, s ! 2)
}).add;

Synth(\sig, [\freq0, 400, \delay, 0.014, \feedback, 0.3]);
Synth(\sig2, [\freq, 500, \sustain, 0.4]);

n = NetAddr("127.0.0.1", 7000);  // open 7000 on localhost server
o = OSCFunc({ arg msg, time;
	if(msg[2] == 0, {
		n.sendMsg("/sc3p5/sig", msg[3]);
	});
	if(msg[2] == 1, {
		n.sendMsg("/sc3p5/sig2", msg[3]);
	});
},'/tr', s.addr);


)
