s.boot;

(
n = NetAddr("127.0.0.1", 7000);  // open 7000 on localhost server

SynthDef("grain", { arg freq = 440, pan = 0, vol = 1, index = 0;
	var dur = 1.0, amp = 1.0, osc, attTime = (0.4*dur), relTime = (0.4*dur), env, envgen, dec;

	dec = Decay.ar(Impulse.ar(0.01), 1.0) * SinOsc.ar(10, 0, 0.5, 0.5);
	SendTrig.kr(Impulse.kr(30), index, dec);

	env = Env([0, amp, amp, 0], [attTime, dur-(attTime+relTime), relTime], 1);
	envgen = EnvGen.kr(env, doneAction: 2);

	Out.ar(0, Pan2.ar(LPF.ar(WhiteNoise.ar(Decay.ar(Impulse.ar(0.1), 0.2)) * 0.1 * vol, freq), pan));
}).send(s);

o = OSCFunc({ arg msg, time;
	n.sendMsg("/sc3p5/particle", msg[2], msg[3]);
},'/tr', s.addr);
)
