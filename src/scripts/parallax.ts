import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default () => {
	const parallaxes = document.querySelectorAll(
		'.life__parallax'
	) as NodeListOf<HTMLElement>

	parallaxes.forEach((parallax, index) => {
		const parallaxContainer = parallax.querySelector(
			'.life__parallax-container'
		)
		const tl = gsap
			.timeline({ paused: true })
			.set(parallaxContainer, { height: '140%' })
			.to(parallaxContainer, {
				yPercent: index % 2 === 0 ? '-28.5' : '40',
				ease: 'none',
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
