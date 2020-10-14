import {
	step,
	TestSettings,
	By,
	Until,
	Key,
	Browser,
	beforeAll,
	beforeEach,
	afterEach,
	afterAll,
} from '@flood/element'
import assert from 'assert'

export const settings: TestSettings = {
	loopCount: 1,
	waitUntil: 'visible',
	clearCache: false,
	clearCookies: false,
	disableCache: false,
	waitTimeout: '60s',
	screenshotOnFailure: true,
	viewport: { width: 1920, height: 1080 },
	launchArgs: ['--window-size=1920,1080'],
	stepDelay: '1s',
	actionDelay: '500ms',
}

const URL = 'https://flood-element-challenge.vercel.app/'

const getNumOfPages = async (browser: Browser): Promise<number> => {
	return await browser.evaluate(() => {
		const nav = document.querySelector('nav[aria-label="pagination navigation"]')
		const items = nav.getElementsByTagName('li')
		return items.length === 2 ? 1 : items.length - 2
	})
}

const scrollToTop = async (browser: Browser): Promise<void> => {
	await browser.scrollTo('top', { behavior: 'smooth' })
}

const adjustPriceRange = async (
	browser: Browser,
	targetMinPrice: number,
	targetMaxPrice: number,
): Promise<void> => {
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
			await browser.press(Key.ARROW_LEFT)
			currentMaxPrice--
		} else {
			await browser.press(Key.ARROW_RIGHT)
			currentMaxPrice++
		}
	}

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
			await browser.press(Key.ARROW_LEFT)
			currentMinPrice--
		} else {
			await browser.press(Key.ARROW_RIGHT)
			currentMinPrice++
		}
	}
}

const minimizePopup = async (browser: Browser): Promise<void> => {
	const minimizeBtn = await browser.findElement(By.xpath('//button[@data-test-minimize]'))
	await browser.click(minimizeBtn)
	await browser.wait(0.5)
}

const maximizePopup = async (browser: Browser): Promise<void> => {
	const maximizeBtn = await browser.findElement(By.xpath('//button[@data-test-maximize]'))
	await browser.click(maximizeBtn)
	await browser.wait(0.5)
}

const getChallangeText = async (browser: Browser): Promise<string> => {
	const modal = await browser.findElement(By.id('challenges-popup'))
	const challengeText = await (await modal.findElement(By.xpath('//h6[@data-test-title]'))).text()

	return challengeText.split(' ')[1].split('/')[0]
}

export default () => {
	beforeAll(async browser => {
		await browser.visit(URL)

		const pageTextVerified = By.css('h3')
		await browser.wait(Until.elementIsVisible(pageTextVerified))

		await browser.press(Key.TAB)
		await browser.press(Key.ENTER)

		await browser.takeScreenshot()
		const modal = By.css('#challenges-popup')
		await browser.wait(Until.elementIsVisible(modal))
	})

	beforeEach(async browser => {
		const challenge = await getChallangeText(browser)
		if (challenge && parseInt(challenge) <= 8) {
			const nextChallengeBtn = By.visibleText('CHECK')
			await browser.wait(Until.elementLocated(nextChallengeBtn))
		}
	})

	afterEach(async browser => {
		await browser.takeScreenshot()
		const modal = await browser.findElement(By.id('challenges-popup'))

		const checkBtn = await modal.findElement(By.visibleText('CHECK'))
		checkBtn?.click()

		const nextBtn = By.visibleText('NEXT')
		await browser.wait(Until.elementLocated(nextBtn))
		const nextBtnEl = await modal.findElement(By.visibleText('NEXT'))
		nextBtnEl.click()
	})

	afterAll(async browser => {
		const finalMessage = By.xpath('//h5[@data-test-message]')
		await browser.wait(Until.elementLocated(finalMessage))
		const finalMsgText = await (await browser.findElement(finalMessage)).text()
		assert.strictEqual(
			finalMsgText,
			'🎉hooray!',
			'The final message should be correct after you finished 8 steps',
		)
		await browser.wait(5)
	})

	step('Test: Challenge 1', async browser => {
		const challenge = await getChallangeText(browser)
		assert.strictEqual(challenge, '1', 'The challenge should be challenge number 1')

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

	step('Test: Challenge 2', async browser => {
		const challenge = await getChallangeText(browser)
		assert.strictEqual(challenge, '2', 'The challenge should be challenge number 2')

		const modalEl = await browser.findElement(By.id('challenges-popup'))
		const keyword = await (await modalEl.findElement(By.id('challenge-2-category')))?.text()
		if (keyword?.toLowerCase() !== 't-shirt') {
			const targetButton = await browser.findElement(By.xpath(`//button[@value="${keyword}"]`))
			await targetButton.click()
		}

		const productCard = By.css('div[data-test-card]')
		await browser.wait(Until.elementsLocated(productCard))

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

	step('Test: Challenge 3', async browser => {
		const challenge = await getChallangeText(browser)
		assert.strictEqual(challenge, '3', 'The challenge should be challenge number 3')
		await browser.page.browserContext().overridePermissions(URL, ['clipboard-read'])

		const revealButton = await browser.findElement(By.visibleText('Reveal the deal'))
		await revealButton.click()

		const copyBtnLocator = By.visibleText('Copy the code')
		await browser.wait(Until.elementIsVisible(copyBtnLocator))
		const copyButton = await browser.findElement(copyBtnLocator)
		await copyButton.click()

		const promotionCode = await browser.evaluate(() => {
			return navigator.clipboard.readText()
		})

		const promotionInput = await browser.findElement(By.id('challenge-3-promotion-code'))
		await promotionInput?.focus()
		await browser.sendKeys(promotionCode)
	})

	step('Test: Challenge 4', async browser => {
		const challenge = await getChallangeText(browser)
		assert.strictEqual(challenge, '4', 'The challenge should be challenge number 4')
		const productsLink = await browser.findElement(By.partialLinkText('Products'))
		await productsLink.click()
	})

	step('Test: Challenge 5', async browser => {
		const challenge = await getChallangeText(browser)
		assert.strictEqual(challenge, '5', 'The challenge should be challenge number 5')
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
				By.xpath(`//button[@aria-label="Go to page ${numOfPage}"]`),
			)
			await goToPageButton.click()
		}

		const productCards = await browser.findElements(By.xpath('//div[@data-test-card]'))
		const cardLength = productCards.length
		const totalProducts = (numOfPage - 1) * 18 + cardLength
		await challenge5Input.focus()
		await browser.sendKeys(totalProducts + '')

		if (numOfPage > 1) {
			const backToFirstPage = await browser.findElement(
				By.xpath('//button[@aria-label="Go to page 1"]'),
			)
			await backToFirstPage.click()
		}

		await scrollToTop(browser)
	})

	step('Test: Challenge 6', async browser => {
		const challenge = await getChallangeText(browser)
		assert.strictEqual(challenge, '6', 'The challenge should be challenge number 6')
		const numOfPage = await getNumOfPages(browser)

		for (let x = 1; x <= numOfPage; x++) {
			const productCards = await browser.findElements(By.xpath('//div[@data-test-card]'))
			for (let y = 0; y < productCards.length; y++) {
				const card = productCards[y]
				await browser.scrollTo(card, { behavior: 'smooth', block: 'nearest' })
				await browser.wait(0.5)
				const location = await card.location()
				await browser.mouse.move(location.x + 10, location.y + 10)

				const addToCartBtn = await card.findElement(By.visibleText('add to cart'))
				await browser.click(addToCartBtn)

				const productName = By.xpath('//h3[@data-test-name]')
				await browser.wait(Until.elementLocated(productName))

				const anotherAddToCardBtn = await browser.findElement(By.visibleText('Add to cart'))
				await browser.click(anotherAddToCardBtn)

				await browser.mouse.move(1, 1)
				await browser.mouse.down()
				await browser.mouse.up()
			}

			if (numOfPage > 1 && x < numOfPage) {
				const goToPageButton = await browser.findElement(
					By.xpath(`//button[@aria-label="Go to page ${x + 1}"]`),
				)
				await goToPageButton.click()
				await scrollToTop(browser)
			}
		}
	})

	step('Test: Challenge 7', async browser => {
		const challenge = await getChallangeText(browser)
		assert.strictEqual(challenge, '7', 'The challenge should be challenge number 7')

		const homeLink = await browser.findElement(By.partialLinkText('Home'))
		await homeLink.click()
		const productsLink = await browser.findElement(By.partialLinkText('Products'))
		await productsLink.click()

		await scrollToTop(browser)

		const category = await (await browser.findElement(By.id('challenge-7-category'))).text()
		const size = await (await browser.findElement(By.id('challenge-7-size'))).text()
		const targetMinPrice = await (await browser.findElement(By.id('challenge-7-min-price'))).text()
		const targetMaxPrice = await (await browser.findElement(By.id('challenge-7-max-price'))).text()

		await minimizePopup(browser)

		const checkBoxes = await browser.findElements(By.xpath('//label[@data-test-filter-check]'))
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
		const challenge = await getChallangeText(browser)
		assert.strictEqual(challenge, '8', 'The challenge should be challenge number 8')

		const cartButton = await browser.findElement(By.id('cart-button'))
		await cartButton.click()

		await browser.wait(Until.urlContains('cart'))
		await scrollToTop(browser)

		const subTotalSelector = await browser.findElement(By.id('subtotal-price'))

		const challengeMinPriceText = (
			await (await browser.findElement(By.id('challenge-8-min-price'))).text()
		).replace('$', '')
		const challengeMaxPriceText = (
			await (await browser.findElement(By.id('challenge-8-max-price'))).text()
		).replace('$', '')

		let cartSubtotalText = (await subTotalSelector.text()).replace('$', '')

		const challengeMinPrice = parseInt(challengeMinPriceText)
		const challengeMaxPrice = parseInt(challengeMaxPriceText)
		let cartSubtotal = parseInt(cartSubtotalText)

		while (cartSubtotal < challengeMinPrice) {
			const addMoreButton = await browser.findElement(By.xpath('//button[@data-test-add]'))
			await addMoreButton.click()
			cartSubtotal = parseInt((await subTotalSelector.text()).replace('$', ''))
		}

		while (cartSubtotal > challengeMaxPrice) {
			const firstProductAmountInput = await browser.findElement(
				By.css('div[data-test-input]>div>input'),
			)

			const firstProductAmount = parseInt(await firstProductAmountInput.getAttribute('value'))
			if (firstProductAmount === 0) {
				const removeFirstProductBtn = await browser.findElement(
					By.xpath('//button[@data-test-remove]'),
				)
				await browser.click(removeFirstProductBtn)
			}

			const minusButton = await browser.findElement(By.xpath('//button[@data-test-minus]'))
			await minusButton.click()
			cartSubtotal = parseInt((await subTotalSelector.text()).replace('$', ''))
		}
	})
}
