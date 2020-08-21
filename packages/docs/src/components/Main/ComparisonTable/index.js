import React from 'react'
import useThemeContext from '@theme/hooks/useThemeContext'
import classnames from 'classnames'
import styles from './styles.module.css'

const data = [
	{
		lable: 'Network Traces',
		plu: true,
		blu: true,
	},
	{
		lable: 'Record backend performance',
		plu: true,
		blu: true,
	},
	{
		lable: 'Record frontend performance',
		plu: false,
		blu: true,
	},
	{
		lable: 'Browser Performance Testing with full control',
		plu: false,
		blu: true,
	},
	{
		lable: 'Capable of testing any user behaviour',
		plu: false,
		blu: true,
	},
	{
		lable: 'Record network and user interaction time',
		plu: false,
		blu: true,
	},
	{
		lable: 'Load testing as easy as functional test',
		plu: false,
		blu: true,
	},
	{
		lable: 'Screenshot  on error or on demand',
		plu: false,
		blu: true,
	},
]

const ComparisonTable = () => {
	const { isDarkTheme } = useThemeContext()
	return (
		<div className={classnames(styles.container, isDarkTheme ? styles.dark : styles.light)}>
			<table>
				<thead>
					<tr>
						<th>Features</th>
						<th>Protocol-level Load Testing</th>
						<th>Browser-based Load Testing</th>
					</tr>
				</thead>
				<tbody>
					{data.map((item, index) => (
						<tr key={index}>
							<td>{item.lable}</td>
							<td>
								<img
									className={classnames(styles.img, !item.plu ? styles.filtered : '')}
									src={item.plu ? 'img/check_ic.png' : 'img/remove_ic.png'}
								/>
							</td>
							<td>
								<img
									className={classnames(styles.img, !item.blu ? styles.filtered : '')}
									src={item.blu ? 'img/check_ic.png' : 'img/remove_ic.png'}
								/>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}

export default ComparisonTable
