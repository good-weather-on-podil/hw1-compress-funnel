import type { Mode, WorkerRequest, WorkerResponse } from "../types";

export type CompressResult = { bytes: ArrayBuffer; size: number };

export type CompressorClient = {
  compress: (id: string, bytes: ArrayBuffer, mode: Mode) => Promise<CompressResult>;
  terminate: () => void;
};

export function createCompressorClient(): CompressorClient {
  const worker = new Worker(
    new URL("./compress.worker.ts", import.meta.url),
    { type: "module" },
  );

  const pending = new Map<
    string,
    { resolve: (r: CompressResult) => void; reject: (e: Error) => void }
  >();

  worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
    const msg = e.data;
    const entry = pending.get(msg.id);
    if (!entry) return;
    if (msg.type === "done") {
      pending.delete(msg.id);
      entry.resolve({ bytes: msg.bytes, size: msg.size });
    } else if (msg.type === "error") {
      pending.delete(msg.id);
      entry.reject(new Error(msg.message));
    }
    // 'started' is informational; ignore here.
  };

  worker.onerror = (e) => {
    // Fail every outstanding request so the UI doesn't hang.
    const err = new Error(e.message || "Worker crashed");
    for (const [, entry] of pending) entry.reject(err);
    pending.clear();
  };

  return {
    compress(id, bytes, mode) {
      return new Promise<CompressResult>((resolve, reject) => {
        pending.set(id, { resolve, reject });
        const req: WorkerRequest = { type: "compress", id, bytes, mode };
        worker.postMessage(req, [bytes]);
      });
    },
    terminate() {
      worker.terminate();
      pending.clear();
    },
  };
}
