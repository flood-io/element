import React from 'react'
import classnames from 'classnames'
// eslint-disable-next-line import/no-unresolved
import Link from '@docusaurus/Link'
// eslint-disable-next-line import/no-unresolved
import useBaseUrl from '@docusaurus/useBaseUrl'
import styles from './styles.module.css'

const Header = () => {
	return (
		<header className={styles.heroHeader}>
			<section className={classnames('container', styles.heroBanner)}>
				<div>
					<h1>Load Test Your App Using Real Browsers</h1>
					<p>
						Flood Element is the first scalable, browser based load generation tool — making load
						testing as easy as functional testing.
					</p>
					<div className={styles.heroButton}>
						<Link
							className={classnames(
								'button button--outline button--primary button--lg',
								styles.getStarted,
							)}
							to={useBaseUrl('docs/')}
						>
							Get Started
						</Link>
					</div>
				</div>
				<img src={useBaseUrl('img/hero_image.png')} />
			</section>
		</header>
	)
}

export default Header
