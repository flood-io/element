import { step, TestSettings, Until, By, Device } from '@flood/element'
import * as assert from 'assert'

export const settings: TestSettings = {
	clearCache: false,
	disableCache: false,
	clearCookies: false,
	loopCount: -1,
	duration: '-1',
	actionDelay: '2s',
	stepDelay: '2s',
	waitTimeout: '60s',
	screenshotOnFailure: true,
	DOMSnapshotOnFailure: true,
}

/**
 * Author: Antonio Jimenez : antonio@flood.io
 * The internet - heroku App
 * @version 1.1
 */

const URL = 'https://the-internet.herokuapp.com'

export default () => {
	step('Test: 01 - Homepage', async (browser) => {
		await browser.visit(URL)
		await browser.wait(Until.elementIsVisible(By.css('#content > h1')))
		const pageTextVerify = By.visibleText('Welcome to the-internet')
		await browser.wait(Until.elementIsVisible(pageTextVerify))
	})

	step('Test: 02 - Form Authentication', async (browser) => {
		await browser.visit(URL + '/login')
		const pageTextVerify = By.visibleText('Login Page')
		await browser.wait(Until.elementIsVisible(pageTextVerify))
	})

	step('Test: 03 - Enter credentials', async (browser) => {
		const Username = By.css('#username')
		await browser.wait(Until.elementIsVisible(Username))
		const UsernameBox = await browser.findElement(Username)
		await UsernameBox.click()
		await browser.type(UsernameBox, 'tomsmith')

		const Password = By.css('#password')
		await browser.wait(Until.elementIsVisible(Password))
		const PasswordBox = await browser.findElement(Password)
		await PasswordBox.click()
		await browser.type(PasswordBox, 'SuperSecretPassword!')

		const Login = By.css('#login > button > i')
		await browser.wait(Until.elementIsVisible(Login))
		const LoginButton = await browser.findElement(Login)
		await LoginButton.click()
	})

	step('Test: 04 - Landing Page', async (browser) => {
		const pageTextVerify = By.visibleText('Secure Area')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

		const Logout = By.css('#content > div > a')
		await browser.wait(Until.elementIsVisible(Logout))
		const LogoutButton = await browser.findElement(Logout)
		await LogoutButton.click()
	})

	step('Test: 05 - Login Page', async (browser) => {
		const pageTextVerify = By.visibleText('Login Page')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

		const Username = By.css('#username')
		await browser.wait(Until.elementIsVisible(Username))
	})
}
