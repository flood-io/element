import { step, TestSettings, By, Until, beforeAll, afterEach, Key, Browser } from '@flood/element'

export const settings: TestSettings = {
	loopCount: 1,
	waitUntil: 'visible',
	clearCache: false,
	clearCookies: false,
	disableCache: false,
	waitTimeout: 60,
	screenshotOnFailure: true,
	viewport: { width: 1366, height: 768 },
	launchArgs: ['--window-size=1920,1080'],
}

const URL = 'https://flood-element-challenge.vercel.app/'

const getNumOfPages = async (browser: Browser) => {
	return await browser.evaluate(() => {
		const nav = document.querySelector('nav[aria-label="pagination navigation"]')
		const items = nav.getElementsByTagName('li')
		return items.length === 2 ? 1 : items.length - 2
	})
}

const scrollToTop = async (browser: Browser) => {
	await browser.evaluate(() => {
		window.scrollTo({ top: 0 })
	})
}

const adjustPriceRange = async (
	browser: Browser,
	targetMinPrice: number,
	targetMaxPrice: number,
) => {
	const priceRange = await browser.findElement(By.css('p[data-test-range]'))
	const priceSlider = await browser.findElement(By.css('span[data-test-slider]'))

	await priceRange.click()

	const sliderLocation = await priceSlider.location()
	const sliderWidth = (await priceSlider.size()).width

	const maxLocation = sliderLocation.x + 1950 / (1950 / sliderWidth)

	const minPriceLocation = sliderLocation.x + (targetMinPrice - 50) / (1950 / sliderWidth)
	const maxPriceLocation = sliderLocation.x + (targetMaxPrice - 50) / (1950 / sliderWidth)

	await browser.mouse.drag([maxLocation, sliderLocation.y], [maxPriceLocation, sliderLocation.y])

	const priceRangeText = await priceRange.text()
	let currentMaxPrice = parseInt(
		priceRangeText
			.split('-')[1]
			.trim()
			.replace('$', ''),
	)

	while (currentMaxPrice !== targetMaxPrice) {
		if (currentMaxPrice > targetMaxPrice) {
			await browser.page.keyboard.press(Key.ARROW_LEFT)
			currentMaxPrice--
		} else {
			await browser.page.keyboard.press(Key.ARROW_RIGHT)
			currentMaxPrice++
		}
	}

	// await browser.wait(0.5)

	await browser.mouse.drag(
		[sliderLocation.x, sliderLocation.y],
		[minPriceLocation, sliderLocation.y],
	)

	const newPriceRangeText = await priceRange.text()
	let currentMinPrice = parseInt(
		newPriceRangeText
			.split('-')[0]
			.trim()
			.replace('$', ''),
	)

	while (currentMinPrice !== targetMinPrice) {
		if (currentMinPrice > targetMinPrice) {
			await browser.page.keyboard.press(Key.ARROW_LEFT)
			currentMinPrice--
		} else {
			await browser.page.keyboard.press(Key.ARROW_RIGHT)
			currentMinPrice++
		}
	}
}

const minimizePopup = async (browser: Browser) => {
	const minimizeBtn = await browser.findElement(By.css('button[data-test-minimize]'))
	await browser.click(minimizeBtn)
	await browser.wait(0.5)
}

const maximizePopup = async (browser: Browser) => {
	const maximizeBtn = await browser.findElement(By.css('button[data-test-maximize]'))
	await browser.click(maximizeBtn)
	await browser.wait(0.5)
}

export default () => {
	// Before all step
	beforeAll(async browser => {
		await browser.visit(URL)

		const pageTextVerified = By.css('h3')
		await browser.wait(Until.elementIsVisible(pageTextVerified))

		const takeTheChallengeBtn = await browser.findElement(By.visibleText('TAKE THE CHALLENGE'))
		await browser.click(takeTheChallengeBtn)

		const modal = By.css('#challenges-popup')
		await browser.wait(Until.elementIsVisible(modal))
	})

	// After each step
	afterEach(async browser => {
		const modal = await browser.findElement(By.id('challenges-popup'))

		const checkBtn = await modal.findElement(By.visibleText('CHECK'))
		checkBtn?.click()
		await browser.wait(0.5)

		const nextBtn = await modal.findElement(By.visibleText('NEXT'))
		nextBtn?.click()
		await browser.wait(0.5)
	})

	// Challenge 1
	step('Test: Challenge 1', async browser => {
		const h2El = await browser.findElement(By.css('h2'))
		const discountText = await h2El.text()
		const discountNumber = discountText.split(' ').filter(word => word.includes('%'))[0]

		const modalEl = await browser.findElement(By.css('#challenges-popup'))
		const labels = await modalEl.findElements(By.tagName('label'))
		await Promise.all(
			labels.map(async label => {
				const correctElText = await label.text()
				if (correctElText === discountNumber) {
					await label.click()
				}
			}),
		)
	})

	// Challenge 2
	step('Test: Challenge 2', async browser => {
		const modalEl = await browser.findElement(By.id('challenges-popup'))
		const keyword = await (await modalEl.findElement(By.id('challenge-2-category')))?.text()
		if (keyword?.toLowerCase() !== 't-shirt') {
			const targetButton = await browser.findElement(By.css(`button[value="${keyword}"]`))
			await targetButton.click()
			await browser.wait(0.5)
		}

		const label = await modalEl.findElement(
			By.js(() => {
				const products = document.getElementById('new-arrivals-panel')?.getElementsByTagName('a')
				const labelEls = document.getElementById('challenges-popup')?.getElementsByTagName('label')
				if (labelEls?.length) {
					const answer = Array.from(labelEls).filter(
						label => label.textContent === products?.length + '',
					)
					return answer[0]
				}
			}),
		)
		await label?.click()
	})

	// Challenge 3
	step('Test: Challenge 3', async browser => {
		await browser.page.browserContext().overridePermissions(URL, ['clipboard-read'])

		const revealButton = await browser.findElement(By.visibleText('Reveal the deal'))
		await revealButton.click()

		const copyBtnLocator = By.visibleText('Copy the code')
		await browser.wait(Until.elementIsVisible(copyBtnLocator))
		const copyButton = await browser.findElement(copyBtnLocator)
		await copyButton.click()

		const promotionCode = await browser.page.evaluate(() => {
			return navigator.clipboard.readText()
		})

		const promotionInput = await browser.findElement(By.id('challenge-3-promotion-code'))
		await promotionInput?.focus()
		await browser.type(promotionInput, promotionCode)
	})

	// Challenge 4
	step('Test: Challenge 4', async browser => {
		const productsLink = await browser.findElement(By.partialLinkText('Products'))
		await productsLink.click()
	})

	// Challenge 5
	step('Test: Challenge 5', async browser => {
		const challengeMinPrice = await browser.findElement(By.id('challenge-5-min-price'))
		const challengeMaxPrice = await browser.findElement(By.id('challenge-5-max-price'))

		const targetMinPrice = parseInt((await challengeMinPrice.text()).replace('$', ''))
		const targetMaxPrice = parseInt((await challengeMaxPrice.text()).replace('$', ''))

		await minimizePopup(browser)

		await adjustPriceRange(browser, targetMinPrice, targetMaxPrice)

		await maximizePopup(browser)

		const numOfPage = await getNumOfPages(browser)

		const challenge5Input = await browser.findElement(By.id('challenge-5-amount-products'))

		if (numOfPage > 1) {
			const goToPageButton = await browser.findElement(
				By.css(`button[aria-label="Go to page ${numOfPage}"]`),
			)
			await goToPageButton.click()
		}

		const productCards = await browser.findElements(By.css('div[data-test-card]'))
		const cardLength = productCards.length
		const totalProducts = (numOfPage - 1) * 18 + cardLength
		await challenge5Input.focus()
		await challenge5Input.sendKeys(totalProducts + '')

		if (numOfPage > 1) {
			const backToFirstPage = await browser.findElement(By.css('button[aria-label="Go to page 1"]'))
			await backToFirstPage.click()
		}

		await scrollToTop(browser)
	})

	step('Test: Challenge 6', async browser => {
		const numOfPage = await getNumOfPages(browser)

		for (let x = 1; x <= numOfPage; x++) {
			const productCards = await browser.findElements(By.css('div[data-test-card]'))
			for (let y = 0; y < productCards.length; y++) {
				await browser.page.evaluate(y => {
					const el = document.querySelectorAll('div[data-test-card]')[y]
					el.scrollIntoView({ block: 'nearest' })
				}, y)
				const card = productCards[y]
				const location = await card.location()
				await browser.mouse.move(location.x + 10, location.y + 10)

				await browser.wait(0.5)

				const addToCartBtn = await card.findElement(By.visibleText('add to cart'))
				await browser.click(addToCartBtn)

				const productName = By.css('h3[data-test-name]')
				await browser.wait(Until.elementIsVisible(productName))

				const anotherAddToCardBtn = await card.findElement(By.visibleText('Add to cart'))
				await browser.click(anotherAddToCardBtn)

				await browser.mouse.move(1, 1)
				await browser.mouse.down()
				await browser.mouse.up()
			}
			if (numOfPage > 1 && x < numOfPage) {
				const goToPageButton = await browser.findElement(
					By.css(`button[aria-label="Go to page ${x + 1}"]`),
				)
				await goToPageButton.click()
				await scrollToTop(browser)
			}
		}
	})

	step('Test: Challenge 7', async browser => {
		const homeLink = await browser.findElement(By.partialLinkText('Home'))
		await homeLink.click()
		const productsLink = await browser.findElement(By.partialLinkText('Products'))
		await productsLink.click()

		await browser.evaluate(() => {
			window.scrollTo({ top: 0 })
		})

		const category = await (await browser.findElement(By.id('challenge-7-category'))).text()
		const size = await (await browser.findElement(By.id('challenge-7-size'))).text()
		const targetMinPrice = await (await browser.findElement(By.id('challenge-7-min-price'))).text()
		const targetMaxPrice = await (await browser.findElement(By.id('challenge-7-max-price'))).text()

		await minimizePopup(browser)

		const checkBoxes = await browser.findElements(By.css('label[data-test-check]'))
		await Promise.all(
			checkBoxes.map(async checkBox => {
				const text = await checkBox.text()
				if (text === category || text === size) {
					await checkBox.click()
				}
			}),
		)

		await adjustPriceRange(browser, parseInt(targetMinPrice), parseInt(targetMaxPrice))
		await maximizePopup(browser)
	})

	step('Test: Challenge 8', async browser => {
		const subTotalSelector = 'subtotal-price'
		const cartButton = await browser.findElement(By.id('cart-button'))
		await cartButton.click()

		await scrollToTop(browser)

		const challengeMinPriceText = (
			await (await browser.findElement(By.id('challenge-9-min-price'))).text()
		).replace('$', '')
		const challengeMaxPriceText = (
			await (await browser.findElement(By.id('challenge-9-max-price'))).text()
		).replace('$', '')

		let cartSubtotalText = (
			await (await browser.findElement(By.id(subTotalSelector))).text()
		).replace('$', '')

		const challengeMinPrice = parseInt(challengeMinPriceText)
		const challengeMaxPrice = parseInt(challengeMaxPriceText)
		let cartSubtotal = parseInt(cartSubtotalText)

		while (cartSubtotal < challengeMinPrice) {
			const addMoreButton = await browser.findElement(By.css('button[data-test-add]'))
			await addMoreButton.click()
			cartSubtotal = parseInt(
				(await (await browser.findElement(By.id(subTotalSelector))).text()).replace('$', ''),
			)
		}

		while (cartSubtotal > challengeMaxPrice) {
			const firstProductAmountInput = await browser.findElement(
				By.css('div[data-test-input]>div>input'),
			)

			const firstProductAmount = parseInt(await firstProductAmountInput.getAttribute('value'))
			if (firstProductAmount === 0) {
				const removeFirstProductBtn = await browser.findElement(By.css('button[data-test-remove]'))
				await browser.click(removeFirstProductBtn)
			}

			const minusButton = await browser.findElement(By.css('button[data-test-minus]'))
			await minusButton.click()
			cartSubtotal = parseInt(
				(await (await browser.findElement(By.id(subTotalSelector))).text()).replace('$', ''),
			)
		}
	})
}
