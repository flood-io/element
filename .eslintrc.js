module.exports = {
	env: {
		es6: true,
		node: true,
	},
	root: true,
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint'],
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/eslint-recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:import/warnings',
		'plugin:import/errors',
		'plugin:import/typescript',
		'prettier/@typescript-eslint',
		'plugin:prettier/recommended',
	],
	rules: {
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/explicit-function-return-type': 'off',
		'import/no-cycle': 'warn',
	},
	overrides: [
		{
			files: ['**/*.js'],
			rules: {
				'@typescript-eslint/no-var-requires': 'off',
			},
		},
	],
}
