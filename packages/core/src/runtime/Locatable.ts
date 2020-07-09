import { ElementHandle, Locator } from '../page/types'

/**
 * Locatable represents anything able to be located, either a string selector or a <[Locator]>. <[Locator]>s are generally created using <[By]> methods.
 */
export type Locatable = Locator | ElementHandle | string

/**
 * NullableLocatable represents a <[Locatable]> which could also be null.
 *
 * Note that most Element location API methods accept a NullableLocatable but will throw an <[Error]> if its actually <[null]>.
 */
export type NullableLocatable = Locatable | null
