import { ScrollTrigger } from 'gsap/ScrollTrigger'

const footer = document.querySelector('footer')

export default () => {
	ScrollTrigger.create({
		trigger: footer,
		start: '+=100px bottom',
		once: true,
		toggleClass: 'active',
	})
}
