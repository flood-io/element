module.exports = {
	env: {
		browser: true,
		es2021: true,
		node: true,
		jest: true,
	},
	root: true,
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint', 'prettier', 'import'],
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'prettier/@typescript-eslint',
		'plugin:import/warnings',
		'plugin:import/errors',
		'plugin:import/typescript',
	],
	rules: {
		'no-unused-vars': 'off',
		'@typescript-eslint/no-empty-function': 'off',
		'@typescript-eslint/no-unused-vars': ['warn', {argsIgnorePattern: '^_'}],
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/explicit-function-return-type': 'off',
		'import/no-cycle': 'warn',
	},
}
