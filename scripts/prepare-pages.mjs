import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const outputDirectory = path.resolve("dist/client");
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "/pizza-ratto";

async function rewriteGeneratedPaths(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const filePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      await rewriteGeneratedPaths(filePath);
      continue;
    }

    if (!/\.(?:html|rsc)$/.test(entry.name)) continue;

    const source = await readFile(filePath, "utf8");
    const rewritten = source.replaceAll(
      "/assets/_vinext_fonts/",
      `${basePath}/assets/_vinext_fonts/`,
    );

    if (rewritten !== source) await writeFile(filePath, rewritten);
  }
}

await rewriteGeneratedPaths(outputDirectory);
await writeFile(path.join(outputDirectory, ".nojekyll"), "");
