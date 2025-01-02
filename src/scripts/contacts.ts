import { ScrollTrigger } from 'gsap/ScrollTrigger'

const contactsInner = document.querySelectorAll('.contacts__inner')

export default () => {
	ScrollTrigger.create({
		trigger: contactsInner,
		start: '-=125px center',
		toggleClass: 'active',
		once: true,
	})
}
