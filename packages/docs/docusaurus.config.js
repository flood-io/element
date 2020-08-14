const versions = require('./versions.json')

module.exports = {
	title: 'Flood Element',
	tagline: 'Break the network barrier',
	url: 'https://element.flood.io',
	baseUrl: '/',
	favicon: 'img/favicon.ico',
	organizationName: 'flood-io',
	projectName: 'element',
	themeConfig: {
		announcementBar: {
			id: 'supportus',
			content:
				'⭐️ If you like Flood Element, give it a star on <a target="_blank" rel="noopener noreferrer" href="https://github.com/flood-io/element">GitHub</a>! ⭐️',
			backgroundColor: '#23232C',
			textColor: '#FFFFFF',
		},
		algolia: {
			apiKey: 'api-key',
			indexName: 'index-name',
			appId: 'app-id', // Optional, if you run the DocSearch crawler on your own
			algoliaOptions: {}, // Optional, if provided by Algolia
		},
		navbar: {
			title: 'Element',
			hideOnScroll: true,
			logo: {
				alt: 'Element',
				src: 'img/Element-Logo-Mark.svg',
			},
			items: [
				{
					label: 'Docs',
					position: 'left',
					activeBaseRegex: `docs`,
					items: [
						{
							label: 'Next',
							to: 'docs/next/',
							activeBaseRegex: `docs/next/(?!support|team|resources)`,
						},
						{
							label: versions[0],
							to: 'docs/',
							activeBaseRegex: `docs/(?!${versions.join('|')}|next)`,
						},
						...versions.slice(1).map(version => ({
							label: version,
							to: `docs/${version}/`,
						})),
					],
				},
				{ href: 'https://www.flood.io/blog', label: 'Blog', position: 'left' },
				{
					href: 'https://github.com/flood-io/element',
					label: 'GitHub',
					position: 'right',
					'aria-label': 'GitHub repository',
				},
				{
					to: 'docs/',
					label: `v${versions[0]}`,
					position: 'right',
				},
			],
		},
		footer: {
			style: 'light',
			links: [
				{
					title: 'Documentations',
					items: [
						{
							label: 'Style Guide',
							to: 'docs/',
						},
						{
							label: 'Second Doc',
							to: 'docs/doc2/',
						},
					],
				},
				{
					title: 'Community',
					items: [
						{
							label: 'Stack Overflow',
							href: 'https://stackoverflow.com/questions/tagged/docusaurus',
						},
						{
							label: 'Discord',
							href: 'https://discordapp.com/invite/docusaurus',
						},
						{
							label: 'Twitter',
							href: 'https://twitter.com/docusaurus',
						},
					],
				},
				{
					title: 'More',
					items: [
						{
							label: 'Blog',
							to: 'blog',
						},
						{
							label: 'GitHub',
							href: 'https://github.com/facebook/docusaurus',
						},
					],
				},
			],
			logo: {
				alt: 'FloodIO',
				src: 'img/flood_logo.svg',
				href: 'https://flood.io',
			},
			copyright: `Element is sponsored by Tricentis and maintained by the <a href="https://flood.io/" target="_blank">Flood</a> load testing team.<br />Copyright © ${new Date().getFullYear()} <a href="https://tricentis.com/" target="_blank">Tricentis Corp</a>. All Rights Reserved. Licensed under the Apache-2 licence.`,
		},
	},
	presets: [
		[
			'@docusaurus/preset-classic',
			{
				docs: {
					// It is recommended to set document id as docs home page (`docs/` path).
					homePageId: 'start/overview',
					sidebarPath: require.resolve('./sidebars.js'),
					editUrl: 'https://github.com/flood-io/element/edit/master/packages/docs/',
				},
				blog: {
					showReadingTime: true,
				},
				theme: {
					customCss: require.resolve('./src/css/custom.css'),
				},
			},
		],
	],
	onBrokenLinks: 'log',
}
