import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import imagesSlider from './imagesSlider'
import { isTouch } from './utils'

const header = document.querySelector('.life__header') as HTMLElement
const title = document.querySelector('.life__title') as HTMLElement
const titleItems = title.querySelectorAll('div') as NodeListOf<HTMLElement>
const sliderParent = document.querySelector('.life__slider') as HTMLElement
const sliderButtons = document.querySelectorAll(
	'.life__dot'
) as NodeListOf<HTMLElement>
const slides = sliderParent.querySelectorAll(
	'.life__slide'
) as NodeListOf<HTMLElement>
const slidePrev = sliderParent.querySelector('.btn-prev') as HTMLElement
const slideNext = sliderParent.querySelector('.btn-next') as HTMLElement

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

	new imagesSlider({
		parent: sliderParent,
		buttons: sliderButtons,
		slides: slides,
		prevButton: slidePrev,
		nextButton: slideNext,
	})

	if (isTouch) {
		import('./parallaxTouch').then(parallax => parallax.default())
	} else {
		import('./parallax').then(parallax => parallax.default())
	}
}
