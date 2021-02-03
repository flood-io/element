import { Page } from 'playwright'

export class Keyboard {
	constructor(private page: Page) {}

	/**
	 * Dispatches a keydown event.
	 * @param key Name of key to press, such as ArrowLeft.
	 * @param options Specifies a input text event.
	 */
	async down(key: string): Promise<void> {
		return this.page.keyboard.down(key)
	}

	/** Shortcut for `keyboard.down` and `keyboard.up`. */
	async press(key: string, options?: { text?: string; delay?: number }): Promise<void> {
		return this.page.keyboard.press(key, options)
	}

	/** Dispatches a `keypress` and `input` event. This does not send a `keydown` or keyup `event`. */
	async sendCharacter(char: string): Promise<void> {
		return this.page.keyboard.insertText(char)
	}

	/**
	 * Sends a keydown, keypress/input, and keyup event for each character in the text.
	 * @param text A text to type into a focused element.
	 * @param options Specifies the typing options.
	 */
	async type(text: string, options?: { delay?: number }): Promise<void> {
		return this.page.keyboard.type(text, options)
	}

	/**
	 * Dispatches a keyup event.
	 * @param key Name of key to release, such as ArrowLeft.
	 */
	async up(key: string): Promise<void> {
		return this.page.keyboard.up(key)
	}
}
