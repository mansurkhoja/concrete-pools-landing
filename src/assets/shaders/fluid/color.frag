precision highp float;
uniform sampler2D velocity;
uniform sampler2D texture;
varying vec2 uv;
varying vec2 originalUv;
uniform vec2 uvRate;
uniform float power;

float getBounds(vec2 uv) {
    return ((step(0., uv.x) * step(0., uv.y)) * (1. - step(1., uv.x))) * (1. - step(1., uv.y));
}

void main() {
    vec2 imgUv = uv;
    imgUv -= 0.5;
    imgUv /= uvRate;
    imgUv += 0.5;

    vec2 vel = texture2D(velocity, uv).xy;
    float len = length(vel);
    vel = (vel * 0.5) + 0.5;
    vec3 color = vec3(vel.x, vel.y, 1.0);
    color = mix(vec3(1.0), color, len * power);

    float bound = getBounds(imgUv);
    imgUv += (1. - (color.r * bound));
    imgUv += (1. - (color.g * bound));
    imgUv += (1. - (color.b * bound));

    vec4 image = texture2D(texture, imgUv);
    gl_FragColor = vec4(color * .5, 1.0);
    gl_FragColor = image;
}
