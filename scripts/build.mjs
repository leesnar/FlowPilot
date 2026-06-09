import { cp, mkdir, rm, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const dist = join(root, "dist");

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp(join(root, "src"), join(dist, "src"), { recursive: true });
await cp(join(root, "worker"), join(dist, "worker"), { recursive: true });
await cp(join(root, "migrations"), join(dist, "migrations"), { recursive: true });
await cp(join(root, "index.html"), join(dist, "index.html"));
await cp(join(root, "index.html"), join(dist, "404.html"));
await writeFile(
  join(dist, "index.js"),
  [
    "import worker from \"./worker/index.js\";",
    "",
    "export default worker;",
    ""
  ].join("\n")
);

const builtIndex = await stat(join(dist, "index.html"));
if (!builtIndex.isFile()) {
  throw new Error("Build failed: dist/index.html was not created.");
}

const serverEntrypoint = await stat(join(dist, "index.js"));
if (!serverEntrypoint.isFile()) {
  throw new Error("Build failed: dist/index.js was not created.");
}

console.log("FlowPilot build completed in dist/.");
