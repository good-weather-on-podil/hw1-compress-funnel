import type { FileItem } from "../types";
import { formatBytes } from "../utils/format";

export function FileRow({ item }: { item: FileItem }) {
  return (
    <li className={`result-row result-row--${item.status}`}>
      <div className="result-row-main">
        <div className="result-row-name">{item.file.name}</div>
        <div className="result-row-meta">
          {item.status === "queued" && <span className="muted">Queued…</span>}
          {item.status === "processing" && (
            <span className="processing">
              <span className="spinner" aria-hidden="true" /> Compressing…
            </span>
          )}
          {item.status === "done" && item.compressedSize !== undefined && (
            <Saving original={item.originalSize} compressed={item.compressedSize} />
          )}
          {item.status === "error" && (
            <span className="error">Error: {item.error}</span>
          )}
        </div>
      </div>
      <div className="result-row-action">
        {item.status === "done" && item.resultUrl && (
          <a
            className="btn-primary"
            href={item.resultUrl}
            download={downloadName(item.file.name)}
          >
            Download
          </a>
        )}
      </div>
    </li>
  );
}

function Saving({ original, compressed }: { original: number; compressed: number }) {
  const saved = original - compressed;
  const pct = original > 0 ? Math.round((saved / original) * 100) : 0;
  return (
    <span className="saving">
      {formatBytes(original)} → <strong>{formatBytes(compressed)}</strong>{" "}
      <span className={saved >= 0 ? "saved" : "grew"}>
        ({saved >= 0 ? "−" : "+"}
        {Math.abs(pct)}%)
      </span>
    </span>
  );
}

function downloadName(name: string) {
  const dot = name.lastIndexOf(".");
  if (dot <= 0) return `${name}-compressed.pdf`;
  return `${name.slice(0, dot)}-compressed${name.slice(dot)}`;
}
