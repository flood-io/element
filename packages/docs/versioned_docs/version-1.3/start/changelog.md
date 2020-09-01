---
id: changelog
title: Changelog
---

# 1.3.0

Released: Aug 2020

## New features

- Add extended step types:
  - [`step.if()`](../guides/script.md###step.if)
  - [`step.unless()`](../guides/script.md###step.unless)
  - [`step.while()`](../guides/script.md###step.while)
  - [`step.repeat()`](../guides/script.md###step.repeat)
  - [`step.once()`](../guides/script.md###step.once)
  - [`step.skip()`](../guides/script.md###step.skip)
  - [`step.recovery()`](../guides/script.md###step.recovery)
- Add hooks for setup and teardown
  - [`beforeAll()`](../guides/hook.md###beforeAll)
  - [`beforeEach()`](../guides/hook.md###beforeEach)
  - [`afterEach()`](../guides/hook.md###afterEach)
  - [`afterAll()`](../guides/hook.md###afterAll)
- Support sending key combinations [(`browser.sendKeyCombinations()`)](<../api/Browser.md###sendKeyCombinations(...keys)>)
- Support authentication with Flood and [lauching a flood directly from Element CLI](../guides/CLI.md##Run-an-Element-script-on-Flood)
- Add new command to [generate a config file](../guides/CLI.md###Generate-a-config-file-from-a-template) and [run a test from a config file](../guides/CLI.md###Run-a-test-locally-with-the-default-config-file)

## Enhancements

- Handle multiple tabs/windows (GitHub issue [#47](https://github.com/flood-io/element/issues/47))
- Refactor code and fix dependencies life cycle issue (GitHub issue [#176](https://github.com/flood-io/element/issues/176))
- Add [`Until.elementTextDoesNotMatch()`](../api/Waiters.md)
- Support importing script helper from other node modules (GitHub issue [#71](https://github.com/flood-io/element/issues/71))
- Make process.env reflect environment variables present when running `element run` (GitHub issue [#104](https://github.com/flood-io/element/issues/104))

## Bugfixes

- Fix homebrew publish of Element (GitHub issue [#135](https://github.com/flood-io/element/issues/135))
- Unable to use the command `element generate <file.ts>` (GitHub issue [#165](https://github.com/flood-io/element/issues/165))
- Setting `recoveryTries` does not work (GitHub issue [#195](https://github.com/flood-io/element/issues/195))
- Exit status of `element run test.ts` to reflect test passing/failing (GitHub issue [#30](https://github.com/flood-io/element/issues/30))
- Setting `screenshotOnFailure():true` does not create a screenshot on failure (GitHub issue [#87](https://github.com/flood-io/element/issues/87))
- Getting error `responded with status code 401. Element expected a status code 200-299 or 300-399` (GitHub issue [#146](https://github.com/flood-io/element/issues/146))
