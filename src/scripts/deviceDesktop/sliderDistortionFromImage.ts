/* import * as THREE from 'three'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
const isTouch = true

import fragmentShader from '../assets/shaders/transition/fragment.glsl'
import vertexShader from '../assets/shaders/transition/vertex.glsl'

import disImage1 from '../assets/images/dis-1.webp'
import disImage2 from '../assets/images/dis-2.webp'

export const loadAssets = async () => {
	if (!isTouch) {
		try {
			await Promise.all([loadImage(disImage1), loadImage(disImage2)])
		} catch (error) {
			console.error(`Error loading slider assets: ${error}`)
		}
	}
}

interface SliderProps {
	parent: HTMLElement
	buttons: NodeListOf<HTMLElement>
	images?: NodeListOf<HTMLImageElement>
	videos?: NodeListOf<HTMLVideoElement>
	progress?: HTMLElement // setProperty
	dataSlider?: HTMLElement // html element to setAttribute data-slider="0" if index of current change
	displacementType: '1' | '2'
	isToggleButtonActive?: boolean // toggle buttons active class
	speedIn?: number
	speedOut?: number
	easing?: gsap.EaseString
	ratio?: number
	intensity?: number
	emitOnChangeIndex?: () => void
	emitOnShow?: () => void
	voiceButton?: HTMLButtonElement
}

export default class Slider {
	// options
	private parent: HTMLElement
	private buttons: NodeListOf<HTMLElement>
	private images?: NodeListOf<HTMLImageElement>
	private videos?: NodeListOf<HTMLVideoElement> | HTMLVideoElement[]
	private progress?: HTMLElement
	private dataSlider?: HTMLElement
	private displacementType: '1' | '2'
	private isToggleButtonActive?: boolean
	private speedIn: number
	private speedOut: number
	private easing: gsap.EaseString
	private ratio: number
	private intensity: number
	private emitOnChangeIndex?: () => void
	private emitOnShow?: () => void
	private voiceButton?: HTMLButtonElement
	private isMuted = true

	// state
	private totalSlides?: number
	public currentSliderIndex: number = 0
	public prevSliderIndex: number = 0
	private isTransitioning: boolean = true
	public isShown: boolean = false
	private isLoop: boolean = false
	private isCanPlay: boolean = false

	//scene
	private displacementImage!: string
	private scene!: THREE.Scene
	private camera!: THREE.OrthographicCamera
	private renderer!: THREE.WebGLRenderer
	private loader!: THREE.TextureLoader
	private displacement!: THREE.Texture
	private textures: (THREE.VideoTexture | THREE.Texture)[] = []
	private a1!: number
	private a2!: number
	private material!: THREE.ShaderMaterial
	private animationForTouchDevice: gsap.core.Timeline[] = []
	private progressId!: number
	private delayedCallProgress!: gsap.core.Tween
	private animationFrameId: number | null = null

	constructor(props: SliderProps) {
		this.parent = props.parent
		this.buttons = props.buttons
		this.progress = props.progress
		this.dataSlider = props.dataSlider
		this.displacementType = props.displacementType
		this.isToggleButtonActive = props.isToggleButtonActive
		this.speedIn = props.speedIn ?? 1.6
		this.speedOut = props.speedOut ?? 1.2
		this.easing = props.easing ?? 'power1.inOut'
		this.ratio = props.ratio ?? 1
		this.intensity = props.intensity ?? 0.5
		this.emitOnChangeIndex = props.emitOnChangeIndex
		this.emitOnShow = props.emitOnShow
		this.images = props.images
		this.voiceButton = props.voiceButton

		if (isTouch) {
			if (props.videos) {
				this.createTouchAnimations(props.videos)
				this.videos = props.videos
				this.videos.forEach(video => {
					this.createVideoEventListeners(video)
				})
				this.totalSlides = this.videos!.length
			} else if (props.images) {
				this.createTouchAnimations(props.images)
				this.images = props.images
				this.totalSlides = this.images!.length
			}
			ScrollTrigger.create({
				trigger: this.parent,
				start: 'top center',
				end: 'center top',
				invalidateOnRefresh: true,
				onEnter: () => {
					this.startSlider()
					if (!this.isShown) {
						this.show()
						document.addEventListener('visibilitychange', () => {
							if (this.isCanPlay) {
								if (document.visibilityState === 'hidden') {
									this.stopSlider(false)
								} else {
									this.startSlider(false)
								}
							}
						})
						this.createButtonsEvent()
					}
				},
				onLeave: () => {
					this.stopSlider()
				},
				onEnterBack: () => {
					this.startSlider()
				},
				onLeaveBack: () => {
					this.stopSlider()
				},
			})
		} else {
			THREE.Cache.enabled = true
			if (props.videos) {
				this.videos = this.cloneVideos(props.videos)
			}

			// choose image for displacement
			this.assignDisplacementImage()

			// set scene
			this.scene = new THREE.Scene()

			// set camera
			this.camera = this.setCamera()
			this.scene.add(this.camera)

			// set renderer
			this.renderer = this.setRenderer()
			this.parent.appendChild(this.renderer.domElement)

			// set displacement texture
			this.loader = new THREE.TextureLoader()
			this.loader.crossOrigin = ''
			this.loader.load(this.displacementImage, e => {
				// console.log('this.loader.load');
				this.displacement = e
				this.displacement.wrapS = this.displacement.wrapT = THREE.RepeatWrapping

				// load textures
				this.loadTextures()

				// setup correct sizes
				this.updateAspect()

				// create material
				this.createShaderMaterial()

				// create mesh
				this.createMesh()

				// rehandle on resize
				window.addEventListener('resize', this.handleResize.bind(this))

				ScrollTrigger.create({
					trigger: this.parent,
					start: 'top center',
					end: 'center top',
					invalidateOnRefresh: true,
					onEnter: () => {
						console.log(this);
						
						this.startSlider()
						if (!this.isShown) {
							this.show()
							document.addEventListener('visibilitychange', () => {
								if (this.isCanPlay) {
									if (document.visibilityState === 'hidden') {
										this.stopSlider(false)
									} else {
										this.startSlider(false)
									}
								}
							})
							this.createButtonsEvent()
						}
					},
					onLeave: () => {
						this.stopSlider()
					},
					onEnterBack: () => {
						this.startSlider()
					},
					onLeaveBack: () => {
						this.stopSlider()
					},
				})
			})
		}

		if (this.voiceButton) {
			this.voiceButton.addEventListener('click', () => {
				if (this.videos) {
					if (this.isMuted) {
						this.isMuted = false
						this.voiceButton?.classList.remove('muted')
					} else {
						this.isMuted = true
						this.voiceButton?.classList.add('muted')
					}

					this.videos.forEach(video => {
						video.muted = this.isMuted
					})
				}
			})
		}
	}

	private cloneVideos(
		initialVideos: NodeListOf<HTMLVideoElement>
	): HTMLVideoElement[] {
		return Array.from(initialVideos).map(
			video => video.cloneNode(true) as HTMLVideoElement
		)
	}

	private createTouchAnimations(items: NodeListOf<HTMLElement>): void {
		items!.forEach(item => {
			this.animationForTouchDevice.push(
				gsap
					.timeline({
						paused: true,
						defaults: { ease: 'power2.inOut' },
					})
					.fromTo(
						item,
						{ scale: 1.2, autoAlpha: 0, duration: this.speedOut },
						{ scale: 1, autoAlpha: 1, duration: this.speedIn }
					)
			)
		})
	}

	private createVideoEventListeners(video: HTMLVideoElement): void {
		video.addEventListener('ended', () => {
			this.change()
		})
	}

	private assignDisplacementImage(): void {
		switch (this.displacementType) {
			case '1':
				this.displacementImage = disImage1
				break
			case '2':
			default:
				this.displacementImage = disImage2
		}
	}

	private setCamera(): THREE.OrthographicCamera {
		const width = this.parent.offsetWidth
		const height = this.parent.offsetHeight

		const camera = new THREE.OrthographicCamera(
			width / -2,
			width / 2,
			height / 2,
			height / -2,
			1,
			1000
		)
		camera.position.z = 1

		return camera
	}

	private setRenderer(): THREE.WebGLRenderer {
		const renderer = new THREE.WebGLRenderer({ alpha: true })
		renderer.setPixelRatio(2)
		renderer.setClearColor(0xffffff, 0.0)
		renderer.setSize(this.parent.offsetWidth, this.parent.offsetHeight)
		// gsap.set(renderer.domElement, { opacity: 0 })
		return renderer
	}

	private render(): void {
		this.renderer.render(this.scene, this.camera)
	}

	private updateAspect(): void {
		const aspectRatio = this.parent.offsetHeight / this.parent.offsetWidth
		if (aspectRatio < this.ratio) {
			this.a1 = 1
			this.a2 = aspectRatio / this.ratio
		} else {
			this.a1 =
				(this.parent.offsetWidth / this.parent.offsetHeight) * this.ratio
			this.a2 = 1
		}
	}

	private createShaderMaterial(): void {
		const angle = Math.PI / 4 // 45 degrees

		const uniforms = {
			intensity1: { type: 'f', value: this.intensity },
			intensity2: { type: 'f', value: -this.intensity },
			disFactor: { type: 'f', value: 0 },
			angle1: { type: 'f', value: angle },
			angle2: { type: 'f', value: angle },
			texture1: { type: 't', value: '' },
			texture2: { type: 't', value: this.textures[this.currentSliderIndex] },
			dis: { type: 't', value: this.displacement },
			res: {
				type: 'vec4',
				value: new THREE.Vector4(
					this.parent.offsetWidth,
					this.parent.offsetHeight,
					this.a1,
					this.a2
				),
			},
		}

		this.material = new THREE.ShaderMaterial({
			uniforms,
			vertexShader,
			fragmentShader,
			transparent: true,
			opacity: 1.0,
		})
	}

	private createMesh(): void {
		const geometry = new THREE.PlaneGeometry(
			this.parent.offsetWidth,
			this.parent.offsetHeight,
			1
		)
		this.scene.add(new THREE.Mesh(geometry, this.material))
	}

	private handleResize(): void {
		this.updateAspect()
		this.material.uniforms.res.value.set(
			this.parent.offsetWidth,
			this.parent.offsetHeight,
			this.a1,
			this.a2
		)
		this.renderer.setSize(this.parent.offsetWidth, this.parent.offsetHeight)
		this.render()
	}

	private loadTextures(): void {
		if (this.videos) {
			this.createVideoTextures()
		} else if (this.images) {
			this.createImageTextures()
		}
	}

	private createVideoTextures(): void {
		this.videos!.forEach((video, index) => {
			this.textures[index] = new THREE.VideoTexture(video)
			this.updateTextures(this.textures[index])

			this.createVideoEventListeners(video)
		})
		this.isLoop = true
		this.totalSlides = this.videos!.length
	}

	private createImageTextures(): void {
		this.images!.forEach((image, index) => {
			this.textures[index] = this.loader.load(image.src, this.render.bind(this))
			this.updateTextures(this.textures[index])
		})

		this.totalSlides = this.images!.length
	}

	private updateTextures(texture: THREE.Texture): void {
		texture.magFilter = THREE.LinearFilter
		texture.minFilter = THREE.LinearFilter
		// texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy()
	}

	public show(): void {
		if (isTouch) {
			this.animationForTouchDevice[this.currentSliderIndex]
				.play()
				.eventCallback('onComplete', () => {
					this.onShowComplete()
				})
		} else {
			gsap.fromTo(
				this.material.uniforms.disFactor,
				{ value: 0 },
				{
					duration: this.speedIn,
					value: 1,
					ease: this.easing,
					onUpdate: () => {
						this.render()
					},
					onComplete: () => {
						this.render()
						this.onShowComplete()
					},
				}
			)
		}
		if (this.emitOnShow) {
			this.emitOnShow()
		}
		this.changeIndex(0)
	}

	private onShowComplete(): void {
		this.isTransitioning = false
		this.isShown = true
		if (this.isCanPlay) {
			this.playSlider()
		}
	}

	private changeIndex(index: number): void {
		this.prevSliderIndex = this.currentSliderIndex
		this.currentSliderIndex = index

		if (this.dataSlider) {
			this.dataSlider.setAttribute('data-slider', index.toString())
		}

		if (this.emitOnChangeIndex) {
			this.emitOnChangeIndex()
		}

		if (this.isToggleButtonActive) {
			this.buttons[this.prevSliderIndex].classList.remove('active')
			this.buttons[this.currentSliderIndex].classList.add('active')
		}
	}

	private createButtonsEvent(): void {
		this.buttons.forEach((btn, index) => {
			btn.addEventListener('click', () => {
				this.change(index)
			})
		})
		if (this.isToggleButtonActive) {
			this.buttons[this.currentSliderIndex].classList.add('active')
		}
	}

	public playSlider({ index }: { index?: number } = {}): void {
		const playIndex = index ?? this.currentSliderIndex
		if (this.videos) {
			const video = this.videos[playIndex]
			video.play()
		}
		this.startProgress()
	}

	public pauseSlider({
		index,
		isCurrentTime = true,
		isStopProgress = true,
	}: {
		index?: number
		isCurrentTime?: boolean
		isStopProgress?: boolean
	} = {}): void {
		if (this.videos) {
			const pauseIndex = index ?? this.currentSliderIndex
			const video = this.videos![pauseIndex]

			video.pause()

			if (isCurrentTime) {
				video.currentTime = 0
			}
		}
		if (isStopProgress) {
			this.stopProgress()
		}
	}

	public startProgress(): void {
		if (this.videos) {
			this.progressId = setInterval(() => {
				const value = Math.round(
					(this.videos![this.currentSliderIndex].currentTime /
						this.videos![this.currentSliderIndex].duration) *
						100
				)
				this.setProgress(value)
			}, 100)
		} else {
			this.delayedCallProgress = gsap.delayedCall(this.speedIn * 2, () => {
				this.change()
			})
		}
	}

	public stopProgress(): void {
		if (this.videos) {
			clearInterval(this.progressId)
		} else {
			this.delayedCallProgress?.kill()
		}
	}

	private setProgress(value: number): void {
		if (this.progress) {
			this.progress.style.setProperty('--progress', `${value}%`)
		}
	}

	private startSlider(isToggleCanPlay: boolean = true): void {
		if (this.isLoop) {
			this.startLoop()
		}

		if (this.isShown) {
			this.playSlider()
		}

		if (isToggleCanPlay) {
			this.isCanPlay = true
		}
	}

	private stopSlider(isToggleCanPlay: boolean = true): void {
		this.pauseSlider({ isCurrentTime: false })

		if (this.isLoop) {
			this.stopLoop()
		}

		if (isToggleCanPlay) {
			this.isCanPlay = false
		}
	}

	private startLoop(): void {
		this.render()
		this.animationFrameId = requestAnimationFrame(this.startLoop.bind(this))
	}

	public stopLoop(): void {
		if (this.animationFrameId !== null) {
			cancelAnimationFrame(this.animationFrameId)
			this.animationFrameId = null
		}
	}

	public change(
		index: number = (this.currentSliderIndex + 1) % this.totalSlides!
	): void {
		if (
			this.isTransitioning ||
			this.currentSliderIndex === index ||
			!this.isCanPlay
		)
			return

		this.isTransitioning = true
		this.pauseSlider({ isCurrentTime: false })
		this.setProgress(0)

		this.changeIndex(index)

		if (isTouch) {
			this.animationForTouchDevice[this.prevSliderIndex].reverse()
			this.animationForTouchDevice[index]
				.play()
				.eventCallback('onComplete', () => {
					this.onChangeComplete()
				})
		} else {
			if (this.currentSliderIndex > this.prevSliderIndex) {
				this.material.uniforms.intensity1.value = -this.intensity
				this.material.uniforms.intensity2.value = this.intensity
			} else {
				this.material.uniforms.intensity1.value = this.intensity
				this.material.uniforms.intensity2.value = -this.intensity
			}
			this.material.uniforms.texture1.value =
				this.textures[this.currentSliderIndex]

			gsap.to(this.material.uniforms.disFactor, {
				duration: this.speedIn,
				value: 0,
				ease: this.easing,
				onUpdate: () => this.render(),
				onComplete: () => {
					this.material.uniforms.disFactor.value = 1
					this.material.uniforms.texture2.value =
						this.textures[this.currentSliderIndex]
					this.render()
					this.onChangeComplete()
				},
			})
		}
	}

	private onChangeComplete(): void {
		this.isTransitioning = false
		this.pauseSlider({
			index: this.prevSliderIndex,
			isCurrentTime: true,
			isStopProgress: false,
		})
		if (this.isCanPlay) {
			this.playSlider()
		}
	}
} */