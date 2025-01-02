import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

interface SliderProps {
	section: HTMLElement
	parent: HTMLElement
	buttons: NodeListOf<HTMLElement>
	covers?: NodeListOf<HTMLElement>
	voiceButton?: HTMLElement
	playButton?: HTMLElement
	prevButton?: HTMLElement
	nextButton?: HTMLElement
	slides: NodeListOf<HTMLElement>
	videos: NodeListOf<HTMLVideoElement>
	progress?: HTMLElement
	autoInit?: boolean
	autoplay?: boolean
	muted?: boolean
	speed?: number
	easing?: gsap.EaseString
	emitOnChange?: () => void
	emitOnShown?: () => void
}

export default class Slider {
	//props
	private section: HTMLElement
	private parent: HTMLElement
	private buttons: NodeListOf<HTMLElement>
	private covers?: NodeListOf<HTMLElement>
	private voiceButton?: HTMLElement
	private playButton?: HTMLElement
	private prevButton?: HTMLElement
	private nextButton?: HTMLElement
	private slides: NodeListOf<HTMLElement>
	private videos: NodeListOf<HTMLVideoElement>
	private progress?: HTMLElement
	private autoInit: boolean
	private autoplay: boolean
	private muted: boolean
	private speed: number
	private easing: gsap.EaseString
	private emitOnChange?: () => void
	private emitOnShown?: () => void

	// state
	private currentIndex: number = 0
	private prevIndex: number = 0
	private animating: boolean = false
	private canPlay: boolean = false
	private initialized: boolean = false
	private loaded: number[] = []

	//animations
	public tls: gsap.core.Timeline[] = []
	private progressId!: number

	constructor(props: SliderProps) {
		this.section = props.section
		this.parent = props.parent
		this.buttons = props.buttons
		this.covers = props.covers
		this.voiceButton = props.voiceButton
		this.playButton = props.playButton
		this.prevButton = props.prevButton
		this.nextButton = props.nextButton
		this.slides = props.slides
		this.videos = props.videos
		this.progress = props.progress
		this.autoInit = props.autoInit ?? true
		this.autoplay = props.autoplay ?? true
		this.muted = props.muted ?? false
		this.speed = props.speed ?? 1.2
		this.easing = props.easing ?? 'power1.inOut'
		this.emitOnChange = props.emitOnChange
		this.emitOnShown = props.emitOnShown

		this.slides.forEach((slide, index) => {
			this.createVideoEvents(this.videos[index])
			this.createTl(slide)
		})

		this.createButtonsEvent()
	}

	private createTl(video: HTMLElement): void {
		this.tls.push(
			gsap
				.timeline({
					paused: true,
					defaults: { ease: this.easing },
				})
				.fromTo(
					video,
					{ scale: 1.2, autoAlpha: 0, duration: this.speed },
					{ scale: 1, autoAlpha: 1, duration: this.speed }
				)
		)
	}

	private createVideoEvents(video: HTMLVideoElement): void {
		video.addEventListener('ended', () => {
			this.change()
		})
	}

	private createButtonsEvent(): void {
		this.buttons.forEach((btn, index) => {
			btn.addEventListener('click', () => {
				this.change(index)
			})
		})

		if (this.voiceButton) {
			this.voiceButton.addEventListener('click', () => {
				if (this.canPlay) {
					this.muted = !this.muted
					this.voiceButton!.classList.toggle('muted', this.muted)
					this.videos!.forEach(video => {
						video.muted = this.muted
					})
				}
			})
		}

		if (this.playButton) {
			this.playButton.addEventListener('click', () => {
				if (this.canPlay && !this.animating) {
					if (this.loaded.includes(this.currentIndex)) {
						this.playVideo()
					} else {
						const index = this.currentIndex
						const slide = this.slides[index]
						if (!slide.classList.contains('load') && this.covers) {
							slide.classList.add('load')
							const video = this.videos[index]
							const cover = this.covers[index]
							video.load()
							video.addEventListener(
								'loadeddata',
								async () => {
									this.loaded.push(index)
									gsap.to(cover, {
										opacity: 0,
										duration: 0.4,
										onComplete: () => {
											cover.remove()
										},
									})
									if (this.canPlay && this.currentIndex === index) {
										this.playVideo()
										this.toggleButtonPlay()
									}
								},
								{ once: true }
							)
							video.addEventListener('error', () => {
								slide.classList.remove('load')
							})
						}
					}
					this.toggleButtonPlay()
				}
			})
		}

		if (this.prevButton) {
			this.prevButton.addEventListener('click', () => {
				this.change(
					(this.currentIndex - 1 + this.slides.length) % this.slides.length
				)
			})
		}

		if (this.nextButton) {
			this.nextButton.addEventListener('click', () => {
				this.change()
			})
		}
	}

	private toggleButtonPlay(isPlay = true): void {
		this.playButton?.classList.toggle('playing', isPlay)
	}

	public init(): void {
		ScrollTrigger.create({
			trigger: this.parent,
			start: 'top center',
			end: 'bottom center',
			onEnter: () => {
				this.startSlider()
				if (!this.initialized) {
					document.addEventListener('visibilitychange', () => {
						if (this.canPlay) {
							if (document.visibilityState === 'hidden') {
								this.stopSlider(false)
							} else {
								this.startSlider(false)
							}
						}
					})
					this.initialized = true
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
	}

	public show(): void {
		this.tls[this.currentIndex].play().eventCallback('onComplete', () => {
			this.onShowComplete()
		})
	}

	private onShowComplete(): void {
		// this.animating = false

		if (this.emitOnShown) {
			this.emitOnShown()
		}

		if (this.autoInit) {
			this.init()
		}

		if (this.progress) {
			this.progress.classList.add('progress--active')
		}

		this.toggleButtonPlay(false)
	}

	private startSlider(isToggleCanPlay: boolean = true): void {
		if (isToggleCanPlay) {
			this.canPlay = true
		}

		if (this.autoplay) {
			this.playVideo()
		}
	}

	private stopSlider(isToggleCanPlay: boolean = true): void {
		this.pauseVideo({ isCurrentTime: false })

		if (isToggleCanPlay) {
			this.canPlay = false
		}
	}

	public async playVideo(): Promise<void> {
		if (this.canPlay) {
			const index = this.currentIndex
			const video = this.videos[index]
			await video.play()
			this.startProgress()
		}
	}

	public pauseVideo({
		index = this.currentIndex,
		isCurrentTime = true,
		isStopProgress = true,
	}: {
		index?: number
		isCurrentTime?: boolean
		isStopProgress?: boolean
	} = {}): void {
		if (isStopProgress) {
			this.stopProgress()
		}
		const video = this.videos[index]

		video.pause()

		if (isCurrentTime) {
			video.currentTime = 0
		}

		this.toggleButtonPlay(false)
	}

	private startProgress(): void {
		if (this.progress) {
			const video = this.videos[this.currentIndex]
			this.progressId = setInterval(() => {
				if (!(video.paused || video.ended)) {
					const value = Math.round((video.currentTime / video.duration) * 100)
					this.setProgress(value)
				}
			}, 100)
		}
	}

	private setProgress(x: number, duration = 0.1): void {
		if (this.progress) {
			gsap.to(this.progress, { '--x': x, duration, ease: 'none' })
		}
	}

	private stopProgress(): void {
		clearInterval(this.progressId)
	}

	public change(
		index: number = (this.currentIndex + 1) % this.videos.length
	): void {
		if (this.animating || this.currentIndex === index || !this.canPlay) return

		this.animating = true
		this.pauseVideo({ isCurrentTime: false })
		this.onChange(index)
		this.setProgress(0, this.speed / 2)

		this.tls[this.prevIndex].reverse()
		this.tls[index].play().eventCallback('onComplete', () => {
			this.onChangeComplete()
		})
	}

	private onChange(index: number): void {
		this.prevIndex = this.currentIndex
		this.currentIndex = index

		this.section.setAttribute('data-slider', index.toString())
		this.buttons[this.prevIndex].classList.remove('active')
		this.buttons[this.currentIndex].classList.add('active')

		if (this.emitOnChange) {
			this.emitOnChange()
		}
	}

	private onChangeComplete(): void {
		this.animating = false
		this.pauseVideo({
			index: this.prevIndex,
		})

		if (this.autoplay) {
			this.playVideo()
		}
	}
}
