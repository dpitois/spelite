import { calculateModifier } from "../../utils/rules";

interface AbilityScoreInputProps {
  label: string;
  score: number;
  onChange: (value: number) => void;
}

export function AbilityScoreInput({
  label,
  score,
  onChange,
}: AbilityScoreInputProps) {
  const modifier = calculateModifier(score);

  return (
    <div className="relative bg-slate-50 p-3 rounded-2xl border-2 border-slate-100 focus-within:border-indigo-500 focus-within:bg-white transition-all overflow-hidden min-h-[90px] flex items-center justify-center">
      {/* Background/Top-Left Label */}
      <label className="absolute inset-0 flex items-start justify-start p-2 font-black uppercase text-slate-200/60 text-3xl tracking-tighter select-none pointer-events-none">
        {label}
      </label>

      <div className="relative z-10 flex items-baseline justify-center gap-2 w-full">
        {/* Score Input */}
        <input
          type="number"
          value={score}
          min="0"
          max="30"
          onChange={(e) => onChange(parseInt(e.currentTarget.value) || 0)}
          className="w-16 bg-transparent text-center text-5xl font-black text-slate-800 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none drop-shadow-sm"
        />

        {/* Modifier on the same line with white outline */}
        <div
          className={`text-2xl font-black [text-shadow:_-2px_-2px_0_#fff,_2px_-2px_0_#fff,_-2px_2px_0_#fff,_2px_2px_0_#fff] ${modifier >= 0 ? "text-indigo-500/80" : "text-red-500/80"}`}
        >
          {modifier >= 0 ? `+${modifier}` : modifier}
        </div>
      </div>
    </div>
  );
}
