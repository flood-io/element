import React from 'react'
import FeatureBlock from './FeatureBlock'
import Section from './Section'
import ComparisonTable from './ComparisonTable'

const features = [
	{
		title: <>Realistic Load</>,
		imageUrl: 'img/network_ic.png',
		description: (
			<>
				Working at a higher level of abstraction greatly simplifies the requests you need to make to
				simulate users on your application.
			</>
		),
	},
	{
		title: <>Test Data</>,
		imageUrl: 'img/json_ic.png',
		description: (
			<>
				Load testing without test data is like using lorem ipsum in production. Element ships with
				rich support for <code>CSV</code> and <code>JSON</code> data loading.
			</>
		),
	},
	{
		title: <>Selenium Compatible</>,
		imageUrl: 'img/se_ic.png',
		description: (
			<>
				Element's DSL is heavily influenced by <code>WebDriver.js</code>, making it really easy to
				migrate your Selenium scripts to Element.
			</>
		),
	},
	{
		title: <>Built on Playwright</>,
		imageUrl: 'img/playwright_ic.png',
		description: (
			<>
				Thanks to the speed of the <code>Playwright</code> automation library, Element generates
				load by launching thousands of instances of Chromium, Firefox, and Webkit.
			</>
		),
	},
	{
		title: <>TypeScript</>,
		imageUrl: 'img/ts_ic.png',
		description: (
			<>
				<code>TypeScript</code> gives you inline documentation and script validation before pressing
				launch, to catch the small issues which might stop the show.
			</>
		),
	},
	{
		title: <>Command Line Interface</>,
		imageUrl: 'img/terminal_ic.png',
		description: (
			<>
				Generate new tests, validate, and run them locally, with our interactive <code>CLI</code>.
			</>
		),
	},
]

const pros = [
	{
		title: <>Reduce maintenance</>,
		imageUrl: 'img/check_ic.png',
		description: (
			<>
				Flood Element scripts are less prone to breakage compared with <code>JMeter</code> or{' '}
				<code>Gatling</code> scripts.
			</>
		),
	},
	{
		title: <>Save time</>,
		imageUrl: 'img/check_ic.png',
		description: (
			<>It takes just a few minutes to get functional load test running with Flood Element.</>
		),
	},
	{
		title: <>Generate Realistic Load</>,
		imageUrl: 'img/check_ic.png',
		description: (
			<>
				In today's modern applications, up to 80% of performance problems occur in the browser,
				which makes browser based load testing more important than ever.
			</>
		),
	},
]

const Main = () => {
	return (
		<main>
			<Section
				title="Features"
				description="Flood Element is the best way to get started with load testing."
			>
				{features.map((props, idx) => (
					<FeatureBlock key={idx} {...props} />
				))}
			</Section>

			<Section
				title="Test Smarter"
				description="Load testing at the browser level opens up huge opportunities for testing modern web applications which would be extremely difficult to achieve reliably with existing network level load testing tools."
			>
				{pros.map((props, idx) => (
					<FeatureBlock key={idx} {...props} />
				))}
			</Section>

			<Section
				title="Browser vs. Protocol"
				description="Load testing has barely kept pace with the rate of innovation on the web as a platform over the last 20 years. We set out to change this with Flood Element."
			>
				<ComparisonTable />
			</Section>
		</main>
	)
}

export default Main
