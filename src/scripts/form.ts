let from = ''
const phoneCode = '+7'
const formBlocks = document.querySelectorAll(
	'.form'
) as NodeListOf<HTMLElement>
const dataFromButtons = document.querySelectorAll(
	'[data-from]'
) as NodeListOf<HTMLElement>

const handleSubmit = (e: SubmitEvent, block: HTMLElement): void => {
	e.preventDefault()
	block.classList.add('p-none', 'form--loading')
	// block.classList.add('form--loading')

	const form = e.target as HTMLFormElement
	const formData = new FormData(form)
	formData.set('from', form.closest('.contacts') ? '' : from)

	fetch(form.action, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams(formData as any).toString(),
	})
		.then(response => {
			if (!response.ok) {
				throw new Error(`Ошибка: ${response.status} ${response.statusText}`)
			}
			block.classList.remove('form--loading')
			block.classList.add('form--submitted')
		})
		.catch((error: Error) => {
			block.classList.remove('p-none', 'form--loading')
			alert(error.message)
		})
}

const toggleError = (input: HTMLInputElement, isError: boolean) => {
	input.classList.toggle('error', isError)
}

const toggleActive = (input: HTMLInputElement | HTMLTextAreaElement) => {
	input.classList.toggle('active', input.value.trim() !== '')
}

const validateName = (input: HTMLInputElement) => input.value.trim().length < 2

const validatePhone = (input: HTMLInputElement) => {
	const regex = /^[+]?\d+$/
	const value = input.value
	return (
		value.length !== 12 || !value.startsWith(phoneCode) || !regex.test(value)
	)
}

export default () => {
	formBlocks.forEach(block => {
		const form = block.querySelector('form') as HTMLFormElement
		const nameInput = block.querySelector('[name="name"]') as HTMLInputElement
		const phoneInput = block.querySelector('[name="phone"]') as HTMLInputElement
		const messageArea = block.querySelector('[name="message"]') as HTMLTextAreaElement

		nameInput.addEventListener('input', () => {
			const nameValue = nameInput.value
			const capitalized = nameValue.charAt(0).toUpperCase() + nameValue.slice(1)
			nameInput.value = capitalized
			toggleError(nameInput, validateName(nameInput))
			toggleActive(nameInput)
		})

		phoneInput.addEventListener('focus', () => {
			let phoneValue = phoneInput.value
			if (!phoneValue.startsWith(phoneCode)) {
				phoneInput.value = phoneCode + phoneValue.slice(2)
				toggleActive(phoneInput)
			}
		})

		phoneInput.addEventListener('input', () => {
			let phoneValue = phoneInput.value.replace(/[^0-9+]/g, '')

			phoneInput.value = phoneValue

			toggleError(phoneInput, validatePhone(phoneInput))
			toggleActive(phoneInput)
		})

		messageArea.addEventListener('input', () => toggleActive(messageArea))

		form.addEventListener('submit', e => {
			if (validatePhone(phoneInput) || validateName(nameInput)) {
				e.preventDefault()
				toggleError(phoneInput, validatePhone(phoneInput))
				toggleError(nameInput, validateName(nameInput))
			} else {
				handleSubmit(e, block)
			}
		})
	})

	dataFromButtons.forEach(btn => {
		btn.addEventListener('click', () => {
			from = btn.getAttribute('data-from') || ''
		})
	})
}
