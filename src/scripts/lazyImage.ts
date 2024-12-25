const images = document.querySelectorAll(
	'[loading]'
) as NodeListOf<HTMLImageElement>

const onLoad = (img: HTMLImageElement) => {
	img.classList.add('loaded')
}

export default () => {
	images.forEach(img =>
		img.complete
			? onLoad(img)
			: img.addEventListener('load', () => onLoad(img), { once: true })
	)
}
