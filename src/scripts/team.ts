import { gsap } from 'gsap'
import { bodyScroll } from './app'

const elList = document.querySelector('.team__list') as HTMLElement
const elItems = elList.querySelectorAll(
	'.team__item'
) as NodeListOf<HTMLElement>
const elItemsBg = elList.querySelectorAll(
	'.team__bg'
) as NodeListOf<HTMLElement>
const elAvatarContainer = document.querySelector(
	'.team__avatars'
) as HTMLElement
const elAvatars = elAvatarContainer.querySelectorAll(
	'.team__avatar'
) as NodeListOf<HTMLElement>

let xAvatarContainerMax: number
let yAvatarContainerMax: number
let clientYList = 0
let avatarScrollEventStarted = false
let isMouseEnteredList = false

const setAvatarContainerX = gsap.quickTo(elAvatarContainer, 'x', {
	ease: 'power3',
})
const setAvatarContainerY = gsap.quickTo(elAvatarContainer, 'y', {
	ease: 'power3',
})

const setAvatarContainerPosition = (x: number, y: number) => {
	setAvatarContainerX(x)
	setAvatarContainerY(y)
}

const setAvatarContainerMaxYX = () => {
	xAvatarContainerMax =
		(window.innerWidth - elAvatarContainer.clientWidth) / window.innerWidth
	yAvatarContainerMax =
		(window.innerHeight - elAvatarContainer.clientHeight) / window.innerHeight
}

const currentYList = () =>
	clientYList * yAvatarContainerMax - elList.getBoundingClientRect().top

const onMouseMoveList = (e: MouseEvent) => {
	clientYList = e.clientY
	const x = e.clientX * xAvatarContainerMax
	const y = currentYList()
	setAvatarContainerPosition(x, y)
}

const itemBgYPercent = (e: MouseEvent, itemHalfHeight: number) =>
	e.offsetY > itemHalfHeight ? 100 : -100

export default () => {
	setAvatarContainerMaxYX()
	window.addEventListener('resize', setAvatarContainerMaxYX)

	gsap.set(elItemsBg, {
		yPercent: 100,
	})

	elItems.forEach((item, index) => {
		item.addEventListener('mouseenter', e => {
			const halfHeight = item.getBoundingClientRect().height / 2

			gsap.set(elItemsBg[index], {
				yPercent: itemBgYPercent(e, halfHeight),
			})
			gsap.to(elItemsBg[index], {
				yPercent: 0,
				duration: 0.4,
				ease: 'power2.out',
			})
			item.classList.add('active')
			elAvatars[index].classList.add('active')
		})

		item.addEventListener('mouseleave', e => {
			const halfHeight = item.getBoundingClientRect().height / 2

			gsap.to(elItemsBg[index], {
				yPercent: itemBgYPercent(e, halfHeight),
				duration: 0.4,
				ease: '0.22, 0.6, 0.36, 1',
			})
			item.classList.remove('active')
			elAvatars[index].classList.remove('active')
		})
	})

	elList.addEventListener('mousemove', onMouseMoveList)

	elList.addEventListener('mouseenter', e => {
		isMouseEnteredList = true
		onMouseMoveList(e)
		if (!avatarScrollEventStarted) {
			bodyScroll.on('scroll', () => {
				if (isMouseEnteredList) {
					const y = currentYList()
					setAvatarContainerY(y)
				}
			})
		}
	})

	elList.addEventListener('mouseleave', () => {
		isMouseEnteredList = false
	})
}
