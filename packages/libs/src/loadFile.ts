import path from "path";

export function loadFile(filePath?: string): string {
  const cwd = process.cwd();
  if (!filePath) {
    return cwd;
  }
  if (path.isAbsolute(filePath)) {
    return filePath;
  }
  return path.join(cwd, filePath);
}
