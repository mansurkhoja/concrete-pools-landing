import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const items = document.querySelectorAll(
	'.model__item'
) as NodeListOf<HTMLElement>
const imagesContainer = document.querySelectorAll(
	'.model__img'
) as NodeListOf<HTMLElement>
const titles = document.querySelectorAll(
	'.model__title'
) as NodeListOf<HTMLElement>
const links = document.querySelectorAll(
	'.model__link'
) as NodeListOf<HTMLElement>

let tls: gsap.core.Timeline[] = []

export default () => {
	items.forEach((item, index) => {
		tls.push(
			gsap
				.timeline({
					paused: true,
				})
				.fromTo(
					imagesContainer[index],
					{ scale: 1.2, opacity: 0 },
					{ scale: 1, opacity: 1 }
				)
				.fromTo(
					titles[index],
					{ scale: 1.4, opacity: 0 },
					{ scale: 1, opacity: 1 },
					'<'
				)
				.fromTo(
					links[index],
					{ opacity: 0 },
					{ opacity: 1, ease: 'power1.in' },
					'-=0.8'
				)
		)

		ScrollTrigger.create({
			trigger: item,
			start: '-=30px center',
			once: true,
			onEnter: () => {
				tls[index].play()
			},
		})
	})
}
