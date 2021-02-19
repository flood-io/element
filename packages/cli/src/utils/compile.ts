import { Compiler, CompilerOutput } from '@flood/element-compiler'
import { checkFile } from '../cmd/common'
import glob from 'glob'
import { join, resolve } from 'path'
import webpack, { Configuration } from 'webpack'
import CssExtractPlugin from 'mini-css-extract-plugin'
import findRoot from 'find-root'

export async function webpackCompiler(sourceFile: string): Promise<CompilerOutput> {
	const compiler = new Compiler(sourceFile, true)
	return compiler.emit()
}

export function validateFile(sourceFile: string): any {
	const fileErr = checkFile(sourceFile)
	if (fileErr) throw fileErr
	return sourceFile
}

export function getFilesPattern(pattern: string[]): string[] {
	if (!pattern || !pattern.length) {
		throw Error('Found no test scripts matching testPathMatch pattern')
	}
	const files: string[] = []
	try {
		files.push(
			...(pattern.reduce((arr: string[], item: string) => arr.concat(glob.sync(item)), []) as []),
		)
		if (!pattern.length) {
			throw Error('Found no test scripts matching testPathMatch pattern')
		}
	} catch {
		throw Error('Found no test scripts matching testPathMatch pattern')
	}
	return files
}

export async function readConfigFile(file: string) {
	const rootPath = process.cwd()
	try {
		return await import(join(rootPath, file))
	} catch {
		throw Error('The config file was not structured correctly. Please check and try again')
	}
}

export async function compileReport(): Promise<void> {
	const packageRoot = findRoot(__dirname)
	const reportRoot = `${packageRoot}/templates/report/`
	const webpackConfig: Configuration = {
		entry: resolve(__dirname, reportRoot, 'script.ts'),
		mode: 'production',
		target: 'web',
		output: {
			path: resolve(__dirname, reportRoot),
			filename: './script.js',
			globalObject: 'this',
			libraryTarget: 'umd',
		},
		resolve: {
			extensions: ['.ts', '.scss'],
		},
		module: {
			rules: [
				{
					test: /\.ts$/,
					loader: require.resolve('ts-loader'),
					options: {
						configFile: resolve(__dirname, packageRoot, 'report-tsconfig.json'),
						onlyCompileBundledFiles: true,
					},
				},
				{
					test: /\.scss$/i,
					use: [CssExtractPlugin.loader, 'css-loader', 'sass-loader'],
				},
			],
		},
		plugins: [new CssExtractPlugin({ filename: 'styles.css' })],
	}

	return new Promise((resolve, reject) => {
		webpack(webpackConfig).run((error, stats) => {
			if (error || stats.hasErrors() || stats.hasWarnings()) {
				const message =
					(error && error.message) || stats.toString({ errorDetails: true, warnings: true })
				reject(Error(message))
			} else resolve()
		})
	})
}
