import Generator from 'yeoman-generator'
import path from 'path'
import findRoot from 'find-root'

export default class TestConfiguration extends Generator {
    public options: { [key: string]: string }

    constructor(args: any[], opts: any) {
        super(args, opts)

        // This makes `appname` a required argument.
        this.argument('testConfiguration', { type: String, required: true })
    }

    default() {
        const packageRoot = findRoot(__dirname)
        this.sourceRoot(path.join(packageRoot, 'templates'))
    }

    writing() {
        this.fs.copyTpl(this.templatePath('element.config.js'), this.destinationPath(this.options.testConfiguration), {})
    }
}
