import { suite, By, Until } from '@flood/element'

export default suite(step => {
	step('Dogfood Test Step', async driver => {
		await driver.visit('http://localhost:1337/wait.html')
		let linkText = By.linkText('show bar')
		await driver.wait(Until.elementIsVisible(linkText))
		let link = await driver.findElement(linkText)
		await link.click()
		await driver.wait(Until.elementIsVisible(By.css('#foo')))
	})
})
