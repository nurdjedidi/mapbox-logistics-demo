import type { DemoMode } from "~/hooks/useDemoMode";

interface ModeSwitchProps {
  mode: DemoMode;
  onSwitch: (m: DemoMode) => void;
}

export default function ModeSwitch({ mode, onSwitch }: ModeSwitchProps) {
  return (
    <div
      className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-0.5 p-1 sm:bottom-6 sm:p-0.5"
      style={{
        background: "rgba(2,6,23,0.85)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.6)",
      }}
    >
      <ModeButton active={mode === "mediterranee"} onClick={() => onSwitch("mediterranee")} label="Méditerranée" flag="🇲🇦" />
      <ModeButton active={mode === "comores"} onClick={() => onSwitch("comores")} label="Comores" flag="🇰🇲" />
      <ModeButton active={mode === "malacca"} onClick={() => onSwitch("malacca")} label="Malacca" flag="🇸🇬" />
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
      className="flex items-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer min-h-[36px]"
      style={{
        background: active
          ? "linear-gradient(135deg, rgba(37,99,235,0.4), rgba(29,78,216,0.25))"
          : "transparent",
        color: active ? "#93c5fd" : "#64748b",
        border: active ? "1px solid rgba(59,130,246,0.3)" : "1px solid transparent",
        boxShadow: active ? "0 0 12px rgba(37,99,235,0.15)" : "none",
      }}
    >
      <span className="text-sm sm:text-base">{flag}</span>
      <span className="inline max-sm:text-[10px]">{label}</span>
    </button>
  );
}
