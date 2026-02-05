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

  const baseClasses = `relative flex flex-col items-center justify-center rounded-2xl border overflow-hidden transition-all`;

  const variantClasses = {
    default: "bg-slate-50 border-slate-100 min-h-[90px] p-3",
    large: "bg-slate-50 border-slate-100 min-h-[100px] p-4",
    accent: "bg-indigo-50 border-indigo-100 min-h-[100px] p-4",
  };

  const labelColorClasses =
    variant === "accent" ? "text-indigo-300/60" : "text-slate-300/60";
  const valueColorClasses =
    variant === "accent" ? "text-indigo-600" : "text-slate-800";

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {/* Background Label - Top-Left Aligned and Bold */}
      <span
        className={`absolute inset-0 flex items-start justify-start p-2 font-black uppercase select-none pointer-events-none leading-none tracking-tighter transition-all ${labelColorClasses} ${
          label.length > 3 ? "text-[10px]" : "text-3xl"
        }`}
      >
        {label}
      </span>

      {/* Main Value - Centered and Massive */}
      <span
        className={`relative z-10 font-black leading-none drop-shadow-md transition-all ${valueColorClasses} ${
          variant === "default" ? "text-6xl" : "text-7xl"
        }`}
      >
        {value}
      </span>

      {/* Sub Value (Modifier) - Bottom Right and Large with White Outline */}
      {subValue !== undefined && (
        <span
          className={`absolute bottom-2 right-2.5 z-10 font-black leading-none tracking-tighter [text-shadow:_-2px_-2px_0_#fff,_2px_-2px_0_#fff,_-2px_2px_0_#fff,_2px_2px_0_#fff,_0_2px_4px_rgba(0,0,0,0.1)] ${colorClasses[subValueColor]} ${
            variant === "default" ? "text-[27px]" : "text-[32px]"
          }`}
        >
          {subValue}
        </span>
      )}
    </div>
  );
}
