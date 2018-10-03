(
SynthDef("withProc", { arg freq=440, pos=0, delay=0.048, feedback=0.2;
		var dur = 0.1, amp = 1.0, osc, attTime = (0.4*dur), relTime = (0.4*dur), env, envgen, s, z, y;

		//envelope to control duration
		env = Env([0, amp, amp, 0], [attTime, dur-(attTime+relTime), relTime], 1);
		envgen = EnvGen.kr(env, doneAction: 2);

	// 10 voices of a random sine percussion sound :
	s = Mix.ar(Array.fill(10, { Resonz.ar(Impulse.ar(0.1), freq, 0.005)}) );
	// reverb predelay time :
	z = DelayN.ar(s, delay);
	// 7 length modulated comb delays in parallel :
	y = Mix.ar(Array.fill(7,{ CombL.ar(z, 0.1, LFNoise1.kr(0.1, 0.04, 0.05), 15) }));
	// two parallel chains of 4 allpass delays (8 total) :
	4.do({ y = AllpassN.ar(y, 0.050, [0.050.rand, 0.050.rand], 1) });
	// add original sound to reverb and play it :
	Out.ar(0, Pan2.ar(s+(feedback*y), pos));
}).send(s);
)
