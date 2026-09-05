export type Locus =
  | { kind: 'file'; line: number }
  | { kind: 'library'; path: string };

export type Finding = {
  locus: Locus;
  message: string;
};

export function fileFinding(line: number, message: string): Finding {
  const locus: Locus = { kind: 'file', line };
  return { locus, message };
}

export function libraryFinding(path: string, message: string): Finding {
  const locus: Locus = { kind: 'library', path };
  return { locus, message };
}
