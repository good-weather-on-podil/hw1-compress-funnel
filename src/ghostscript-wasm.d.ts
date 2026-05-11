declare module "@jspawn/ghostscript-wasm" {
  const createModule: (opts?: Record<string, unknown>) => Promise<unknown>;
  export default createModule;
}

declare module "@jspawn/ghostscript-wasm/gs.wasm?url" {
  const url: string;
  export default url;
}

declare module "@jspawn/ghostscript-wasm/gs.js?url" {
  const url: string;
  export default url;
}
