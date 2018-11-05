// http://doc.sccode.org/Tutorials/Getting-Started/16-Sequencing-with-Patterns.html
(
SynthDef(\click, { |out, freq = 440, mul = 0.22, dur = 1.0, sustain = 1|
	var o, i;
	var s;
	SendTrig.kr(Impulse.kr(0.1), 0, 1);
	i = HPF.ar(Saw.ar(0.1), 100) * EnvGen.kr(Env.linen(0.05, sustain, 2), doneAction: Done.freeSelf);
	s = HPF.ar(Ringz.ar(SinOsc.ar(340, 0, i * mul), 80), 100);
	Out.ar(out, s ! 2)
}).add;

SynthDef(\sig, { |out, freq = 440, mul = 0.22, dur = 1.0, sustain = 1|
	var o, i;
	var s;
	SendTrig.kr(Impulse.kr(0.1), 1, 1);
	i = HPF.ar(Saw.ar(0.1), 100) * EnvGen.kr(Env.linen(0.05, sustain, 2), doneAction: Done.freeSelf);
	s = Ringz.ar(SinOsc.ar(100, 0, i * mul), 50);
	Out.ar(out, s ! 2)
}).add;

SynthDef(\hhat, { |out, freq = 440, mul = 0.22, dur = 1.0, sustain = 1|
	var o, i;
	var s;
	SendTrig.kr(Impulse.kr(0.1), 2, 1);
	i = Decay.ar(Impulse.ar(0.5), 0.1) * EnvGen.kr(Env.linen(0.05, sustain, 0.1), doneAction: Done.freeSelf);
	// s = Ringz.ar(WhiteNoise.ar(i * mul), 100);
	s = HPF.ar(Ringz.ar(WhiteNoise.ar(i * mul), 100), 5000);
    Out.ar(out, s ! 2)
}).add;

SynthDef(\bass, { |out, freq = 440, gate = 1, amp = 0.5, slideTime = 0.17, ffreq = 1000, width = 0.15, attackTime = 0.01, releaseTime = 0.2,
        detune = 1.005, preamp = 4|
    var    sig,
	env = Env.adsr(attackTime, 0.3, 0.4, releaseTime);
	SendTrig.kr(Impulse.kr(0.1), 2, 1);
    freq = Lag.kr(freq, slideTime);
	sig = Mix(VarSaw.ar([freq, freq * detune], 0, width, preamp)).distort * amp
        * EnvGen.kr(env, gate, doneAction: Done.freeSelf);
    sig = LPF.ar(sig, ffreq);
    Out.ar(out, sig ! 2)
}).add;

// Synth(\click, [\freq, 500, \dur, 0.14]);
// Synth(\sig, [\freq, 500, \sustain, 0.4]);
// Synth(\bass, [\freq, 500, \releaseTime, 0.01, \dur, 0.1]);
)

(
n = NetAddr("127.0.0.1", 7000);  // open 7000 on localhost server
o = OSCFunc({ arg msg, time;
	// [time, msg].postln;
	// msg[3].postln;
	if(msg[2] == 0, {
		n.sendMsg("/sc3p5/click", msg[3]);
	});
	if(msg[2] == 1, {
		n.sendMsg("/sc3p5/sig", msg[3]);
	});
	if(msg[2] == 2, {
		n.sendMsg("/sc3p5/hhat", msg[3]);
	});
},'/tr', s.addr);

p = Pxrand([
	Pbind(
		\instrument, Pseq([\click, \hhat, \click, \hhat], 1),
		\dur, Pseq([0.25, 0.25, 0.25, 0.25], 1),
		\legato, 1
	),
	Pbind(
		\instrument, Pseq([\click, \hhat, \click, \hhat], 1),
		\dur, Pseq([0.125, 0.125, 0.5, 0.25], 1),
		\legato, 1
	),
	Pbind(
		\instrument, Pseq([\sig, \click, \hhat], 1),
		\dur, Pseq([0.625, 0.25, 0.125], 1),
		\legato, 1
	),
	Pbind(
		\instrument, Pseq([\hhat], 4),
		\dur, 1.0 / 4.0,
		\legato, 1
	),
	// Pbind(
	// 	\instrument, Pseq([\click, \click, \click, \hhat], 1),
	// 	\midinote, Pseq([60, 68, 60, 60], 1),
	// 	\dur, Pseq([0.25, 0.25, 0.25, 0.25], 1),
	// 	\detune, 1.01,
	// 	\legato, 1
	// ),
	Pbind(
		\instrument, Pseq([\click, \click, \hhat], 1),
		\dur, Pseq([0.25, 0.5, 0.25], 1),
		\legato, 1
	)
], inf).play(quant: 1);
)
TempoClock.default.tempo = 128/60;
