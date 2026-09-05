const SCRIPT_EXTENSIONS = ['md', 'txt'];

export function isScript(fileName: string): boolean {
  const dot = fileName.lastIndexOf('.');
  if (dot < 1) return false;
  const extension = fileName.slice(dot + 1).toLowerCase();
  return SCRIPT_EXTENSIONS.includes(extension);
}

export function scriptName(fileName: string): string {
  const dot = fileName.lastIndexOf('.');
  return fileName.slice(0, dot);
}
