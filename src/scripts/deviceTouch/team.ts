import { gsap } from 'gsap'

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
let itemTouchedIndex: number = -1

const setAvatarContainerMaxYX = () => {
	xAvatarContainerMax =
		(window.innerWidth - elAvatarContainer.clientWidth) / window.innerWidth
	yAvatarContainerMax =
		(window.innerHeight - elAvatarContainer.clientHeight) / window.innerHeight
}

const currentYItem = (clientYItem: number) =>
	clientYItem * yAvatarContainerMax - elList.getBoundingClientRect().top

const setAvatarContainerPosition = (e: TouchEvent) => {
	const touch = e.targetTouches[0]
	const x = touch.clientX * xAvatarContainerMax
	const y = currentYItem(touch.clientY)
	gsap.to(elAvatarContainer, {
		x,
		y,
		ease: 'power3.out',
		duration: 0.4,
	})
}

const handleItemTouchStart = (
	item: HTMLElement,
	index: number,
	e: TouchEvent
) => {
	if (itemTouchedIndex < 0) {
		itemTouchedIndex = index
		item.classList.add('active')
		elAvatars[index].classList.add('active')
		gsap.to(elItemsBg[index], {
			scale: 1,
			opacity: 1,
			duration: 0.4,
		})
		setAvatarContainerPosition(e)
	}
}

const handleItemTouchEnd = (item: HTMLElement, index: number) => {
	if (itemTouchedIndex === index) {
		item.classList.remove('active')
		elAvatars[index].classList.remove('active')
		gsap.to(elItemsBg[index], {
			scale: 0.85,
			opacity: 0,
			duration: 0.4,
		})
		itemTouchedIndex = -1
	}
}

export default () => {
	setAvatarContainerMaxYX()
	window.addEventListener('resize', setAvatarContainerMaxYX)

	gsap.set(elItemsBg, {
		scale: 0.85,
		opacity: 0,
	})

	elItems.forEach((item, index) => {
		item.addEventListener(
			'touchstart',
			e => handleItemTouchStart(item, index, e),
			{
				passive: true,
			}
		)

		item.addEventListener('touchend', () => handleItemTouchEnd(item, index))
	})
}
