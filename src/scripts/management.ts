import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getViewportDimensions, loadVideo } from './utils'
import { isScrollToHashInProgress, toggleNavVisibility } from './nav'
import Slider from './slider'
import { toggleHeaderVisibility } from './header'

const section = document.querySelector('.management') as HTMLElement
const items = section.querySelector('.management__items') as HTMLElement
const phone = items.querySelector('.management__phone') as HTMLElement
const openButton = items.querySelector('.management__open') as HTMLButtonElement
const closeButton = items.querySelector(
	'.management__phone-close'
) as HTMLButtonElement
const sliderParent = section.querySelector('.management__slider') as HTMLElement
const sliderSlides = sliderParent.querySelectorAll(
	'.management__slide'
) as NodeListOf<HTMLElement>
const sliderVideos = sliderParent.querySelectorAll(
	'video'
) as NodeListOf<HTMLVideoElement>
const sliderButtons = section.querySelectorAll(
	'.management__phone-button'
) as NodeListOf<HTMLElement>
const sliderProgress = sliderParent.querySelector('.progress') as HTMLElement

const tlTogglePhone = gsap.timeline({
	paused: true,
	defaults: { duration: 0.6 },
})

let isTlTogglePhoneCreated = false

let slider: Slider

const updateTlTogglePhone = () => {
	const { isTabletMini } = getViewportDimensions()
	if (isTabletMini) {
		if (!isTlTogglePhoneCreated) {
			tlTogglePhone
				.fromTo(phone, { autoAlpha: 0, scale: 0.9 }, { autoAlpha: 1, scale: 1 })
				.fromTo(
					openButton,
					{ autoAlpha: 1, scale: 1 },
					{ autoAlpha: 0, scale: 0.9 },
					'<'
				)
			isTlTogglePhoneCreated = true
		}
	} else if (isTlTogglePhoneCreated) {
		tlTogglePhone.clear()
		gsap.set([phone, openButton], { clearProps: 'all' })
		isTlTogglePhoneCreated = false
	}
}

export const loadAssets = async () => {
	await loadVideo(sliderVideos[0], 'canplaythrough')
}

export default async () => {
	updateTlTogglePhone()
	window.addEventListener('resize', updateTlTogglePhone)
	openButton.addEventListener('click', () => {
		tlTogglePhone.play()
	})
	closeButton.addEventListener('click', () => {
		tlTogglePhone.reverse()
	})

	slider = new Slider({
		parent: sliderParent,
		buttons: sliderButtons,
		slides: sliderSlides,
		videos: sliderVideos,
		progress: sliderProgress,
		section: section,
		autoInit: false,
		emitOnChange() {
			tlTogglePhone.reverse()
		},
		async emitOnShown() {
			await loadVideo(sliderVideos[1])
			await loadVideo(sliderVideos[2])
			await loadVideo(sliderVideos[3])
			slider.init()
		},
	})
}

export const onPreloadComplete = () => {
	/* slider.show()

	ScrollTrigger.create({
		trigger: section,
		start: 'center-=100px center',
		end: 'bottom+=68px bottom',
		onEnterBack: () => {
			if (isScrollToHashInProgress) return
			toggleNavVisibility(true)
			toggleHeaderVisibility(true)
		},
		onEnter: () => {
			if (isScrollToHashInProgress) return
			toggleNavVisibility(true)
			toggleHeaderVisibility(true)
		},
		onLeave: () => {
			if (isScrollToHashInProgress) return
			toggleNavVisibility()
			toggleHeaderVisibility()
		},
		onLeaveBack: () => {
			if (isScrollToHashInProgress) return
			toggleNavVisibility()
			toggleHeaderVisibility()
		},
	})

	items.classList.add('show') */

	ScrollTrigger.create({
		trigger: section,
		start: 'top bottom',
		once: true,
		onEnter: () => {
			slider.show()
			ScrollTrigger.create({
				trigger: section,
				start: 'center-=100px center',
				end: 'bottom+=68px bottom',
				onEnterBack: () => {
					if (isScrollToHashInProgress) return
					toggleNavVisibility(true)
					toggleHeaderVisibility(true)
				},
				onEnter: () => {
					if (isScrollToHashInProgress) return
					toggleNavVisibility(true)
					toggleHeaderVisibility(true)
				},
				onLeave: () => {
					if (isScrollToHashInProgress) return
					toggleNavVisibility()
					toggleHeaderVisibility()
				},
				onLeaveBack: () => {
					if (isScrollToHashInProgress) return
					toggleNavVisibility()
					toggleHeaderVisibility()
				},
			})
			items.classList.add('show')
		},
	})
}
