import React from 'react'
import Layout from '@theme/Layout'
import { Banner, MainV2 } from '../components'

function v2Page() {
	return (
		<Layout title="Element version 2.0">
			<Banner />
			<MainV2 />
		</Layout>
	)
}

export default v2Page
