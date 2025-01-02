import { ScrollTrigger } from 'gsap/ScrollTrigger'

const footer = document.querySelector('footer')

export default () => {
	ScrollTrigger.create({
		trigger: footer,
		start: 'top bottom',
		once: true,
		toggleClass: 'active'
	})
}
