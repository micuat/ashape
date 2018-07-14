// instance mode by Naoto Hieda

var shader, depthShader;
var pos = [];
var pg;

var s = function (p) {
    p.setup = function () {
    p.createCanvas(800, 800);
    p.frameRate(30);

    pg = p.createGraphics(800, 800, p.P3D);
    shader = shaderHelper.load(p, p.folderName + "/frag.glsl");
  }

  let tween = 0;
  function vowel_a (angle) {
    let cos = Math.cos(angle);
    if(cos < 0) cos = 0;
    let x = 50 + 50 * Math.pow(cos, 32.0);
    let z = 100 * Math.sin(angle);
    return {x: x, z: z, cx: -50, cz: 0};
  }
  function vowel_i (angle) {
    let x = 50;
    let z = 100 * Math.sin(angle);
    return {x: x, z: z, cx: -50, cz: 0};
  }
  function vowel_o (angle) {
    let cos = Math.cos(angle);
    if(cos < 0) cos = 0;
    let x = 75 * Math.sin(angle);
    let z = 50 - 50 * Math.pow(cos, 32.0);
    return {x: x, z: z, cx: 0, cz: -50};
  }
  function vowel_eu (angle) {
    let x = 75 * Math.sin(angle);
    let z = 50;
    return {x: x, z: z, cx: 0, cz: -50};
  }
  function vowel_oo (angle) {
    let cos = Math.cos(angle);
    if(cos < 0) cos = 0;
    let x = 75 * Math.sin(angle);
    let z = 50 + 50 * Math.pow(cos, 32.0);
    return {x: x, z: z, cx: 0, cz: -50};
  }
  let vowels = [vowel_a, vowel_i, vowel_o, vowel_eu, vowel_oo];
  let vowel0, vowel1;

  function consonant_ng (angle, pos) {
    let x = 50 * Math.cos(angle) + pos.cx;
    let z = 50 * Math.sin(angle) + pos.cz;
    return {x: x, z: z};
  }
  function consonant_s (angle, pos) {
    let cos = Math.cos(angle);
    let x = 50 * Math.sin(angle) + pos.cx;
    let z = 75.0/2 + 75 * -Math.pow(cos, 4.0) + pos.cz;
    return {x: x, z: z};
  }
  function consonant_m (angle, pos) {
    let x = 50 * Math.pow(Math.abs(Math.cos(angle)), 0.5) * (Math.cos(angle)>0?1:-1) + pos.cx;
    let z = 50 * Math.pow(Math.abs(Math.sin(angle)), 0.5) * (Math.sin(angle)>0?1:-1) + pos.cz;
    return {x: x, z: z};
  }
  let consonants = [consonant_ng, consonant_s, consonant_m];
  let consonant0, consonant1;

  p.draw = function () {
    if (p.frameCount % 60 == 0) {
      // shader = shaderHelper.load(p, "028_points/frag.glsl");
      // depthShader = p.loadShader("028_points/depthFrag.glsl", "028_points/depthVert.glsl");
      // print(p.frameRate());
    }

    if (vowel0 == null) vowel0 = vowels[0];
    if (consonant0 == null) consonant0 = consonants[0];
    if (vowel1 == null) vowel1 = vowels[0];
    if (consonant1 == null) consonant1 = consonants[0];
    if (p.frameCount % 120 == 0) {
      print(p.frameRate());
      // defaultShader = p.loadShader(name + ("/default.frag"), name + ("/default.vert"));
      // p.shader(defaultShader);
    }

    if (p.frameCount % 120 == 0) {
      // vowel1 = vowel0;
      vowel0 = p.random(vowels);
      // consonant1 = consonant0;
      consonant0 = p.random(consonants);
    }
    else if (p.frameCount % 120 == 60) {
      // vowel0 = vowel1;
      vowel1 = p.random(vowels);
      // consonant0 = consonant1;
      consonant1 = p.random(consonants);
    }

    tween0 = Math.cos(p.frameCount / 120.0 * Math.PI * 2.0);
    tween0 = (tween0 == 0) ? 0.5 : (tween0 > 0 ? 1 : 0);
    tween = p.lerp(tween, tween0, 0.1);

    let t = p.millis() * 0.001;

    shader.set("u_depth", pg);

    p.background(0);

    shader.set("iTime", t);

    let n = 2.0;

    let x = 0;
    let z = 0;

    function lerp(p0, p1, rate) {
      return {x: p.lerp(p0.x, p1.x, rate),
      z: p.lerp(p0.z, p1.z, rate)};
    }
    {
      let i = 0;
      let phase = Math.PI * i / n * 2.0;
      let angle = p.millis() * 0.0025 * (i + 1) + 2.0*Math.PI*(-Math.sin(t) * 0.5 + 0.5);
      // let angle = p.millis() * 0.005 + phase;

      let pos0 = vowel0(angle);
      let pos1 = vowel1(angle);
      let pos = lerp(pos0, pos1, tween);
      shader.set("pos0", pos.x / 100.0, 0.0, pos.z / 100.0);

      pos0 = consonant0(angle, pos0);
      pos1 = consonant1(angle, pos1);
      pos = lerp(pos0, pos1, tween);
      shader.set("pos2", pos.x / 100.0, 0.0, pos.z / 100.0);
    }
    {
      let i = 1;
      let phase = Math.PI * i / n * 2.0;
      let angle = p.millis() * 0.0025 * (i + 1) + 2.0*Math.PI*(Math.sin(t) * 0.5 + 0.5);
      // let angle = p.millis() * 0.005 + phase;

      let pos0 = vowel0(angle);
      let pos1 = vowel1(angle);
      let pos = lerp(pos0, pos1, tween);
      shader.set("pos1", pos.x / 100.0, 0.0, pos.z / 100.0);

      pos0 = consonant0(angle, pos0);
      pos1 = consonant1(angle, pos1);
      pos = lerp(pos0, pos1, tween);
      shader.set("pos3", pos.x / 100.0, 0.0, pos.z / 100.0);
    }

    p.filter(shader);

    // p.image(pg, 0, 0);
    // p.rect(0, 0, p.width, p.height)
  }

};

var p057 = new p5(s);