import { useFunnel } from "./state/useFunnel";
import { UploadScreen } from "./components/UploadScreen";
import { ModeScreen } from "./components/ModeScreen";
import { ProcessScreen } from "./components/ProcessScreen";

export default function App() {
  const { state, dispatch } = useFunnel();

  return (
    <div className="app">
      <header className="app-header">
        <h1>PDF Compressor</h1>
        <p className="subtitle">All compression runs in your browser. No uploads.</p>
      </header>
      <main className="app-main">
        {state.step === "upload" && (
          <UploadScreen files={state.files} dispatch={dispatch} />
        )}
        {state.step === "mode" && (
          <ModeScreen mode={state.mode} dispatch={dispatch} />
        )}
        {state.step === "process" && state.mode && (
          <ProcessScreen
            files={state.files}
            mode={state.mode}
            dispatch={dispatch}
          />
        )}
      </main>
    </div>
  );
}
