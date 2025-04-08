import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Distortion from './distortion'

const footer = document.querySelector('footer') as HTMLElement
const imageContainer = footer.querySelector('.footer__img') as HTMLElement
const image = imageContainer.querySelector('img') as HTMLImageElement
const hideImage = gsap.set(image, { display: 'none', paused: true })

export default () => {
	imageContainer.classList.remove('lazy')

	const distortion = new Distortion({
		parent: imageContainer,
		speed: 2,
		emitOnInitialized() {
			distortion.setIsVisible(true)
			distortion.show()
		},
		emitOnShown() {
			hideImage.reverse()
			distortion.destroy()
		},
	})

	ScrollTrigger.create({
		trigger: footer,
		start: '+=104px bottom',
		once: true,
		toggleClass: 'active',
		onEnter: () => {
			hideImage.play()
			if (image.complete) {
				distortion.init(image.currentSrc)
			} else {
				image.addEventListener(
					'load',
					() => distortion.init(image.currentSrc),
					{ once: true }
				)
			}
		},
	})
}
