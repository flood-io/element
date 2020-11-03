---
title: Setting up your editor
id: editor
---

To get the most out of writing Element scripts, it's important to have your editor configured correctly. If you don't write code every day, chances are you haven't evaluated all the options available to you.

We recommend using [VSCode](https://code.visualstudio.com/), which is a free code editor available from Microsoft for every platform.

## How to debug Element script with VSCode
Element 1.3.8 (or above) supports the ability to debug scripts with VSCode, with a few simple steps as below.

### 1. Add new configurations in `launch.json` file
Under `.vscode` folder of your project, find the `launch.json` file and add the below configurations:

```json
{
  "version": "1.3.8",
  "configurations": [
    {
      "name": "debug",
      "type": "node",
      "request": "launch",
      "args": [
        "/usr/local/bin/element",
        "run",
        "./test.ts",
        "--devtools",
        "--debug"
      ],
    }
  ]
}
```
### 2. Add the `debugger` keyword in your test script
In your test script, add the `debugger` keyword where you want the test to pause in execution.
![Add debugger keyword in your test script](/docs_img/debugger.png)