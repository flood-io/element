import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
// eslint-disable-next-line import/no-unresolved
import useBaseUrl from '@docusaurus/useBaseUrl'
// eslint-disable-next-line import/no-unresolved
import useThemeContext from '@theme/hooks/useThemeContext'
import styles from './styles.module.css'

function FeatureBlock({ imageUrl, title, description }) {
	const imgUrl = useBaseUrl(imageUrl)
	const { isDarkTheme } = useThemeContext()
	return (
		<div className={classnames('col col--4', styles.wrapper)}>
			<div className={classnames(styles.content, isDarkTheme ? styles.dark : styles.light)}>
				<div className={styles.header}>
					<img className={styles.img} src={imgUrl} alt={title} />
					<h3>{title}</h3>
				</div>
				<p>{description}</p>
			</div>
		</div>
	)
}

FeatureBlock.propTypes = {
	imageUrl: PropTypes.string.isRequired,
	title: PropTypes.string.isRequired,
	description: PropTypes.string.isRequired,
}

export default FeatureBlock
