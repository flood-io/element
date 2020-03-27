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
		[
			'module-resolver',
			{
				cwd: 'packages',
				alias: {
					'@flood/element-compiler': './compiler/src/index.ts',
					'@flood/element-core': './core/src/index.ts',
					'@flood/element-cli': './cli/src/index.ts',
				},
			},
		],
	],
}
