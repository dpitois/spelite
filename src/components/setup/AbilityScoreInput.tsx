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
    <div className="bg-slate-50 p-4 rounded-xl border-2 border-slate-100 focus-within:border-indigo-500 transition-all">
      <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest text-center">
        {label}
      </label>
      <input
        type="number"
        value={score}
        onChange={(e) => onChange(parseInt(e.currentTarget.value) || 0)}
        className="w-full bg-transparent text-center text-xl font-black text-slate-800 outline-none"
      />
      <div
        className={`text-center text-xs font-bold mt-1 ${modifier >= 0 ? "text-indigo-600" : "text-red-500"}`}
      >
        {modifier >= 0 ? `+${modifier}` : modifier}
      </div>
    </div>
  );
}
