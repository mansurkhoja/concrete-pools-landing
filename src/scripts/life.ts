import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { isTouch } from './utils'
import Slider from './slider'

const header = document.querySelector('.life__header') as HTMLElement
const title = document.querySelector('.life__title') as HTMLElement
const titleItems = title.querySelectorAll(
	'.life__title-item'
) as NodeListOf<HTMLElement>
const titleGradient = title.querySelector('.gradient-bg') as HTMLElement
const sliderSection = document.querySelector('.life__slider') as HTMLElement
const sliderParent = document.querySelector('.life__slider-container') as HTMLElement
const sliderButtons = document.querySelectorAll(
	'.life__dot'
) as NodeListOf<HTMLElement>
const slides = sliderParent.querySelectorAll(
	'.life__slide'
) as NodeListOf<HTMLElement>

const tlTitle = gsap.timeline({ paused: true })
const letters: HTMLSpanElement[] = []

export default () => {
	titleItems.forEach(item => {
		const text = item.textContent!.trim()

		item.innerHTML = ''

		text.split('').forEach(char => {
			const span = document.createElement('span')
			if (char === ' ') {
				span.textContent = '\u00A0'
			} else {
				span.textContent = char
				letters.push(span)
			}
			item.appendChild(span)
		})
	})

	tlTitle
		.fromTo(title, { y: 0 }, { y: -250, ease: 'power1.out' })
		.fromTo(
			letters,
			{ x: index => index * 10 + 90 },
			{ x: 0, stagger: { amount: 2 }, ease: 'power1.out' },
			'<'
		)
		.fromTo(
			letters,
			{ opacity: 0 },
			{ opacity: 1, stagger: { amount: 2 }, ease: 'power1.in' },
			'<'
		)
		.fromTo(
			titleGradient,
			{ autoAlpha: 0 },
			{ autoAlpha: 1 },
			'<'
		)
		.to(title, { y: -360, duration: 2 })
		.to(
			letters,
			{
				opacity: 0,
				scale: 0.1,
				stagger: { amount: 2, from: 'edges' },
				ease: 'power1.in',
			},
			'<'
		)

	ScrollTrigger.create({
		trigger: header,
		start: 'center-=250 center',
		end: '+=1000',
		pin: true,
		pinSpacing: false,
		onUpdate: self => {
			tlTitle.progress(self.progress)
		},
	})

	const slider = new Slider({
		section: sliderSection,
		parent: sliderParent,
		buttons: sliderButtons,
		slides: slides,
		speed: 1.6,
		easing: 'power1.in'
	})

	ScrollTrigger.create({
		trigger: sliderSection,
		start: 'top bottom',
		once: true,
		onEnter: () => slider.show(),
	})

	if (isTouch) {
		import('./parallaxTouch').then(parallax => parallax.default())
	} else {
		import('./parallax').then(parallax => parallax.default())
	}
}
