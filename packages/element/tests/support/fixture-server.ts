import * as express from 'express'
import { resolve } from 'path'

let instance = null

export class DogfoodServer {
	app: express.Application
	server: any

	constructor() {
		this.app = express()
		// this.app.use(morgan('tiny'))
		this.app.use(express.static(resolve(__dirname, '../../dogfood/dockerfiles/watirspec/html')))
	}

	async start() {
		if (instance) {
			return
		}
		await new Promise(done => {
			instance = this.server = this.app.listen(1337, function() {
				console.log('Dogfood server listening on port :1337!')
				done()
			})
		})
	}

	async close() {
		instance = null
		await this.server.close()
	}
}
