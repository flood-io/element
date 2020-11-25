module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint', 'import', 'prettier'],
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
}
