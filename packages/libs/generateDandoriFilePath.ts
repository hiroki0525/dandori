import path from "path";

export function generateDandoriFilePath(filePath?: string): string {
  const initCwd = process.env.INIT_CWD as string;
  if (!filePath) {
    return initCwd;
  }
  if (path.isAbsolute(filePath)) {
    return filePath;
  }
  return path.join(initCwd, filePath);
}
