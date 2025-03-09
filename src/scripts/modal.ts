import { gsap } from 'gsap'
import { bodyScroll } from './app'
import Splide from '@splidejs/splide'

const modalShowName = 'data-modal-show'
const modalHideName = 'data-modal-hide'

const showButtons = document.querySelectorAll(
	`[${modalShowName}]`
) as NodeListOf<HTMLElement>
const hideButtons = document.querySelectorAll(
	`[${modalHideName}]`
) as NodeListOf<HTMLElement>

let activeModal: HTMLElement | null
let tl: gsap.core.Timeline

export const show = (id: string | null) => {
	if (id) {
		activeModal = document.getElementById(id)

		if (activeModal) {
			bodyScroll.stop()
			activeModal.classList.remove('d-none')

			let slide = activeModal.querySelector('.splide') as HTMLElement
			if (slide) {
				if (!slide.classList.contains('is-initialized')) {
					const splide = new Splide(slide, {
						arrows: false,
						padding: { left: 0, right: '10%' },
						gap: '5%',
						pagination: true,
					})
			
					splide.on('pagination:mounted', function (data) {
						data.items.forEach( function ( item ) {
							item.button.classList.add('link')
						} );
					})

					splide.mount()
				}
			}
			let container = activeModal.querySelector('.modal__container')
			tl = gsap.effects.modal(activeModal, container)
			tl.play()
		}
	}
}

const hide = (id: string | null) => {
	tl.timeScale(2)
		.reverse()
		.eventCallback('onReverseComplete', () => {
			if (activeModal) {
				activeModal.querySelector('.modal__inner')?.scroll(0, 0)
			}
			bodyScroll.start()
			show(id)
		})
}

export default () => {
	gsap.registerEffect({
		name: 'modal',
		effect: (modal: HTMLElement, container: HTMLElement) => {
			return gsap
				.timeline({ paused: true, defaults: { duration: 0.5 } })
				.fromTo(
					modal,
					{ autoAlpha: 0 },
					{
						autoAlpha: 1,
					}
				)
				.fromTo(container, { y: -58 }, { y: 0, ease: 'power1.out' }, '<')
		},
		extendTimeline: true,
	})

	showButtons.forEach(button => {
		const id = button.getAttribute(modalShowName)
		button.addEventListener('click', () => {
			show(id)
		})
	})

	hideButtons.forEach(button => {
		const id = button.getAttribute(modalHideName)
		button.addEventListener('click', () => {
			hide(id)
		})
	})

	/* const slides = document.querySelectorAll('.splide') as NodeListOf<HTMLElement>
	slides.forEach(slide => {
		const splide = new Splide(slide, {
			arrows: false,
			padding: { left: 0, right: '10%' },
			gap: '5%',
			pagination: true,
		})

		splide.on('pagination:mounted', function (data) {
			data.items.forEach(function (item) {
				item.button.classList.add('link')
			})
		})

		splide.mount()
	}) */
}
