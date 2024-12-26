// import { isScrollToHashInProgress } from './nav'

const header = document.querySelector('header') as HTMLElement
export const toggleHeaderVisibility = (isHide = false) => {
	// if (isScrollToHashInProgress) {
	// 	isHide = true
	// }
	header.classList.toggle('header--hide', isHide)
}
