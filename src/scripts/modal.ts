import { gsap } from 'gsap'
import { bodyScroll } from './app'
import Slider from './slider'

interface ModalSliders {
	[key: string]: {
		slider: Slider
	}
}

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
			let container = activeModal.querySelector('.modal__container')
			tl = gsap.effects.modal(activeModal, container)
			tl.play()
		}
	}
}

const hide = (id: string | null, onHide: () => void | undefined) => {
	tl.timeScale(2)
		.reverse()
		.eventCallback('onReverseComplete', () => {
			if (onHide) onHide()
			if (activeModal) {
				activeModal.querySelector('.modal__inner')?.scroll(0, 0)
			}
			activeModal = null
			bodyScroll.start()
			show(id)
		})
}

export default () => {
	const modalSliders: ModalSliders = {}

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
			if (id && modalSliders[id]) {
				const slider = modalSliders[id].slider
				if (!slider.initialized) {
					slider.show()
				} else {
					slider.startSlider()
				}
			}
			show(id)
		})
	})

	hideButtons.forEach(button => {
		const id = button.getAttribute(modalHideName)
		button.addEventListener('click', () => {
			hide(id, () => {
				const activeModalId = activeModal?.getAttribute('id')
				if (activeModalId && modalSliders[activeModalId]) {
					const slider = modalSliders[activeModalId].slider
					if (slider.initialized) {
						slider.stopSlider()
					}
				}
			})
		})
	})

	const sliders = document.querySelectorAll('.modal__slider')

	sliders.forEach(item => {
		const modalElement = item.closest('.modal') as HTMLElement
		const modalId = modalElement.getAttribute('id')

		if (modalId) {
			const sliderContainer = item.querySelector(
				'.modal__slider-container'
			) as HTMLElement
			const slides = item.querySelectorAll(
				'.modal__slide'
			) as NodeListOf<HTMLElement>

			const slider = new Slider({
				section: modalElement,
				parent: sliderContainer,
				slides: slides,
				speed: 1.2,
				easing: 'power1.in',
				autoInit: false,
				emitOnShown() {
					const activeModalId = activeModal?.getAttribute('id')
					if (modalId === activeModalId) {
						slider.startSlider()
					}
				},
			})

			modalSliders[modalId] = {
				slider,
			}
		}
	})
}
