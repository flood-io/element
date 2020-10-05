import Generator from 'yeoman-generator'
import { join } from 'path'

export default class Report extends Generator {
	options: { data: string; dir: string }

	initializing() {
		this.sourceRoot(join(__dirname, 'templates'))
		this.destinationRoot(this.options.dir)
	}

	writing() {
		this.fs.copyTpl(this.templatePath('index.html'), this.destinationPath('index.html'), {})
		this.fs.copyTpl(this.templatePath('styles.css'), this.destinationPath('styles.css'), {})
		this.fs.copyTpl(this.templatePath('js'), this.destinationPath('js'), {})
		this.fs.write(this.destinationPath('js/data.js'), `var data = ${this.options.data}`)
		this.fs.copyTpl(this.templatePath('assets'), this.destinationPath('assets'), {})
		this.fs.write(this.destinationPath('data.json'), this.options.data)
	}
}
