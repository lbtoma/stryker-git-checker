import { checkDiff } from "@/helpers/diff-checker";
import { LineDifferenceRange } from "@/helpers/diff-parser";
import { CheckResult, CheckStatus } from "@stryker-mutator/api/check";
import { Position } from "@stryker-mutator/api/core";
import { Location } from "mutation-testing-report-schema";

describe("Git diff check utils", () => {
  describe("checkDiff", () => {
    test("Should ignore mutants out of the diff", () => {
      const start: Position = { line: 1, column: 10 };
      const end: Position = { line: 5, column: 3 };
      const result = checkDiff({ start, end }, undefined);

      expect(result).toStrictEqual({
        status: "Ignored",
        reason: "Mutation out of range",
      });
    });

    describe("Boundary testing", () => {
      const outOfRangeResult: CheckResult = {
        status: "Ignored" as CheckStatus,
        reason: "Mutation out of range",
      };
      const passedResult: CheckResult = {
        status: CheckStatus.Passed,
      };

      const testCases: [
        string,
        Location,
        Map<number, LineDifferenceRange>,
        CheckResult
      ][] = [
        [
          "Far from the start",
          { start: { line: 5, column: 10 }, end: { line: 10, column: 1 } },
          new Map([[2, [5, 30]]]),
          outOfRangeResult,
        ],
        [
          "Near to the start but outside",
          { start: { line: 5, column: 10 }, end: { line: 10, column: 1 } },
          new Map([[5, [5, 8]]]),
          outOfRangeResult,
        ],
        [
          "In the start",
          { start: { line: 5, column: 10 }, end: { line: 10, column: 1 } },
          new Map([[5, [10, 20]]]),
          passedResult,
        ],
        [
          "Near from the start but inside",
          { start: { line: 5, column: 10 }, end: { line: 5, column: 30 } },
          new Map([[5, [15, 20]]]),
          passedResult,
        ],
        [
          "In the middle",
          { start: { line: 5, column: 10 }, end: { line: 10, column: 1 } },
          new Map([[8, [5, 30]]]),
          passedResult,
        ],
        [
          "Near to the bottom boundary but inside",
          { start: { line: 5, column: 10 }, end: { line: 10, column: 8 } },
          new Map([[10, [4, 6]]]),
          passedResult,
        ],
        [
          "In the the bottom boundary",
          { start: { line: 5, column: 10 }, end: { line: 10, column: 8 } },
          new Map([[10, [8, 20]]]),
          outOfRangeResult,
        ],
        [
          "Near from the bottom boundary but outside",
          { start: { line: 5, column: 10 }, end: { line: 10, column: 1 } },
          new Map([[10, [5, 30]]]),
          outOfRangeResult,
        ],
        [
          "Far from the bottom",
          { start: { line: 5, column: 10 }, end: { line: 10, column: 1 } },
          new Map([[20, [5, 30]]]),
          outOfRangeResult,
        ],
      ];

      for (const [testCaseName, location, diff, expectedResult] of testCases) {
        test(testCaseName, () => {
          expect(checkDiff(location, diff)).toStrictEqual(expectedResult);
        });
      }
    });
  });
});
