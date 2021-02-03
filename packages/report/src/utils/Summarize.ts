import chalk from 'chalk'
import { table, getBorderCharacters, TableUserConfig } from 'table'

export function reportRunTest(reportTableData: number[][]): any {
	const data: any[] = [
		[
			'Iteration',
			chalk.green('Passed'),
			chalk.red('Failed'),
			chalk.yellow('Skipped'),
			'Unexecuted',
		],
	]
	const rowData = reportTableData.map(item => {
		const [iteration, passedNo, failedNo, skippedNo, unexecutedNo] = item
		return [
			iteration,
			passedNo > 0 ? chalk.green(`${passedNo}`) : chalk.grey('_'),
			failedNo > 0 ? chalk.red(`${failedNo}`) : chalk.grey('_'),
			skippedNo > 0 ? chalk.yellow(`${skippedNo}`) : chalk.grey('_'),
			unexecutedNo > 0 ? unexecutedNo : chalk.grey('_'),
		]
	})
	data.push(...rowData)
	const config: TableUserConfig = {
		border: getBorderCharacters('ramac'),
		columns: {
			0: {
				alignment: 'center',
				width: 10,
			},
			1: {
				alignment: 'center',
				width: 10,
			},
			2: {
				alignment: 'center',
				width: 10,
			},
			3: {
				alignment: 'center',
				width: 10,
			},
			4: {
				alignment: 'center',
				width: 10,
			},
		},
	}
	return table(data, config)
}
