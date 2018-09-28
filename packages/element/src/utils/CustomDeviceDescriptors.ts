const customDeviceDescriptors: { [index: string]: any } = {
	'Chrome Desktop Large': {
		userAgent:
			'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.186 Safari/537.36',
		viewport: {
			width: 1440,
			height: 900,
			deviceScaleFactor: 1,
			isMobile: false,
			hasTouch: false,
			isLandscape: true,
		},
	},
}

export default customDeviceDescriptors
