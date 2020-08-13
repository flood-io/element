// const versions = require("./versions.json");

const versions = ['1.0', '1.2']

module.exports = {
	title: 'Flood Element',
	tagline: 'Break the network barrier',
	url: 'https://element.flood.io',
	baseUrl: '/',
	favicon: 'img/favicon.ico',
	organizationName: 'flood-io', // Usually your GitHub org/user name.
	projectName: 'element', // Usually your repo name.
	themeConfig: {
		announcementBar: {
			id: 'supportus',
			content:
				'⭐️ If you like Flood Element, give it a star on <a target="_blank" rel="noopener noreferrer" href="https://github.com/flood-io/element">GitHub</a>! ⭐️',
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
					to: 'docs/introduction', // "fake" link
					position: 'left',
					activeBaseRegex: `docs`,
					items: [
						{
							label: versions[0],
							to: 'docs/',
							activeBaseRegex: `docs/(?!${versions.join('|')}|next)`,
						},
						...versions.slice(1).map(version => ({
							label: version,
							to: `docs/${version}/`,
						})),
						{
							label: 'Master/Unreleased',
							to: 'docs/next/',
							activeBaseRegex: `docs/next/(?!support|team|resources)`,
						},
					],
				},
				{ to: 'blog', label: 'Blog', position: 'left' },
				{
					href: 'https://github.com/flood-io/element',
					label: 'GitHub',
					position: 'right',
					'aria-label': 'GitHub repository',
				},
				{
					to: 'versions',
					label: `v${versions[0]}`,
					position: 'right',
				},
			],
		},
		footer: {
			style: 'light',
			links: [
				{
					title: 'Docs',
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
				alt: 'Facebook Open Source Logo',
				src: 'img/flood_logo.svg',
				href: 'https://flood.io',
			},
			copyright: `Element is sponsored by Tricentis and maintained by the Flood load testing team. Copyright © ${new Date().getFullYear()} Tricentis Corp.`,
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
