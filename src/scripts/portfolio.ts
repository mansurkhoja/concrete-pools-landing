import { show } from './modal'

let iframeActiveUrl = ''
const buttons3d = document.querySelectorAll(
	'[data-3d]'
) as NodeListOf<HTMLElement>
const modalContainer = document.querySelector(
	'.modal__container--iframe'
) as HTMLElement

export default () => {
	const iframe = document.createElement('iframe') as HTMLIFrameElement
	iframe.className = 'absolute'

	buttons3d.forEach(btn => {
		btn.addEventListener('click', () => {
			const url = btn.getAttribute('data-3d')
			if (url !== iframeActiveUrl) {
				iframeActiveUrl = url || ''
				iframe.src = iframeActiveUrl
				iframe.remove()
				modalContainer?.appendChild(iframe)
			}
			show('3d')
		})
	})
}
