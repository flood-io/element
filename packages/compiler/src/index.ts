import { Configuration as WebpackConfig, Stats } from 'webpack'
import { CompilerOptions, sys } from 'typescript'
import { resolve, dirname, join } from 'path'
// import MemoryFileSystem from 'memory-fs'
import WebpackBar from 'webpackbar'
import findRoot from 'find-root'

import { transformFileAsync } from '@babel/core'

// import { Context, Script, compileFunction, createContext, runInContext } from 'vm'

export interface CompilerOutput {
	content: string
	stats?: CompilerStats
}

class CompilerStats {
	hash?: string
	startTime?: number
	endTime?: number

	/** Returns true if there were errors while compiling. */
	hasErrors(): boolean {
		return false
	}
	/** Returns true if there were warnings while compiling. */
	hasWarnings(): boolean {
		return false
	}
	/** Returns a formatted string of the compilation information (similar to CLI output). */
	toString(options?: Stats.ToStringOptions): string {
		return 'Compiled'
	}
}

export class Compiler {
	constructor(private sourceFile: string /* , private productionMode: boolean = false */) {}

	public async emit(): Promise<CompilerOutput> {
		let result = await transformFileAsync(resolve(this.sourceFile), {
			comments: false,
			highlightCode: true,
			presets: [
				'@babel/preset-typescript',
				[
					'@babel/preset-env',
					{
						targets: { node: 'current' },
						useBuiltIns: false,
					},
				],
			],
		})

		let content: string = ''
		if (result != null) {
			content = result.code ?? ''
		}

		let stats = new CompilerStats()

		return {
			content,
			stats,
		}

		// let compiler = webpack(this.webpackConfig)

		// let fileSystem = new MemoryFileSystem()

		// compiler.outputFileSystem = fileSystem

		// return new Promise((yeah, nah) => {
		// 	compiler.run((err, stats) => {
		// 		// let formattedStats = stats.toString()

		// 		if (stats.hasErrors() || stats.hasWarnings()) {
		// 			return nah(
		// 				new Error(
		// 					stats.toString({
		// 						errorDetails: true,
		// 						warnings: true,
		// 					}),
		// 				),
		// 			)
		// 		} else {
		// 			// let output = compiler.outputFileSystem as MemoryFileSystem
		// 			yeah({ stats, content: fileSystem.data['bundle.js'].toString() })
		// 		}
		// 	})
		// })
	}

	get compilerOptions(): CompilerOptions {
		return {
			allowJs: true,
			checkJs: false,
			sourceMap: false,
			declaration: false,
		}
	}

	get webpackConfig(): WebpackConfig {
		let loader = require.resolve('ts-loader')

		return {
			entry: this.sourceFile,
			// mode: this.productionMode ? 'production' : 'development',
			mode: 'none',
			devtool: 'cheap-module-eval-source-map',
			output: {
				path: '/',
				filename: join('bundle.js'),
				globalObject: 'this',
				libraryTarget: 'umd',
			},
			resolve: {
				extensions: ['.ts', '.js'],

				// plugins: [
				// 	new TsconfigPathsPlugin({
				// 		configFile: join(__dirname, '../element-tsconfig.json'),
				// 	}),
				// ],
			},
			cache: true,

			plugins: [
				new WebpackBar({
					// reporters: ['fancy'],
				}),
			],

			module: {
				rules: [
					{
						test: /\.ts$/,
						exclude: /node_modules/,
						loader: {
							loader,
							options: {
								context: resolve(dirname(this.sourceFile)),
								configFile: this.configFilePath,
								onlyCompileBundledFiles: true,
								reportFiles: [this.sourceFile],
								transpileOnly: true,
								compilerOptions: this.compilerOptions,
							},
						},
					},
				],
			},

			externals: ['@flood/element', '@flood/element-api'],
		}
	}

	private get configFilePath(): string {
		let configFile = 'tsconfig.json'
		let root = findRoot(__dirname)
		let paths = [resolve(dirname(this.sourceFile)), resolve(root, 'compiler-home')]

		let localConfig = paths.map(path => join(path, configFile)).find(path => sys.fileExists(path))

		return localConfig || configFile
	}
}
