import webpack, { Configuration as WebpackConfig } from 'webpack'
import { resolve, dirname } from 'path'

const isProductionGrid = process.env.IS_GRID != null || process.env.FLOOD_CHROME_VERSION != null

function getFileName(file: string): string {
	return file.substring(file.lastIndexOf('/') + 1, file.length - 3)
}

function webpackConfig(sourceFile: string): WebpackConfig {
	const loader = require.resolve('ts-loader')

	const modules = ['node_modules']
	if (isProductionGrid) {
		modules.push('/app/node_modules')
	}

	return {
		entry: resolve(sourceFile),
		mode: 'none',
		target: 'node',
		module: {
			rules: [
				{
					test: /\.ts/,
					exclude: /node_modules/,
					loader: {
						loader,
						options: {
							context: resolve(dirname(sourceFile)),
							onlyCompileBundledFiles: true,
							reportFiles: [sourceFile],
							transpileOnly: true,
							compilerOptions: {
								allowJs: true,
								checkJs: false,
								sourceMap: false,
								declaration: true,
							},
						},
					},
				},
			],
		},
		resolve: {
			extensions: ['.ts', '.js'],
			modules,
		},
		output: {
			path: process.cwd(),
			filename: `${getFileName(sourceFile)}.compiled.js`,
			globalObject: 'this',
			libraryTarget: 'umd',
		},
		externals: ['@flood/element'],
	}
}

export async function webpackCompiler(sourceFile: string): Promise<string> {
	const compiler = webpack(webpackConfig(resolve(sourceFile)))
	return new Promise((resolve, reject) => {
		compiler.run((err, stats) => {
			if (err || stats.hasErrors()) {
				reject(
					new Error(
						stats.toString({
							errorDetails: true,
						}),
					),
				)
			} else resolve('Compile success')
		})
	})
}
