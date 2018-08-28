import { escapeCss } from '../utils/Escape'
import { LinkTextLocator } from './locators/LinkText'
import { VisibleTextLocator } from './locators/VisibleTextLocator'
import { CSSLocator } from './locators/CSS'
import { TagNameLocator } from './locators/TagName'
import { XPathLocator } from './locators/XPath'
import { Locator } from './types'
import { BaseLocator } from './Locator'
import { EvaluateFn } from 'puppeteer'

/**
 * By is used to create <[Locator]>s to find Elements or use in any place which accepts a Locator or <[Locatable]>.
 *
 * @class By
 */
export class By {
	public readonly command: string
	public readonly args: string[]

	constructor(command: string, ...args) {
		this.command = command
		this.args = args
	}

	/**
	 * Locates an element using a CSS (jQuery) style selector
	 * @param selector
	 */
	public static css(selector: string, debugString?: string): Locator {
		if (debugString === undefined) {
			debugString = `By.css('${selector}')`
		}
		return new CSSLocator(selector, debugString)
	}

	/**
	 * Locates elements by the ID attribute. This locator uses the CSS selector
	 * `*[id="$ID"]`, _not_ `document.getElementById`.
	 *
	 * @param {string} id The ID to search for
	 */
	public static id(id: string): Locator {
		if (id.startsWith('#')) id = id.slice(1)
		return this.css(`*[id="${escapeCss(id)}"]`, `By.id('#${id}')`)
	}

	/**
	 * Locates link elements whose `textContent` matches the given
	 * string.
	 *
	 * @param {string} text The link text to search for.
	 */
	static linkText(text): Locator {
		return new LinkTextLocator(text, false, `By.linkText('${text}')`)
	}

	/**
	 * Locates link elements whose `textContent` contains the given
	 * substring.
	 *
	 * @param {string} text The substring to check for in a link's visible text.
	 */
	static partialLinkText(text): Locator {
		return new LinkTextLocator(text, true, `By.partialLinkText('${text}')`)
	}

	/**
	 * Locates all elements whose `textContent` equals the given
	 * substring and is not hidden by CSS.
	 *
	 * @param {string} text The string to check for in a elements's visible text.
	 */
	static visibleText(text: string): Locator {
		return new VisibleTextLocator(text, false, `By.visibleText('${text}')`)
	}

	/**
	 * Locates all elements whose `textContent` contains the given
	 * substring and is not hidden by CSS.
	 *
	 * @param {string} text The substring to check for in a elements's visible text.
	 */
	static partialVisibleText(text: string): Locator {
		return new VisibleTextLocator(text, true, `By.partialVisibleText('${text}')`)
	}

	/**
	 * Locates an elements by evaluating a JavaScript expression.
	 * The result of this expression must be an element or list of elements.
	 *
	 * @param {!(string|Function)} script The script to execute.
	 * @param {...*} var_args The arguments to pass to the script.
	 */
	static js(script: EvaluateFn, ...args): Locator {
		let locator = new BaseLocator('By.js(function)')
		locator.pageFunc = script
		locator.pageFuncMany = script
		locator.pageFuncArgs = args
		return locator
	}

	/**
	 * Locates elements whose `name` attribute has the given value.
	 *
	 * @param {string} value The name attribute to search for.
	 * @return {!By} The new locator.
	 */
	public static nameAttr(value: string): Locator {
		return By.css(`*[name="${escapeCss(value)}"]`, `By.nameAttr(${value})`)
	}

	/**
	 * Locates an element where the attribute matches the value.
	 *
	 * **Example:**
	 * By.attr('name', 'frame-name')
	 */
	public static attr(tagName: string, attrName: string, attrValue: string): Locator {
		return By.css(
			`${escapeCss(tagName).toLowerCase()}[${escapeCss(attrName)}="${escapeCss(attrValue)}"]`,
			`By.attr$(tagName},${attrName},${attrValue})`,
		)
	}

	/**
	 * Locates elements with a given tag name.
	 *
	 * @param {string} name The tag name to search for.
	 * @return {!By} The new locator.
	 */
	static tagName(name: string): Locator {
		return new TagNameLocator(name)
	}

	/**
	 * Locates elements matching a XPath selector. Care should be taken when
	 * using an XPath selector with a {@link webdriver.WebElement} as WebDriver
	 * will respect the context in the specified in the selector. For example,
	 * given the selector `//div`, WebDriver will search from the document root
	 * regardless of whether the locator was used with a WebElement.
	 *
	 * @param {string} xpath The XPath selector to use.
	 * @return {!By} The new locator.
	 * @see http://www.w3.org/TR/xpath/
	 */
	static xpath(xpath): Locator {
		return new XPathLocator(xpath)
	}
}
