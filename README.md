# PDF Compressor

A frontend-only PDF compression web app. Nothing leaves your browser — Ghostscript is compiled to WebAssembly and runs entirely client-side in a Web Worker.

## How it works

1. **Upload** one or more PDF files (drag-and-drop or file picker).
2. **Pick a compression mode**:
   - **High** — maximum size reduction (`/screen`, 72 dpi images, best for screen viewing)
   - **Medium** — balanced (`/ebook`, 150 dpi, good for most documents)
   - **Low** — light compression (`/printer`, 300 dpi, preserves print quality)
3. **Each file is processed independently** in a Web Worker. A spinner shows progress per file. When a file finishes you get a download link with the original → compressed size diff. If a file fails (corrupt, encrypted, etc.) the error is shown inline next to that file — other files keep processing.

## Tech stack

- **Vite + React 18 + TypeScript**
- **[`@jspawn/ghostscript-wasm`](https://www.npmjs.com/package/@jspawn/ghostscript-wasm)** — Ghostscript compiled to WebAssembly (~16 MB). Real production-grade PDF compression, not just metadata stripping.
- **Web Worker** for compression so the main thread stays responsive.
- Plain CSS — no UI framework.

## Architecture

```
src/
├── App.tsx                 — step machine: 'upload' | 'mode' | 'process'
├── state/useFunnel.ts      — useReducer (step, mode, files[])
├── components/
│   ├── UploadScreen.tsx    — multi-file picker + drag-drop
│   ├── ModeScreen.tsx      — three mode cards
│   ├── ProcessScreen.tsx   — kicks off the worker, renders results
│   └── FileRow.tsx         — per-file row: spinner / error / download
└── worker/
    ├── compress.worker.ts  — loads Ghostscript WASM, runs the compression
    └── workerClient.ts     — promise-based wrapper around postMessage
```

Files are processed sequentially in a single long-lived worker (Ghostscript's WASM heap is large; parallel compression risks OOM).

## Running locally

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

Production build:

```bash
npm run build
npm run preview
```

## Notes

- The first compression in a session takes a few seconds longer — the 16 MB `gs.wasm` has to download and instantiate. Subsequent compressions reuse the loaded module.
- `vite.config.ts` sets `Cross-Origin-Opener-Policy` and `Cross-Origin-Embedder-Policy` headers so the Emscripten runtime can use `SharedArrayBuffer` if needed.
- The WASM path is resolved via `locateFile` using Vite's `?url` asset import — necessary because Emscripten can't auto-locate `gs.wasm` from an ES-module Worker context.

## License

Ghostscript is AGPL-3.0; this app inherits that license.
