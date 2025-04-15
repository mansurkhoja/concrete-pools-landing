import Lenis from 'lenis'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { isTouch } from './utils'

const galleries = document.querySelectorAll(
	'.gallery'
) as NodeListOf<HTMLElement>

export default () => {
	galleries.forEach(gallery => {
		const container = gallery.querySelector(
			'.gallery__container'
		) as HTMLElement

		const containerScroll = new Lenis({
			orientation: 'horizontal',
			gestureOrientation: 'horizontal',
			wrapper: container,
			duration: 4,
		})

		function raf(time: number) {
			containerScroll.raf(time)
			requestAnimationFrame(raf)
		}

		requestAnimationFrame(raf)

		let offsetWidth = container.offsetWidth
		let scrollWidth = container.scrollWidth
		window.addEventListener('resize', () => {
			offsetWidth = container.offsetWidth
			scrollWidth = container.scrollWidth
		})
		const scrollAmount = (x: number) =>
			(x / offsetWidth) * (scrollWidth - offsetWidth)

		container.scrollTo(scrollAmount(window.innerWidth / 2), 0)

		if (!isTouch) {
			container.addEventListener('mousemove', e => {
				containerScroll.scrollTo(scrollAmount(e.clientX))
			})
		}

		ScrollTrigger.create({
			trigger: gallery,
			once: true,
			start: '-=125px center',
			toggleClass: 'active',
		})
	})
}
