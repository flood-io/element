import './styles.scss'

type Milliseconds = number

type ScriptWithError = {
	name: string
	error: string
}

type ExecutionInfo = {
	time: string
	duration: Milliseconds
	mode: string
	os: string
	nodeVersion: string
	elementVersion: string
}

type TestScriptResult = {
	name: string
	duration: Milliseconds
	iterationResults: Array<IterationResult>
}

type IterationResult = {
	name: string
	duration: Milliseconds
	stepResults: Array<StepResult>
}
type Status = 'passed' | 'failed' | 'skipped' | 'unexecuted'

type StepResult = {
	name: string
	status: Status
	subTitle?: string
	duration?: Milliseconds
}

export function getTimeString(ms: number) {
	if (ms < 1000) return `${ms}ms`
	const s = Math.floor(ms / 1000)
	if (s < 60) return `${s}s ${ms % 1000}ms`
	const m = Math.floor(s / 60)
	if (m < 60) return `${m}m ${s % 60}s`
	return `${Math.floor(m / 60)}h ${m % 60}m`
}

function renderIterationResult(
	iteration: IterationResult,
	index: number,
	isViewingNumber: boolean,
) {
	const result = {
		passed: 0,
		failed: 0,
		skipped: 0,
		unexecuted: 0,
	}
	const totalSteps = iteration.stepResults.length

	function getShowValue(result: number) {
		if (isViewingNumber) return result
		return (result * 100) / totalSteps
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
		.map(function(script) {
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

function renderExecutedScripts(scripts: TestScriptResult[], isViewingNumber: boolean) {
	return scripts
		.map(function(script) {
			const iterations = script.iterationResults

			return `
        <tr>
          <td rowspan=${iterations.length || 1}><a href="#${script.name}">${script.name}</a></td>
          ${renderIterationResult(iterations[0], 1, isViewingNumber)}
        </tr>
        ${iterations
					.slice(1)
					.map(function(iteration, index) {
						return `<tr>${renderIterationResult(iteration, index + 2, isViewingNumber)}</tr>`
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

function renderSummaryData(
	scripts: TestScriptResult[],
	scriptWithError: ScriptWithError[],
	isViewingNumber: boolean,
) {
	return `
    ${renderExecutedScripts(scripts, isViewingNumber)}
    ${renderScriptWithError(scriptWithError)}
  `
}

export function toggleSummaryView(
	executedScrips: TestScriptResult[],
	unexecutedScript: ScriptWithError[],
	isViewingNumber: boolean,
) {
	const summaryTable = document.getElementById('table-summary')

	if (summaryTable) {
		summaryTable.innerHTML = `
			${renderSummaryHeader()}
			${renderSummaryData(executedScrips, unexecutedScript, isViewingNumber)}
		`
	}
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

export function renderSummary(
	executedScrips: TestScriptResult[],
	unexecutedScript: ScriptWithError[],
) {
	document.writeln(`
    <table id="table-summary" class="table">
      ${renderSummaryHeader()}
      ${renderSummaryData(executedScrips, unexecutedScript, true)}
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
	return `
    <td class="step-name">${step.name}</td>
    <td class="${step.status} step-result">${step.status}</td>
    <td>${step.duration !== undefined ? `${getTimeString(step.duration)}` : '-'}</td>
  `
}

function renderDetailData(iterations: IterationResult[]) {
	return `
    ${iterations
			.map(function(iteration, index) {
				const steps = iteration.stepResults

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
					.map(function(step) {
						return `<tr>${renderStepDetail(step)}</tr>`
					})
					.join('')}
      `
			})
			.join('')}
  `
}

function renderDetail(script: TestScriptResult) {
	document.writeln(`
    <div id=${script.name} class="script-detail">
      <i>${script.name} (${getTimeString(script.duration)})</i>
      <table class="table">
        ${renderDetailHeader()}
        ${renderDetailData(script.iterationResults)}
      </table>
    </div>
  `)
}

export function renderScriptsDetail(scripts: TestScriptResult[]) {
	return `
    ${scripts.forEach(function(script) {
			return renderDetail(script)
		})}
  `
}
