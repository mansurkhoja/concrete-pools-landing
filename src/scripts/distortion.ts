import * as THREE from 'three'
import { gsap } from 'gsap'
import vertexShader from '../assets/shaders/distortion/vertex.glsl'
import fragmentShader from '../assets/shaders/distortion/fragment.glsl'

interface DistortionProps {
	parent: HTMLElement
	speed?: number
	easing?: gsap.EaseString
	emitOnInitialized?: () => void
	emitOnShown?: () => void
	emitOnChanged?: () => void
}

class ResourceTracker {
	private resources: Set<{ dispose?: () => void }> = new Set()

	track<T>(resource: T & { dispose?: () => void }): T {
		if (resource.dispose) {
			this.resources.add(resource)
		}
		return resource
	}

	/* untrack<T>(resource: T & { dispose?: () => void }): void {
    this.resources.delete(resource);
  } */

	dispose(): void {
		for (const resource of this.resources) {
			resource.dispose?.()
		}
		this.resources.clear()
	}
}

export default class Distortion {
	//props
	private parent: HTMLElement
	private speed: number
	private easing: gsap.EaseString
	private emitOnInitialized?: () => void
	private emitOnShown?: () => void
	private emitOnChanged?: () => void

	//state
	// private initialized: boolean = false
	private isVisible: boolean = false

	//animationFrame
	private cameraFrame: number | null = null
	private animationFrame: number | null = null

	//scene
	private scene!: THREE.Scene
	private camera!: THREE.PerspectiveCamera
	private renderer!: THREE.WebGLRenderer
	private material!: THREE.ShaderMaterial
	private plane!: THREE.Mesh<
		THREE.PlaneGeometry,
		THREE.ShaderMaterial,
		THREE.Object3DEventMap
	>
	private textures!: THREE.Texture[]
	private texture!: THREE.Texture
	private resTracker!: ResourceTracker
	private width: number = 0
	private height: number = 0
	private track!: <T>(resource: T & { dispose?: () => void }) => T
	private time: number = 0
	private resizeEvent!: () => void

	constructor(props: DistortionProps) {
		this.parent = props.parent
		this.speed = props.speed ?? 1
		this.easing = props.easing ?? 'power2.inOut'
		this.emitOnInitialized = props.emitOnInitialized
		this.emitOnShown = props.emitOnShown
		this.emitOnChanged = props.emitOnChanged

		this.updateSize()

		this.resTracker = new ResourceTracker()
		this.track = this.resTracker.track.bind(this.resTracker)

		this.scene = new THREE.Scene()

		this.camera = this.setCamera()

		this.renderer = this.setRenderer()
		this.parent.appendChild(this.renderer.domElement)
		gsap.set(this.renderer.domElement, { autoAlpha: 0 })

		this.createShaderMaterial()

		this.createMesh()

		this.resizeEvent = () => this.resize(this.texture)
	}

	private updateSize(): void {
		const { width, height } = this.parent.getBoundingClientRect()
		this.width = width
		this.height = height
	}

	private setCamera(): THREE.PerspectiveCamera {
		const camera = new THREE.PerspectiveCamera(
			70,
			this.width / this.height,
			0.001,
			100
		)
		camera.position.set(0, 0, 1)
		return camera
	}

	private setRenderer(): THREE.WebGLRenderer {
		const renderer = new THREE.WebGLRenderer({ alpha: true })
		renderer.setPixelRatio(window.devicePixelRatio)
		renderer.setClearColor(0xffffff, 0.0)
		return renderer
	}

	private createShaderMaterial(): void {
		const uniforms = {
			time: { type: 'f', value: 0 },
			img1: { type: 't', value: '' },
			img2: { type: 't', value: '' },
			progress1: { type: 'f', value: 0 },
			progress2: { type: 'f', value: 0 },
			resolution: { type: 'v2', value: '' },
		}

		this.material = this.track(
			new THREE.ShaderMaterial({
				side: THREE.DoubleSide,
				uniforms,
				vertexShader,
				fragmentShader,
			})
		)
	}

	private createMesh(): void {
		this.plane = new THREE.Mesh(
			this.track(new THREE.PlaneGeometry(1, 1, 64, 64)),
			this.material
		)
		this.scene.add(this.plane)
	}

	private resize(texture: THREE.Texture, speed?: number): void {
		this.updateSize()
		this.material.uniforms.resolution.value = new THREE.Vector2(
			this.width,
			this.height
		)
		this.renderer.setSize(this.width, this.height)
		this.camera.aspect = this.width / this.height

		let scale = texture.image.width / texture.image.height
		let fov: number

		const distance = this.camera.position.z - this.plane.position.z
		const RAD_TO_DEG = 2 * (180 / Math.PI)

		if (this.width / this.height > scale) {
			fov = RAD_TO_DEG * Math.atan(scale / 2 / distance / this.camera.aspect)
		} else {
			fov = RAD_TO_DEG * Math.atan(this.plane.scale.y / 2 / distance)
		}

		if (speed) {
			const updateCamera = () => {
				this.camera.updateProjectionMatrix()
				this.cameraFrame = requestAnimationFrame(updateCamera)
			}
			updateCamera()
			gsap
				.timeline({ defaults: { duration: speed, ease: this.easing } })
				.to(this.plane.scale, { x: scale })
				.to(this.camera, { fov: fov }, `-=${speed}`)
				.eventCallback('onComplete', () => {
					cancelAnimationFrame(this.cameraFrame!)
				})
		} else {
			this.plane.scale.x = scale
			this.camera.fov = fov
			this.camera.updateProjectionMatrix()
		}
	}

	public init(url: string): void {
		this.textures = []

		this.texture = this.textures[0] = this.track(
			new THREE.TextureLoader().load(url, () => {
				this.material.uniforms.img1.value = this.texture
				this.material.uniforms.img2.value = this.texture
				this.resize(this.texture)
				this.render()
				window.addEventListener('resize', this.resizeEvent)
				if (this.emitOnInitialized) this.emitOnInitialized()
			})
		)
	}

	private render(): void {
		let style = window.getComputedStyle(this.renderer.domElement, null)

		if (this.isVisible && style.visibility === 'visible') {
			this.time += 0.04
			this.material.uniforms.time.value = this.time
			this.renderer.render(this.scene, this.camera)
		}

		this.animationFrame = requestAnimationFrame(() => this.render())
	}

	public show(speed = this.speed): void {
		gsap
			.timeline({ defaults: { duration: speed, ease: this.easing } })
			.fromTo(
				[this.material.uniforms.progress1, this.material.uniforms.progress2],
				{ value: 1 },
				{ value: 0 }
			)
			.to(this.renderer.domElement, { autoAlpha: 1 }, `-=${speed}`)
			.eventCallback('onComplete', () => {
				if (this.emitOnShown) this.emitOnShown()
			})
	}

	public change(url: string, index: number, speed = this.speed): void {
		let change = () => {
			this.texture = this.textures[index]
			this.material.uniforms.img2.value = this.texture
			this.resize(this.texture, speed)
			gsap
				.timeline({ defaults: { duration: speed, ease: this.easing } })
				.fromTo(this.material.uniforms.progress1, { value: 0 }, { value: 1 })
				.fromTo(
					this.material.uniforms.progress2,
					{ value: 1 },
					{ value: 0 },
					`-=${speed}`
				)
				.eventCallback('onComplete', () => {
					this.material.uniforms.progress1.value = 0
					this.material.uniforms.progress2.value = 0
					this.material.uniforms.img1.value = this.texture
					if (this.emitOnChanged) this.emitOnChanged()
				})
		}

		if (this.textures[index] && this.textures[index].image) {
			change()
		} else {
			this.texture = this.textures[index] = this.track(
				new THREE.TextureLoader().load(url, () => {
					change()
				})
			)
		}
	}

	public setIsVisible(isVisible: boolean): void {
		this.isVisible = isVisible
	}

	public destroy(): void {
		this.setIsVisible(false)
		cancelAnimationFrame(this.cameraFrame!)
		cancelAnimationFrame(this.animationFrame!)
		window.removeEventListener('resize', this.resizeEvent)
		this.resTracker.dispose()
		this.renderer.dispose()
		this.renderer.domElement.remove()
		this.scene.remove.apply(this.scene, this.scene.children)
		for (let child in this) delete this[child]
	}
}
