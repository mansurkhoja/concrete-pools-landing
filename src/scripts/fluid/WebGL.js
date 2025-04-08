import Common from './Common'
import Output from './Output'
import Mouse from './Mouse'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default class WebGL {
	constructor(props) {
		this.props = props
		this.isVisible = true

		this.Common = new Common({
			parent: props.container,
		})

		this.Mouse = new Mouse({
			Common: this.Common,
			container: props.container,
		})

		this.Common.init()
		this.Mouse.init()

		this.init()
		this.loop()

		window.addEventListener('resize', this.resize.bind(this))
	}

	init() {
		this.props.parent.prepend(this.Common.renderer.domElement)
		this.Output = new Output({
			Common: this.Common,
			Mouse: this.Mouse,
			src: this.props.src,
			onLoad: this.props.onLoad
		})

		ScrollTrigger.create({
			trigger: this.props.container,
			start: 'top bottom',
			end: 'bottom top',
			markers: true,
			onEnter: () => {
				this.isVisible = true
			},
			onLeave: () => {
				this.isVisible = false
			},
			onEnterBack: () => {
				this.isVisible = true
			},
			onLeaveBack: () => {
				this.isVisible = false
			},
		})
	}

	resize() {
		this.Common.resize()
		this.Output.resize()
	}

	render() {
		if (this.isVisible) {
			this.Common.update()
			this.Output.update()
		}
	}

	loop() {
		this.render()
		requestAnimationFrame(this.loop.bind(this))
	}

	// stopLoop() {
	// 	cancelAnimationFrame(this.loop.bind(this))
	// }
}
