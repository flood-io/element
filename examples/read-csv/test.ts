import { step, TestData, Browser } from '@flood/element'

interface Data {
	firstName: string
	lastName: string
	email: string
	due: string
	webSite: string
}

TestData.fromCSV<Data>('data.csv').filter((line) => line.due === '$50.00')

export default () => {
	let totalDue = 0
	step('Prepare', async (browser: Browser, data: Data) => {
		const { firstName, lastName, email } = data
		console.log(`Name: ${firstName} ${lastName}`)
		console.log(`Email: ${email}`)
	})

	step.skip(async (browser: Browser, data: Data) => {
		totalDue += Number.parseInt(data.due.slice(1))
		console.log(totalDue)
	})
}
