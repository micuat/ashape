// http://doc.sccode.org/Tutorials/Getting-Started/16-Sequencing-with-Patterns.html
(
SynthDef(\click, { |out, freq = 440, mul = 0.22, dur = 1.0, sustain = 1|
	var o, i;
	var s;
	SendTrig.kr(Impulse.kr(0.1), 0, 1);
	i = Decay.ar(Impulse.ar(0.5), 0.1) * EnvGen.kr(Env.linen(0.05, sustain, 0.1), doneAction: Done.freeSelf);
	// s = Ringz.ar(WhiteNoise.ar(i * mul), 100);
	s = HPF.ar(Ringz.ar(WhiteNoise.ar(i * mul), 100), 5000);
    Out.ar(out, s ! 2)
}).add;
SynthDef(\bass, { |out, freq = 440, gate = 1, amp = 0.5, slideTime = 0.17, ffreq = 1000, width = 0.15, attackTime = 0.01, releaseTime = 0.2,
        detune = 1.005, preamp = 4|
    var    sig,
	env = Env.adsr(attackTime, 0.3, 0.4, releaseTime);
	SendTrig.kr(Impulse.kr(0.1), 1, 1);
    freq = Lag.kr(freq, slideTime);
	sig = Mix(VarSaw.ar([freq, freq * detune], 0, width, preamp)).distort * amp
        * EnvGen.kr(env, gate, doneAction: Done.freeSelf);
    sig = LPF.ar(sig, ffreq);
    Out.ar(out, sig ! 2)
}).add;
)

(
n = NetAddr("127.0.0.1", 7000);  // open 7000 on localhost server
o = OSCFunc({ arg msg, time;
	// [time, msg].postln;
	// msg[3].postln;
	if(msg[2] == 1, {
		n.sendMsg("/sc3p5/bass", msg[3]);
	}, {
		n.sendMsg("/sc3p5/click", msg[3]);
	});
},'/tr', s.addr);

p = Pxrand([
	Pbind(
		\instrument, Pseq([\click, \bass, \click, \bass], 1),
		\midinote, Pseq([60, 50, 60, 38], 1),
		\dur, Pseq([0.25, 0.25, 0.25, 0.25], 1),
		\detune, 1.001,
		\legato, 1
	),
	Pbind(
		\instrument, Pseq([\click, \bass, \click, \bass], 1),
		\midinote, Pseq([60, 38, 60, 50], 1),
		\dur, Pseq([0.25, 0.25, 0.25, 0.25], 1),
		\detune, 1.001,
		\legato, 1
	),
	Pbind(
		\instrument, Pseq([\click, \click, \click], 1),
		\midinote, Pseq([60, 68, 60], 1),
		\dur, Pseq([0.25, 0.125, 0.625], 1),
		\detune, 1.01,
		\legato, 1
	),
	Pbind(
		\instrument, Pseq([\click], 4),
		\midinote, 30,
		\dur, 1.0 / 4.0,
		\detune, 1.01,
		\legato, 1
	),
	Pbind(
		\instrument, Pseq([\click, \click, \click, \bass], 1),
		\midinote, Pseq([60, 68, 60, 40], 1),
		\dur, Pseq([0.25, 0.25, 0.25, 0.25], 1),
		\detune, 1.01,
		\legato, 1
	),
	Pbind(
		\instrument, Pseq([\click, \click, \bass], 1),
		\midinote, 40,
		\dur, Pseq([0.3, 0.55, 0.25], 1),
		\detune, 1.001,
		\attackTime, 0.1,
		\releaseTime, 0.4,
		\legato, 1
	)
], inf).play(quant: 1);
)
TempoClock.default.tempo = 180/60;
