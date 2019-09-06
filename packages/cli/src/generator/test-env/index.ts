import * as Generator from 'yeoman-generator'
import { join, basename } from 'path'
import findRoot from 'find-root'
import * as commandExists from 'command-exists'
import { readFileSync } from 'fs'

export default class TestEnv extends Generator {
	public options: { [key: string]: string }
	public elementVersion: string

	constructor(args: any[], opts: any) {
		super(args, opts)

		// This makes `dir` a required argument.
		this.argument('dir', { type: String, required: true })
	}

	initializing() {
		const packageRoot = findRoot(__dirname)

		// parse current element version
		const elementPackageFile = join(findRoot(require.resolve('@flood/element')), 'package.json')
		const elementPackage = JSON.parse(readFileSync(elementPackageFile, 'utf8'))
		this.elementVersion = elementPackage.version

		this.sourceRoot(join(packageRoot, 'templates'))

		// assume dir is absolute
		this.destinationRoot(this.options.dir)

		console.log(`Initializing '${this.destinationRoot()}'`)

		this.options.repoName = basename(this.destinationPath())
	}

	answers: { [key: string]: string }

	async prompting() {
		this.answers = await this.prompt([
			{
				type: 'input',
				name: 'title',
				message: 'The title of this test.',
				default: this.options.repoName,
			},
			{
				type: 'input',
				name: 'url',
				message: 'A URL to use in the generated test script.',
				default: 'https://challenge.flood.io',
			},
		])
	}

	writing() {
		this.fs.writeJSON(this.destinationPath('package.json'), this._packageJSON)
		this.fs.writeJSON(this.destinationPath('tsconfig.json'), this._tsConfigJSON)
		this.fs.copyTpl(this.templatePath('test.ts'), this.destinationPath('test.ts'), {
			title: this.answers.title,
			url: this.answers.url,
		})
	}

	installing() {
		const prevValue = process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD
		process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = '1'
		commandExists('yarn', (err: Error, yes: boolean) => {
			if (yes) {
				this.yarnInstall()
			} else {
				this.npmInstall()
			}
		})
		process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = prevValue
	}

	get _packageJSON(): any {
		return {
			name: this.options.repoName.split(' ').join('-'),
			version: '0.0.1',
			description: 'Flood Element test script',
			private: true,

			prettier: {
				semi: false,
				singleQuote: true,
				trailingComma: 'all',
				printWidth: 100,
				useTabs: true,
				tabWidth: 2,
				bracketSpacing: true,
				jsxBracketSameLine: true,
				arrowParens: 'avoid',
			},

			dependencies: {
				'@flood/element': `^${this.elementVersion}`,
				prettier: '*',
			},
		}
	}

	get _tsConfigJSON(): any {
		return {
			compilerOptions: {
				module: 'commonjs',
				target: 'ES2015',
				moduleResolution: 'node',
				lib: ['esnext', 'dom'],
				pretty: true,
				strictNullChecks: false,
				allowUnreachableCode: false,
				alwaysStrict: true,
				noUnusedLocals: false,
				noUnusedParameters: false,
				noImplicitAny: false,
				allowSyntheticDefaultImports: true,
				// types: ['@types/node'],
				// typeRoots: ['node_modules/@types'],
			},
			exclude: ['node_modules', 'node_modules/**'],
		}
	}
}
