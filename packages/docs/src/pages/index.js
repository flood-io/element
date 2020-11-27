import React from 'react'
// eslint-disable-next-line import/no-unresolved
import Layout from '@theme/Layout'
import { Header, Main } from '../components'

const Home = () => {
	return (
		<Layout
			title="Flood Element Load Testing Tool"
			description="Description will go into a meta tag in <head />"
		>
			<Header />
			<Main />
		</Layout>
	)
}

export default Home
