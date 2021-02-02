import React from 'react'
import Section from './Section'

const v2Features = [
	{
		title: <>Brand new innovative look of the CLI</>,
		imageUrl: 'img/cli_img.png',
		bgClassName: 'bg--cli',
		description: (
			<>
				<p>The terminal log in v2.0 is renovated to be more professional and user-friendly.</p>
				<ul>
					<li>
						Stay up-to-date on how your test is executed in real-time with the intuitive and
						progressive console log{' '}
					</li>
					<li>
						Find what’s you’re looking for at the first glance thanks to the smart indentation,
						spacing and coloring throughout the log
					</li>
					<li>View either a concise or comprehensive log (verbose mode) at your discrete</li>
					<li>
						See taken screenshots right on the terminal <i>(only on iTerm2 - MacOS)</i>
					</li>
					<li>Presented with a summary table as a simple test report once the execution is done</li>
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
						Safari) and Firefox browsers with a single API
					</li>
					<li>
						Simulate multiple devices with a single browser instance with a more powerful browser
						context feature
					</li>
					<li>Build automation for single-page apps that rely on the modern web platform</li>
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
				Since Element 2.0, you can simulate a number of virtual users on your local machine (each
				running in a separate browser) to ramp up and/or down for a specific period. This would be
				helpful for a local load test at a small scale.
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
					Don’t just think of Flood Element as a load test scripting tool. With a wide range of
					browser interaction APIs, plus various assertion methods, you can totally leverage Flood
					Element to automate your functional testing.
				</p>
				<p>
					Since v2.0, we’ll also show you an HTML report of the final test results of your test
					suite. So besides assessing the performance, you can also evaluate the quality of the
					application under test without the hassle of writing separate scripts for non-functional
					and functional testing.
				</p>
			</>
		),
	},
]

const MainV2 = () => {
	return (
		<main>
			{v2Features.map((feature, idx) => (
				<Section key={idx} {...feature} />
			))}
		</main>
	)
}

export default MainV2
