import { Logger } from "@stryker-mutator/api/logging";

export enum ChunkLinePrefix {
  UNCHANGED = " ",
  ADDITION = "+",
  DELETION = "-",
}
export type LineDifferenceRange = [number, number];
export type DiffMap = Map<string, Map<number, LineDifferenceRange>>;

export default class DiffParser {
  constructor(private readonly logger: Logger) {}

  public static compareLine(
    deleted: string | undefined,
    added: string
  ): LineDifferenceRange | undefined {
    if (!added || deleted === added) {
      return undefined;
    }

    const range: LineDifferenceRange = [0, added.length - 1];

    if (deleted) {
      let deletedRight = deleted.length - 1;

      while (deleted[range[0]] === added[range[0]]) {
        range[0]++;

        if (!added[range[0]]) return undefined;
      }

      while (deleted[deletedRight] === added[range[1]]) {
        range[1]--;
        deletedRight--;
      }
    }

    return range;
  }

  public parseChunk(
    chunk: string,
    startLinePosition: number
  ): Map<number, LineDifferenceRange> {
    const addedLines = new Map<number, string>();
    const deletedLines = new Map<number, string>();
    const rangeMap = new Map<number, LineDifferenceRange>();

    let currentPosition = startLinePosition;

    for (const rawLine of chunk.split("\n")) {
      const prefix = rawLine[0];
      const content = rawLine.slice(1);

      switch (prefix) {
        case ChunkLinePrefix.UNCHANGED:
          currentPosition++;
          break;
        case ChunkLinePrefix.ADDITION:
          addedLines.set(currentPosition, content);
          currentPosition++;
          break;
        case ChunkLinePrefix.DELETION:
          deletedLines.set(currentPosition, content);
          break;
        default:
          const errorMessage = `Unexpected chunk prefix = ${prefix}`;
          this.logger.error(errorMessage);
          throw errorMessage;
      }
    }

    for (const [linePosition, addedLine] of addedLines) {
      const range = DiffParser.compareLine(
        deletedLines.get(linePosition),
        addedLine
      );

      if (range) rangeMap.set(linePosition, range);
    }

    return rangeMap;
  }
}
