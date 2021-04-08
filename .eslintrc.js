module.exports = {
	root: true,
	env: {
		browser: true,
		es2021: true,
		node: true,
		jest: true,
	},
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:import/warnings',
		'plugin:import/errors',
		'plugin:import/typescript',
	],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 12,
		sourceType: 'module',
	},
	plugins: ['@typescript-eslint', 'import'],
	rules: {
		'no-unused-vars': 'off',
		'@typescript-eslint/no-empty-function': 'off',
		'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/explicit-function-return-type': 'off',
		'import/no-cycle': 'warn',
	},
}
