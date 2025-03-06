import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { bodyScroll } from './app'
import { getViewportDimensions } from './utils'

const nav = document.querySelector('.nav') as HTMLElement
const toggle = nav.querySelector('.nav__toggle') as HTMLElement
const list = nav.querySelector('.nav__list') as HTMLUListElement
const container = nav.querySelector('.nav__container') as HTMLElement
const items = nav.querySelectorAll('.nav__item') as NodeListOf<HTMLElement>
const links = nav.querySelectorAll(
	'.nav__link'
) as NodeListOf<HTMLAnchorElement>

const listHeight = items.length * 36 + 15

let isNavOpen = false
let isTlExpandMobileCreated = false
let activeLink: HTMLAnchorElement | null

export let isScrollToHashInProgress = false

export const toggleNavVisibility = (isHide = false) => {
	nav.classList.toggle('nav--hide', isHide)
}

const tlExpand = gsap.timeline({
	defaults: { duration: 0.6 },
	paused: true,
})

const updateTlExpand = () => {
	const { isMobile } = getViewportDimensions()

	if (isMobile) {
		if (isTlExpandMobileCreated) return
		isTlExpandMobileCreated = true
		gsap.set(container, { clearProps: 'width' })
		tlExpand
			.clear()
			.to(
				items,
				{
					opacity: 0,
					y: 15,
					duration: 0.3,
					onComplete: () => list.classList.add('column'),
				},
				'<'
			)
			.fromTo(container, { height: 55 }, { height: listHeight }, '<')
			.to(
				items,
				{
					opacity: 1,
					y: 0,
					duration: 0.3,
					delay: 0.3,
					onReverseComplete: () => {
						list.classList.remove('column')
						scrollToActiveLink(0)
					},
				},
				'<'
			)
	} else {
		isTlExpandMobileCreated = false
		list.classList.remove('column')
		gsap.set(container, { clearProps: 'height' })
		gsap.set(items, { y: 0, opacity: 1 })
		const listWidth = Math.min(list.scrollWidth, window.innerWidth - 116)

		tlExpand.clear().fromTo(
			container,
			{
				width: 400, //list.clientWidth
			},
			{ width: listWidth, onReverseComplete: scrollToActiveLink }
		)
	}
}

const toggleNavExpand = () => {
	isNavOpen = !isNavOpen
	nav.setAttribute('aria-expanded', isNavOpen ? 'true' : 'false')
	if (isNavOpen) {
		tlExpand.play()
	} else {
		tlExpand.reverse()
	}
}

const setActiveLink = (link: HTMLAnchorElement | null) => {
	activeLink?.classList.remove('nav__link--active')
	activeLink = link
	activeLink?.classList.add('nav__link--active')
}

const scrollToActiveLink = (duration = 0.4) => {
	if (activeLink) {
		const offsetX = activeLink.href.includes('manage')
			? 50
			: (list.clientWidth - activeLink.clientWidth) / 2

		gsap.to(list, {
			duration,
			ease: 'none',
			scrollTo: {
				x: activeLink,
				offsetX,
			},
		})
	}
}

const toggleNavHeader = (isHide: boolean = true) => {
	toggleNavVisibility(isHide)
}

const onSectionFullAuto = (section: HTMLElement, isEnter: boolean = true) => {
	if (section.classList.contains('full--auto')) {
		toggleNavHeader(isEnter)
	}
}

export default () => {
	updateTlExpand()
	toggle.addEventListener('click', toggleNavExpand)

	const navScroll = new Lenis({
		orientation: 'horizontal',
		gestureOrientation: 'both',
		wrapper: list,
	})

	gsap.ticker.add((time: number) => navScroll.raf(time * 1000))
	gsap.ticker.lagSmoothing(0)

	links.forEach((link, index) => {
		const section = document.querySelector(link.hash) as HTMLElement
		const offset = index == 0 ? 0 : 250

		link.addEventListener('click', (e: MouseEvent) => {
			e.preventDefault()
			isScrollToHashInProgress = true
			bodyScroll.scrollTo(section, {
				onComplete: () => {
					isScrollToHashInProgress = false
				},
				lock: true,
				offset: offset,
				lerp: 0.07,
				duration: 1,
			})
			setActiveLink(link)
			toggleNavExpand()
			if (section.classList.contains('full')) {
				toggleNavHeader()
			}
		})

		ScrollTrigger.create({
			trigger: section,
			start: `${offset / 2}px center`,
			end: 'bottom+=125px center',
			onEnter: () => {
				section?.classList.add('entered')
				if (isScrollToHashInProgress) return
				setActiveLink(link)
				scrollToActiveLink()
				onSectionFullAuto(section)
			},
			onEnterBack: () => {
				if (isScrollToHashInProgress) return
				setActiveLink(link)
				scrollToActiveLink()
				onSectionFullAuto(section)
			},
			onLeaveBack: () => {
				if (isScrollToHashInProgress) return
				if (index == 0) {
					setActiveLink(null)
				}
				onSectionFullAuto(section, false)
			},
			onLeave: () => {
				if (isScrollToHashInProgress) return
				onSectionFullAuto(section, false)
			},
		})
	})

	window.addEventListener('resize', () => {
		updateTlExpand()
		scrollToActiveLink()
	})

	const toTop = document.querySelector('.to-top')

	toTop?.addEventListener('click', () => {
		bodyScroll.scrollTo(0, { lock: true })
	})
}
