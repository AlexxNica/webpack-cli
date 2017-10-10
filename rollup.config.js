import cjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import flow from 'rollup-plugin-flow';
import babel from 'rollup-plugin-babel';
import json from 'rollup-plugin-json';

export default {
  input: './lib/index.js',
  output: {
      file: 'webpack.js',
      format: 'cjs'
  },
  plugins: [
	json({
		// All JSON files will be parsed by default,
		// but you can also specifically include/exclude files
		include: 'lib/utils/webpackOptionsSchema.json',

		// for tree-shaking, properties will be declared as
		// variables, using either `var` or `const`
		preferConst: true,

		indent: '  '
	  }),
	flow({ all: false }),
	babel({
		exclude: [
			'lib/generate-loader',
			'lib/generate-plugin',
			'lib/utils/webpack-generator.js',
			'lib/creator/**/**',
			'node_modules/**'
		],
		runtimeHelpers: true
	  }),
    cjs({
		include: 'lib/**',
		extensions: [ '.js', '.json' ],
	}),
	resolve({
		browser: false,
		modulesOnly: true,
		preferBuiltins: false,  }),
  ]
};
