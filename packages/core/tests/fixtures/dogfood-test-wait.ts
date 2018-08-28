import { step, TestSettings, Until, By, MouseButtons, Device, Driver, ENV } from '@flood/element'

export const settings: TestSettings = {
	loopCount: 1,
	device: Device.iPadLandscape,
	userAgent: 'I AM ROBOT',
	disableCache: true,
	actionDelay: 1,
	stepDelay: 2,
	responseTimeMeasurement: 'step',
}

export default () => {
	step('Dogfood Test Step', async (driver: Driver) => {
		await driver.visit('http://localhost:1337/wait.html')

		let linkText = By.linkText('show bar')
		await driver.wait(Until.elementIsVisible(linkText))

		let link = await driver.findElement(linkText)
		await link.click()

		await driver.wait(Until.elementIsVisible(By.css('#foo')))
	})
}
