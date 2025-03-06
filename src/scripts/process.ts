import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Slider from './slider'
import { isScrollToHashInProgress, toggleNavVisibility } from './nav'

const section = document.querySelector('.process') as HTMLElement
const header = section.querySelector('.process__header') as HTMLElement
const sliderParent = section.querySelector('.process__slider') as HTMLElement
const sliderSlides = sliderParent.querySelectorAll(
	'.process__slide'
) as NodeListOf<HTMLElement>
const sliderVideos = sliderParent.querySelectorAll(
	'video'
) as NodeListOf<HTMLVideoElement>
const sliderButtons = section.querySelectorAll(
	'.process__button'
) as NodeListOf<HTMLElement>
const sliderProgress = sliderParent.querySelector('.progress') as HTMLElement
const sliderVoice = section.querySelector('.process__voice') as HTMLElement
const sliderCover = sliderParent.querySelectorAll(
	'.process__cover'
) as NodeListOf<HTMLElement>
const sliderPlayButton = sliderParent.querySelector('.btn-play') as HTMLElement
const slidePrev = sliderParent.querySelector('.btn-prev') as HTMLElement
const slideNext = sliderParent.querySelector('.btn-next') as HTMLElement
const title = section.querySelectorAll('.process__name')
const counter = section.querySelectorAll('.process__counter span')

let sliderShown = false
export default () => {
	gsap.set(header, { yPercent: -100 })

	const slider = new Slider({
		section: section,
		parent: sliderParent,
		buttons: sliderButtons,
		slides: sliderSlides,
		videos: sliderVideos,
		progress: sliderProgress,
		autoplay: false,
		voiceButton: sliderVoice,
		playButton: sliderPlayButton,
		prevButton: slidePrev,
		nextButton: slideNext,
		covers: sliderCover,
	})

	title.forEach((title, index) => {
		slider.tls[index]
			.fromTo(
				title,
				{ display: 'none', opacity: 0, y: -20 },
				{ display: 'flex', opacity: 1, y: 0 },
				'<'
			)
			.fromTo(
				counter[index],
				{ autoAlpha: 0, yPercent: -100, scaleX: 1.5 },
				{ autoAlpha: 1, yPercent: -60, scaleX: 1 },
				'<'
			)
	})

	ScrollTrigger.create({
		trigger: sliderParent,
		start: 'top center',
		end: 'bottom center',
		onEnterBack: () => {
			if (isScrollToHashInProgress) return
			toggleNavVisibility(true)
		},
		onEnter: () => {
			if (!sliderShown) {
				sliderShown = true
				slider.show()
				gsap.to(header, { yPercent: 0, delay: 0.5, ease: 'power2.out' })
			}
			if (isScrollToHashInProgress) return
			toggleNavVisibility(true)
		},
		onLeave: () => {
			if (isScrollToHashInProgress) return
			toggleNavVisibility()
		},
		onLeaveBack: () => {
			if (isScrollToHashInProgress) return
			toggleNavVisibility()
		},
	})
}
