import iconPlace from '../assets/images/icon-place.png'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const apiKey = '8a5caee8-97e8-4e04-b9fd-263cd2e82a22'
const container = document.getElementById('map') as HTMLElement

const init = async () => {
	await ymaps3.ready

	const { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapMarker } =
		ymaps3

	const map = new YMap(
		container,

		{
			location: {
				// Координаты центра карты
				center: [37.228789, 55.777671],
				// Уровень масштабирования
				zoom: 8.9,
			},
			behaviors: [
				'drag',
				'pinchZoom',
				'dblClick',
				'magnifier',
				'oneFingerZoom',
				'mouseRotate',
				'mouseTilt',
				'pinchRotate',
				'panTilt',
			],
			showScaleInCopyrights: true,
		},

		[
			// Add a map scheme layer
			new YMapDefaultSchemeLayer({}),
			// Add a layer of geo objects to display the markers
			new YMapDefaultFeaturesLayer({}),
		]
	)

	const marker = () => {
		const markerContainerElement = document.createElement('div')
		markerContainerElement.classList.add('marker-container')

		const markerElement = document.createElement('div')
		markerElement.classList.add('marker')

		const markerImage = document.createElement('img')
		markerImage.src = iconPlace
		markerImage.classList.add('image')

		markerElement.appendChild(markerImage)

		markerContainerElement.appendChild(markerElement)

		return new YMapMarker(
			{
				coordinates: [37.228789, 55.777671],
			},
			markerContainerElement
		)
	}

	map.addChild(marker())

	gsap.to('.map__loader', {
		opacity: 0,
		display: 'none',
		duration: 0.3,
		delay: 0.2,
	})
}

export default () => {
	ScrollTrigger.create({
		trigger: '#map',
		start: '-250px bottom',
		once: true,
		onEnter: () => {
			const script = document.createElement('script')
			script.src = `https://api-maps.yandex.ru/v3/?apikey=${apiKey}&lang=ru_RU`
			script.addEventListener('load', init, { passive: true, once: true })
			document.body.appendChild(script)
		},
	})
}
