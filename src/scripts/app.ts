import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ScrollToPlugin from 'gsap/ScrollToPlugin'
import Lenis from 'lenis'
import lazyImage from './lazyImage'
import nav from './nav'
import form from './form'
import intro from './intro'
import management from './management'
import process from './process'
import gallery from './gallery'
import reviews from './reviews'
import contacts from './contacts'
import map from './map'

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

	bodyScroll = new Lenis({ lerp: 0.05 })
	bodyScroll.on('scroll', ScrollTrigger.update)
	gsap.ticker.add(time => bodyScroll.raf(time * 1000))
	gsap.ticker.lagSmoothing(0)

	if (history.scrollRestoration) {
		history.scrollRestoration = 'manual'
		ScrollTrigger.clearScrollMemory('manual')
	}

	lazyImage()

	nav()

	form()

	intro()

	management()

	process()

	gallery()

	reviews()

	contacts()

	map()
}
