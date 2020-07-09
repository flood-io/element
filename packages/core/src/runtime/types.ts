import { NavigationOptions } from 'puppeteer'
import { StepDefinition } from './Step'
import { TestDataSource } from '../test-data/TestData'

export { NavigationOptions }

/**
 * EvaluateFn represents a function which can be evaluated on the browser.
 * It can either be a [string] or a function.
 */
export type EvaluateFn = string | ((...args: any[]) => any)

/**
 * Defines a test suite of steps to run.
 *
 * **Example:**
 * ```
 *   import { TestData } from '@flood/element'
 *   interface Row {
 *     user: string
 *     systemID: number
 *   }
 *   const testData = TestData.withCSV<Row>(...)
 *
 *   export default suite.withData((testData, step) => {
 *     step("Step 1", async (row: Row, browser: Browser) => {
 *       await browser.visit(`http://example.com/user-${row.systemID}.html`)
 *     })
 *   })
 * ```
 *
 * @param testDefinition
 */
export declare const suite: SuiteDefinition

export interface SuiteDefinition {
	(callback: (this: null, s: StepDefinition) => void): void
	withData<T>(data: TestDataSource<T>, callback: (this: null, step: StepDefinition) => void): void
}
