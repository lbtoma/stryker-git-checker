export enum ChunkLinePrefix {
  UNCHANGED = " ",
  ADDITION = "+",
  DELETION = "-",
}
export type LineDifferenceRange = [number, number];
export type DiffMap = Map<string, Map<number, LineDifferenceRange>>;

const DIFFS_SPLIT_REGEX = new RegExp("diff\\s--git\\s.+\\n", "g");
const FILE_PATH_REGEX = new RegExp("[+]{3}\\sb\\/.+", "g");
const CHUNKS_MATCH_REGEX = new RegExp(
  "@@\\s-\\d+(,\\d+)?\\s\\+\\d+(,\\d+)\\s@@.*\\n(.|\\n(?!(@@\\s-\\d+(,?\\d+)?\\s\\+\\d+(,\\d+)\\s@@)))+",
  "gm"
);
const CHUNK_HEADER_MATCH_REGEX = new RegExp("@@[^@]+@@", "g");
const COMMA_OR_SPACE_REGEX = new RegExp("[,|\\s]", "g");
const CHUNK_HEADER_REMOVAL_REGEX = new RegExp(
  "@@\\s-\\d+(,\\d+)?\\s\\+\\d+(,\\d+)\\s@@.*\\n",
  "gm"
);

/**
 * Compares the deleted and the added line present
 * in the diff chunk, returning the range of the comparison
 * in the `[left, right]` format. The right is exclusive and
 * the left is inclusive.
 *
 * The algorithm is a simple heuristic to remove the start and
 * the end of the lines if they are respectively the same.
 *
 * @param deleted The line that was deleted in the diff.
 * @param added The line that was added in the diff.
 * @returns The difference range if exists.
 */
export function compareLine(
  deleted: string | undefined,
  added: string
): LineDifferenceRange | undefined {
  if (!added || deleted === added) {
    return undefined;
  }

  const rangeIndexes: LineDifferenceRange = [0, added.length - 1];

  if (deleted) {
    let deletedRight = deleted.length - 1;

    while (deleted[rangeIndexes[0]] === added[rangeIndexes[0]]) {
      rangeIndexes[0]++;

      if (!added[rangeIndexes[0]]) return undefined;
    }

    while (deleted[deletedRight] === added[rangeIndexes[1]]) {
      rangeIndexes[1]--;
      deletedRight--;
    }
  }

  return [rangeIndexes[0] + 1, rangeIndexes[1] + 2];
}

/**
 * Parses a diff chunk.
 *
 * @param chunk chunk string.
 * @param startLinePosition the correspondent position of the first line.
 * @returns Range entries.
 */
export function parseChunk(
  chunk: string,
  startLinePosition: number
): [number, LineDifferenceRange][] {
  const addedLines = new Map<number, string>();
  const deletedLines = new Map<number, string>();
  const rangeEntries: [number, LineDifferenceRange][] = [];

  let currentPosition = startLinePosition;

  for (const rawLine of chunk.split("\n").filter(Boolean)) {
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
        throw errorMessage;
    }
  }

  for (const [linePosition, addedLine] of addedLines) {
    const range = compareLine(deletedLines.get(linePosition), addedLine);

    if (range) rangeEntries.push([linePosition, range]);
  }

  return rangeEntries;
}

/**
 * Parses the output of the `git diff` command.
 *
 * @param input the stdout of the `git diff` command.
 * @returns The parsed `DiffMap`.
 */
export function parseDiffs(input: string): DiffMap {
  const diffMap: DiffMap = new Map();
  const diffs = input.split(DIFFS_SPLIT_REGEX).filter(Boolean);

  for (const diff of diffs) {
    const filePath = diff.match(FILE_PATH_REGEX)?.[0].slice(6)!;
    const rangeEntries: [number, LineDifferenceRange][] = [];

    const chunksWithHeader = diff.match(CHUNKS_MATCH_REGEX)!;

    for (const chunkWithHeader of chunksWithHeader) {
      const header = chunkWithHeader.match(CHUNK_HEADER_MATCH_REGEX)?.[0]!;

      const linePosition = parseInt(
        header.split("+")[1]!.split(COMMA_OR_SPACE_REGEX)[0]!
      );
      if (isNaN(linePosition)) throw "Invalid line position";

      const chunk = chunkWithHeader.replace(CHUNK_HEADER_REMOVAL_REGEX, "");

      rangeEntries.push(...parseChunk(chunk, linePosition));
    }

    diffMap.set(filePath, new Map(rangeEntries));
  }

  return diffMap;
}
