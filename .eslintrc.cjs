// eslint-disable-next-line no-undef
module.exports = {
	extends: ['canonical', 'canonical/prettier'],
	ignorePatterns: ['scripts/**/*'],
	overrides: [
		{
			extends: ['canonical/typescript', 'canonical/module', 'canonical/browser', 'canonical/prettier'],
			files: '*.ts',
			parserOptions: {
				project: './tsconfig.json',
			},
			rules: {
				'@typescript-eslint/unbound-method': 'off',
			},
		},
		{
			extends: [
				'canonical/module',
				'canonical/browser',
				'canonical/jsx-a11y',
				'canonical/typescript',
				'plugin:solid/typescript',
				'canonical/prettier',
			],
			files: '*.tsx',
			parserOptions: {
				project: './tsconfig.json',
			},
			rules: {
				'jsx-a11y/label-has-associated-control': 'off',
			},
		},
	],
	plugins: ['solid', 'import', 'prettier'],
	root: true,
	rules: {
		'canonical/filename-match-exported': 'off',
		'canonical/filename-match-regex': 'off',
		'import/no-unassigned-import': 'off',
		'no-restricted-imports': [
			'error',
			{
				patterns: [
					{
						group: ['.*'],
						message: "Don't use relative imports",
					},
				],
			},
		],
		'prettier/prettier': 'error',
		'unicorn/prevent-abbreviations': 'off',
	},
};
