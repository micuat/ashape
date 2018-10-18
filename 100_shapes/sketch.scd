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

	Out.ar(0, Pan2.ar(LPF.ar(Ringz.ar(WhiteNoise.ar(Decay.ar(Impulse.ar(0.1), 0.5)) * 0.1 * vol, freq, 0.1), 500), pan));
}).send(s);
)

Synth(\blip, [\freq, 100]);
Synth(\grain, [\freq, 30]);

(
var a;
a = Pseq([[100, 0.25], [200, 0.5], [131.2, 0.25], [99.2, 0.25]], inf).asStream;
{
    a.do { |val|
		var x0 = 1;
		var x1 = 2.rand;
		var x2 = 2.rand;
		var x3 = 2.rand;
		var x4 = 2.rand;
		var x5 = 2.rand;
		var x6 = 2.rand;
		var x7 = 2.rand;
		n.sendMsg("/sc3p5", x0.asFloat, x1.asFloat, x2.asFloat, x3.asFloat, x4.asFloat, x5.asFloat, x6.asFloat, x7.asFloat);
		Synth(\grain, [\freq, 30, \vol, 0.5]);
		{
		0.5.wait;
		b = Pseq([100 * x0, 200 * x1, 131.2 * x2, 99.2 * x3, 120 * x4, 180 * x5, 151.2 * x6, 90.2 * x7], 1).asStream;
		b.do {
			|valb|
			Synth(\blip, [\freq, valb, \dur, 2]);
			1.0.rand.wait;
		};
		}.fork;

		1.wait;
		n.sendMsg("/sc3p5/bang");
		3.wait;
    }
}.fork;
)
