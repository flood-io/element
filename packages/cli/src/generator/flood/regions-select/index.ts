import Generator from 'yeoman-generator'
import ora from 'ora'

import { LaunchOptions, getRegions, launchOnDemand, countVUH } from '../../../utils/flood'

export default class RegionsSelect extends Generator {
	options: LaunchOptions
	availableRegions: { [key: string]: string }
	answers: {
		regions: string[]
		confirm: boolean
	} = {
		regions: [],
		confirm: false,
	}

	get _selectedRegionIds(): string[] {
		const { availableRegions, answers } = this
		return answers.regions.map(
			name => Object.keys(availableRegions)[Object.values(availableRegions).indexOf(name)],
		)
	}

	get _regionsString(): string {
		return this.answers.regions.join(', ')
	}

	get _vuh(): number {
		return countVUH(this.options, this.answers.regions.length)
	}

	get _confirmMessage(): string {
		const {
			options: { virtualUsers },
			answers: { regions },
			_regionsString,
		} = this
		const totalUsers = virtualUsers * regions.length

		return `You're about to simulate ${totalUsers} total user${
			totalUsers === 1 ? '' : 's'
		} across ${regions.length} region${
			regions.length === 1 ? '' : 's'
		}: ${_regionsString}. Estimated usage will be ${this._vuh} VUH. Are you sure?`
	}

	async prompting() {
		this.availableRegions = await getRegions()

		this.answers.regions = (
			await this.prompt({
				type: 'checkbox',
				name: 'regions',
				message: 'Select the regions you want to launch this flood',
				choices: Object.values(this.availableRegions),
			})
		).regions

		if (this.answers.regions.length === 0) {
			this.env.error('At least 1 region needs to be selected' as any)
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
				const { options, _selectedRegionIds } = this
				const url = await launchOnDemand(options, _selectedRegionIds)

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
