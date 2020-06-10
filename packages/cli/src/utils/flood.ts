import fetch from 'node-fetch'
import FormData from 'form-data'
import { existsSync, readFileSync, writeFileSync, createReadStream } from 'fs'
import findRoot from 'find-root'
import { join } from 'path'

interface Project {
	id: string
	name: string
}

export interface Grid {
	uuid: string
	name: string
	infrastructure: 'hosted' | 'demand'
}

interface Config {
	token?: string
	project?: Project
}

export interface LaunchOptions {
	file: string
	hosted: boolean
	virtualUser: number
	duration: number
	rampup: number
}

const packageRoot = findRoot(__dirname)
const configPath = join(packageRoot, 'flood-config.json')

const regions = {
	'ca-central-1': 'Canada Central',
	'us-east-1': 'US East (Virginia)',
	'us-east-2': 'US East (Ohio)',
	'us-west-1': 'US West (California)',
	'us-west-2': 'US West (Oregon)',
	'eu-west-1': 'EU West (Ireland)',
	'eu-west-2': 'UK South (London)',
	'eu-west-3': 'EU West (Paris)',
	'eu-central-1': 'EU Central (Frankfurt)',
	'ap-southeast-1': 'Southeast Asia (Singapore)',
	'ap-southeast-2': 'Australia East (Sydney)',
	'ap-northeast-1': 'Japan East (Tokyo)',
	'ap-northeast-2': 'Korea Central (Seoul)',
	'sa-east-1': 'South America (Sao Paulo)',
	'ap-south-1': 'India West (Mumbai)',
}

function getConfig(): Config {
	return existsSync(configPath) ? JSON.parse(readFileSync(configPath).toString()) : {}
}

function setToken(token: string): void {
	const config = getConfig()
	config.token = token
	writeFileSync(configPath, JSON.stringify(config))
}

function getToken(): string | undefined {
	return getConfig().token
}

export function setProject(project: Project): void {
	const config = getConfig()
	config.project = project
	writeFileSync(configPath, JSON.stringify(config))
}

export function getProject(): Project {
	const { project } = getConfig()
	if (!project)
		throw 'You\'re not currently using any project on Flood. Select to use a project first, using this command: element flood use "<project_name>"'
	return project
}

export async function getRegions(): Promise<{ [key: string]: string }> {
	return regions
}

export function isAuthenticated(): boolean {
	if (!getToken()) {
		throw 'You need to be authenticated first. Please use this command: element flood authenticate <your_api_token>'
	}
	return true
}

export async function getProjects(): Promise<Project[]> {
	const res = await (
		await fetch('https://api.flood.io/projects', {
			headers: {
				Authorization: `Basic ${getToken()}`,
			},
		})
	).json()
	const errors = res.errors || res.error
	if (errors) throw new Error(errors)

	return res._embedded.projects
}

export async function getHostedGrids(): Promise<Grid[]> {
	const res = await (
		await fetch('https://api.flood.io/grids', {
			headers: {
				Authorization: `Basic ${getToken()}`,
			},
		})
	).json()
	const errors = res.errors || res.error
	if (errors) throw new Error(errors)

	const grids: Grid[] = res._embedded.grids
	return grids.filter(grid => grid.infrastructure === 'hosted')
}

export async function authenticate(username: string): Promise<void> {
	const token = Buffer.from(`${username}:`).toString('base64')
	const res = await (
		await fetch({
			url: 'https://api.flood.io/account',
			headers: {
				Authorization: `Basic ${token}`,
			},
		})
	).json()
	const errors = res.errors || res.error
	if (errors) throw new Error(errors)

	setToken(token)
}

function createFormData(options: LaunchOptions): FormData {
	const { file, virtualUser, rampup } = options
	const data = new FormData()

	data.append('flood[tool]', 'flood-chrome')
	data.append('flood[project]', getProject().name)
	data.append('flood_files[]', createReadStream(file))
	data.append('flood[threads]', virtualUser)
	data.append('flood[rampup]', rampup)
	return data
}

export async function launchOnDemand(
	options: LaunchOptions,
	selectedRegions: string[],
): Promise<string> {
	const body = createFormData(options)

	selectedRegions.forEach(id => {
		body.append('flood[grids][][infrastructure]', 'demand')
		body.append('flood[grids][][instance_quantity]', 1)
		body.append('flood[grids][][instance_type]', 'm4.xlarge')
		body.append('flood[grids][][region]', id)
		body.append('flood[grids][][stop_after]', options.duration)
	})

	const headers = body.getHeaders()
	headers.Authorization = `Basic ${getToken()}`

	const res = await (
		await fetch('https://api.flood.io/floods', {
			method: 'POST',
			headers,
			body,
		})
	).json()
	const errors = res.errors || res.error
	if (errors) throw new Error(errors)

	return res.uuid
}

export async function launchHosted(
	options: LaunchOptions,
	selectedGrid: string[],
): Promise<string> {
	const body = createFormData(options)

	selectedGrid.forEach(uuid => {
		body.append('flood[grids][][uuid]', uuid)
	})

	const headers = body.getHeaders()
	headers.Authorization = `Basic ${getToken()}`

	const res = await (
		await fetch('https://api.flood.io/floods', {
			method: 'POST',
			headers,
			body,
		})
	).json()
	const errors = res.errors || res.error
	if (errors) throw new Error(errors)

	return res.uuid
}
