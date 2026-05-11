import { useReducer } from "react";
import type { AppState, FileItem, Mode, Step } from "../types";

type Action =
  | { type: "ADD_FILES"; files: File[] }
  | { type: "REMOVE_FILE"; id: string }
  | { type: "SET_MODE"; mode: Mode }
  | { type: "GOTO"; step: Step }
  | { type: "UPDATE_FILE"; id: string; patch: Partial<FileItem> }
  | { type: "RESET" };

const initialState: AppState = {
  step: "upload",
  mode: null,
  files: [],
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "ADD_FILES": {
      const added: FileItem[] = action.files.map((file) => ({
        id: crypto.randomUUID(),
        file,
        status: "queued",
        originalSize: file.size,
      }));
      return { ...state, files: [...state.files, ...added] };
    }
    case "REMOVE_FILE":
      return { ...state, files: state.files.filter((f) => f.id !== action.id) };
    case "SET_MODE":
      return { ...state, mode: action.mode };
    case "GOTO":
      return { ...state, step: action.step };
    case "UPDATE_FILE":
      return {
        ...state,
        files: state.files.map((f) =>
          f.id === action.id ? { ...f, ...action.patch } : f,
        ),
      };
    case "RESET":
      return initialState;
  }
}

export function useFunnel() {
  const [state, dispatch] = useReducer(reducer, initialState);
  return { state, dispatch };
}

export type Dispatch = ReturnType<typeof useFunnel>["dispatch"];
