import { useRef, useState } from "react";
import type { FileItem } from "../types";
import type { Dispatch } from "../state/useFunnel";
import { formatBytes } from "../utils/format";

type Props = { files: FileItem[]; dispatch: Dispatch };

export function UploadScreen({ files, dispatch }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  function acceptFiles(list: FileList | File[]) {
    const pdfs = Array.from(list).filter(
      (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"),
    );
    if (pdfs.length === 0) return;
    dispatch({ type: "ADD_FILES", files: pdfs });
  }

  return (
    <section className="card">
      <h2>Upload PDF files</h2>
      <div
        className={`dropzone ${dragOver ? "dropzone--over" : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          acceptFiles(e.dataTransfer.files);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="application/pdf,.pdf"
          hidden
          onChange={(e) => {
            if (e.target.files) acceptFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <p className="dropzone-title">Drop PDFs here or click to browse</p>
        <p className="dropzone-hint">You can add multiple files</p>
      </div>

      {files.length > 0 && (
        <ul className="file-list">
          {files.map((f) => (
            <li key={f.id} className="file-list-row">
              <div className="file-list-meta">
                <span className="file-list-name">{f.file.name}</span>
                <span className="file-list-size">{formatBytes(f.originalSize)}</span>
              </div>
              <button
                className="btn-text"
                onClick={() => dispatch({ type: "REMOVE_FILE", id: f.id })}
                aria-label={`Remove ${f.file.name}`}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="actions">
        <button
          className="btn-primary"
          disabled={files.length === 0}
          onClick={() => dispatch({ type: "GOTO", step: "mode" })}
        >
          Continue ({files.length} {files.length === 1 ? "file" : "files"})
        </button>
      </div>
    </section>
  );
}
