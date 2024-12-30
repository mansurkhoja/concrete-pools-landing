import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const gallery = document.querySelector('.reviews__gallery') as HTMLElement
const playButtons = gallery.querySelectorAll(
	'.reviews__btn-play'
) as NodeListOf<HTMLButtonElement>
const videos = gallery.querySelectorAll('video')

let canPlay = false
let playingVideoIndex: number | null = null

const togglePlayButtonClass = (
	button: HTMLElement,
	playing: boolean = false
) => {
	button.classList.toggle('playing', playing)
}

const pauseVideo = () => {
	if (playingVideoIndex !== null) {
		videos[playingVideoIndex].pause()
		togglePlayButtonClass(playButtons[playingVideoIndex])
		playingVideoIndex = null
	}
}

const playVideo = (index: number) => {
	if (canPlay) {
		videos[index].play()
		playingVideoIndex = index
	} else {
		togglePlayButtonClass(playButtons[index])
	}
}

export default () => {
	ScrollTrigger.create({
		trigger: gallery,
		start: 'top bottom',
		end: 'bottom top',
		onLeaveBack: () => {
			canPlay = false
			pauseVideo()
		},
		onLeave: () => {
			canPlay = false
			pauseVideo()
		},
		onEnter: () => {
			canPlay = true
		},
		onEnterBack: () => {
			canPlay = true
		},
	})

	playButtons.forEach((button, index) => {
		button.addEventListener('click', () => {
			pauseVideo()
			const parent = button.closest('.reviews__item') as HTMLElement
			const cover = parent.querySelector(
				'.reviews__cover'
			) as HTMLElement | null
			const video = videos[index]

			if (cover) {
				video.load()
				video.muted = false
				video.addEventListener('loadeddata', () => {
					gsap.to(cover, {
						opacity: 0,
						duration: 0.2,
						onComplete: () => cover?.remove(),
					})
					pauseVideo()
					playVideo(index)
				})
				video.addEventListener('ended', () => {
					togglePlayButtonClass(playButtons[index])
				})
			} else {
				playVideo(index)
			}
			togglePlayButtonClass(button, true)
		})
	})
}
