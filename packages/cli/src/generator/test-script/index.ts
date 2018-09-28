import * as Generator from 'yeoman-generator'
import * as path from 'path'
import * as findRoot from 'find-root'

const packageRoot = findRoot(__dirname)

export default class TestScript extends Generator {
	public options: { [key: string]: string }

	constructor(args: any[], opts: any) {
		super(args, opts)

		// This makes `appname` a required argument.
		this.argument('testScript', { type: String, required: true })
	}

	default() {
		this.sourceRoot(path.join(packageRoot, 'templates'))
	}

	answers: { [key: string]: string }

	async prompting() {
		const title = path.basename(this.options.testScript, '.ts')
		this.answers = await this.prompt([
			{
				type: 'input',
				name: 'url',
				message: 'The title of this test.',
				default: title,
			},
			{
				type: 'input',
				name: 'url',
				message: 'A URL to use in the generated test script.',
				default: 'http://challenge.flood.io',
			},
		])
	}

	writing() {
		this.fs.copyTpl(this.templatePath('test.ts'), this.destinationPath(this.options.testScript), {
			title: this.appname,
			url: this.answers.url,
		})
	}
}
