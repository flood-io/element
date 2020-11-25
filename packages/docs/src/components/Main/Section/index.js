import React from 'react'
import PropTypes from 'prop-types'
import styles from './styles.module.css'

const Section = ({ title, description, children }) => {
	return (
		<section className="container">
			<div className={styles.title}>
				<h2>{title}</h2>
				<p>{description}</p>
			</div>
			<div className={styles.content}>
				<div className="row">{children}</div>
			</div>
		</section>
	)
}

Section.propTypes = {
	title: PropTypes.string.isRequired,
	description: PropTypes.string.isRequired,
	children: PropTypes.element.isRequired,
}

export default Section
