import webpack, { Configuration as WebpackConfig, Stats } from 'webpack'
import { CompilerOptions, sys } from 'typescript'
import { resolve, dirname, join } from 'path'
import MemoryFileSystem from 'memory-fs'
import WebpackBar from 'webpackbar'
import findRoot from 'find-root'

export interface CompilerOutput {
	content: string
	stats: Stats
}

export class Compiler {
	constructor(private sourceFile: string, private productionMode: boolean = false) {}

	public async emit(): Promise<CompilerOutput> {
		let compiler = webpack(this.webpackConfig)

		let fileSystem = new MemoryFileSystem()

		compiler.outputFileSystem = fileSystem

		return new Promise((yeah, nah) => {
			compiler.run((err, stats) => {
				// let formattedStats = stats.toString()

				if (stats.hasErrors() || stats.hasWarnings()) {
					return nah(
						new Error(
							stats.toString({
								errorDetails: true,
								warnings: true,
							}),
						),
					)
				} else {
					// let output = compiler.outputFileSystem as MemoryFileSystem
					yeah({ stats, content: fileSystem.data['bundle.js'].toString() })
				}
			})
		})
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
			mode: this.productionMode ? 'production' : 'development',
			devtool: 'cheap-module-eval-source-map',
			output: {
				path: '/',
				filename: join('bundle.js'),
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
								transpileOnly: this.productionMode,
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
