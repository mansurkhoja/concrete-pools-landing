import { gsap } from 'gsap'

// let setCursorPosition: (x: number, y: number) => void

export default () => {
	let isMouseDown = false

	const hoverElements = [
		...document.querySelectorAll('a,button,[role="button"]'),
	]

	const elOutline = document.createElement('div')
	const elCircle = document.createElement('div')
	elOutline.className = 'cursor cursor--outline p-none'
	elCircle.className = 'cursor cursor--circle p-none'
	document.body.prepend(elOutline, elCircle)

	gsap.set(elOutline, { xPercent: -50, yPercent: -50 })
	gsap.set(elCircle, { xPercent: -50, yPercent: -50, scale: 0.2 })

	const tlScale = gsap
		.timeline({
			paused: true,
			defaults: { duration: 0.6 },
		})
		.to(elOutline, {
			scale: 0.6,
		})
		.to(
			elCircle,
			{
				scale: 0.15,
			},
			'<'
		)

	const tlHover = gsap
		.timeline({
			paused: true,
			defaults: { ease: 'none', duration: 0.6 },
		})
		.to(elOutline, {
			backgroundColor: 'rgba(79, 114, 166, 0.2)',
			borderColor: 'transparent',
		})
		.to(
			elCircle,
			{
				backgroundColor: 'transparent',
			},
			'<'
		)

	const tlFadeOut = gsap
		.timeline({ paused: true })
		.to(elOutline, {
			opacity: 0,
			duration: 0.4,
		})
		.to(
			elCircle,
			{
				opacity: 0,
				duration: 0.6,
			},
			'<'
		)

	const xOutlineTo = gsap.quickTo(elOutline, 'x', {
		duration: 0.3,
		ease: 'power3',
	})
	const yOutlineTo = gsap.quickTo(elOutline, 'y', {
		duration: 0.3,
		ease: 'power3',
	})
	const xCircleTo = gsap.quickTo(elCircle, 'x', {
		duration: 0.6,
		ease: 'power3',
	})
	const yCircleTo = gsap.quickTo(elCircle, 'y', {
		duration: 0.6,
		ease: 'power3',
	})

	const setCursorPosition = (x: number, y: number) => {
		xOutlineTo(x)
		yOutlineTo(y)
		xCircleTo(x)
		yCircleTo(y)
	}

	let xStart = window.innerWidth / 2 - 24 // 24 = CURSOR_SIZE:48 / 2
	let yStart = window.innerHeight / 2 - 24 // 24 = CURSOR_SIZE:48 / 2

	gsap.set([elOutline, elCircle], {
		x: xStart,
		y: yStart,
	})

	hoverElements.forEach(el => {
		el.addEventListener('mouseenter', () => tlHover.play())
		el.addEventListener('mouseleave', () => tlHover.reverse())
	})

	document.addEventListener('mousedown', e => {
		if (e.button === 0) {
			isMouseDown = true
			tlScale.timeScale(3)
			tlScale.play()
		}
	})
	document.addEventListener('mouseup', () => {
		if (isMouseDown) {
			tlScale.timeScale(1)
			tlScale.reverse()
			isMouseDown = false
		}
	})

	document.documentElement.addEventListener('mouseleave', () =>
		tlFadeOut.play()
	)
	document.documentElement.addEventListener('mouseenter', () =>
		tlFadeOut.reverse()
	)

	window.addEventListener('mousemove', e => {
		const { clientX: x, clientY: y } = e
		const moveSpeed = Math.sqrt((x - xStart) ** 2 + (y - yStart) ** 2)

		if (moveSpeed > 11 && !isMouseDown) {
			tlScale.play()
			gsap.delayedCall(0.3, () => {
				if (!isMouseDown) {
					tlScale.reverse()
				}
			})
		}

		setCursorPosition(x, y)

		xStart = x
		yStart = y
	})
}
