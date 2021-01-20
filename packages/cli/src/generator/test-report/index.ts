import Generator from 'yeoman-generator'
import { join } from 'path'
import findRoot from 'find-root'

export default class Report extends Generator {
	options: { data: string; dir: string }

	initializing() {
		const packageRoot = findRoot(__dirname)
		this.sourceRoot(join(packageRoot, 'templates/report'))
		this.destinationRoot(this.options.dir)
	}

	writing() {
		this.fs.copyTpl(this.templatePath('report.html'), this.destinationPath('report.html'), {})
		this.fs.copyTpl(this.templatePath('assets'), this.destinationPath('assets'), {})
		this.fs.move(this.templatePath('styles.css'), this.destinationPath('styles.css'), {})
		this.fs.move(this.templatePath('script.js'), this.destinationPath('js/script.js'), {})
		this.fs.write(this.destinationPath('js/data.js'), `var data = ${this.options.data}`)
		this.fs.write(this.destinationPath('data.json'), this.options.data)
	}
}
