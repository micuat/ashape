function ShaderHelper () {
}

ShaderHelper.prototype.load = function (parent, path) {
  let fragSourceRaw = parent.loadStrings(path);
  let fragSource = [];
  for (let i in fragSourceRaw) {
    if (fragSourceRaw[i].match(/^#pragma include "(.*)"$/)) {
      let name = fragSourceRaw[i].replace(/^#pragma include "(.*)"$/, '$1');
      let includeSource = parent.loadStrings(name);
      for (let j in includeSource) {
        fragSource.push(includeSource[j]);
      }
    }
    else {
      fragSource.push(fragSourceRaw[i]);
    }
  }
  let vertSource = parent.loadStrings("libs/textureVert.glsl");
  return new Packages.processing.opengl.PShader(parent.that, vertSource, fragSource);
}

var shaderHelper = new ShaderHelper();