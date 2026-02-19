import fs from "fs-extra";

export async function cleanup(path) {
  await fs.remove(path);
}
