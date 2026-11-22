import { PROTEIN_SLIDES } from '../data/slides';

interface BottomDockProps {
  activeSlideIndex: number;
  microscopeMode: boolean;
  isProteinView: boolean;
  onSelectSlide: (idx: number) => void;
}

export function BottomDock({
  activeSlideIndex,
  microscopeMode,
  isProteinView,
  onSelectSlide,
}: BottomDockProps) {
  return (
    <nav
      aria-label="Protein worlds interface"
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-20 max-w-[96vw] pointer-events-auto"
    >
      <div className="flex items-center gap-2 p-1.5 bg-[#080E1A]/95 border border-white/15 rounded-xl shadow-2xl overflow-x-auto">
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
              className={`font-display px-5 py-2.5 text-sm sm:text-base font-semibold rounded-lg whitespace-nowrap shrink-0 cursor-pointer transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                active
                  ? 'text-slate-950 shadow-md'
                  : 'text-slate-100 hover:text-white hover:bg-white/10'
              }`}
              style={
                active
                  ? {
                      backgroundColor: slide.accentColor,
                      boxShadow: microscopeMode
                        ? `0 0 18px ${slide.accentColor}66`
                        : undefined,
                    }
                  : undefined
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
