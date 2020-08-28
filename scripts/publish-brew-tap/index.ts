import findRoot from 'find-root'
import path from 'path'
import fs from 'fs'
import child_process from 'child_process'
import semver from 'semver'
import { sync as which } from 'which'
import { sync as mkdirp } from 'mkdirp'
import gitP from 'simple-git/promise'

const packageJSONFile = path.join(findRoot(path.join(__dirname, '..')), 'packages/cli/package.json')
const packageJSON = JSON.parse(fs.readFileSync(packageJSONFile, 'utf8'))
const version = packageJSON.version

const git = which('git')

const major = semver.major(version)
const minor = semver.minor(version)
const patch = semver.patch(version)
const prerelease = semver.prerelease(version)

const eltURL = `https://registry.npmjs.org/@flood/element-cli/-/element-cli-${version}.tgz`
const repo = 'git@github.com:flood-io/homebrew-taps.git'

const home = process.env.HOME
if (home === undefined) throw new Error('no $HOME set')
const tap = path.join(home, '.cache/flood-element/tap-tmp')

const sum = child_process
	.execSync(`curl -sL ${eltURL} | shasum -a 256 -b`, { encoding: 'utf8' })
	.split(' ')[0]

const formula = versionSuffix => `
require "language/node"

class Element${versionToBrewClassSuffix(versionSuffix)} < Formula
  desc "Flood Element CLI"
  homepage "https://github.com/flood-io/element"
  url "https://registry.npmjs.org/@flood/element-cli/-/element-cli-${version}.tgz"
  sha256 "${sum}"

  depends_on "node"
  # uncomment if there is a native addon inside the dependency tree
  # depends_on "python" => :build

  def install
    system "npm", "install", *Language::Node.std_npm_install_args(libexec)
    bin.install_symlink Dir["#{libexec}/bin/*"]
  end

  test do
    # add a meaningful test here
  end
end
`

function versionToBrewClassSuffix(version: string): string {
	if (version.length === 0) return ''

	version = version.replace(/[-_.\s]([a-zA-Z0-9])/g, (x: string, ...captures: any[]): string => {
		return captures[0].toUpperCase()
	})
	return `AT${version}`
}

const writeBrew = root => {
	if (prerelease) {
		if (prerelease[0] === 'beta' || prerelease[0] === 'alpha') {
			// this writes formula for each beta version e.g. element@0.0.2-beta.16
			// which isn't terribly useful
			// fs.writeFileSync(path.join(root, `element@${version}.rb`), formula(version), 'utf8')

			const ver = `${major}.${minor}.${patch}-${prerelease[0]}`
			fs.writeFileSync(path.join(root, `element@${ver}.rb`), formula(ver), 'utf8')
		}
	} else {
		fs.writeFileSync(path.join(root, `element.rb`), formula(''), 'utf8')
		fs.writeFileSync(
			path.join(root, `element@${major}.${minor}.rb`),
			formula(`${major}.${minor}`),
			'utf8',
		)
	}
}

async function update() {
	if (!fs.existsSync(tap)) {
		child_process.execSync(`${git} clone ${repo} -- ${tap}`, {
			stdio: 'inherit',
		})
	} else {
		child_process.execSync(`${git} pull`, { cwd: tap, stdio: 'inherit' })
	}

	const root = path.join(tap, 'Formula')
	mkdirp(root)

	writeBrew(root)

	const sgit = gitP(tap)

	await sgit.add('Formula')
	const status = await sgit.status()
	if (status.files.length > 0) {
		await sgit.commit('published element brew tap')
		await sgit.push()
	}
}

update()
	.then(() => {
		console.log('done')
	})
	.catch(e => {
		console.error(e)
		process.exit(1)
	})
