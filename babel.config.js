module.exports = {
	presets: [
		[
			'@babel/preset-env',
			{
				targets: {
					node: 'current',
				},
			},
		],
		'@babel/preset-typescript',
	],
	plugins: [
		'@babel/plugin-proposal-optional-chaining',
		'@babel/plugin-proposal-nullish-coalescing-operator',
		[
			'@babel/plugin-proposal-decorators',
			{
				legacy: true,
			},
		],
	],
}
