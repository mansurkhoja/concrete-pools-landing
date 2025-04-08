import face_vert from '../../assets/shaders/fluid/face.vert'
import pressure_frag from '../../assets/shaders/fluid/pressure.frag'
import ShaderPass from './ShaderPass'

export default class Pressure extends ShaderPass {
	constructor(simProps) {
		super({
			material: {
				vertexShader: face_vert,
				fragmentShader: pressure_frag,
				uniforms: {
					boundarySpace: {
						value: simProps.boundarySpace,
					},
					pressure: {
						value: simProps.src_p.texture,
					},
					velocity: {
						value: simProps.src_v.texture,
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

	update({ vel, pressure }) {
		this.uniforms.velocity.value = vel.texture
		this.uniforms.pressure.value = pressure.texture
		super.update()
	}
}
