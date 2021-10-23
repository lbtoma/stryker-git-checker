import { CheckResult, CheckStatus } from "@stryker-mutator/api/check";
import { Location } from "@stryker-mutator/api/core";
import { LineDifferenceRange } from "./diff-parser";

/**
 * Checks if the mutant location has overlap with the Git diffs.
 *
 * @param location The mutant location to be checked.
 * @param diff The diff in the parsed Git diff command output.
 * @returns The Check Result.
 */
export const checkDiff = (
  location: Location,
  diff?: Map<number, LineDifferenceRange>
): CheckResult => {
  if (diff) {
    for (const [lineNumber, range] of diff.entries()) {
      if (
        // Start
        (lineNumber === location.start.line &&
          range[0] >= location.start.column) ||
        // Middle
        (lineNumber > location.start.line && lineNumber < location.end.line) ||
        // Bottom
        (lineNumber === location.end.line && range[1] < location.end.column)
      ) {
        return { status: CheckStatus.Passed };
      }
    }
  }

  // This cast is necessary because the status `Ignored` is missing
  // in `@stryker-mutator/api` `CheckStatus` enum.
  return {
    status: "Ignored" as CheckStatus,
    reason: "Mutation out of range",
  };
};
