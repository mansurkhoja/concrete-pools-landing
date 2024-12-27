import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

interface SliderProps {
	parent: HTMLElement
	buttons: NodeListOf<HTMLElement>
	prevButton?: HTMLElement
	nextButton?: HTMLElement
	slides: NodeListOf<HTMLElement>
}

export default class imagesSlider {
	// props
	private parent: HTMLElement
	private buttons: NodeListOf<HTMLElement>
	private prevButton?: HTMLElement
	private nextButton?: HTMLElement
	private slides: NodeListOf<HTMLElement>

	// state
	private currentIndex: number = 0
	private prevIndex: number = 0
	private animating: boolean = false
	private canPlay: boolean = false

	//animations
	private tls: gsap.core.Timeline[] = []
	private progress!: gsap.core.Tween

	constructor(props: SliderProps) {
		this.parent = props.parent
		this.buttons = props.buttons
		this.prevButton = props.prevButton
		this.nextButton = props.nextButton
		this.slides = props.slides

		this.createTls()

		ScrollTrigger.create({
			trigger: this.parent,
			start: 'top bottom',
			once: true,
			onEnter: () => this.show(),
		})
	}

	private createTls(): void {
		this.slides.forEach(item => {
			this.tls.push(
				gsap
					.timeline({
						paused: true,
						defaults: { duration: 1.6 },
					})
					.fromTo(
						item,
						{ autoAlpha: 0, scale: 1.2 },
						{ autoAlpha: 1, scale: 1, ease: 'power1.in' }
					)
			)
		})
	}

	private createButtonsEvent(): void {
		this.buttons.forEach((btn, index) => {
			btn.addEventListener('click', () => {
				this.change(index)
			})
		})

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

	private init(): void {
		ScrollTrigger.create({
			trigger: this.parent,
			start: 'top bottom',
			end: 'bottom top',
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

	private show(): void {
		this.tls[this.currentIndex].play().eventCallback('onComplete', () => {
			document.addEventListener('visibilitychange', () => {
				if (this.canPlay) {
					if (document.visibilityState === 'hidden') {
						this.stopSlider(false)
					} else {
						this.startSlider(false)
					}
				}
			})
			this.createButtonsEvent()
			this.init()
		})
	}

	private startSlider(isToggleCanPlay: boolean = true): void {
		if (isToggleCanPlay) {
			this.canPlay = true
		}

		if (this.canPlay) {
			this.playImage()
		}
	}

	private stopSlider(isToggleCanPlay: boolean = true): void {
		this.pauseImage()

		if (isToggleCanPlay) {
			this.canPlay = false
		}
	}

	private playImage(): void {
		this.progress = gsap.delayedCall(4, () => {
			this.change()
		})
	}

	private pauseImage(): void {
		this.progress?.kill()
	}

	private change(
		index: number = (this.currentIndex + 1) % this.slides.length
	): void {
		if (this.animating || this.currentIndex === index || !this.canPlay) return

		this.animating = true
		this.pauseImage()
		this.onChange(index)

		this.tls[this.prevIndex].reverse()
		this.tls[index].play().eventCallback('onComplete', () => {
			if (this.canPlay) {
				this.playImage()
			}
			this.animating = false
		})
	}

	private onChange(index: number): void {
		this.prevIndex = this.currentIndex
		this.currentIndex = index

		this.buttons[this.prevIndex].classList.remove('active')
		this.buttons[this.currentIndex].classList.add('active')
	}
}
