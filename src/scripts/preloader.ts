import { gsap } from 'gsap'
import { onPreloadComplete as intro } from './intro'

const preloader = document.querySelector('.preloader') as HTMLElement

const onReady = () => {
	gsap.to(preloader, {
		autoAlpha: 0,
		duration: 0.5,
		ease: 'power1.in',
		onComplete: () => {
			preloader.remove()
			intro()
			document.body.classList.remove('fixed')
		},
	})
}

const loadAssets = async () => {
	if (import.meta.env.DEV) {
		try {
			// load()
			onReady()
		} catch (error) {
			if (import.meta.env.DEV) {
				alert('Error loading assets:' + error)
			}
		}
	} else {
		// await load()
		onReady()
	}
}

export default () => {
	loadAssets()
	gsap.to(preloader, {
		color: '#4f72a6',
		duration: 3,
		delay: 1,
		ease: 'power1.in',
	})
}
