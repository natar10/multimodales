const fs = require('fs');

function bundleShaders() {
    const simplex = fs.readFileSync('spirit/src/glsl/helpers/simplexNoiseDerivatives4.glsl', 'utf8');
    const curl = fs.readFileSync('spirit/src/glsl/helpers/curl4.glsl', 'utf8');
    const pos = fs.readFileSync('spirit/src/glsl/position.frag', 'utf8');
    const quadVert = fs.readFileSync('spirit/src/glsl/quad.vert', 'utf8');
    const throughFrag = fs.readFileSync('spirit/src/glsl/through.frag', 'utf8');
    const particlesVert = fs.readFileSync('spirit/src/glsl/particles.vert', 'utf8');
    const particlesFrag = fs.readFileSync('spirit/src/glsl/particles.frag', 'utf8');

    let finalCurl = curl.replace('#pragma glslify: snoise4 = require(./simplexNoiseDerivatives4)', simplex)
                        .replace('#pragma glslify: export(curl)', '');

    let finalPos = pos.replace('#pragma glslify: curl = require(./helpers/curl4)', finalCurl);

    let output = `
export const positionFrag = \`${finalPos.replace(/`/g, '\\`')}\`;
export const quadVert = \`${quadVert.replace(/`/g, '\\`')}\`;
export const throughFrag = \`${throughFrag.replace(/`/g, '\\`')}\`;
export const particlesVert = \`${particlesVert.replace(/`/g, '\\`')}\`;
export const particlesFrag = \`${particlesFrag.replace(/`/g, '\\`')}\`;
`;

    fs.writeFileSync('src/three/effects/spirit/shaders.js', output);
    console.log('Shaders bundled!');
}

bundleShaders();
