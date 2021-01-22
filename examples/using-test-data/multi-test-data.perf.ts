import { step, TestSettings, TestData, Browser } from '@flood/element'

export const settings: TestSettings = {
	chromeVersion: 'stable',
	loopCount: -1,
	waitUntil: 'visible',
	waitTimeout: '60s',
	screenshotOnFailure: false,
	clearCache: true,
	clearCookies: true,
	disableCache: true,
	incognito: true,
	actionDelay: '1s',
	stepDelay: '2s',
}

type Flooders = {
	name: string
	email: string
}

type User = {
	email: string
	password: string
}

type SolarSystemPlanet = {
	index: number
	planetName: string
	diameter: number
	orbit: number
	day: number
}

const solarSystemPart1: SolarSystemPlanet[] = [
	{
		index: 1,
		planetName: 'Mercury',
		diameter: 4878,
		orbit: 88,
		day: 58.6,
	},
	{
		index: 2,
		planetName: 'Venus',
		diameter: 12104,
		orbit: 225,
		day: 241,
	},
	{
		index: 3,
		planetName: 'Earth',
		diameter: 12760,
		orbit: 365.24,
		day: 1,
	},
	{
		index: 4,
		planetName: 'Mars',
		diameter: 6787,
		orbit: 687,
		day: 1,
	},
]

const solarSystemPart2: SolarSystemPlanet[] = [
	{
		index: 5,
		planetName: 'Jupiter',
		diameter: 139822,
		orbit: 4343.5,
		day: 0.4,
	},
	{
		index: 6,
		planetName: 'Saturn',
		diameter: 139822,
		orbit: 4343.5,
		day: 0.4,
	},
	{
		index: 7,
		planetName: 'Uranus',
		diameter: 51120,
		orbit: 30660,
		day: 0.75,
	},
	{
		index: 8,
		planetName: 'Neptune',
		diameter: 49530,
		orbit: 60225,
		day: 0.8,
	},
	{
		index: 9,
		planetName: 'Pluto',
		diameter: 2301,
		orbit: 90520,
		day: 6.4,
	},
]

TestData.fromCSV<User>('./users.csv').as('users')
TestData.fromJSON<Flooders>('./flooders*.json')
	.as('flooders')
	.shuffle()

TestData.fromData<SolarSystemPlanet>(solarSystemPart1).as('Solar-System-Planets')
TestData.fromData<SolarSystemPlanet>(solarSystemPart2)
	.shuffle()
	.as('Solar-System-Planets')

const toEarthYear = (day: number): string => {
	return (day / 365).toFixed(1).toString()
}

const toEarthHour = (day: number): string => {
	return (day * 24).toFixed(1).toString()
}

export default () => {
	step(
		'List all Test Data',
		async (
			browser: Browser,
			data: {
				users: User
				flooders: Flooders
				'Solar-System-Planets': SolarSystemPlanet
			},
		) => {
			console.log('======================================================')
			console.log(`FloodUsers:\n`)
			console.log(data.users)
			console.log('-----------------------------------------------------')
			console.log(`Flooders:\n`)
			console.log(data.flooders)
			console.log('-----------------------------------------------------')
			console.log(`Solar System Planet:\n`)
			const planet = {
				...data['Solar-System-Planets'],
				diameter: `${data['Solar-System-Planets'].diameter} km`,
				orbit:
					data['Solar-System-Planets'].orbit <= 365
						? `${data['Solar-System-Planets'].orbit} Earth days`
						: `${toEarthYear(data['Solar-System-Planets'].orbit)} Earth years`,
				day:
					data['Solar-System-Planets'].day >= 1
						? `${data['Solar-System-Planets'].day} Earth days`
						: `${toEarthHour(data['Solar-System-Planets'].day)} Earth hours`,
			}
			console.log(planet)
			console.log('======================================================')
			await browser.wait(3)
		},
	)
}
