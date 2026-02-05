interface StatBoxProps {
  label: string;
  value: string | number;
  subValue?: string | number;
  subValueColor?: "indigo" | "red" | "default";
  variant?: "default" | "large" | "accent";
  className?: string;
}

export function StatBox({
  label,
  value,
  subValue,
  subValueColor = "default",
  variant = "default",
  className = "",
}: StatBoxProps) {
  const colorClasses = {
    indigo: "text-indigo-600",
    red: "text-red-500",
    default: "text-slate-400",
  };

  if (variant === "accent") {
    return (
      <div
        className={`bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 text-center min-w-[70px] ${className}`}
      >
        <span className="block text-xl font-black text-indigo-600">
          {value}
        </span>
        <span className="text-[10px] text-indigo-400 uppercase font-black tracking-tighter">
          {label}
        </span>
      </div>
    );
  }

  if (variant === "large") {
    return (
      <div
        className={`bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 text-center min-w-[70px] ${className}`}
      >
        <span className="block text-xl font-black text-slate-800">{value}</span>
        <span className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">
          {label}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`text-center p-2 bg-slate-50 rounded-xl border border-slate-100 ${className}`}
    >
      <span className="block text-[8px] font-black uppercase text-slate-400 tracking-tighter leading-tight mb-0.5">
        {label}
      </span>
      <span className="block text-sm font-black text-slate-800 leading-none mb-0.5">
        {value}
      </span>
      {subValue !== undefined && (
        <span
          className={`text-[10px] font-bold leading-none ${colorClasses[subValueColor]}`}
        >
          {subValue}
        </span>
      )}
    </div>
  );
}
