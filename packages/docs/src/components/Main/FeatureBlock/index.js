import React, { useState, useEffect } from 'react'
import classnames from 'classnames'
import useBaseUrl from '@docusaurus/useBaseUrl'
import useThemeContext from '@theme/hooks/useThemeContext'
import styles from './styles.module.css'

function FeatureBlock({ imageUrl, title, description }) {
	const [styleClassName, setStyleClassName] = useState(styles.light)
	const imgUrl = useBaseUrl(imageUrl)
	const { isDarkTheme } = useThemeContext()
	useEffect(() => {
		setStyleClassName(isDarkTheme ? styles.dark : styles.light)
	}, [isDarkTheme])

	return (
		<div className={classnames('col col--4', styles.wrapper)}>
			<div className={classnames(styles.content, styleClassName)}>
				<div className={styles.header}>
					<img className={styles.img} src={imgUrl} alt={title} />
					<h3>{title}</h3>
				</div>
				<p>{description}</p>
			</div>
		</div>
	)
}
export default FeatureBlock
