import React from 'react'
import FeatureBlock from './FeatureBlock'
import Section from './Section'

const features = [
	{
		title: <>Realistic Load</>,
		imageUrl: 'img/undraw_docusaurus_mountain.svg',
		description: (
			<>
				Working at a higher level of abstraction greatly simplifies the requests you need to make to
				simulate users on your application.
			</>
		),
	},
	{
		title: <>Test Data</>,
		imageUrl: 'img/undraw_docusaurus_tree.svg',
		description: (
			<>
				Load testing without test data is like using lorem ipsum in production. Element ships with
				rich support for <code>CSV</code> and <code>JSON</code> data loading.
			</>
		),
	},
	{
		title: <>Selenium Compatible</>,
		imageUrl: 'img/undraw_docusaurus_react.svg',
		description: (
			<>
				Element's DSL is heavily influenced by <code>WebDriver.js</code>, making it really easy to
				migrate your Selenium scripts to Element.
			</>
		),
	},
	{
		title: <>Built on Puppeteer</>,
		imageUrl: 'img/undraw_docusaurus_react.svg',
		description: (
			<>
				Thanks to the speed of the <code>Puppeteer</code> automation library, Element generates load
				by launching thousands of instances of Google Chrome.
			</>
		),
	},
	{
		title: <>TypeScript</>,
		imageUrl: 'img/undraw_docusaurus_mountain.svg',
		description: (
			<>
				<code>TypeScript</code> gives you inline documentation and script validation before pressing
				launch, to catch the small issues which might stop the show.
			</>
		),
	},
	{
		title: <>Command Line Interface</>,
		imageUrl: 'img/undraw_docusaurus_tree.svg',
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
		imageUrl: 'img/undraw_docusaurus_mountain.svg',
		description: (
			<>
				Flood Element scripts are less prone to breakage compared with <code>JMeter</code> or{' '}
				<code>Gatling</code> scripts.
			</>
		),
	},
	{
		title: <>Save time</>,
		imageUrl: 'img/undraw_docusaurus_tree.svg',
		description: (
			<>It takes just a few minutes to get functional load test running with Flood Element.</>
		),
	},
	{
		title: <>Generate Realistic Load</>,
		imageUrl: 'img/undraw_docusaurus_react.svg',
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
				<p>
					Traditionally, load testing meant simulating network calls as quickly as possible, either
					using scripting, log replay, or a network recorder. But these approaches have always
					suffered from a high cost of script maintenance due to the fickle nature of network
					requests, lack of maintenance due to complexity, or simulating unrealistic load due to a
					misunderstanding of the workload patterns of regular users of the product. These are just
					some of the problems we're solving by load testing in a similar way to real users of your
					application.
				</p>
			</Section>
		</main>
	)
}

export default Main
