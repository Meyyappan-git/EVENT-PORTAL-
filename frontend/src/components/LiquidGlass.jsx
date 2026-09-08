export default function LiquidGlass({ children, className = '' }) {
  return (
    <div class="relative isolate w-full max-w-[34rem] overflow-hidden rounded-[18px] bg-[rgba(17,24,39,0.58)]
  px-6 py-6 sm:px-8 sm:py-8
  backdrop-blur-[18px] backdrop-saturate-[132%] backdrop-contrast-[128%]
  border border-white/[0.14]
  shadow-[0_20px_70px_rgba(0,0,0,0.281),inset_0_1px_0.5px_rgba(255,255,255,0.273),inset_0_2px_5px_rgba(255,255,255,0.084),inset_0_-12px_22px_rgba(0,0,0,0.053)]
  before:content-[''] before:pointer-events-none before:absolute before:inset-0 before:z-[2] before:rounded-[inherit] before:mix-blend-screen
  before:bg-[radial-gradient(120%_80%_at_0%_0%,rgba(255,255,255,0.122)_0%,transparent_42%),radial-gradient(120%_80%_at_100%_0%,rgba(255,255,255,0.091)_0%,transparent_42%),linear-gradient(155deg,rgba(255,255,255,0.160)_0%,rgba(255,255,255,0.030)_17%,transparent_46%)]
  after:content-[''] after:pointer-events-none after:absolute after:inset-0 after:z-[2] after:rounded-[inherit]
  after:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.044)]
  after:bg-[linear-gradient(to_top,rgba(255,255,255,0.035)_0%,transparent_30%),radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.006)_0%,transparent_46%)] text-white">

  <span class="pointer-events-none absolute inset-0 z-[1] rounded-[inherit] backdrop-blur-[9.4px] backdrop-saturate-[132%] [mask-image:radial-gradient(ellipse_at_center,#000_0%,#000_28%,transparent_70%)] [-webkit-mask-image:radial-gradient(ellipse_at_center,#000_0%,#000_28%,transparent_70%)]"></span>
  <span class="pointer-events-none absolute inset-0 z-[1] rounded-[inherit] backdrop-blur-[16.9px] backdrop-saturate-[132%] [mask-image:radial-gradient(ellipse_at_center,transparent_18%,#000_48%,transparent_88%)] [-webkit-mask-image:radial-gradient(ellipse_at_center,transparent_18%,#000_48%,transparent_88%)]"></span>
  <span class="pointer-events-none absolute inset-0 z-[1] rounded-[inherit] backdrop-blur-[29.2px] backdrop-saturate-[132%] [mask-image:radial-gradient(ellipse_at_center,transparent_45%,#000_78%,#000_100%)] [-webkit-mask-image:radial-gradient(ellipse_at_center,transparent_45%,#000_78%,#000_100%)]"></span>
  <div class="relative z-[3]">
    <div className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${accentClasses[accent] || accentClasses.cyan}`}>
        {label}
      </div>
      <div className="mt-4 text-3xl font-bold text-blue-300">{value}</div>
  </div>
</div>
  );
}