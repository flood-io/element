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
	virtualUsers: number
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

export function configAvailable(): boolean {
	const { FLOOD_API_TOKEN, PROJECT } = process.env
	return !!(FLOOD_API_TOKEN || isAuthenticated()) && !!(PROJECT || getProject())
}

export async function fetchProjects(apiToken?: string): Promise<Project[]> {
	const res = await (
		await fetch('https://api.flood.io/projects', {
			headers: {
				Authorization: `Basic ${apiToken || getToken()}`,
			},
		})
	).json()
	const errors = res.errors || res.error
	if (errors) throw new Error(errors)

	return res._embedded.projects.map(project => {
		return {
			id: project.id,
			name: project.name,
		}
	})
}

export async function fetchProject(idOrName: string, apiToken?: string): Promise<Project> {
	const projects = await fetchProjects(apiToken)
	const project = projects.find(p => p.id === idOrName || p.name === idOrName)
	if (!project) {
		throw `No project found with id or name "${idOrName}". Please check and try again`
	}
	return project
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

export function countVUH(options: LaunchOptions, gridCount: number) {
	const { virtualUsers, duration } = options
	const billingDuration = (duration - (duration % 15) + (duration % 15 ? 1 : 0) * 15) / 60

	return virtualUsers * gridCount * billingDuration
}

export async function authenticate(username: string): Promise<void> {
	const token = Buffer.from(`${username}:`).toString('base64')
	const res = await (
		await fetch('https://api.flood.io/api/users/me', {
			headers: {
				Authorization: `Basic ${token}`,
			},
		})
	).json()
	const errors = res.errors || res.error
	if (errors) throw new Error(errors)

	setToken(token)
}

function createFormData(config: Config, options: LaunchOptions): FormData {
	const { file, virtualUsers, rampup, duration } = options
	const data = new FormData()

	data.append('flood[tool]', 'flood-chrome')
	data.append('flood[project]', (config.project as any).name)
	data.append('flood_files[]', createReadStream(file))
	data.append('flood[threads]', virtualUsers)
	data.append('flood[rampup]', rampup)
	data.append('flood[duration]', duration * 60)
	return data
}

async function getConfigFromEnv(): Promise<Config> {
	const { FLOOD_API_TOKEN, PROJECT } = process.env
	const token = FLOOD_API_TOKEN ? Buffer.from(`${FLOOD_API_TOKEN}:`).toString('base64') : getToken()

	const project = PROJECT ? await fetchProject(PROJECT, token) : getProject()
	return { token, project }
}

export async function launchOnDemand(
	options: LaunchOptions,
	selectedRegions: string[],
): Promise<string> {
	const config = await getConfigFromEnv()
	const body = createFormData(config, options)

	selectedRegions.forEach(id => {
		body.append('flood[grids][][infrastructure]', 'demand')
		body.append('flood[grids][][instance_quantity]', 1)
		body.append('flood[grids][][instance_type]', 'm5.xlarge')
		body.append('flood[grids][][region]', id)
		body.append('flood[grids][][stop_after]', options.duration)
	})

	const headers = body.getHeaders()
	headers.Authorization = `Basic ${config.token}`

	const res = await (
		await fetch('https://api.flood.io/floods', {
			method: 'POST',
			headers,
			body,
		})
	).json()
	const errors = res.errors || res.error
	if (errors) throw new Error(errors)

	return `https://app.flood.io/projects/${(config.project as any).id}/flood/${res.uuid}`
}

export async function launchHosted(
	options: LaunchOptions,
	selectedGrid: string[],
): Promise<string> {
	const config = await getConfigFromEnv()
	const body = createFormData(config, options)

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

	return `https://app.flood.io/projects/${(config.project as any).id}/flood/${res.uuid}`
}
