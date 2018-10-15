s.boot;

n = NetAddr("127.0.0.1", 7000);  // open 47120 on localhost server

(
SynthDef(\blip, { | freq = 440, amp = 0.85, att = 0.01, rel = 0.06, dur = 1.0 |
    var sig, env, lfo;
    var envel = Env([0, 1, 0.5, 1, 0], [0.1, 0.5, 0.02, 0.5]*dur);
    sig = SinOsc.ar(freq, 0, amp);
    env = EnvGen.ar(envel, doneAction:Done.freeSelf);
    Out.ar(0, Pan2.ar(RHPF.ar(sig*env, freq * 2), 0.0))
}).add;
)

Synth(\blip, [\freq, 100]);

(
var a;
a = Pseq([[100, 0.25], [200, 0.5], [131.2, 0.25], [99.2, 0.25]], inf).asStream;
{
    a.do { |val|
		n.sendMsg("/sc3p5", val[0].asFloat);
        Synth(\blip, [\freq, val[0], \dur, 1]);
		(val[1] + 0.5.rand).wait;
    }
}.fork;
)
