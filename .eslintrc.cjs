/** @type { import("eslint").Linter.Config } */
module.exports = {
	root: true,
	settings: {
		'import/resolver': {
			typescript: {
				project: ['tsconfig.json', 'packages/*/tsconfig.json'],
			},
		},
	},
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:svelte/recommended',
		'prettier',
		'plugin:import/recommended',
		'plugin:import/typescript',
	],
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint', 'prettier', 'import'],
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2020,
		extraFileExtensions: ['.svelte'],
	},
	env: {
		browser: true,
		es2017: true,
		node: true,
	},
	overrides: [
		{
			files: ['*.svelte'],
			parser: 'svelte-eslint-parser',
			parserOptions: {
				parser: '@typescript-eslint/parser',
			},
		},
	],
	rules: {
		'prettier/prettier': 'error',
		'import/prefer-default-export': 'off',
		'import/no-default-export': 'off',
		'@typescript-eslint/no-unused-vars': 'warn',
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/no-non-null-assertion': 'off',
		'@typescript-eslint/ban-types': [
			'error',
			{
				types: {
					// Don't disallow Function as it's also an aws construct
					Function: false,
				},
				extendDefaults: true,
			},
		],
		'class-methods-use-this': [0],
		'import/no-unresolved': [0],
		'import/order': [
			'error',
			{
				alphabetize: {
					order: 'asc',
					caseInsensitive: true,
				},
				'newlines-between': 'never',
			},
		],
	},
};
