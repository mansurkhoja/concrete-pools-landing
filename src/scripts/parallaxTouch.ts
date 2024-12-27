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
		const tl = gsap.timeline({
			paused: true,
			defaults: { ease: 'power3.inOut' },
		})

		if (index == 0) {
			tl.fromTo(
				parallaxContainer,
				{
					xPercent: -100,
				},
				{
					xPercent: 0,
				}
			)
		} else if (index == 1) {
			tl.fromTo(
				parallaxContainer,
				{
					xPercent: 100,
				},
				{
					xPercent: 0,
				}
			)
		} else {
			tl.fromTo(
				parallaxContainer,
				{
					yPercent: 100,
				},
				{
					yPercent: 0,
				}
			)
		}

		ScrollTrigger.create({
			trigger: parallax,
			start: 'top bottom',
			end: 'bottom top',
			once: true,
			onEnter: () => {
				tl.play()
			},
		})
	})
}
