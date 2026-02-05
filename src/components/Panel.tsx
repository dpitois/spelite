import type { ComponentChildren } from "preact";

interface PanelProps {
  title?: ComponentChildren;
  addon?: ComponentChildren;
  children: ComponentChildren;
  className?: string;
  contentClassName?: string;
  padding?: "none" | "medium";
  titleVariant?: "default" | "large";
}

export function Panel({
  title,
  addon,
  children,
  className = "",
  contentClassName = "",
  padding = "medium",
  titleVariant = "default",
}: PanelProps) {
  const paddingClasses = {
    none: "p-0",
    medium: "p-4",
  };

  const titleClasses =
    titleVariant === "large"
      ? "text-3xl font-black text-slate-800 tracking-tight"
      : "text-xs font-black uppercase text-slate-400 tracking-widest";

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden ${className}`}
    >
      {(title || addon) && (
        <div
          className={`p-4 flex justify-between items-center ${children && titleVariant === "large" ? "mb-2" : ""}`}
        >
          {title && <h3 className={titleClasses}>{title}</h3>}
          {addon && <div className="flex items-center gap-2">{addon}</div>}
        </div>
      )}
      <div
        className={`${paddingClasses[padding]} ${title || addon ? "pt-0" : ""} ${contentClassName}`}
      >
        {children}
      </div>
    </div>
  );
}
