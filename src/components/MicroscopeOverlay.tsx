import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Microscope } from 'lucide-react';
import { ProteinSlide } from '../data/slides';

interface MicroscopeOverlayProps {
  slide: ProteinSlide;
  active: boolean;
}

const GREEN_TEXT_AURA =
  '0 0 8px rgba(74, 222, 128, 0.72), 0 0 20px rgba(34, 197, 94, 0.4)';

export function MicroscopeOverlay({ slide, active }: MicroscopeOverlayProps) {
  const [expandedPhoto, setExpandedPhoto] = useState(false);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="microscope-hud"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-15 pointer-events-none"
        >
          {/* Optical Vignette Centered on the 3D Lens Target (right-center on desktop) */}
          <div
            aria-hidden="true"
            className="hidden md:block absolute inset-0"
            style={{
              background:
                'radial-gradient(circle at 65% 48%, transparent 22%, rgba(4, 11, 10, 0.56) 44%, rgba(4, 11, 10, 0.9) 70%)',
            }}
          />

          {/* Optical Microscope Reticle Ring */}
          <div
            aria-hidden="true"
            className="hidden md:flex absolute left-[65%] top-[48%] -translate-x-1/2 -translate-y-1/2 w-[min(56vh,540px)] h-[min(56vh,540px)] rounded-full border border-emerald-400/45 items-center justify-center"
          >
            <div className="w-[88%] h-[88%] rounded-full border border-dashed border-emerald-300/25" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-4 bg-emerald-400/60" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-4 bg-emerald-400/60" />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-px w-4 bg-emerald-400/60" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 h-px w-4 bg-emerald-400/60" />

            <div
              className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 font-mono text-sm sm:text-base text-[#86EFAC] whitespace-nowrap"
              style={{ textShadow: GREEN_TEXT_AURA }}
            >
              <span className="inline-block w-14 h-0.5 bg-emerald-400" />
              <span>{slide.microscopeScaleBar}</span>
              <span aria-hidden="true">·</span>
              <span>{slide.microscopeMagnification}</span>
            </div>
          </div>

          {/* Left Microscope Inspection Panel with LARGE Reference Figure + Structure Map */}
          <motion.aside
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className={`pointer-events-auto fixed left-5 top-[50px] bottom-[84px] flex flex-col justify-center transition-all duration-200 ${
              expandedPhoto
                ? 'w-[min(860px,calc(100vw-2.5rem))] z-30'
                : 'w-[600px] max-w-[calc(100vw-2.5rem)]'
            }`}
          >
            <div className="bg-[#040B0A]/94 border border-emerald-400/35 rounded-xl p-5 sm:p-6 shadow-2xl max-h-full overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-emerald-400/20">
                <div className="min-w-0">
                  <div
                    className="flex items-center gap-2 text-base sm:text-xl font-mono font-bold text-[#86EFAC]"
                    style={{ textShadow: GREEN_TEXT_AURA }}
                  >
                    <Microscope className="w-5 h-5 shrink-0 text-[#4ADE80]" />
                    <span>Microscope · {slide.title}</span>
                  </div>
                  <div
                    className="text-sm sm:text-base text-[#A7F3D0] truncate mt-0.5"
                    style={{ textShadow: GREEN_TEXT_AURA }}
                  >
                    {slide.worldName}
                  </div>
                </div>
                <span
                  className="font-mono text-sm sm:text-base text-[#ECFDF5] shrink-0"
                  style={{ textShadow: GREEN_TEXT_AURA }}
                >
                  Press <kbd className="px-2 py-0.5 bg-[#061510] border border-emerald-400/40 rounded text-[#ECFDF5]">E</kbd> or <kbd className="px-2 py-0.5 bg-[#061510] border border-emerald-400/40 rounded text-[#ECFDF5]">Esc</kbd>
                </span>
              </div>

              {/* Large Reference Figure Showcase */}
              <div className="mt-4">
                <div
                  className="flex items-center justify-between text-sm sm:text-base font-mono text-[#A7F3D0] mb-2"
                  style={{ textShadow: GREEN_TEXT_AURA }}
                >
                  <span>{slide.microscopeTargetName}</span>
                  <span className="text-sm text-[#4ADE80]">
                    {expandedPhoto ? 'Click photo to shrink' : 'Click photo to enlarge'}
                  </span>
                </div>
                <div
                  onClick={() => setExpandedPhoto((prev) => !prev)}
                  title="Click figure to toggle size"
                  className="rounded-lg overflow-hidden border border-emerald-400/35 bg-white cursor-zoom-in"
                >
                  <img
                    src={slide.referenceImage}
                    alt={`${slide.title} microscope figure`}
                    referrerPolicy="no-referrer"
                    className={`w-full object-contain transition-all duration-200 ${
                      expandedPhoto ? 'h-[430px] sm:h-[490px] p-3' : 'h-64 sm:h-72 p-2.5'
                    }`}
                  />
                </div>
              </div>

              {/* Structural Breakdown */}
              <div className="mt-4 pt-3.5 border-t border-emerald-400/20">
                <div
                  className="flex items-center justify-between text-sm sm:text-base font-mono font-semibold text-[#86EFAC] mb-3"
                  style={{ textShadow: GREEN_TEXT_AURA }}
                >
                  <span>Microscopic Structure Map</span>
                  <span>{slide.microscopeMagnification}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {slide.microscopeDetails.map((item) => (
                    <div
                      key={item.part}
                      className="p-3.5 rounded-lg bg-[#05130E] border border-emerald-400/20"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          aria-hidden="true"
                          className="w-3.5 h-3.5 rounded-sm shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span
                          className="text-base sm:text-[17px] font-bold text-[#ECFDF5] truncate"
                          style={{ textShadow: GREEN_TEXT_AURA }}
                        >
                          {item.part}
                        </span>
                      </div>
                      <p
                        className="text-sm sm:text-[15px] text-[#A7F3D0] leading-snug"
                        style={{ textShadow: GREEN_TEXT_AURA }}
                      >
                        {item.role}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
