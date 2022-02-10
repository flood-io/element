import { transformFileAsync } from '@babel/core'
import { CompilerOutput } from '../types'
import { resolve, dirname } from 'path'
import { CompilerStats } from '../CompilerStats'

export class BabelTransformer {
	constructor(private sourceFile: string) {}

	process() {
		return this.babelCompiler()
	}

	private async babelCompiler(): Promise<CompilerOutput> {
		const result = await transformFileAsync(resolve(this.sourceFile), {
			comments: false,
			highlightCode: true,
			caller: {
				name: 'element-babel-compiler',
				supportsStaticESM: false,
			},
			compact: false,
			sourceMaps: 'both',

			cwd: dirname(this.sourceFile),

			presets: [
				'@babel/preset-typescript',
				[
					'@babel/preset-env',
					{
						targets: { node: 'current' },
						useBuiltIns: false,
					},
				],
			],
		})

		let content = ''
		if (result != null) {
			content = result.code ?? ''
		}

		const stats = new CompilerStats()

		return {
			content,
			stats,
		}
	}
}
