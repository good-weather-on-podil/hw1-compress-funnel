import type { Mode } from "../types";
import type { Dispatch } from "../state/useFunnel";

type Props = { mode: Mode | null; dispatch: Dispatch };

const OPTIONS: { value: Mode; title: string; desc: string }[] = [
  {
    value: "high",
    title: "High",
    desc: "Maximum size reduction. 72 dpi images. Best for screen viewing.",
  },
  {
    value: "medium",
    title: "Medium",
    desc: "Balanced compression. 150 dpi images. Good for most documents.",
  },
  {
    value: "low",
    title: "Low",
    desc: "Light compression. 300 dpi images. Preserves quality for print.",
  },
];

export function ModeScreen({ mode, dispatch }: Props) {
  return (
    <section className="card">
      <h2>Choose compression mode</h2>
      <div className="mode-grid">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            className={`mode-card ${mode === opt.value ? "mode-card--selected" : ""}`}
            onClick={() => dispatch({ type: "SET_MODE", mode: opt.value })}
          >
            <span className="mode-card-title">{opt.title}</span>
            <span className="mode-card-desc">{opt.desc}</span>
          </button>
        ))}
      </div>
      <div className="actions">
        <button
          className="btn-secondary"
          onClick={() => dispatch({ type: "GOTO", step: "upload" })}
        >
          Back
        </button>
        <button
          className="btn-primary"
          disabled={mode === null}
          onClick={() => dispatch({ type: "GOTO", step: "process" })}
        >
          Start compression
        </button>
      </div>
    </section>
  );
}
