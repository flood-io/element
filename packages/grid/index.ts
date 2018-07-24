import { main } from './src/Grid'

main(process.argv)
	.then(() => {
		console.log('grid finished!')
		process.exit(0)
	})
	.catch(err => {
		console.error(err)
		process.exit(1)
	})
