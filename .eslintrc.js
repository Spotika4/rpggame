module.exports = {
	root: true,
	parserOptions: { 
		ecmaVersion: 6,
		sourceType: 'module'
	},
	env: {
		es6: true,
		browser: true,

		node: true
	},
    extends: [
		'eslint:recommended'
	],
	parser: "babel-eslint",
	rules: {

	}
}
