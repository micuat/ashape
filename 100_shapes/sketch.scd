s.boot;

n = NetAddr("127.0.0.1", 7000);  // open 7000 on localhost server

(
SynthDef(\blip, { | freq = 440, amp = 0.85, dur = 1.0 |
    var sig, env, lfo;
    var envel = Env([0, 1, 0.5, 0.75, 0], [0.1, 0.5, 0.4, 0.5]*dur);
    sig = SinOsc.ar(freq, 0, amp);
    env = EnvGen.ar(envel, doneAction: Done.freeSelf);
    Out.ar(0, Pan2.ar(RHPF.ar(sig*env, freq * 2), 0.0))
}).add;
)

(
SynthDef("\grain", { arg freq=440, pan=0, vol=1;
		var dur = 1, amp = 1.0, osc, attTime = (0.4*dur), relTime = (0.4*dur), env, envgen;

		//envelope to control duration
		env = Env([0, amp, amp, 0], [attTime, dur-(attTime+relTime), relTime], 1);
		envgen = EnvGen.kr(env, doneAction: Done.freeSelf);

	Out.ar(0, Pan2.ar(LPF.ar(Decay.ar(Impulse.ar(0.1), 0.15), freq), pan));
}).send(s);
)

Synth(\blip, [\freq, 100, \dur, 0.1]);
Synth(\grain, [\freq, 1000]);

(
var a;
a = Pseq([[100, 0.25], [200, 0.5], [131.2, 0.25], [99.2, 0.25]], inf).asStream;
{
	var lastMode = 0, mode = 0;
    a.do { |val|
		mode = [0,1,2,3].choose;
		if(mode == lastMode,
			{},
			{
				Synth(\blip, [\freq, 200, \dur, 0.5]);
				n.sendMsg("/sc3p5/bang", mode);
		});
		lastMode = mode;

		2.wait;
    }
}.fork;
)
