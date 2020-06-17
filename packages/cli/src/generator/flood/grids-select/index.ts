import Generator from 'yeoman-generator'
import ora from 'ora'

import { LaunchOptions, getHostedGrids, launchHosted, Grid, countVUH } from '../../../utils/flood'

export default class RegionsSelect extends Generator {
	options: LaunchOptions
	runningGrids: Grid[]
	answers: {
		grids: string[]
		confirm: boolean
	} = {
		grids: [],
		confirm: false,
	}

	get _selectedGridIds(): string[] {
		const { runningGrids, answers } = this
		return runningGrids.filter(grid => answers.grids.includes(grid.name)).map(grid => grid.uuid)
	}

	get _vuh(): number {
		return countVUH(this.options, this.answers.grids.length)
	}

	get _confirmMessage(): string {
		const {
			options: { virtualUser },
			answers: { grids },
		} = this
		const totalUsers = virtualUser * grids.length

		return `You're about to simulate ${totalUsers} total user${
			totalUsers === 1 ? '' : 's'
		} across ${grids.length} grid${grids.length === 1 ? '' : 's'}. Estimated usage will be ${
			this._vuh
		} VUH. Are you sure?`
	}

	async prompting() {
		this.runningGrids = await getHostedGrids()

		if (this.runningGrids.length === 0) {
			console.log(
				"There're no running grids. Please go to https://app.flood.io to launch a grid first",
			)
			return
		}

		this.answers.grids = (
			await this.prompt({
				type: 'checkbox',
				name: 'regions',
				message: 'Select the grids you want to launch this flood on',
				choices: this.runningGrids.map(grid => grid.name),
			})
		).regions

		if (this.answers.grids.length === 0) {
			this.env.error('At least 1 grid needs to be selected' as any)
		}

		this.answers.confirm = (
			await this.prompt({
				type: 'confirm',
				name: 'confirm',
				message: this._confirmMessage,
			})
		).confirm
	}

	async running() {
		if (!this.answers.confirm) return
		else {
			const throbber = ora('Flood is queued and will begin shortly').start()
			try {
				const { options, _selectedGridIds } = this
				const url = await launchHosted(options, _selectedGridIds)

				throbber.stop()
				console.log('Click on the link below to view the flood details:')
				console.log(url)
			} catch (err) {
				throbber.stop()
				this.env.error(err)
			}
		}
	}
}
