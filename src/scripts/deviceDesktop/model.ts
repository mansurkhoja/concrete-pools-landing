import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Distortion from './distortion'
import Fluid from '../fluid/Fluid'

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
		const container = imagesContainer[index]
		const img = container.querySelector('img') as HTMLImageElement

		tls.push(
			gsap
				.timeline({
					paused: true,
				})
				.fromTo(container, { scale: 1.5, opacity: 0 }, { scale: 1, opacity: 1 })
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

		let imageSrc = ''

		const distortion = new Distortion({
			parent: container,
			easing: 'power2.out',
			speed: 1.2,
			emitOnInitialized() {
				ScrollTrigger.create({
					trigger: item,
					start: '-=30px center',
					once: true,
					onEnter: () => {
						distortion.setIsVisible(true)
						distortion.show()
						tls[index].play()
					},
				})
			},
			emitOnShown() {
				new Fluid({
					container: item,
					parent: container,
					src: imageSrc,
					onLoad: () => distortion.destroy(),
				})
			},
		})

		ScrollTrigger.create({
			trigger: item,
			start: '-=270px bottom',
			once: true,
			onEnter: () => {
				gsap.set(container, { scale: 1 })
				container.classList.remove('lazy')
				imageSrc = img.currentSrc
				distortion.init(imageSrc)
				container.querySelector('picture')?.remove()
			},
		})
	})
}
