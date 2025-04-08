import * as THREE from 'three'
import { gsap } from 'gsap' // Ensure GSAP is imported

export default class Mouse {
	constructor(props) {
		this.Common = props.Common
		this.container = props.container

		this.coords = new THREE.Vector2()
		this.coords_old = new THREE.Vector2()
		this.diff = new THREE.Vector2()

		this.isAnimating = false
	}

	init() {
		this.container.addEventListener(
			'mousemove',
			this.onDocumentMouseMove.bind(this),
			false
		)
	}

	setCoords(x, y) {
		const newCoords = new THREE.Vector2(
			(x / this.Common.width) * 2 - 1,
			-(y / this.Common.height) * 2 + 1
		)

		if (this.isAnimating) {
			// Stop any existing animation
			gsap.killTweensOf(this.coords)
		}

		// Animate the coords to the new value
		gsap.to(this.coords, {
			x: newCoords.x,
			y: newCoords.y,
			ease: 'none',
			duration: 0.1, // Adjust the duration for your needs
			onUpdate: () => this.update(), // Update the diff on each frame
			onComplete: () => {
				this.isAnimating = false
				this.update()
			},
		})

		this.isAnimating = true
	}

	onDocumentMouseMove(event) {
		const bound = this.container.getBoundingClientRect()
		this.setCoords(event.clientX - bound.x, event.clientY - bound.y)
	}

	update() {
		this.diff.subVectors(this.coords, this.coords_old)
		this.coords_old.copy(this.coords)

		if (this.coords_old.x === 0 && this.coords_old.y === 0) this.diff.set(0, 0)
	}
}
