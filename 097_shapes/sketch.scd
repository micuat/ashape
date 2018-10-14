(
SynthDef("signal", { arg freq0=440, freq1=440, pos=0, delay=0.048, feedback=0.2, vol=1.0;
		var dur = 4, amp = 1.0, osc, attTime = (0.4*dur), relTime = (0.4*dur), env, envgen, s, z, y;

		//envelope to control duration
		env = Env([0, amp, amp, 0], [attTime, dur-(attTime+relTime), relTime], 1);
		envgen = EnvGen.kr(env, doneAction: 2);

	s = Mix.ar(Array.fill(10, { Pulse.ar(freq0, 0.5, Decay.ar(Impulse.ar(0.1) * 0.01, 2), 0)}) ) * 1;
	// reverb predelay time :
	z = DelayN.ar(s, delay);
	// 7 length modulated comb delays in parallel :
	y = Mix.ar(Array.fill(7,{ CombL.ar(z, 0.1, LFNoise1.kr(0.1, 0.04, 0.05), 15) }));
	// two parallel chains of 4 allpass delays (8 total) :
	4.do({ y = AllpassN.ar(y, 0.050, [0.050.rand, 0.050.rand], 1) });
	// add original sound to reverb and play it :
	Out.ar(0, Pan2.ar(s+(feedback*y), pos) * vol);
}).send(s);
)

(
SynthDef("grain", { arg freq=440, pan=0, vol=1;
		var dur = 0.05, amp = 1.0, osc, attTime = (0.4*dur), relTime = (0.4*dur), env, envgen, s, z, y;

		//envelope to control duration
		env = Env([0, amp, amp, 0], [attTime, dur-(attTime+relTime), relTime], 1);
		envgen = EnvGen.kr(env, doneAction: 2);

	Out.ar(0, Pan2.ar(LPF.ar(WhiteNoise.ar(Decay.ar(Impulse.ar(0.1), 0.2)) * 0.1 * vol, freq), pan));
}).send(s);
)

a = Synth("signal", [\feedback, 0.01, \freq0, 700, \freq1, 200]);