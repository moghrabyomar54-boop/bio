import { AnimatePresence, motion } from 'motion/react';
import { Atom, Globe, Microscope } from 'lucide-react';
import { PresentationSimState, ProteinSlide } from '../data/slides';
import { ProteinMindMap } from './ProteinMindMap';
import { ScientificDiagrams } from './ScientificDiagrams';

interface SlideHUDProps {
  slide: ProteinSlide;
  simState: PresentationSimState;
  inTransit: boolean;
  microscopeMode: boolean;
  mindMapBranchIndex: number;
  onSelectMindMapBranch: (idx: number) => void;
  onGoToThankYou: () => void;
}

const HEADING_AURA =
  '0 0 12px rgba(74, 222, 128, 0.9), 0 0 30px rgba(34, 197, 94, 0.65), 0 0 56px rgba(16, 185, 129, 0.42)';

const TEXT_AURA =
  '0 0 8px rgba(74, 222, 128, 0.72), 0 0 20px rgba(34, 197, 94, 0.4)';

export function SlideHUD({
  slide,
  simState,
  inTransit,
  microscopeMode,
  mindMapBranchIndex,
  onSelectMindMapBranch,
  onGoToThankYou,
}: SlideHUDProps) {
  if (microscopeMode) return null;

  return (
    <aside
      aria-live="polite"
      className="fixed left-5 top-[50px] bottom-[84px] z-10 w-[585px] max-w-[calc(100vw-2.5rem)] flex flex-col justify-center pointer-events-none"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, x: -18, scale: 0.985 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 18, scale: 0.985 }}
          transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-auto bg-[#040B0A]/88 border border-emerald-400/28 rounded-xl p-4 sm:p-5 shadow-2xl max-h-full overflow-y-auto"
        >
          {/* World & Chapter Line */}
          <div className="flex items-center justify-between gap-2 text-base mb-1">
            <div
              className="flex items-center gap-2 font-mono truncate text-[#86EFAC]"
              style={{ textShadow: TEXT_AURA }}
            >
              <span className="font-bold text-[#4ADE80]">
                World {slide.chapter}
              </span>
              <span aria-hidden="true">·</span>
              <span className="truncate">{slide.scaleLabel}</span>
            </div>
            {inTransit && (
              <span
                className="inline-flex items-center gap-1.5 font-mono text-sm text-[#86EFAC] shrink-0"
                style={{ textShadow: TEXT_AURA }}
              >
                <Atom className="w-4 h-4 animate-spin text-[#4ADE80]" />
                <span>Changing Slide</span>
              </span>
            )}
          </div>

          <div
            className="flex items-center gap-2 text-base sm:text-lg font-semibold text-[#A7F3D0] mb-1.5"
            style={{ textShadow: TEXT_AURA }}
          >
            <Globe className="w-4.5 h-4.5 shrink-0 text-[#4ADE80]" />
            <span>{slide.worldName}</span>
          </div>

          {/* Glowing Green Aura Display Title */}
          <h1
            className="font-display text-4xl sm:text-[42px] font-bold tracking-tight text-[#ECFDF5] leading-none mb-3"
            style={{ textShadow: HEADING_AURA, textWrap: 'balance' }}
          >
            {slide.title}
          </h1>

          {/* Enlarged Mind Map (Press Q to cycle sections) */}
          <div className="mb-3">
            <ProteinMindMap
              rootTitle={slide.title}
              accentColor={slide.accentColor}
              branches={slide.mindMapBranches}
              activeBranchIndex={mindMapBranchIndex}
              onSelectBranchIndex={onSelectMindMapBranch}
            />
          </div>

          {/* Quantitative Metrics */}
          <div className="grid grid-cols-3 gap-3 py-2.5 border-t border-emerald-400/20">
            {slide.stats.map((st) => (
              <div key={st.label}>
                <div
                  className="text-sm sm:text-base font-medium text-[#86EFAC] truncate"
                  style={{ textShadow: TEXT_AURA }}
                >
                  {st.label}
                </div>
                <div
                  className="font-mono text-2xl sm:text-[26px] font-bold text-[#ECFDF5] tabular-nums mt-0.5 leading-tight"
                  style={{ textShadow: TEXT_AURA }}
                >
                  {st.value}
                </div>
                <div
                  className="font-mono text-sm text-[#A7F3D0]"
                  style={{ textShadow: TEXT_AURA }}
                >
                  {st.unit}
                </div>
              </div>
            ))}
          </div>

          <ScientificDiagrams slide={slide} simState={simState} />

          {/* Keyboard Cues: E = Microscope Zoom, ArrowRight / T on final protein = Thank You */}
          <div
            className="mt-3 pt-2.5 border-t border-emerald-400/20 flex flex-col gap-1.5 text-base font-mono text-[#86EFAC]"
            style={{ textShadow: TEXT_AURA }}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-2">
                <Microscope className="w-4.5 h-4.5 text-[#4ADE80] shrink-0" />
                <span>
                  {slide.index === 0
                    ? 'Press E · Zoom into Red Blood Cell'
                    : 'Press E · Microscope Zoom & Figure'}
                </span>
              </span>
              <kbd className="px-2.5 py-0.5 text-sm font-bold bg-[#061510] border border-emerald-400/40 rounded text-[#ECFDF5]">
                E
              </kbd>
            </div>
            {slide.index === 4 && (
              <div
                onClick={onGoToThankYou}
                role="link"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onGoToThankYou();
                  }
                }}
                className="flex items-center justify-between gap-2 text-[#4ADE80] hover:text-white cursor-pointer pt-0.5"
              >
                <span>Press → · What Are Enzymes? &amp; Story</span>
                <kbd className="px-2.5 py-0.5 text-sm font-bold bg-[#061510] border border-emerald-400/40 rounded text-[#ECFDF5]">
                  →
                </kbd>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </aside>
  );
}
