import { compareLine, parseChunk } from "@/helpers/diff-parser";
import { INVALID_CHUNK, VALID_CHUNK } from "@tests/mocks/chunks";

describe("GitParser", () => {
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
});
