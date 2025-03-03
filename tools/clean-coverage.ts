import { walk } from "$std/fs/mod.ts";

async function cleanNpmCoverage() {
  const coverageDir = new URL("../coverage", import.meta.url);
  
  for await (const entry of walk(coverageDir, { exts: [".json"] })) {
    if (entry.isFile) {
      const content = await Deno.readTextFile(entry.path);
      
      try {
        const coverage = JSON.parse(content);
        // Check if the url in the coverage file is npm-related
        const hasNpmFiles = coverage?.url?.includes("/npm/") || coverage?.url?.includes("\\npm\\");

        if (hasNpmFiles) {
          await Deno.remove(entry.path);
        }
      } catch {
        // Ignore
      }
    }
  }
}

if (import.meta.main) {
  cleanNpmCoverage().catch(console.error);
}