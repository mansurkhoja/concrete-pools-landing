const header = document.querySelector('header') as HTMLElement
export const toggleHeaderVisibility = (isHide = false) => {
	header.classList.toggle('header--hide', isHide)
}
