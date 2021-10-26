# stryker-git-checker

In the software testing context, one of the main downsides of the
mutation testing technique is the high processing time to execute
the analyses in large codebases. This work aims to develop an
integration with the Git version control system, allowing to perform
fast mutation tests with the Stryker Mutator framework, creating
mutants only in new changes over the original code base, improving
the productivity in the use of this technique in development with
Javascript (and friends).

This work is part of the [Lucas Barioni Toma](https://github.com/lbtoma)'s
completion of Electronic Engineering course work in the [Technological
Aeronautics Institute](http://www.ita.br). Results will be collected later
for benchmarks and to evaluate the adequacy of this technique.

Future work:

- [x] Make it work in a simple Javascript project;
- [ ] Add automated integration tests (I'm still figuring out how I will do this);
- [ ] Add mutation testing;
- [ ] Configure CI/CD;
- [ ] Make it work in a simple Typescript project;
- [ ] Make it work in a complex Typescript + React project;
- [ ] Make it work in Windows 😬;

🚧 `Please note`: This is very experimental yet, thinks can not work as expected.

## Usage

To install the plugin to a existing project with Stryker Mutator, just add the plugin package with `npm` or `yarn`:

```bash
# NPM
npm install --save-dev stryker-git-checker

# Yarn
yarn add --dev stryker-git-checker
```

Then add `git-checker` to the checkers list and `stryker-git-checker` to the plugins list:

```js
/**
 * Example of `stryker.conf.js` file.
 *
 * @type {import('@stryker-mutator/api/core').StrykerOptions}
 */
module.exports = {
  packageManager: "yarn",
  reporters: ["html", "clear-text", "progress"],
  testRunner: "jest",
  coverageAnalysis: "perTest",
  // Add `git-checker` to the `checkers` list.
  checkers: ["git-checker"],
  // Add all plugins being used including the `stryker-git-checker`.
  plugins: ["@stryker-mutator/jest-runner", "stryker-git-checker"],
};
```

`Note`: remember that when you use custom plugins you need to explicitly add all plugins in the plugins list.
