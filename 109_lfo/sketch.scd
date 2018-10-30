s.boot;

// https://en.wikibooks.org/wiki/Designing_Sound_in_SuperCollider/Bubbles
(
SynthDef(\bubbletrigs, {|out=0, probability=0.5|
	var trigs, buf, a;
	// These two lines create a loop of zeroes
	// with some ones (i.e. triggers) placed at prime-number locations
	a = {0}.dup(200);
	[29, 37, 47, 67, 89, 113, 157, 197].do{|val| a[val] = 1};
	buf = a.as(LocalBuf);
	// playbuf by default will use the server's rate, but we want one item every 15ms
	trigs = PlayBuf.kr(1, buf, 0.015.reciprocal / (s.sampleRate / s.options.blockSize), loop: 1);
	// Randomly discard half of them, to remove too much obvious looping
	trigs = CoinGate.kr(probability, trigs);
	// Let's poll to watch the events appearing
	SendTrig.kr(Impulse.kr(100), 0, (trigs > 0.0) * SinOsc.kr(1, 0, 200));
	trigs.poll(trigs);
	Out.kr(out, trigs);
	// Out.ar([0, 1], SinOsc.ar(DelayN.ar(Decay.kr(trigs, 5), 2, 2)*1000+SinOsc.ar(0.2, 0, 30, 100), 0, 0.1));
}).add
)

(
SynthDef(\bubblebub, {	|out=0, t_trig=0, attack=0.01, decay=0.08, pitchcurvelen=0.1, freq=1000, doneAction=0, amp=0.1|
	var pitch, son;
	amp   = amp * EnvGen.ar(Env.perc(attack, decay).delay(0.003), t_trig, doneAction: doneAction);
	pitch = freq * EnvGen.ar(Env.new([0,0.5,1,0],[0,1,1]).exprange(1, 2.718), t_trig, timeScale: pitchcurvelen);
	son = SinOsc.ar(pitch);
	// high-pass to remove any lowpitched artifacts, scale amplitude
	// son = HPF.ar(son, 10) * amp * 1;
	son = Ringz.ar(son, 10, 0.01) * amp;
	Out.ar([0, 1], son);
}).store
)

(
n = NetAddr("127.0.0.1", 7000);  // open 7000 on localhost server
o = OSCFunc({ arg msg, time;
	// [time, msg].postln;
	if(msg[3] != 0.0, {
		n.sendMsg("/sc3p5/spawn", msg[3]);
	});
},'/tr', s.addr);
s.bind{
	// Here we'll create busses to hold the triggers, passing them from synth to synth
	~maintrigbus = Bus.control(s, 1);
	~bubtrigbus = Bus.control(s, 4);
	// Note how we make sure things are running in the desired order, using \addAfter
	~trigs = Synth(\bubbletrigs, [\out: ~maintrigbus]);
	// This reads the main trig and puts each trig on a randomly-chosen bus
	~randomdistrib = {
		var trig, which;
		trig = In.kr(~maintrigbus);
		which = TIRand.kr(0,3, trig);
		// or try the Stepper instead of TIRand for "round-robin" selection:
		// which = Stepper.kr(trig, 0, 0, 3);
		which = which.poll(trig);
		Out.kr(~bubtrigbus.index + which, trig);
	}.play(target: ~trigs, addAction: \addAfter);

	s.sync;

	~bubs = [100,110,120,140].collect{|afreq|
		Synth(\bubblebub, [\freq, afreq, \decay, 2, \amp, 0.01], target: ~randomdistrib, addAction: \addAfter);
	};

	s.sync;

	// "map" allows us to push the triggers from the control bus to the "t_trig" inputs:
	~bubs.do{|bub, bubindex| bub.map(\t_trig, ~bubtrigbus.index + bubindex) };
};
)
