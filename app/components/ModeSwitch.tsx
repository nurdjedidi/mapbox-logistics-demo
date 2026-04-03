import type { DemoMode } from "~/hooks/useDemoMode";

interface ModeSwitchProps {
  mode: DemoMode;
  onSwitch: (m: DemoMode) => void;
}

export default function ModeSwitch({ mode, onSwitch }: ModeSwitchProps) {
  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] sm:bottom-6"
      style={{
        background: "rgba(2,6,23,0.9)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: "9999px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)",
        padding: "4px",
      }}
    >
      <div className="flex items-center gap-0.5">
        <ModeButton active={mode === "mediterranee"} onClick={() => onSwitch("mediterranee")} label="Méditerranée" flag="🇲🇦" />
        <ModeButton active={mode === "comores"} onClick={() => onSwitch("comores")} label="Comores" flag="🇰🇲" />
        <ModeButton active={mode === "malacca"} onClick={() => onSwitch("malacca")} label="Malacca" flag="🇲🇾" />
      </div>
    </div>
  );
}

function ModeButton({ active, onClick, label, flag }: {
  active: boolean;
  onClick: () => void;
  label: string;
  flag: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer touch-manipulation"
      style={{
        background: active
          ? "linear-gradient(135deg, rgba(37,99,235,0.5), rgba(29,78,216,0.3))"
          : "transparent",
        color: active ? "#bfdbfe" : "#94a3b8",
        border: active ? "1px solid rgba(96,165,250,0.4)" : "1px solid transparent",
        borderRadius: "9999px",
        boxShadow: active ? "0 0 16px rgba(37,99,235,0.25)" : "none",
        minHeight: "36px",
      }}
    >
      <span className="text-base sm:text-lg leading-none">{flag}</span>
      <span className="text-[11px] sm:text-sm leading-none whitespace-nowrap">{label}</span>
    </button>
  );
}
