import { Checker, CheckResult } from "@stryker-mutator/api/check";
import {
  tokens,
  commonTokens,
  PluginContext,
  Injector,
  Scope,
} from "@stryker-mutator/api/plugin";
import { Logger, LoggerFactoryMethod } from "@stryker-mutator/api/logging";
import { Mutant } from "@stryker-mutator/api/core";
import { DiffMap, parseDiffs } from "./helpers/diff-parser";
import { exec } from "child_process";
import { checkDiff } from "./helpers/diff-checker";

const GIT_DIFF_COMMAND = "git diff --color=never HEAD^";

function gitCheckerLoggerFactory(
  loggerFactory: LoggerFactoryMethod,
  target: Function | undefined
) {
  const targetName = target?.name ?? GitChecker.name;
  const category =
    targetName === GitChecker.name
      ? GitChecker.name
      : `${GitChecker.name}.${targetName}`;

  return loggerFactory(category);
}
gitCheckerLoggerFactory.inject = tokens(
  commonTokens.getLogger,
  commonTokens.target
);

/**
 * GitChecker factory.
 *
 * @param injector dependencies.
 * @returns an instance of the plugin class.
 */
export function create(injector: Injector<PluginContext>): GitChecker {
  return injector
    .provideFactory(
      commonTokens.logger,
      gitCheckerLoggerFactory,
      Scope.Transient
    )
    .injectClass(GitChecker);
}
create.inject = tokens(commonTokens.injector);

/**
 * Git Checker plugin class.
 *
 * @todo add integration tests when they become viable.
 */
export class GitChecker implements Checker {
  public static inject = tokens(commonTokens.logger, commonTokens.options);
  private diffMap: DiffMap | undefined;

  constructor(private readonly logger: Logger) {}

  /**
   * Initializes the Git Checker Plugin by executing
   * the `git diff` command and parsing output.
   *
   * @returns Void Promise.
   */
  public init = async (): Promise<void> => {
    this.logger.debug("Process starting Git Checker plugin.");

    return new Promise((resolve, reject) => {
      exec(GIT_DIFF_COMMAND, (error, stdout, stderr) => {
        try {
          if (error) {
            this.logger.error(stderr);
            this.logger.fatal(
              `Error while executing the \`${GIT_DIFF_COMMAND}\` command.`
            );
            reject(error);
          }

          this.logger.trace("Git diff command output:", stdout);

          this.diffMap = parseDiffs(stdout, process.cwd());

          this.logger.debug("Process successfully loaded Git Checker plugin.");

          if (this.logger.isTraceEnabled()) {
            for (const [file, diffs] of this.diffMap) {
              for (const [line, [start, end]] of diffs) {
                this.logger.trace(
                  `File "${file}": changes detected in the line ${line}, column ${start} to ${end}.`
                );
              }
            }
          }

          resolve();
        } catch (err) {
          reject(err);
        }
      });
    });
  };

  /**
   * Checks if the mutant location has overlap with the Git diffs.
   *
   * @param mutant The mutant to be checked.
   * @returns The Check Result.
   */
  public check = ({ fileName, location }: Mutant): Promise<CheckResult> => {
    this.logger.trace(
      `Checking a mutant in the file "${fileName}, location:`,
      location
    );

    return Promise.resolve(checkDiff(location, this.diffMap!.get(fileName)));
  };
}
