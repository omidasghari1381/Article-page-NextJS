import fs from "fs/promises";
import path from "path";

const BASE = path.join(process.cwd(), "public", "i18n");

export async function writeJsonAtomically(fileName: string, data: unknown) {
  await fs.mkdir(BASE, { recursive: true });
  const tmp = path.join(BASE, `${fileName}.tmp`);
  const final = path.join(BASE, fileName);
  await fs.writeFile(tmp, JSON.stringify(data, null, 0), "utf8");
  await fs.rename(tmp, final);
  return final;
}