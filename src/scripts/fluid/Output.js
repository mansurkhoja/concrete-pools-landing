import * as THREE from 'three'

import color_frag from '../../assets/shaders/fluid/color.frag'
import face_vert from '../../assets/shaders/fluid/face.vert'
import Simulation from './Simulation'

export default class Output {
	constructor(props) {
		this.Common = props.Common
		this.Mouse = props.Mouse
		this.src = props.src
		this.onLoad = props.onLoad
		this.init()
	}

	init() {
		this.texture = new THREE.TextureLoader().load(this.src, this.onLoad)

		this.simulation = new Simulation({
			Common: this.Common,
			Mouse: this.Mouse,
		})
		this.simulation.options.cursor_size = this.Common.width / 6

		this.scene = new THREE.Scene()
		this.camera = new THREE.Camera()

		this.output = new THREE.Mesh(
			new THREE.PlaneGeometry(2, 2),
			new THREE.RawShaderMaterial({
				vertexShader: face_vert,
				fragmentShader: color_frag,
				uniforms: {
					velocity: {
						value: this.simulation.fbos.vel_0.texture,
					},
					power: { value: 0.4 },
					uvRate: { value: new THREE.Vector2(1, 1) },
					texture: { value: this.texture },
					boundarySpace: {
						value: new THREE.Vector2(),
					},
				}
			})
		)

		this.scene.add(this.output)
	}

	resize() {
		this.simulation.resize()
		this.simulation.options.cursor_size = this.Common.width / 6
	}

	render() {
		this.Common.renderer.setRenderTarget(null)
		this.Common.renderer.render(this.scene, this.camera)
	}

	update() {
		this.simulation.update()
		this.render()
	}
}
