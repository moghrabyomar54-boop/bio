import { PROTEIN_SLIDES } from '../data/slides';

interface BottomDockProps {
  activeSlideIndex: number;
  microscopeMode: boolean;
  isProteinView: boolean;
  onSelectSlide: (idx: number) => void;
}

const DOCK_TEXT_AURA =
  '0 0 10px rgba(74, 222, 128, 0.85), 0 0 24px rgba(34, 197, 94, 0.5)';

export function BottomDock({
  activeSlideIndex,
  microscopeMode,
  isProteinView,
  onSelectSlide,
}: BottomDockProps) {
  return (
    <nav
      aria-label="Protein worlds interface"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 max-w-[96vw] pointer-events-auto"
    >
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#040B0A]/82 backdrop-blur-xl border border-emerald-400/28 shadow-[0_0_30px_rgba(34,197,94,0.2)] overflow-x-auto">
        {PROTEIN_SLIDES.map((slide, idx) => {
          const active = isProteinView && idx === activeSlideIndex;
          const label =
            slide.title === 'Chaperone Protein' ? 'Chaperone' : slide.title;
          return (
            <button
              key={slide.id}
              type="button"
              onClick={() => onSelectSlide(idx)}
              aria-current={active ? 'page' : undefined}
              className={`font-display px-4 py-2 rounded-xl text-sm sm:text-base font-semibold tracking-wide whitespace-nowrap shrink-0 cursor-pointer border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4ADE80] ${
                active
                  ? 'text-[#ECFDF5] bg-emerald-500/20 border-[#4ADE80]/75'
                  : 'bg-transparent border-transparent text-[#A7F3D0]/85 hover:text-[#ECFDF5] hover:bg-emerald-500/12 hover:border-emerald-400/35'
              }`}
              style={
                active
                  ? {
                      textShadow: DOCK_TEXT_AURA,
                      borderColor: slide.accentColor,
                      boxShadow: microscopeMode
                        ? `0 0 22px ${slide.accentColor}77`
                        : `0 0 16px rgba(74, 222, 128, 0.42)`,
                    }
                  : {
                      textShadow: '0 0 8px rgba(74, 222, 128, 0.35)',
                    }
              }
            >
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
