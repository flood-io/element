import webpack, { Configuration as WebpackConfig } from 'webpack'
import { CompilerOptions, sys } from 'typescript'
import { resolve, dirname, join, basename } from 'path'
import MemoryFileSystem from 'memory-fs'
import WebpackBar from 'webpackbar'
import findRoot from 'find-root'
import { CompilerOutput } from './types'

export { CompilerOutput }

const isProductionGrid = process.env.IS_GRID != null || process.env.FLOOD_CHROME_VERSION != null

export class Compiler {
	private sourceFile: string
	private externalDebs: boolean | undefined

	constructor(sourceFile: string, externalDeps?: boolean) {
		this.sourceFile = resolve(sourceFile)
		this.externalDebs = externalDeps
	}

	public async emit(): Promise<CompilerOutput> {
		return this.webpackCompiler()
	}

	private getFileName(file: string): string {
		return basename(file, '.ts')
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

		const options: WebpackConfig = {
			entry: this.sourceFile,
			mode: 'none',
			target: 'node',
			output: {
				path: this.externalDebs ? process.cwd() : '/',
				filename: this.externalDebs
					? join(`${this.getFileName(this.sourceFile)}_compiled.js`)
					: join(`bundle.js`),
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

		if (!this.externalDebs) options.devtool = 'cheap-module-source-map'
		return options
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
							(err && err.message) ||
								stats.toString({
									errorDetails: true,
									warnings: true,
								}),
						),
					)
				} else {
					const content = this.externalDebs
						? `Compile ${this.getFileName(compiler.options.entry as string)} success`
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
