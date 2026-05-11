export type Step = "upload" | "mode" | "process";

export type Mode = "high" | "medium" | "low";

export type Status = "queued" | "processing" | "done" | "error";

export type FileItem = {
  id: string;
  file: File;
  status: Status;
  originalSize: number;
  compressedSize?: number;
  resultUrl?: string;
  error?: string;
};

export type AppState = {
  step: Step;
  mode: Mode | null;
  files: FileItem[];
};

export type WorkerRequest = {
  type: "compress";
  id: string;
  bytes: ArrayBuffer;
  mode: Mode;
};

export type WorkerResponse =
  | { type: "started"; id: string }
  | { type: "done"; id: string; bytes: ArrayBuffer; size: number }
  | { type: "error"; id: string; message: string };
