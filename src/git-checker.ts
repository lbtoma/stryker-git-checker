import { Checker, CheckResult, CheckStatus } from '@stryker-mutator/api/check';
import { tokens, commonTokens, PluginContext, Injector, Scope } from '@stryker-mutator/api/plugin';
import { Logger, LoggerFactoryMethod } from '@stryker-mutator/api/logging';
import { Mutant } from '@stryker-mutator/api/core';

gitCheckerLoggerFactory.inject = tokens(commonTokens.getLogger, commonTokens.target);
function gitCheckerLoggerFactory(loggerFactory: LoggerFactoryMethod, target: Function | undefined) {
  const targetName = target?.name ?? GitChecker.name;
  const category = targetName === GitChecker.name
    ? GitChecker.name
    : `${GitChecker.name}.${targetName}`;

  return loggerFactory(category);
}

create.inject = tokens(commonTokens.injector);
export function create(injector: Injector<PluginContext>): GitChecker {
  return injector
    .provideFactory(commonTokens.logger, gitCheckerLoggerFactory, Scope.Transient)
    .injectClass(GitChecker);
}

export class GitChecker implements Checker {
  public static inject = tokens(commonTokens.logger, commonTokens.options);

  constructor(private readonly logger: Logger) {}

  public async init(): Promise<void> {
    this.logger.info("Starting the Git Checker plugin");
  }

  public async check(mutant: Mutant): Promise<CheckResult> {
    this.logger.info(mutant.fileName);
    return { status: CheckStatus.Passed }; 
  }
}
