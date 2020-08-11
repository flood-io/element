import moment from 'moment'

export function getName() {
	return `Dustin at ${moment.utc().toISOString()}`
}
