import { gsap } from 'gsap'

const section = document.querySelector('.intro') as HTMLElement
const titleItems = section.querySelectorAll('.intro__title span') as NodeListOf<HTMLSpanElement>
const buttonContainers = section.querySelectorAll('.btn__container') as NodeListOf<HTMLElement>

export default () => {
	gsap.set(titleItems, {
		yPercent: 99.9,
		rotate: 3,
	})

	gsap.set(buttonContainers, {
		xPercent: idx => (idx % 2 === 0 ? '-100' : '100'),
	})
}

export const onPreloadComplete = () => {
	gsap
		.timeline()
		.to(titleItems, {
			yPercent: 0,
			duration: 0.8,
			rotate: 0,
			stagger: 0.1,
		})
		.to(
			buttonContainers,
			{
				xPercent: 0,
				opacity: 1,
				ease: 'back.out',
			},
			'-=0.45'
		)
}