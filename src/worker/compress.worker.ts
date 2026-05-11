/// <reference lib="webworker" />
import gsScriptUrl from "@jspawn/ghostscript-wasm/gs.js?url";
import gsWasmUrl from "@jspawn/ghostscript-wasm/gs.wasm?url";
import type { Mode, WorkerRequest, WorkerResponse } from "../types";

declare const self: DedicatedWorkerGlobalScope & { Module?: GsFactory };

const MODE_PRESET: Record<Mode, string> = {
  high: "/screen",
  medium: "/ebook",
  low: "/printer",
};

type GsModule = {
  FS: {
    writeFile: (path: string, data: Uint8Array) => void;
    readFile: (path: string) => Uint8Array;
    unlink: (path: string) => void;
  };
  callMain: (args: string[]) => number;
};

type GsFactory = (opts: { locateFile: (path: string) => string }) => Promise<GsModule>;

let modulePromise: Promise<GsModule> | null = null;

async function loadFactory(): Promise<GsFactory> {
  if (self.Module) return self.Module;
  // gs.js is a UMD bundle. Loading via Vite's ?url + indirect eval runs the
  // script in the worker's global scope so its top-level `var Module = ...`
  // becomes `self.Module`. This avoids Vite/Rollup's CJS interop, which would
  // otherwise take the `module.exports = Module` branch and the global is
  // never set — the bug behind "createModule is not defined" in production.
  const text = await (await fetch(gsScriptUrl)).text();
  (0, eval)(text);
  if (!self.Module) throw new Error("Failed to load Ghostscript module factory.");
  return self.Module;
}

function getModule(): Promise<GsModule> {
  if (!modulePromise) {
    modulePromise = loadFactory().then((factory) =>
      factory({
        locateFile: (path: string) =>
          path.endsWith(".wasm") ? gsWasmUrl : path,
      }),
    );
  }
  return modulePromise;
}

function post(msg: WorkerResponse, transfer: Transferable[] = []) {
  self.postMessage(msg, transfer);
}

async function handleCompress(req: WorkerRequest) {
  post({ type: "started", id: req.id });

  const mod = await getModule();
  const preset = MODE_PRESET[req.mode];
  const inPath = `/in-${req.id}.pdf`;
  const outPath = `/out-${req.id}.pdf`;

  try {
    mod.FS.writeFile(inPath, new Uint8Array(req.bytes));

    const status = mod.callMain([
      "-q",
      "-dNOPAUSE",
      "-dBATCH",
      "-dSAFER",
      "-sDEVICE=pdfwrite",
      "-dCompatibilityLevel=1.4",
      `-dPDFSETTINGS=${preset}`,
      `-sOutputFile=${outPath}`,
      inPath,
    ]);

    if (status !== 0) {
      throw new Error(`Ghostscript exited with status ${status}. The PDF may be invalid or password-protected.`);
    }

    let out: Uint8Array;
    try {
      out = mod.FS.readFile(outPath);
    } catch {
      throw new Error("Compression produced no output. The PDF may be invalid or encrypted.");
    }
    // Copy into a fresh ArrayBuffer so we can transfer it without affecting Emscripten's heap.
    const buffer = new ArrayBuffer(out.byteLength);
    new Uint8Array(buffer).set(out);

    post({ type: "done", id: req.id, bytes: buffer, size: buffer.byteLength }, [buffer]);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    post({ type: "error", id: req.id, message });
  } finally {
    try { mod.FS.unlink(inPath); } catch { /* ignore */ }
    try { mod.FS.unlink(outPath); } catch { /* ignore */ }
  }
}

self.onmessage = (e: MessageEvent<WorkerRequest>) => {
  if (e.data?.type === "compress") {
    void handleCompress(e.data);
  }
};
