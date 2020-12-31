import './styles.scss'

interface ScriptWithError {
	name: string
	error: string
}

interface ExecutionInfo {
	time: string
	duration: number
	mode: string
	os: string
	nodeVersion: string
	elementVersion: string
}

interface TestScriptResult {
	name: string
	duration: number
	iterationResults: Array<IterationResult>
}

interface IterationResult {
	name: string
	duration: number
	stepResults: Array<StepResult>
}

type Status = 'passed' | 'failed' | 'skipped' | 'unexecuted'

interface StepResult {
	name: string
	status: Status
	subTitle?: string
	duration?: number
	error?: string
}

const filter = {
	passed: true,
	failed: true,
	skipped: true,
	unexecuted: true,
}
let viewNumber = true
let showError = false

export function getTimeString(ms: number) {
	if (ms < 1000) return `${ms}ms`
	const s = Math.floor(ms / 1000)
	if (s < 60) return `${s}s ${ms % 1000}ms`
	const m = Math.floor(s / 60)
	if (m < 60) return `${m}m ${s % 60}s`
	return `${Math.floor(m / 60)}h ${m % 60}m`
}

export function renderExecutionInfo(info: ExecutionInfo) {
	document.writeln(`
    <div class="execution-info">
      <div>
        <div class="info-property">Execution Mode</div>
        <div class="info-property">Execution Date</div>
        <div class="info-property">Duration</div>
      </div>
			<div>
				<div class="info-data">${info.mode}</div>
        <div class="info-data">${info.time}</div>
        <div class="info-data">${getTimeString(info.duration)}</div>
      </div>
      <div>
				<div class="info-property">Operation System</div>
				<div class="info-property">Node Version</div>
        <div class="info-property">Element Version</div>
      </div>
      <div>
				<div class="info-data">${info.os}</div>
				<div class="info-data">${info.nodeVersion}</div>
				<div class="info-data">${info.elementVersion}</div>
      </div>
    </div>
  `)
}

function renderIterationResult(iteration: IterationResult, index: number) {
	const result = {
		passed: 0,
		failed: 0,
		skipped: 0,
		unexecuted: 0,
	}
	const totalSteps = iteration.stepResults.length

	function getPercentString(value: number): string {
		return value.toLocaleString(undefined, { style: 'percent', maximumFractionDigits: 2 })
	}

	function getShowValue(result: number): string {
		if (viewNumber) return result + ''
		return getPercentString(result / totalSteps)
	}

	iteration.stepResults.forEach(function(step) {
		result[step.status]++
	})

	return `
    <td>${index}</td>
    <td>
      <div class="summary-result">
        ${
					result.passed > 0
						? `<div style="flex: ${result.passed}" class="passed">
							${getShowValue(result.passed)}
						</div>`
						: ''
				}
        ${
					result.failed > 0
						? `<div style="flex: ${result.failed}" class="failed">
							${getShowValue(result.failed)}
						</div>`
						: ''
				}
        ${
					result.skipped > 0
						? `<div style="flex: ${result.skipped}" class="skipped">
							${getShowValue(result.skipped)}
						</div>`
						: ''
				}
        ${
					result.unexecuted > 0
						? `<div style="flex: ${result.unexecuted}" class="unexecuted">
							${getShowValue(result.unexecuted)}
						</div>`
						: ''
				}
      </div>
    </td>
  `
}

function renderScriptWithError(scripts: ScriptWithError[]) {
	return scripts
		.map(script => {
			return `
        <tr class="unexecuted-script">
          <td class="script-with-error">${script.name}</td>
          <td>-</td>
          <td>${script.error}</td>
        </tr>
      `
		})
		.join('')
}

function renderExecutedScripts(scripts: TestScriptResult[]) {
	return scripts
		.map(script => {
			const iterations = script.iterationResults

			return `
        <tr>
          <td rowspan=${iterations.length || 1}><a href="#${script.name}">${script.name}</a></td>
          ${renderIterationResult(iterations[0], 1)}
        </tr>
        ${iterations
					.slice(1)
					.map((iteration, index) => {
						return `<tr>${renderIterationResult(iteration, index + 2)}</tr>`
					})
					.join('')}
      `
		})
		.join('')
}

function renderSummaryHeader() {
	return `
    <tr>
      <th style="width: 35%">Test script</th>
      <th style="width: 15%">Iteration</th>
      <th style="width: 50%">Result</th>
    </tr>
  `
}

function renderSummaryData(scripts: TestScriptResult[], scriptWithError: ScriptWithError[]) {
	return `
    ${renderExecutedScripts(scripts)}
    ${renderScriptWithError(scriptWithError)}
  `
}

export function toggleSummaryView(
	executedScrips: TestScriptResult[],
	unexecutedScript: ScriptWithError[],
) {
	const summaryTable = document.getElementById('table-summary')

	viewNumber = !viewNumber

	if (summaryTable) {
		summaryTable.innerHTML = `
			${renderSummaryHeader()}
			${renderSummaryData(executedScrips, unexecutedScript)}
		`
	}
}

export function renderSummary(
	executedScrips: TestScriptResult[],
	unexecutedScript: ScriptWithError[],
) {
	document.writeln(`
    <table id="table-summary" class="table">
      ${renderSummaryHeader()}
      ${renderSummaryData(executedScrips, unexecutedScript)}
    </table>
  `)
}

function renderDetailHeader() {
	return `
    <tr>
      <th style="width: 15%">Iteration</th>
      <th style="width: 55%">Step</th>
      <th style="width: 15%">Result</th>
      <th style="width: 15%">Duration</th>
    </tr>
  `
}

function renderStepDetail(step: StepResult) {
	function getError() {
		if (!step.error) return ''

		const errorId = `error-${step.name}`
		const errorPart1 = step.error.slice(0, 100) || ''
		const errorPart2 = step.error.slice(100) || ''

		return `<div class="error with-show-more">
			<input type="checkbox" class="trigger" id="${errorId}" />
			<p class="wrapper">
				<span class="always-show-section">${errorPart1}</span>
				${
					errorPart2
						? `<span class="show-more-section">${errorPart2}</span>
						<label for="${errorId}" class="button"></label>`
						: ''
				}
			</p>
		</div>`
	}

	return `
		<td class="step-name">
			<div>${step.name}</div>
			${showError ? getError() : ''}
		</td>
    <td class="${step.status} step-result">${step.status}</td>
    <td>${step.duration !== undefined ? `${getTimeString(step.duration)}` : '-'}</td>
  `
}

function renderDetailData(iterations: IterationResult[]) {
	return `
    ${iterations
			.map((iteration, index) => {
				const steps = iteration.stepResults.filter(step => filter[step.status])

				if (steps.length === 0) {
					return '<tr><td colspan=3>No steps match the filter<td></tr>'
				}

				return `
        <tr>
          <td rowspan=${steps.length}>
            ${
							steps.length > 1
								? `<div>${`${index + 1}`}</div>
            <div>(${getTimeString(iteration.duration)})</div>`
								: `${index + 1} (${getTimeString(iteration.duration)})`
						}
          </td>
          ${renderStepDetail(steps[0])}
        </tr>
        ${steps
					.slice(1)
					.map(step => {
						return `<tr>${renderStepDetail(step)}</tr>`
					})
					.join('')}
      `
			})
			.join('')}
  `
}

function renderDetail(script: TestScriptResult) {
	const detailTable = document.getElementById(script.name)
	const detailHTML = `
		<i>${script.name} (${getTimeString(script.duration)})</i>
		<table class="table">
			${renderDetailHeader()}
			${renderDetailData(script.iterationResults)}
		</table>
	`
	if (detailTable) {
		detailTable.innerHTML = detailHTML
	}
}

export function renderScriptsDetail(scripts: TestScriptResult[]) {
	scripts.forEach(script => {
		document.writeln(`<div id=${script.name} class="script-detail"></div>`)
		renderDetail(script)
	})
}

export function filterDetail(scripts: TestScriptResult[], filterKey: keyof typeof filter) {
	console.log(showError)
	filter[filterKey] = !filter[filterKey]
	scripts.forEach(script => renderDetail(script))
}

export function toggleShowError(scripts: TestScriptResult[]) {
	showError = !showError
	scripts.forEach(script => renderDetail(script))
}
