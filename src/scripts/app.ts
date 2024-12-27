import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ScrollToPlugin from 'gsap/ScrollToPlugin'
import Lenis from 'lenis'
import { isTouch } from './utils'
import lazyImage from './lazyImage'
// import header from './header'
import nav from './nav'
import modal from './modal'
import form from './form'
import intro from './intro'
import management from './management'
import model from './model'
import life from './life'

export let bodyScroll: Lenis

export default () => {
	gsap.defaults({
		ease: 'power1.inOut',
		duration: 1,
	})
	gsap.registerPlugin(ScrollToPlugin, ScrollTrigger)

	//remove on new gsap release
	let mm = gsap.matchMedia()
	mm.add('(orientation: portrait)', () => {
		ScrollTrigger.refresh()
		return () => ScrollTrigger.refresh()
	})

	bodyScroll = new Lenis({ lerp: 0.07, duration: 2 })
	bodyScroll.on('scroll', ScrollTrigger.update)
	gsap.ticker.add(time => bodyScroll.raf(time * 1000))
	gsap.ticker.lagSmoothing(0)

	if (history.scrollRestoration) {
		history.scrollRestoration = 'manual'
		ScrollTrigger.clearScrollMemory('manual')
	}

	if (!isTouch) {
		import('./cursor').then(cursor => cursor.default())
	}

	lazyImage()

	// header()

	nav()

	modal()

	form()

	intro()

	management()

	model()

	life()
}
