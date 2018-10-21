(
SynthDef("grain", { arg freq=440, pan=0, vol=1;
		var dur = 0.05, amp = 1.0, osc, attTime = (0.4*dur), relTime = (0.4*dur), env, envgen, s, z, y;

		//envelope to control duration
		env = Env([0, amp, amp, 0], [attTime, dur-(attTime+relTime), relTime], 1);
		envgen = EnvGen.kr(env, doneAction: 2);

	Out.ar(0, Pan2.ar(LPF.ar(WhiteNoise.ar(Decay.ar(Impulse.ar(0.1), 0.2)) * 0.1 * vol, freq), pan));
}).send(s);
)
