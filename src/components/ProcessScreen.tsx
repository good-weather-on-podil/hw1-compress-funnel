import { useEffect, useRef } from "react";
import type { FileItem, Mode } from "../types";
import type { Dispatch } from "../state/useFunnel";
import { FileRow } from "./FileRow";
import { createCompressorClient, type CompressorClient } from "../worker/workerClient";

type Props = { files: FileItem[]; mode: Mode; dispatch: Dispatch };

// Module-level singleton: surviving StrictMode's mount→unmount→mount double-invoke
// matters more than tidy per-component teardown. The worker lives for the page.
let sharedClient: CompressorClient | null = null;
function getClient() {
  if (!sharedClient) sharedClient = createCompressorClient();
  return sharedClient;
}

export function ProcessScreen({ files, mode, dispatch }: Props) {
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const client = getClient();

    (async () => {
      for (const item of files) {
        try {
          const bytes = await item.file.arrayBuffer();
          dispatch({ type: "UPDATE_FILE", id: item.id, patch: { status: "processing" } });
          const result = await client.compress(item.id, bytes, mode);
          const blob = new Blob([result.bytes], { type: "application/pdf" });
          const url = URL.createObjectURL(blob);
          dispatch({
            type: "UPDATE_FILE",
            id: item.id,
            patch: {
              status: "done",
              compressedSize: result.size,
              resultUrl: url,
            },
          });
        } catch (err) {
          dispatch({
            type: "UPDATE_FILE",
            id: item.id,
            patch: {
              status: "error",
              error: err instanceof Error ? err.message : String(err),
            },
          });
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allDone = files.every((f) => f.status === "done" || f.status === "error");

  return (
    <section className="card">
      <h2>Compressing ({mode})</h2>
      <ul className="result-list">
        {files.map((f) => (
          <FileRow key={f.id} item={f} />
        ))}
      </ul>
      {allDone && (
        <div className="actions">
          <button
            className="btn-secondary"
            onClick={() => dispatch({ type: "RESET" })}
          >
            Start over
          </button>
        </div>
      )}
    </section>
  );
}
