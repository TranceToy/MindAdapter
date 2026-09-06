// The way in for a browser without the picker: a folder upload, which hands
// over the whole tree at once and remembers nothing once the launch is over.
export function pickLibraryFiles(): Promise<File[] | null> {
  return new Promise((resolve) => {
    const input = folderInput();
    const settle = (picked: File[] | null) => {
      input.remove();
      resolve(picked);
    };
    input.addEventListener('change', () => settle([...(input.files ?? [])]));
    input.addEventListener('cancel', () => settle(null));
    document.body.append(input);
    input.click();
  });
}

function folderInput(): HTMLInputElement {
  const input = document.createElement('input');
  input.type = 'file';
  input.webkitdirectory = true;
  input.multiple = true;
  input.hidden = true;
  return input;
}
