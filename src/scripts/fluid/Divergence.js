import divergence_frag from '../../assets/shaders/fluid/divergence.frag'
import face_vert from '../../assets/shaders/fluid/face.vert'

import ShaderPass from './ShaderPass'

export default class Divergence extends ShaderPass {
	constructor(simProps) {
		super({
			material: {
				vertexShader: face_vert,
				fragmentShader: divergence_frag,
				uniforms: {
					boundarySpace: {
						value: simProps.boundarySpace,
					},
					velocity: {
						value: simProps.src.texture,
					},
					px: {
						value: simProps.cellScale,
					},
					dt: {
						value: simProps.dt,
					},
				},
			},
			output: simProps.dst,
			Common: simProps.Common,
		})

		this.init()
	}

	update({ vel }) {
		this.uniforms.velocity.value = vel.texture
		super.update()
	}
}
