import { gsap } from 'gsap'
import { isTouch } from './utils'
import { onPreloadComplete as intro } from './intro'
import {
	onPreloadComplete as management,
	loadAssets as loadManagement,
} from './management'

const preloader = document.querySelector('.preloader') as HTMLElement

const onReady = () => {
	gsap.to(preloader, {
		autoAlpha: 0,
		duration: 0.5,
		ease: 'power1.in',
		onComplete: () => {
			preloader.remove()
			intro()
			management()
			document.body.classList.remove('fixed')
		},
	})
}

const loadDeviceModule = async () => {
	const module = isTouch
		? await import('./deviceTouch/init')
		: await import('./deviceDesktop/init')
	module.default()
}

const loadAssets = async () => {
	try {
		await loadDeviceModule()
		await loadManagement()
		onReady()
	} catch (error) {
		if (import.meta.env.DEV) {
			alert('Error loading assets:' + error)
		}
	}
}

// const loadAssets = async () => {
// 	if (import.meta.env.DEV) {
// 		try {
// 			if (isTouch) {
// 				const module = await import('./deviceTouch/init')
// 				module.default()
// 			} else {
// 				const module = await import('./deviceDesktop/init')
// 				module.default()
// 			}

// 			loadManagement()
// 			onReady()
// 		} catch (error) {
// 			if (import.meta.env.DEV) {
// 				alert('Error loading assets:' + error)
// 			}
// 		}
// 	} else {
// 		if (isTouch) {
// 			const module = await import('./deviceTouch/init')
// 			module.default()
// 		} else {
// 			const module = await import('./deviceDesktop/init')
// 			module.default()
// 		}

// 		await loadManagement()
// 		onReady()
// 	}
// }

export default () => {
	loadAssets()
	gsap.to(preloader, {
		color: '#4f72a6',
		duration: 3,
		delay: 1,
		ease: 'power1.in',
	})
}
