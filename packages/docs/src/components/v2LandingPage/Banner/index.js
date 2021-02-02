import React from 'react'
import classnames from 'classnames'
import useThemeContext from '@theme/hooks/useThemeContext'
import styles from './styles.module.css'

const Banner = () => {
	const { isDarkTheme } = useThemeContext()
	const styleClassName = isDarkTheme ? styles.dark : styles.light
	return (
		<div className={styles.bannerHeader}>
			<section className={classnames('container', styles.bannerMain, styleClassName)}>
				<div>
					<h1>Flood Element 2.0 is now available!</h1>
					<p>
						In this version, we introduce a total transformation in the CLI look as well as the core
						library that Flood Element is built on and many more cool features.
					</p>
				</div>
			</section>
		</div>
	)
}

export default Banner
