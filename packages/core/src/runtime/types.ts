import { NavigationOptions } from 'puppeteer'

export { NavigationOptions }

/**
 * EvaluateFn represents a function which can be evaluated on the browser.
 * It can either be a [string] or a function.
 */
export type EvaluateFn = string | ((...args: any[]) => any)
