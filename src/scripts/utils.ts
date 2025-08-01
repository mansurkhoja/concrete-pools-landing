export const isTouch = typeof window.ontouchstart !== 'undefined'

export const loadVideo = (
	video: HTMLVideoElement,
	eventType: 'loadedmetadata' | 'loadeddata' | 'canplaythrough' = 'loadeddata'
): Promise<HTMLVideoElement> => {
	return new Promise<HTMLVideoElement>((resolve, reject) => {
		video.load()

		const onLoad = () => {
			resolve(video)
		}

		const onError = (e: any) => {
			console.error(e)
			reject(video)
		}

		video.addEventListener(eventType, onLoad, { once: true })
		video.addEventListener('error', onError, { once: true })
	})
}

export const getViewportDimensions = () => {
	return {
		isMobile: window.innerWidth < 720,
		isTabletMini: window.innerWidth < 1024,
		// isTablet: window.innerWidth < 1280,
		isDesktop: window.innerWidth >= 1280,
	}
}
