import React from 'react'
import Section from './Section'

const v2Features = [
	{
		title: <>Brand new innovative look of the CLI</>,
		imageUrl: 'img/cli_img.png',
		bgClassName: 'bg--cli',
		description: (
			<>
				<p>
					Element v2.0’s CLI is renovated to be more professional and user-friendly, for a better
					developer experience.
				</p>
				<ul>
					<li>
						Stay up-to-date on how your test is executed in real-time with the intuitive and
						progressive terminal output.
					</li>
					<li>
						Find what you're looking for at first glance thanks to smart indentation, spacing and
						coloring.
					</li>
					<li>View either concise or comprehensive output with the optional verbose mode.</li>
					<li>
						See taken screenshots right within the terminal <i>(only on iTerm2 - MacOS).</i>
					</li>
					<li>
						After completion, you’re now presented with a summary table as a simple test report.
					</li>
				</ul>
			</>
		),
	},
	{
		title: <>Powered with Microsoft Playwright core</>,
		imageUrl: 'img/playwright_img.png',
		bgClassName: 'bg--playwright',
		description: (
			<>
				<p>
					Our Puppeteer core is now replaced by Playwright, an open-source Node library by
					Microsoft, which you can rely on for cross-browser automation that is ever-green, capable,
					reliable and fast.
				</p>
				<ul>
					<li>
						Automate your cross-browser testing across Chromium, WebKit (browser engine used by
						Safari) and Firefox browsers with a single API.
					</li>
					<li>
						Simulate multiple devices with a single browser instance with a more powerful browser
						context feature.
					</li>
					<li>Build automation for single-page apps that rely on the modern web platform.</li>
				</ul>
			</>
		),
	},
	{
		title: <>Load test with multiple local virtual users</>,
		imageUrl: 'img/multiple_users_img.png',
		bgClassName: 'bg--mu',
		description: (
			<p>
				With Element 2.0, you can now simulate a number of virtual users on your local machine, each
				running in a separate browser instance, with the ability to ramp up and/or down for a
				specific period. This feature brings small scale load testing locally, so that you can build
				and test your element scripts before uploading them to flood to run at larger scales.
			</p>
		),
	},
	{
		title: <>Support HTML test report for functional automation</>,
		imageUrl: 'img/html_report_img.png',
		bgClassName: 'bg--html-report',
		description: (
			<>
				<p>
					Flood is no longer just a load test scripting tool. With a wide range of browser
					interaction APIs and various assertion methods, you can leverage Element to completely
					automate your functional testing.
				</p>
				<p>
					With v2.0, we’ll also show you a HTML report of the final test results of your test suite.
					So while assessing the performance, you can also evaluate the quality of the application
					under test without the hassle of writing separate scripts for non-functional and
					functional testing.
				</p>
			</>
		),
	},
]

const MainV2 = () => {
	return (
		<main>
			{v2Features.map((feature, idx) => {
				if (feature.bgClassName === 'bg--html-report') {
					return (
						<Section key={idx} {...feature}>
							<h3>Let’s see what else it has in store for you!</h3>
							<div>
								<a href="/">
									<button className="btn--get-started">Get Started</button>
								</a>
								<a className="view-docs" href="/docs">
									View Documentation
								</a>
							</div>
						</Section>
					)
				}

				return <Section key={idx} {...feature} />
			})}
		</main>
	)
}

export default MainV2
