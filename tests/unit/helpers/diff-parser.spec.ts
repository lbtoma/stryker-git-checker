import DiffParser from "@/helpers/diff-parser";
import { Logger } from "@stryker-mutator/api/logging";
import { INVALID_CHUNK, VALID_CHUNK } from "@tests/mocks/chunks";

describe("GitParser", () => {
  describe("compareLine", () => {
    test("Equal lines", () => {
      const deleted = "const fn = () => console.log('FOO');";
      const added = "const fn = () => console.log('FOO');";

      const result = DiffParser.compareLine(deleted, added);

      expect(result).toBe(undefined);
    });

    test("Inner range", () => {
      const deleted = "const fn = () => console.log('FOO');";
      const added = "const fn = () => console.log('BARBAZ');";

      const result = DiffParser.compareLine(deleted, added);

      expect(result).toStrictEqual([30, 35]);
    });

    test("Right range", () => {
      const deleted = "const fn = () => console.log('FOO');";
      const added = "const fn = () => console.log('FOO'); // some comment";

      const result = DiffParser.compareLine(deleted, added);

      expect(result).toStrictEqual([deleted.length, deleted.length + 15]);
    });

    test("Left range", () => {
      const deleted = "const fn = () => console.log('FOO');";
      const added = "/* some comment */ const fn = () => console.log('FOO');";

      const result = DiffParser.compareLine(deleted, added);

      expect(result).toStrictEqual([0, 18]);
    });

    test("New line", () => {
      const deleted = undefined;
      const added = "const fn = () => console.log('FOO');";

      const result = DiffParser.compareLine(deleted, added);

      expect(result).toStrictEqual([0, added.length - 1]);
    });

    test("Empty line", () => {
      const deleted = "const fn = () => console.log('FOO');";
      const added = "";

      const result = DiffParser.compareLine(deleted, added);

      expect(result).toStrictEqual(undefined);
    });

    test("Very different lines", () => {
      const deleted = "const fn = () => console.log('FOO');";
      const added = "let a = 0";

      const result = DiffParser.compareLine(deleted, added);

      expect(result).toStrictEqual([0, added.length - 1]);
    });
  });

  describe("parseChunk", () => {
    test("Valid chunk", () => {
      const parser = new DiffParser({ error: () => {} } as unknown as Logger);

      const rangeMap = parser.parseChunk(VALID_CHUNK, 12);

      expect(rangeMap.get(12)).toBe(undefined);
      expect(rangeMap.get(13)).toBe(undefined);
      expect(rangeMap.get(14)).toBe(undefined);
      expect(rangeMap.get(15)).toStrictEqual([10, 31]);
      expect(rangeMap.get(16)).toBe(undefined);
      expect(rangeMap.get(17)).toBe(undefined);
      expect(rangeMap.get(18)).toStrictEqual([36, 36]);
      expect(rangeMap.get(19)).toStrictEqual([0, 27]);
      expect(rangeMap.get(20)).toBe(undefined);
      expect(rangeMap.get(21)).toBe(undefined);
    });

    test("Invalid chunk", () => {
      const parser = new DiffParser({ error: () => {} } as unknown as Logger);

      expect(() => {
        parser.parseChunk(INVALID_CHUNK, 12);
      }).toThrow('Unexpected chunk prefix = "');
    });
  });
});
