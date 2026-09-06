import { readTagList } from './declaration-values';
import { tokeniseProse } from './tokenise-prose';
import type { Word } from './tokenise-prose';

export type DeclarationEntry = {
  kind: 'declaration';
  key: string;
  value: string;
  line: number;
};

export type StrayEntry = {
  kind: 'stray';
  line: number;
};

export type BlockEntry = DeclarationEntry | StrayEntry;

export type DeclarationBlock = BlockEntry[];

export type ParsedSegment = {
  line: number;
  tags: string[];
  block: DeclarationBlock;
  words: Word[];
};

export type ParsedScript = {
  head: DeclarationBlock;
  segments: ParsedSegment[];
};

const HEADER_MARK = '#';
const KEY_MARK = ':';
const LINE_BREAK = /\r?\n/;

type Line = {
  text: string;
  number: number;
};

type SegmentLines = {
  header: Line;
  body: Line[];
};

type Sections = {
  head: Line[];
  segments: SegmentLines[];
};

export function parseScript(text: string): ParsedScript {
  const lines = numberLines(text);
  const sections = splitSections(lines);
  const head = readBlock(sections.head);
  const segments = sections.segments.map(readSegment);
  return { head, segments };
}

export function countWords(script: ParsedScript): number {
  let words = 0;
  for (const segment of script.segments) words += segment.words.length;
  return words;
}

export function allBlocks(script: ParsedScript): DeclarationBlock[] {
  const blocks = [script.head];
  for (const segment of script.segments) blocks.push(segment.block);
  return blocks;
}

function numberLines(text: string): Line[] {
  const lines: Line[] = [];
  let number = 0;
  for (const line of text.split(LINE_BREAK)) {
    number += 1;
    lines.push({ text: line, number });
  }
  return lines;
}

function splitSections(lines: Line[]): Sections {
  const head: Line[] = [];
  const segments: SegmentLines[] = [];
  let open: SegmentLines | null = null;
  for (const line of lines) {
    if (line.text.startsWith(HEADER_MARK)) {
      open = { header: line, body: [] };
      segments.push(open);
      continue;
    }
    if (open) open.body.push(line);
    else head.push(line);
  }
  return { head, segments };
}

function readSegment(section: SegmentLines): ParsedSegment {
  const tagList = section.header.text.slice(HEADER_MARK.length);
  const tags = readTagList(tagList);
  const blank = section.body.findIndex(isBlank);
  const block = readBlock(declarationLines(section.body, blank));
  const prose = joinText(proseLines(section.body, blank));
  const words = tokeniseProse(prose);
  return { line: section.header.number, tags, block, words };
}

function declarationLines(body: Line[], blank: number): Line[] {
  if (blank < 0) return body;
  return body.slice(0, blank);
}

function proseLines(body: Line[], blank: number): Line[] {
  if (blank < 0) return [];
  return body.slice(blank + 1);
}

function readBlock(lines: Line[]): DeclarationBlock {
  const block: DeclarationBlock = [];
  for (const line of lines) {
    if (isBlank(line)) continue;
    const entry = readEntry(line);
    block.push(entry);
  }
  return block;
}

function readEntry(line: Line): BlockEntry {
  const mark = line.text.indexOf(KEY_MARK);
  if (mark < 1) return { kind: 'stray', line: line.number };
  const key = line.text.slice(0, mark).trim();
  const value = line.text.slice(mark + 1).trim();
  return { kind: 'declaration', key, value, line: line.number };
}

function isBlank(line: Line): boolean {
  return line.text.trim() === '';
}

function joinText(lines: Line[]): string {
  const texts: string[] = [];
  for (const line of lines) texts.push(line.text);
  return texts.join('\n');
}
