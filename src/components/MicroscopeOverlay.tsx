import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Microscope } from 'lucide-react';
import { ProteinSlide } from '../data/slides';

interface MicroscopeOverlayProps {
  slide: ProteinSlide;
  active: boolean;
}

const HEADING_AURA =
  '0 0 12px rgba(74, 222, 128, 0.9), 0 0 30px rgba(34, 197, 94, 0.65)';

const TEXT_AURA =
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
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-15 pointer-events-none"
        >
          {/* Optical Vignette Centered on the 3D Lens Target */}
          <div
            aria-hidden="true"
            className="hidden md:block absolute inset-0"
            style={{
              background:
                'radial-gradient(circle at 65% 48%, transparent 22%, rgba(3, 10, 8, 0.6) 44%, rgba(2, 7, 5, 0.92) 70%)',
            }}
          />

          {/* Glowing Optical Microscope Circular Reticle Frame */}
          <div
            aria-hidden="true"
            className="hidden md:flex absolute left-[65%] top-[48%] -translate-x-1/2 -translate-y-1/2 w-[min(56vh,540px)] h-[min(56vh,540px)] rounded-full border border-emerald-400/50 shadow-[0_0_52px_rgba(34,197,94,0.22)] items-center justify-center"
          >
            <div className="w-[88%] h-[88%] rounded-full border border-dashed border-emerald-400/35" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-5 bg-[#4ADE80]" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-5 bg-[#4ADE80]" />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 w-5 bg-[#4ADE80]" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 h-0.5 w-5 bg-[#4ADE80]" />

            <div
              className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 font-mono text-sm sm:text-base text-[#86EFAC] whitespace-nowrap"
              style={{ textShadow: TEXT_AURA }}
            >
              <span className="inline-block w-14 h-0.5 bg-[#4ADE80]" />
              <span>{slide.microscopeScaleBar}</span>
              <span aria-hidden="true">·</span>
              <span>{slide.microscopeMagnification}</span>
            </div>
          </div>

          {/* Left Microscope Inspection Panel */}
          <motion.aside
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className={`pointer-events-auto fixed left-5 top-[50px] bottom-[84px] flex flex-col justify-center transition-all duration-200 ${
              expandedPhoto
                ? 'w-[min(860px,calc(100vw-2.5rem))] z-30'
                : 'w-[600px] max-w-[calc(100vw-2.5rem)]'
            }`}
          >
            <div className="rounded-xl bg-[#040B0A]/90 backdrop-blur-xl border border-emerald-400/28 p-5 sm:p-6 shadow-2xl max-h-full overflow-y-auto">
              <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-emerald-400/20">
                <div className="min-w-0">
                  <div
                    className="flex items-center gap-2 text-base sm:text-xl font-mono font-bold uppercase text-[#86EFAC]"
                    style={{ textShadow: HEADING_AURA }}
                  >
                    <Microscope className="w-5 h-5 shrink-0 text-[#4ADE80]" />
                    <span>Microscope · {slide.title}</span>
                  </div>
                  <div
                    className="text-sm sm:text-base text-[#A7F3D0] font-semibold truncate mt-0.5"
                    style={{ textShadow: TEXT_AURA }}
                  >
                    {slide.worldName}
                  </div>
                </div>
                <span
                  className="font-mono text-sm sm:text-base text-[#ECFDF5] shrink-0"
                  style={{ textShadow: TEXT_AURA }}
                >
                  Press{' '}
                  <kbd className="px-2 py-0.5 bg-[#061510] border border-emerald-400/40 rounded text-[#ECFDF5]">
                    E
                  </kbd>{' '}
                  or{' '}
                  <kbd className="px-2 py-0.5 bg-[#061510] border border-emerald-400/40 rounded text-[#ECFDF5]">
                    Esc
                  </kbd>
                </span>
              </div>

              <div className="mt-4">
                <div
                  className="flex items-center justify-between text-sm sm:text-base font-mono text-[#A7F3D0] mb-2"
                  style={{ textShadow: TEXT_AURA }}
                >
                  <span>{slide.microscopeTargetName}</span>
                  <span className="text-sm text-[#4ADE80] font-bold">
                    {expandedPhoto ? 'Click photo to shrink' : 'Click photo to enlarge'}
                  </span>
                </div>
                <div
                  onClick={() => setExpandedPhoto((prev) => !prev)}
                  title="Click figure to toggle size"
                  className="rounded-xl overflow-hidden border border-emerald-400/35 bg-white shadow-xl cursor-zoom-in"
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

              <div className="mt-4 pt-3.5 border-t border-emerald-400/20">
                <div
                  className="flex items-center justify-between text-sm sm:text-base font-mono font-bold text-[#86EFAC] mb-3"
                  style={{ textShadow: TEXT_AURA }}
                >
                  <span>MICROSCOPIC STRUCTURE MAP</span>
                  <span>{slide.microscopeMagnification}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {slide.microscopeDetails.map((item) => (
                    <div
                      key={item.part}
                      className="p-3.5 rounded-xl bg-[#05110E]/82 border border-emerald-400/22"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          aria-hidden="true"
                          className="w-3 h-3 rounded-full shrink-0 border border-white/25"
                          style={{ backgroundColor: item.color }}
                        />
                        <span
                          className="text-base sm:text-[17px] font-bold text-[#ECFDF5] truncate"
                          style={{ textShadow: TEXT_AURA }}
                        >
                          {item.part}
                        </span>
                      </div>
                      <p
                        className="text-sm sm:text-[15px] text-[#A7F3D0] leading-snug"
                        style={{ textShadow: TEXT_AURA }}
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
