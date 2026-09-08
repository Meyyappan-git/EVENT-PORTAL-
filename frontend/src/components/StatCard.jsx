import { useRef, useCallback } from "react";
import "./RippleStatCard.css";

const accentClasses = {
  cyan: "bg-cyan-400/15 text-cyan-200 ring-1 ring-inset ring-cyan-300/30",
  violet: "bg-violet-400/15 text-violet-200 ring-1 ring-inset ring-violet-300/30",
  rose: "bg-rose-400/15 text-rose-200 ring-1 ring-inset ring-rose-300/30",
};

export default function RippleStatCard({
  label,
  value,
  accent = "cyan",
}) {
  const layerRef = useRef(null);
  const lastSpawn = useRef(0);

  const spawnRipple = useCallback((x, y, isBurst) => {
    const layer = layerRef.current;
    if (!layer) return;
    const span = document.createElement("span");
    span.className = isBurst ? "ripple ripple--burst" : "ripple";
    span.style.left = `${x}px`;
    span.style.top = `${y}px`;
    span.addEventListener("animationend", () => span.remove());
    layer.appendChild(span);
  }, []);

  const handleMouseMove = useCallback(
    (e) => {
      const now = performance.now();
      if (now - lastSpawn.current < 220) return; // throttle so it reads as a trail, not noise
      lastSpawn.current = now;
      const rect = e.currentTarget.getBoundingClientRect();
      spawnRipple(e.clientX - rect.left, e.clientY - rect.top, false);
    },
    [spawnRipple]
  );

  const handleClick = useCallback(
    (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      spawnRipple(e.clientX - rect.left, e.clientY - rect.top, true);
    },
    [spawnRipple]
  );

  return (
    <div
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      className="relative [transform-style:preserve-3d] -rotate-x-12 rotate-y-12 hover:-rotate-x-6 hover:rotate-y-6 transition-all duration-300 ease-in-out isolate w-full max-w-[34rem] cursor-pointer overflow-hidden rounded-[18px] bg-[rgba(17,24,39,0.58)]
      px-6 py-6 sm:px-8 sm:py-8
      backdrop-blur-[18px] backdrop-saturate-[132%] backdrop-contrast-[128%]
      border border-white/[0.14]
      shadow-[0_20px_70px_rgba(0,0,0,0.281),inset_0_1px_0.5px_rgba(255,255,255,0.273),inset_0_2px_5px_rgba(255,255,255,0.084),inset_0_-12px_22px_rgba(0,0,0,0.053)]
      text-white"
    >
      {/* ripples get appended here directly (perf: avoids a re-render per ripple) */}
      <div
        ref={layerRef}
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[inherit]"
      />

      {/* glass highlight layers — same shapes as your original before/after pseudo-elements */}
      <span className="pointer-events-none absolute inset-0 z-[1] rounded-[inherit] backdrop-blur-[9.4px] backdrop-saturate-[132%] [mask-image:radial-gradient(ellipse_at_center,#000_0%,#000_28%,transparent_70%)] [-webkit-mask-image:radial-gradient(ellipse_at_center,#000_0%,#000_28%,transparent_70%)]" />
      <span className="pointer-events-none absolute inset-0 z-[1] rounded-[inherit] backdrop-blur-[16.9px] backdrop-saturate-[132%] [mask-image:radial-gradient(ellipse_at_center,transparent_18%,#000_48%,transparent_88%)] [-webkit-mask-image:radial-gradient(ellipse_at_center,transparent_18%,#000_48%,transparent_88%)]" />
      <span className="pointer-events-none absolute inset-0 z-[1] rounded-[inherit] backdrop-blur-[29.2px] backdrop-saturate-[132%] [mask-image:radial-gradient(ellipse_at_center,transparent_45%,#000_78%,#000_100%)] [-webkit-mask-image:radial-gradient(ellipse_at_center,transparent_45%,#000_78%,#000_100%)]" />

      <div className="pointer-events-none absolute inset-0 z-[1] rounded-[inherit] mix-blend-screen bg-[radial-gradient(120%_80%_at_0%_0%,rgba(255,255,255,0.122)_0%,transparent_42%),radial-gradient(120%_80%_at_100%_0%,rgba(255,255,255,0.091)_0%,transparent_42%),linear-gradient(155deg,rgba(255,255,255,0.160)_0%,rgba(255,255,255,0.030)_17%,transparent_46%)]" />
      <div className="pointer-events-none absolute inset-0 z-[1] rounded-[inherit] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.044)] bg-[linear-gradient(to_top,rgba(255,255,255,0.035)_0%,transparent_30%),radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.006)_0%,transparent_46%)]" />

      <div className="relative z-[3]">
        <div
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
            accentClasses[accent] || accentClasses.cyan
          }`}
        >
          {label}
        </div>
        <div className="mt-4 text-3xl font-bold">{value}</div>
      </div>
    </div>
  );
}