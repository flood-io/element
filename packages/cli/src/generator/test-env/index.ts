import * as Generator from 'yeoman-generator'
import * as path from 'path'
import * as fs from 'fs'
import * as findRoot from 'find-root'
import * as commandExists from 'command-exists'

const packageRoot = findRoot(__dirname)

// parse current element version
const elementPackageFile = path.join(findRoot(require.resolve('@flood/element')), 'package.json')
const elementPackage = JSON.parse(fs.readFileSync(elementPackageFile, 'utf8'))
const elementVersion = elementPackage.version

export default class TestEnv extends Generator {
	public options: { [key: string]: string }

	constructor(args, opts) {
		super(args, opts)

		// This makes `appname` a required argument.
		this.argument('dir', { type: String, required: true })
	}

	initializing() {
		this.sourceRoot(path.join(packageRoot, 'templates'))

		if (path.isAbsolute(this.options.dir)) {
			this.destinationRoot(this.options.dir)
		} else {
			this.destinationRoot(this.destinationPath(this.options.dir))
		}
	}

	answers: { [key: string]: string }

	async prompting() {
		const basename = path.basename(this.destinationPath())
		this.answers = await this.prompt([
			{
				type: 'input',
				name: 'url',
				message: 'The title of this test.',
				default: basename,
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
		this.fs.write(this.destinationPath('package.json'), this._packageJSON)
		this.fs.write(this.destinationPath('tsconfig.json'), this._tsConfigJSON)
		this.fs.copyTpl(this.templatePath('test.ts'), this.destinationPath('test.ts'), {
			title: this.appname,
			url: this.answers.url,
		})
	}

	installing() {
		const prevValue = process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD
		process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = '1'
		commandExists('yarn', (err, yes) => {
			if (yes) {
				this.yarnInstall()
			} else {
				this.npmInstall()
			}
		})
		process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = prevValue
	}

	get _packageJSON(): string {
		const pkg = {
			name: this.appname,
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
				'@flood/element': `^${elementVersion}`,
				prettier: '^1.10.2',
			},
		}

		return JSON.stringify(pkg, null, '  ')
	}

	get _tsConfigJSON(): string {
		const config = {
			compilerOptions: {
				module: 'commonjs',
				target: 'ES2017',
				moduleResolution: 'node',
				lib: ['dom', 'esnext'],
				pretty: true,
				strictNullChecks: false,
				allowUnreachableCode: false,
				alwaysStrict: true,
				noUnusedLocals: false,
				noUnusedParameters: false,
				noImplicitAny: false,
				allowSyntheticDefaultImports: true,
				types: ['@types/node'],
				typeRoots: ['node_modules/@types'],
			},
			exclude: ['node_modules', 'node_modules/**'],
		}

		return JSON.stringify(config, null, '  ')
	}
}
