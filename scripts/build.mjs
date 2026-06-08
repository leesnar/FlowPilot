import { cp, mkdir, rm, stat } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const dist = join(root, "dist");

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp(join(root, "src"), join(dist, "src"), { recursive: true });
await cp(join(root, "index.html"), join(dist, "index.html"));

const builtIndex = await stat(join(dist, "index.html"));
if (!builtIndex.isFile()) {
  throw new Error("Build failed: dist/index.html was not created.");
}

console.log("FlowPilot build completed in dist/.");
