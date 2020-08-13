import React from 'react'
import useBaseUrl from '@docusaurus/useBaseUrl'
import styles from './styles.module.css'

function FeatureBlock({ imageUrl, title, description }) {
	const imgUrl = useBaseUrl(imageUrl)
	return (
		<div className="col col--4">
			<div className="text--center">
				<img className={styles.img} src={imgUrl} alt={title} />
			</div>
			<h3>{title}</h3>
			<p>{description}</p>
		</div>
	)
}
export default FeatureBlock
