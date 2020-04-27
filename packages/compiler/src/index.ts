import webpack, { Configuration as WebpackConfig } from 'webpack'
import { CompilerOptions, sys } from 'typescript'
import { resolve, dirname, join } from 'path'
import MemoryFileSystem from 'memory-fs'
import WebpackBar from 'webpackbar'
import findRoot from 'find-root'
import { CompilerOutput } from './types'

export { CompilerOutput }

const isProductionGrid = process.env.IS_GRID != null || process.env.FLOOD_CHROME_VERSION != null

export class Compiler {
	private sourceFile: string

	constructor(sourceFile: string) {
		this.sourceFile = resolve(sourceFile)
	}

	public async emit(): Promise<CompilerOutput> {
		return this.webpackCompiler()
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
		const loader = require.resolve('ts-loader')

		const modules = ['node_modules']
		if (isProductionGrid) {
			modules.push('/app/node_modules')
		}

		return {
			entry: this.sourceFile,
			// mode: this.productionMode ? 'production' : 'development',
			mode: 'none',
			// devtool: 'cheap-module-eval-source-map',
			devtool: 'cheap-module-source-map',
			output: {
				path: '/',
				filename: join('bundle.js'),
				globalObject: 'this',
				libraryTarget: 'umd',
			},
			resolve: {
				extensions: ['.ts', '.js'],
				modules,

				// plugins: [
				// 	new TsconfigPathsPlugin({
				// 		configFile: join(__dirname, '../element-tsconfig.json'),
				// 	}),
				// ],
			},
			cache: true,

			plugins: [
				new WebpackBar({
					name: 'Script Compiler',
					// reporters: ['fancy']
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

			externals: ['@flood/element', '@flood/element-api'], //'faker', 'assert'
		}
	}

	private get configFilePath(): string {
		const configFile = 'tsconfig.json'
		const root = findRoot(__dirname)
		const paths = [resolve(dirname(this.sourceFile)), resolve(root, 'compiler-home')]

		const localConfig = paths.map(path => join(path, configFile)).find(path => sys.fileExists(path))

		return localConfig || configFile
	}

	private async webpackCompiler(): Promise<CompilerOutput> {
		const compiler = webpack(this.webpackConfig)
		const fileSystem = new MemoryFileSystem()
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
					yeah({
						stats,
						content: fileSystem.data['bundle.js'].toString(),
						sourceMap: fileSystem.data['bundle.js.map'].toString(),
					})
				}
			})
		})
	}
}
