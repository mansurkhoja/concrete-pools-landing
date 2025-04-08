import * as THREE from 'three'

export default class Common {
	constructor(props) {
		this.props = props
		this.width = null
		this.height = null
		this.resizeFunc = this.resize.bind(this)

		this.time = 0
		this.delta = 0
	}

	init() {
		this.pixelRatio = window.devicePixelRatio

		this.resize()

		this.renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: true,
		})

		this.renderer.autoClear = false

		this.renderer.setSize(this.width, this.height)

		this.renderer.setClearColor(0x000000)

		this.renderer.setPixelRatio(this.pixelRatio)

		this.clock = new THREE.Clock()
		this.clock.start()
	}

	resize() {
		const bound = this.props.parent.getBoundingClientRect()
		this.width = bound.width
		this.height = bound.height
		
		if (this.renderer) this.renderer.setSize(this.width, this.height)
	}

	update() {
		this.delta = this.clock.getDelta()
		this.time += this.delta
	}
}

