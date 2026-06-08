import http from "node:http";
import { createReadStream, existsSync } from "node:fs";
import { stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const port = Number(process.env.PORT || 4173);
const root = process.cwd();

const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg"
};

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const normalized = normalize(decoded).replace(/^(\.\.[/\\])+/, "");
  return join(root, normalized === "/" ? "index.html" : normalized);
}

const server = http.createServer(async (req, res) => {
  const urlPath = new URL(req.url || "/", `http://localhost:${port}`).pathname;
  let filePath = safePath(urlPath);

  try {
    const fileStat = await stat(filePath);
    if (fileStat.isDirectory()) {
      filePath = join(filePath, "index.html");
    }
  } catch {
    filePath = join(root, "index.html");
  }

  if (!existsSync(filePath)) {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }

  res.writeHead(200, { "content-type": mime[extname(filePath)] || "application/octet-stream" });
  createReadStream(filePath).pipe(res);
});

server.listen(port, () => {
  console.log(`FlowPilot dev server running at http://localhost:${port}`);
});
