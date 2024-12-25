import { gsap } from 'gsap'
import { bodyScroll } from './app'
const modalShowName = 'data-modal-show'
const modalHideName = 'data-modal-hide'

const elShowButtons = document.querySelectorAll(
	`[${modalShowName}]`
) as NodeListOf<HTMLElement>
const elHideButtons = document.querySelectorAll(
	`[${modalHideName}]`
) as NodeListOf<HTMLElement>

let activeModal: HTMLElement | null
let tl: gsap.core.Timeline

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

	elShowButtons.forEach(button => {
		const id = button.getAttribute(modalShowName)
		button.addEventListener('click', () => {
			show(id)
		})
	})

	elHideButtons.forEach(button => {
		const id = button.getAttribute(modalHideName)
		button.addEventListener('click', () => {
			hide(id)
		})
	})
}

export const show = (id: string | null) => {
	if (id) {
		bodyScroll.stop()
		activeModal = document.getElementById(id)!
		activeModal.classList.remove('d-none')
		let container = activeModal.querySelector('.modal__container')
		tl = gsap.effects.modal(activeModal, container)
		tl.play()
	}
}

const hide = (id: string | null) => {
	tl.timeScale(2)
		.reverse()
		.eventCallback('onReverseComplete', () => {
			activeModal?.querySelector('.modal__inner')?.scroll(0, 0)
			bodyScroll.start()
			show(id)
		})
}
