import { step, TestSettings, Until, By, MouseButtons, Device, Driver, ENV } from '@flood/element'

export const settings: TestSettings = {
	loopCount: 1,
	device: Device.iPadLandscape,
	userAgent: 'I AM ROBOT',
	disableCache: true,
	actionDelay: '1s',
	stepDelay: '2s',
	responseTimeMeasurement: 'step',
	waitUntil: 'visible',
}

export default () => {
	step('Dogfood Test Step', async (driver: Driver) => {
		await driver.visit('<URL>')
		const linkText = By.linkText('show bar')
		const link = await driver.findElement(linkText)
		await link.click()
		await driver.findElement(By.css('#foo'))
	})
}
