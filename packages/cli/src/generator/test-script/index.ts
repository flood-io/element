import Generator from 'yeoman-generator'
import path from 'path'
import findRoot from 'find-root'

export default class TestScript extends Generator {
	public options: { [key: string]: string }

	constructor(args: any[], opts: any) {
		super(args, opts)

		// This makes `appname` a required argument.
		this.argument('testScript', { type: String, required: true })
	}

	default() {
		const packageRoot = findRoot(__dirname)
		this.sourceRoot(path.join(packageRoot, 'templates'))
	}

	answers: { [key: string]: string }

	async prompting() {
		this.answers = await this.prompt([
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
			url: this.answers.url,
		})
	}
}
