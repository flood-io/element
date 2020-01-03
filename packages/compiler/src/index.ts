import { transformFileAsync } from '@babel/core'
import webpack from 'webpack'

export class Compiler {
	constructor(private sourceFile: string) {}

	public async emit() {
		let output = await transformFileAsync(this.sourceFile, {
			presets: [
				[
					'@babel/preset-typescript',
					{
						diagnostics: true,
					},
				],
				[
					'@babel/preset-env',
					{
						targets: {
							node: 'current',
						},
						modules: 'commonjs',
					},
				],
			],
		}).catch(err => {
			console.log(err)
		})

		if (output != null) {
			debugger
			return output.code
		}

		return null
	}
}
