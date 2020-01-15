import Generator from 'yeoman-generator'
import { join, basename } from 'path'
import findRoot from 'find-root'
import commandExists from 'command-exists'
import { readFileSync } from 'fs'
import slug from 'slug'

export default class TestEnv extends Generator {
	public options: { [key: string]: string }
	public elementVersion: string

	constructor(args: any[], opts: any) {
		super(args, opts)

		// This makes `dir` a required argument.
		this.argument('dir', { type: String, required: true })
		this.argument('skip-install', { type: String, required: false })
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

	rootGeneratorName() {
		return 'flood-element-cli'
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

		const testScriptPath = slug(this.answers.title)
		const newAnswers = await this.prompt([
			{
				type: 'input',
				name: 'scriptName',
				message: 'Test script name',
				default: `${testScriptPath}.perf.ts`,
			},
		])

		this.answers = { ...this.answers, ...newAnswers }
	}

	writing() {
		this.fs.writeJSON(this.destinationPath('package.json'), this._packageJSON)
		this.fs.writeJSON(this.destinationPath('tsconfig.json'), this._tsConfigJSON)
		this.fs.copyTpl(this.templatePath('test.ts'), this.destinationPath(this.answers.scriptName), {
			title: this.answers.title,
			url: this.answers.url,
		})
		this.fs.copyTpl(this.templatePath('gitignore'), this.destinationPath('.gitignore'), {})
	}

	installing() {
		if (this.options['skip-install']) return

		// const prevValue = process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD
		// process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = '1'
		commandExists('yarn', (err: null | Error, exists: boolean) => {
			if (exists) {
				this.yarnInstall()
			} else {
				this.npmInstall()
			}
		})
		// process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = prevValue
	}

	get _packageJSON(): any {
		return {
			name: this.options.repoName.split(' ').join('-'),
			version: '1.0.0',
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
				'@flood/element-cli': `^${this.elementVersion}`,
				assert: `*`,
				faker: `*`,
				prettier: '*',
			},

			devDependencies: {
				'@types/faker': '*',
				'@types/assert': '*',
			},

			element: {
				testMatch: ['**/*.perf.[tj]s'],
			},
		}
	}

	get _tsConfigJSON(): any {
		return {
			compilerOptions: {
				module: 'commonjs',
				target: 'es2015',
				moduleResolution: 'node',
				removeComments: true,
				lib: ['esnext', 'dom'],
				pretty: true,
				strictNullChecks: true,
				forceConsistentCasingInFileNames: true,
				allowUnreachableCode: false,
				alwaysStrict: true,
				noUnusedLocals: true,
				noImplicitAny: true,
				allowSyntheticDefaultImports: true,
				esModuleInterop: true,
				experimentalDecorators: true,
				emitDecoratorMetadata: true,
				declaration: true,
				allowJs: false,
				checkJs: false,
			},

			files: [`./${this.answers.scriptName}`],
		}
	}
}
