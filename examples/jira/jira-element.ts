import { step, TestSettings, Until, By, Key } from '@flood/element'
import * as assert from 'assert'

export const settings: TestSettings = {
	loopCount: -1,
	screenshotOnFailure: true,
	description: 'JIRA - Create Issue',
	actionDelay: '8s',
	stepDelay: '8s',
	disableCache: true,
	clearCookies: true,
}

/**
 * Create an Issue - JIRA - Flood Element Example
 * Version: 1.0
 */
export default () => {
	step('JIRA: Navigate to Sign-in', async browser => {
		await browser.visit('http://flood-demo.atlassian.net', { waitUntil: 'load' })

		let pageTextVerify = By.visibleText('Log in to your account')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

		await browser.takeScreenshot()
	})

	step('JIRA: Username Sign-in', async browser => {
		// Fill in text field - billing First Name
		await browser.type(By.css('#username'), 'j.rizio@tricentis.com')

		let btnContinue = await browser.findElement(By.css('#login-submit > span > span'))
		await btnContinue.click()

		await browser.takeScreenshot()
	})

	step('JIRA: Login', async browser => {
		// Fill in text field - password
		await browser.type(By.css('#password'), 'PwWt46GEkiLk')

		let btnLogin = await browser.findElement(By.css('#login-submit > span > span > span'))
		await btnLogin.click()

		let pageTextVerify = By.visibleText('Welcome to Jira')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

		await browser.takeScreenshot()
	})

	step('JIRA: Click Projects', async browser => {
		let btnProjects = await browser.findElement(By.xpath("//a[contains(@href, 'BrowseProjects')]"))
		await btnProjects.click()

		let pageTextVerify = By.visibleText('Projects')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

		await browser.takeScreenshot()
	})

	step('JIRA: Click jira-load-test project', async browser => {
		let btnProjects = await browser.findElement(By.visibleText('jira-load-test'))
		await btnProjects.click()

		let pageTextVerify = By.visibleText('Kanban board')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

		await browser.takeScreenshot()
	})

	step('JIRA: Create Issue - Enter Details', async browser => {
		let btnCreate = await browser.findElement(
			By.xpath("//span[contains(@aria-label, 'Create (c)')]"),
		)
		await btnCreate.click()

		let pageTextVerify = By.visibleText('Create issue')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

		await browser.takeScreenshot()

		//#issuetype-field = BUG
		let selIssueType = await browser.findElement(
			By.xpath("//input[contains(@id, 'issuetype-field')]"),
		)
		await selIssueType.focus()

		await browser.type(By.css('#issuetype-field'), 'Bug')
		await browser.press(Key.ENTER)

		//#summary
		await browser.type(By.css('#summary'), 'There is a bug in the application')

		//#description
		await browser.type(
			By.css('#description'),
			'There is a bug in the application and this is the description',
		)

		//#priority-field
		await browser.type(By.css('#priority-field'), 'Low')
		await browser.press(Key.ENTER)

		//#labels-textarea
		await browser.type(By.css('#labels-textarea'), 'bug-report')
		await browser.press(Key.ENTER)
		await browser.type(By.css('#labels-textarea'), 'defect')
		await browser.press(Key.ENTER)

		//#environment
		await browser.type(By.css('#environment'), 'Production')
	})

	step('JIRA: Create Issue', async browser => {
		//#create-issue-submit
		let btnCreate = await browser.findElement(By.css('#create-issue-submit'))
		await btnCreate.click()

		let pageTextVerify = By.visibleText('Kanban board')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

		await browser.takeScreenshot()
	})
}
