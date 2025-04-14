import { gsap } from 'gsap'
import { bodyScroll } from '../app'

const list = document.querySelector('.team__list') as HTMLElement
const items = list.querySelectorAll(
	'.team__item'
) as NodeListOf<HTMLElement>
const itemsBg = list.querySelectorAll(
	'.team__bg'
) as NodeListOf<HTMLElement>
const avatarContainer = document.querySelector(
	'.team__avatars'
) as HTMLElement
const avatars = avatarContainer.querySelectorAll(
	'.team__avatar'
) as NodeListOf<HTMLElement>

let xAvatarContainerMax: number
let yAvatarContainerMax: number
let clientYList = 0
let avatarScrollEventStarted = false
let isMouseEnteredList = false

const setAvatarContainerX = gsap.quickTo(avatarContainer, 'x', {
	ease: 'power3',
})
const setAvatarContainerY = gsap.quickTo(avatarContainer, 'y', {
	ease: 'power3',
})

const setAvatarContainerPosition = (x: number, y: number) => {
	setAvatarContainerX(x)
	setAvatarContainerY(y)
}

const setAvatarContainerMaxYX = () => {
	xAvatarContainerMax =
		(window.innerWidth - avatarContainer.clientWidth) / window.innerWidth
	yAvatarContainerMax =
		(window.innerHeight - avatarContainer.clientHeight) / window.innerHeight
}

const currentYList = () =>
	clientYList * yAvatarContainerMax - list.getBoundingClientRect().top

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

	gsap.set(itemsBg, {
		yPercent: 100,
	})

	items.forEach((item, index) => {
		item.addEventListener('mouseenter', e => {
			const halfHeight = item.getBoundingClientRect().height / 2

			gsap.set(itemsBg[index], {
				yPercent: itemBgYPercent(e, halfHeight),
			})
			gsap.to(itemsBg[index], {
				yPercent: 0,
				duration: 0.4,
				ease: 'power2.out',
			})
			item.classList.add('active')
			avatars[index].classList.add('active')
		})

		item.addEventListener('mouseleave', e => {
			const halfHeight = item.getBoundingClientRect().height / 2

			gsap.to(itemsBg[index], {
				yPercent: itemBgYPercent(e, halfHeight),
				duration: 0.4,
				ease: '0.22, 0.6, 0.36, 1',
			})
			item.classList.remove('active')
			avatars[index].classList.remove('active')
		})
	})

	list.addEventListener('mousemove', onMouseMoveList)

	list.addEventListener('mouseenter', e => {
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

	list.addEventListener('mouseleave', () => {
		isMouseEnteredList = false
	})
}
