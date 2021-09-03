import { compareLine, parseChunk, parseDiffs } from "@/helpers/diff-parser";
import {
  INVALID_CHUNK,
  VALID_CHUNK,
  GIT_DIFF_STDOUT,
} from "@tests/mocks/git-diff-outputs";

describe("Git parsing utils", () => {
  describe("compareLine", () => {
    test("Equal lines", () => {
      const deleted = "const fn = () => console.log('FOO');";
      const added = "const fn = () => console.log('FOO');";

      const result = compareLine(deleted, added);

      expect(result).toBe(undefined);
    });

    test("Inner range", () => {
      const deleted = "const fn = () => console.log('FOO');";
      const added = "const fn = () => console.log('BARBAZ');";

      const result = compareLine(deleted, added);

      expect(result).toStrictEqual([31, 37]);
    });

    test("Right range", () => {
      const deleted = "const fn = () => console.log('FOO');";
      const added = "const fn = () => console.log('FOO'); // some comment";

      const result = compareLine(deleted, added);

      expect(result).toStrictEqual([deleted.length + 1, deleted.length + 17]);
    });

    test("Left range", () => {
      const deleted = "const fn = () => console.log('FOO');";
      const added = "/* some comment */ const fn = () => console.log('FOO');";

      const result = compareLine(deleted, added);

      expect(result).toStrictEqual([1, 20]);
    });

    test("New line", () => {
      const deleted = undefined;
      const added = "const fn = () => console.log('FOO');";

      const result = compareLine(deleted, added);

      expect(result).toStrictEqual([1, added.length + 1]);
    });

    test("Empty line", () => {
      const deleted = "const fn = () => console.log('FOO');";
      const added = "";

      const result = compareLine(deleted, added);

      expect(result).toStrictEqual(undefined);
    });

    test("Very different lines", () => {
      const deleted = "const fn = () => console.log('FOO');";
      const added = "let a = 0";

      const result = compareLine(deleted, added);

      expect(result).toStrictEqual([1, added.length + 1]);
    });
  });

  describe("parseChunk", () => {
    test("Valid chunk", () => {
      const rangeMap = parseChunk(VALID_CHUNK, 12);

      expect(rangeMap.find(([n]) => n === 12)).toBe(undefined);
      expect(rangeMap.find(([n]) => n === 13)).toBe(undefined);
      expect(rangeMap.find(([n]) => n === 14)).toBe(undefined);
      expect(rangeMap.find(([n]) => n === 15)).toStrictEqual([15, [11, 33]]);
      expect(rangeMap.find(([n]) => n === 16)).toBe(undefined);
      expect(rangeMap.find(([n]) => n === 17)).toBe(undefined);
      expect(rangeMap.find(([n]) => n === 18)).toStrictEqual([18, [37, 38]]);
      expect(rangeMap.find(([n]) => n === 19)).toStrictEqual([19, [1, 29]]);
      expect(rangeMap.find(([n]) => n === 20)).toBe(undefined);
      expect(rangeMap.find(([n]) => n === 21)).toBe(undefined);
    });

    test("Invalid chunk", () => {
      expect(() => {
        parseChunk(INVALID_CHUNK, 12);
      }).toThrow('Unexpected chunk prefix = "');
    });
  });

  describe("parseDiffs", () => {
    test("Should parse the `git diff` command correctly", () => {
      const parsed = parseDiffs(GIT_DIFF_STDOUT);

      const file1 = parsed.get("src/git-checker.ts");
      expect(file1).not.toBe(undefined);
      const file2 = parsed.get("tests/unit/helpers/diff-parser.spec.ts");
      expect(file2).not.toBe(undefined);
      expect([...parsed.entries()].length).toBe(2);

      const file1Line74 = file1?.get(74);
      expect(file1Line74).toStrictEqual([29, 89]);

      const file2Line4 = file2?.get(4);
      expect(file2Line4).toStrictEqual([14, 28]);
      const file2Lines92to95 = [92, 93, 94, 95].map((p) => file2?.get(p));
      expect(file2Lines92to95).toStrictEqual([
        [1, 3],
        [1, 33],
        undefined,
        [1, 6],
      ]);
    });
  });
});
