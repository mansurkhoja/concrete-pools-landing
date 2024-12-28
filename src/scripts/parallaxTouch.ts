import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const getClipPath = (index: number): string => {
	return `inset(0% ${index === 0 ? '100' : '0'}% ${
		index === 2 ? '100' : '0'
	}% ${index === 1 ? '100' : '0'}%)`
}

export default () => {
	const parallaxes = document.querySelectorAll(
		'.life__parallax'
	) as NodeListOf<HTMLElement>

	parallaxes.forEach((parallax, index) => {
		const tl = gsap.timeline({
			paused: true,
			// defaults: { ease: 'expoScale(0.5,7,none)' },
			// defaults: { duration: 0.8, delay: 0.2 },
			defaults: { ease:'power1.out' }
		})
		const initialClipPath = getClipPath(index)
		const finalClipPath = 'inset(0% 0% 0% 0%)'

		tl.fromTo(
			parallax,
			{ clipPath: initialClipPath },
			{ clipPath: finalClipPath }
		)

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

	// parallaxes.forEach((parallax, index) => {
	// 	const parallaxContainer = parallax.querySelector(
	// 		'.life__parallax-container'
	// 	)
	// 	const tl = gsap.timeline({
	// 		paused: true,
	// 		defaults: { ease: 'expoScale(0.5,7,none)' },
	// 		// defaults: { duration: 0.8, delay: 0.2 },
	// 		// defaults: { ease:'none'}
	// 	})

	// 	if (index !== 2) {
	// 		tl.fromTo(
	// 			parallaxContainer,
	// 			{
	// 				width: 0,
	// 			},
	// 			{
	// 				width: '100%',
	// 			}
	// 		)
	// 	} else {
	// 		tl.fromTo(
	// 			parallaxContainer,
	// 			{
	// 				height: 0,
	// 			},
	// 			{
	// 				height: '100%',
	// 			}
	// 		)
	// 	}

	// 	/* if (index == 0) {
	// 		tl.fromTo(
	// 			parallaxContainer,
	// 			{
	// 				xPercent: -100,
	// 			},
	// 			{
	// 				xPercent: 0,
	// 			}
	// 		)
	// 	} else if (index == 1) {
	// 		tl.fromTo(
	// 			parallaxContainer,
	// 			{
	// 				xPercent: 100,
	// 			},
	// 			{
	// 				xPercent: 0,
	// 			}
	// 		)
	// 	} else {
	// 		tl.fromTo(
	// 			parallaxContainer,
	// 			{
	// 				yPercent: 100,
	// 			},
	// 			{
	// 				yPercent: 0,
	// 			}
	// 		)
	// 	} */

	// 	ScrollTrigger.create({
	// 		trigger: parallax,
	// 		start: 'top bottom',
	// 		end: 'bottom top',
	// 		once: true,
	// 		onEnter: () => {
	// 			tl.play()
	// 		},
	// 	})
	// })
}
