import React from 'react'
import classnames from 'classnames'
import useThemeContext from '@theme/hooks/useThemeContext'
import './styles.css'

const Section = ({ title, imageUrl, description, bgClassName }) => {
	const { isDarkTheme } = useThemeContext()
	const styleClassName = isDarkTheme ? 'dark' : 'light'
	return (
		<section className={classnames('section--v2', bgClassName, styleClassName)}>
			<div className="container">
				<div className="left-side">
					<h2>{title}</h2>
					{description}
				</div>
				<div className="right-side">
					<img src={imageUrl} alt={title} />
				</div>
			</div>
		</section>
	)
}

export default Section
