import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Distortion from './distortion'

interface SliderProps {
	section: HTMLElement
	parent: HTMLElement
	buttons?: NodeListOf<HTMLElement>
	covers?: NodeListOf<HTMLElement>
	slides: NodeListOf<HTMLElement>
	videos?: NodeListOf<HTMLVideoElement>
	progress?: HTMLElement
	autoInit?: boolean
	autoPlay?: boolean
	speed?: number
	easing?: gsap.EaseString
	emitOnShown?: () => void
	emitOnChange?: () => void
}

export default class Slider {
	//props
	private section: HTMLElement
	private parent: HTMLElement
	private buttons?: NodeListOf<HTMLElement>
	private covers?: NodeListOf<HTMLElement>
	private slides: NodeListOf<HTMLElement>
	private videos?: NodeListOf<HTMLVideoElement>
	private progress?: HTMLElement
	private autoInit: boolean
	private autoPlay: boolean
	private speed: number
	private easing: gsap.EaseString
	private emitOnShown?: () => void
	private emitOnChange?: () => void

	// state
	private currentIndex: number = 0
	private prevIndex: number = 0
	private animating: boolean = false
	private canPlay: boolean = false
	public initialized: boolean = false
	private loaded: number[] = []
	private distortion!: Distortion

	//animations
	public tls: gsap.core.Timeline[] = []
	private progressId!: number
	private delayedCall!: gsap.core.Tween

	constructor(props: SliderProps) {
		this.section = props.section
		this.parent = props.parent
		this.buttons = props.buttons
		this.covers = props.covers
		this.slides = props.slides
		this.videos = props.videos
		this.progress = props.progress
		this.autoInit = props.autoInit ?? true
		this.autoPlay = props.autoPlay ?? true
		this.speed = props.speed ?? 1.2
		this.easing = props.easing ?? 'power2.inOut'
		this.emitOnShown = props.emitOnShown
		this.emitOnChange = props.emitOnChange

		if (!this.videos) {
			this.distortion = new Distortion({
				parent: this.parent,
				speed: this.speed,
				easing: this.easing,
				emitOnInitialized: () => {
					this.distortion.setIsVisible(true)
					this.distortion.show()
				},
				emitOnShown: () => {
					this.onShowComplete()

					if (this.slides.length === 1) {
						this.distortion.destroy()
						this.slides[0].style.display = 'block'
					}
				},
				emitOnChanged: () => {
					this.onChangeComplete()
				},
			})
		}

		this.slides.forEach((slide, index) => {
			if (this.videos) {
				this.createTl(slide)
				this.createVideoEvents(this.videos[index])
			} else {
				slide.style.display = 'none'
			}

			if (this.buttons) {
				this.buttons[index].addEventListener('click', () => {
					this.change(index)
				})
			}
		})

		this.createButtonsEvent()
	}

	private createTl(slide: HTMLElement): void {
		this.tls.push(
			gsap
				.timeline({
					paused: true,
					defaults: { ease: this.easing, duration: this.speed },
				})
				.fromTo(slide, { scale: 1.2, autoAlpha: 0 }, { scale: 1, autoAlpha: 1 })
		)
	}

	private createVideoEvents(video: HTMLVideoElement): void {
		video.addEventListener('ended', () => {
			this.change()
		})
	}

	private createButtonsEvent(): void {
		const voiceButton = this.section.querySelector('.btn-voice')
		const playButton = this.section.querySelector('.btn-play')
		const prevButton = this.section.querySelector('.btn-prev')
		const nextButton = this.section.querySelector('.btn-next')

		if (voiceButton) {
			voiceButton.addEventListener('click', () => {
				if (this.canPlay) {
					this.videos!.forEach(video => {
						video.muted = !video.muted
					})
					voiceButton.classList.toggle('muted', !this.videos![0].muted)
					voiceButton.classList.toggle('btn--active', !this.videos![0].muted)
				}
			})
		}

		if (playButton) {
			playButton.addEventListener('click', () => {
				if (this.canPlay && !this.animating) {
					if (this.loaded.includes(this.currentIndex)) {
						this.playVideo(true)
					} else {
						const index = this.currentIndex
						const slide = this.slides[index]
						if (!slide.classList.contains('load') && this.covers) {
							slide.classList.add('load')
							const video = this.videos![index]
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
										this.playVideo(true)
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

		if (prevButton) {
			if (this.slides.length > 1) {
				prevButton.addEventListener('click', () => {
					this.change(
						(this.currentIndex - 1 + this.slides.length) % this.slides.length
					)
				})
			} else {
				prevButton.classList.add('d-none')
			}
		}

		if (nextButton) {
			if (this.slides.length > 1) {
				nextButton.addEventListener('click', () => {
					this.change()
				})
			} else {
				nextButton.classList.add('d-none')
			}
		}
	}

	private toggleButtonPlay(isPlay = true): void {
		const playButton = this.section.querySelector('.btn-play')
		playButton?.classList.toggle('playing', isPlay)
	}

	public show(): void {
		if (this.videos) {
			this.tls[this.currentIndex].play().eventCallback('onComplete', () => {
				this.onShowComplete()
			})
		} else {
			const image = this.parent.querySelector('img') as HTMLImageElement
			image.loading = 'eager'

			if (image.complete) {
				this.distortion.init(image.currentSrc)
			} else {
				image.addEventListener(
					'load',
					() => this.distortion.init(image.currentSrc),
					{ once: true }
				)
			}
		}
	}

	private onShowComplete(): void {
		if (this.emitOnShown) {
			this.emitOnShown()
		}

		if (this.autoInit) {
			this.init()
		}

		this.section.classList.add('slider-showed')

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
	}

	public init(): void {
		ScrollTrigger.create({
			trigger: this.parent,
			start: 'top center',
			end: 'bottom center',
			onEnter: () => {
				this.startSlider()
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

	public startSlider(isToggleCanPlay: boolean = true): void {
		if (isToggleCanPlay) {
			this.canPlay = true
		}

		if (this.videos) {
			this.playVideo()
		} else {
			this.playImage()

			if (this.initialized) {
				this.distortion.setIsVisible(true)
			}
		}
	}

	public stopSlider(isToggleCanPlay: boolean = true): void {
		if (this.videos) {
			this.pauseVideo({ isCurrentTime: false })
		} else {
			this.pauseImage()

			if (this.initialized) {
				this.distortion.setIsVisible(false)
			}
		}

		if (isToggleCanPlay) {
			this.canPlay = false
		}
	}

	private async playVideo(autoPlay = this.autoPlay): Promise<void> {
		if (this.canPlay && autoPlay) {
			const index = this.currentIndex
			const video = this.videos![index]
			await video.play()
			this.startProgress()
		}
	}

	private pauseVideo({
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
		const video = this.videos![index]

		video.pause()

		if (isCurrentTime) {
			video.currentTime = 0
		}

		this.toggleButtonPlay(false)
	}

	private playImage(): void {
		this.delayedCall = gsap.delayedCall(4, () => {
			this.change()
		})
	}

	private pauseImage(): void {
		this.delayedCall?.kill()
	}

	private startProgress(): void {
		if (this.progress) {
			const video = this.videos![this.currentIndex]
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
		index: number = (this.currentIndex + 1) % this.slides.length
	): void {
		if (this.animating || this.currentIndex === index || !this.canPlay) return

		this.animating = true
		if (this.videos) {
			this.pauseVideo({ isCurrentTime: false })
		} else {
			this.pauseImage()
		}
		this.onChange(index)
		this.setProgress(0, this.speed / 2)

		if (this.videos) {
			this.tls[this.prevIndex].reverse()
			this.tls[index].play().eventCallback('onComplete', () => {
				this.onChangeComplete()
			})
		} else {
			const images = this.parent.querySelectorAll('img')
			const image = images[index]
			image.loading = 'eager'

			if (image.complete) {
				this.distortion.change(image.currentSrc, index)
			} else {
				image.addEventListener(
					'load',
					() => this.distortion.change(image.currentSrc, index),
					{ once: true }
				)
			}
		}
	}

	private onChange(index: number): void {
		this.prevIndex = this.currentIndex
		this.currentIndex = index

		this.section.setAttribute('data-slider', index.toString())

		if (this.buttons) {
			this.buttons[this.prevIndex].classList.remove('active')
			this.buttons[this.currentIndex].classList.add('active')
		}

		if (this.emitOnChange) {
			this.emitOnChange()
		}
	}

	private onChangeComplete(): void {
		this.animating = false

		if (this.videos) {
			this.pauseVideo({
				index: this.prevIndex,
			})
			this.playVideo()
		} else {
			this.playImage()
		}
	}
}
