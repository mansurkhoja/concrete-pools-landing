import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Distortion from './distortion'

export default () => {
	const parallaxes = document.querySelectorAll(
		'.life__parallax'
	) as NodeListOf<HTMLElement>

	parallaxes.forEach((parallax, index) => {
		const parallaxContainer = parallax.querySelector(
			'.life__parallax-container'
		) as HTMLElement
		const parallaxImage = parallax.querySelector('img') as HTMLImageElement
		const hideImage = gsap.set(parallaxImage, { display: 'none', paused: true })

		gsap.set(parallaxContainer, { height: '140%' })
		const tl = gsap.timeline({ paused: true }).to(parallaxContainer, {
			yPercent: index % 2 === 0 ? '-28.5' : '40',
			ease: 'none',
		})

		const distortion = new Distortion({
			parent: parallaxContainer,
			speed: 1.3,
			easing: 'power1.out',
			emitOnInitialized() {
				ScrollTrigger.create({
					trigger: parallax,
					start: 'top bottom',
					once: true,
					onEnter: () => {
						distortion.setIsVisible(true)
						distortion.show()
					},
				})
			},
			emitOnShown() {
				hideImage.reverse()
				distortion.destroy()
			},
		})

		ScrollTrigger.create({
			trigger: parallax,
			start: '-=340px bottom',
			once: true,
			onEnter: () => {
				hideImage.play()
				parallaxContainer.classList.remove('lazy')
				if (parallaxImage.complete) {
					distortion.init(parallaxImage.currentSrc)
				} else {
					parallaxImage.addEventListener(
						'load',
						() => distortion.init(parallaxImage.currentSrc),
						{ once: true }
					)
				}
			},
		})

		ScrollTrigger.create({
			trigger: parallax,
			start: 'top bottom',
			end: 'bottom top',
			onUpdate: self => {
				tl.progress(self.progress)
			},
		})
	})
}
