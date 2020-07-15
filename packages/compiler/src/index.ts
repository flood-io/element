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
	private externalDebs: boolean | undefined

	constructor(sourceFile: string, externalDebs?: boolean) {
		this.sourceFile = resolve(sourceFile)
		this.externalDebs = externalDebs
	}

	public async emit(): Promise<CompilerOutput> {
		return this.webpackCompiler()
	}

	get compilerOptions(): CompilerOptions {
		return {
			allowJs: true,
			checkJs: false,
			sourceMap: false,
			declaration: true,
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
			mode: 'none',
			target: 'node',
			devtool: 'cheap-module-source-map',
			output: {
				path: this.externalDebs ? process.cwd() : '/',
				filename: join('bundle.js'),
				globalObject: 'this',
				libraryTarget: 'umd',
			},
			resolve: {
				extensions: ['.ts', '.js'],
				modules,
			},
			cache: true,

			plugins: [
				new WebpackBar({
					name: 'Script Compiler',
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
								context: dirname(this.sourceFile),
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
		const configFile = 'tsconfig.json'
		const root = findRoot(__dirname)
		const paths = [resolve(dirname(this.sourceFile)), resolve(root, 'compiler-home')]
		const localConfig = paths.map(path => join(path, configFile)).find(path => sys.fileExists(path))
		return localConfig || configFile
	}

	private async webpackCompiler(): Promise<CompilerOutput> {
		const compiler = webpack(this.webpackConfig)
		const fileSystem = new MemoryFileSystem()
		if (!this.externalDebs) {
			compiler.outputFileSystem = fileSystem
		}
		return new Promise((resolve, reject) => {
			compiler.run((err, stats) => {
				if (err || stats.hasErrors() || stats.hasWarnings()) {
					reject(
						new Error(
							err.message ||
								stats.toString({
									errorDetails: true,
									warnings: true,
								}),
						),
					)
				} else {
					const content = this.externalDebs
						? 'Compile Success'
						: fileSystem.data['bundle.js'].toString()
					const sourceMap = this.externalDebs ? '' : fileSystem.data['bundle.js.map'].toString()
					resolve({
						stats,
						content,
						sourceMap,
					})
				}
			})
		})
	}
}
