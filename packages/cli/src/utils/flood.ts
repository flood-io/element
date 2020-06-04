import fetch from 'node-fetch'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import findRoot from 'find-root'
import { join } from 'path'

interface Config {
	token?: string
	project?: string
}

export interface Project {
	name: string
}

const packageRoot = findRoot(__dirname)
const configPath = join(packageRoot, 'flood-config.json')

function getConfig(): Config {
	return existsSync(configPath) ? JSON.parse(readFileSync(configPath).toString()) : {}
}

function setToken(token: string): void {
	const config = getConfig()
	config.token = token
	writeFileSync(configPath, JSON.stringify(config))
}

function getToken(): string | undefined {
	const config = getConfig()
	return config.token
}

export function setProject(name: string): void {
	const config = getConfig()
	config.project = name
	writeFileSync(configPath, JSON.stringify(config))
}

export function getProject(): string | undefined {
	const config = getConfig()
	return config.project
}

export function isAuthenticated(): boolean {
	if (!getToken()) {
		throw 'You need to be authenticated first. Please use this command: element flood authenticate <your_api_token>'
	}
	return true
}

export function usingProject(): boolean {
	if (!getProject()) {
		throw 'You\'re not currently using any project on Flood. Select to use a project first, using this command: element flood use "<project_name>"'
	}
	return true
}

export async function floodFetch(url: string): Promise<any> {
	const token = getToken()
	if (!token) throw new Error('Not authenticated')

	const result = await (
		await fetch(url, {
			headers: {
				Authorization: `Basic ${token}`,
			},
		})
	).json()
	const errors = result.errors || result.error

	if (errors) throw new Error(errors)
	return result
}

export async function authenticate(username: string): Promise<void> {
	const token = Buffer.from(`${username}:`).toString('base64')
	const result = await (
		await fetch('https://api.flood.io/account', {
			headers: {
				Authorization: `Basic ${token}`,
			},
		})
	).json()
	const errors = result.errors || result.error

	if (errors) throw new Error(errors)
	setToken(token)
}
