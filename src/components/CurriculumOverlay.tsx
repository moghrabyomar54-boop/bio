import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CurriculumSlide } from '../data/curriculumSlides';

interface CurriculumOverlayProps {
  slide: CurriculumSlide | null;
}

const TITLE_AURA =
  '0 0 14px rgba(74, 222, 128, 0.95), 0 0 36px rgba(34, 197, 94, 0.72), 0 0 68px rgba(16, 185, 129, 0.48)';

const BODY_AURA =
  '0 0 9px rgba(74, 222, 128, 0.62), 0 0 22px rgba(34, 197, 94, 0.36)';

export function CurriculumOverlay({ slide }: CurriculumOverlayProps) {
  const [zoomedImg, setZoomedImg] = useState(false);

  return (
    <AnimatePresence mode="wait">
      {slide && (
        <motion.section
          key={slide.id}
          aria-label={slide.title}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-15 flex flex-col justify-between bg-[#020907]/52 pt-7 sm:pt-10 pb-24 px-6 sm:px-14 lg:px-20 overflow-y-auto"
        >
          <div className="w-full max-w-[1680px] mx-auto my-auto flex flex-col justify-center">
            {/* Header Kicker */}
            <div className="mb-2.5">
              <span
                className="font-mono text-base sm:text-xl font-bold tracking-wide text-[#86EFAC]"
                style={{ textShadow: BODY_AURA }}
              >
                {slide.numberLabel}
              </span>
            </div>

            {/* Full-Screen Glowing Green Aura Title */}
            <motion.h1
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
              className="font-display text-4xl sm:text-6xl lg:text-[64px] font-bold tracking-tight text-[#ECFDF5] leading-[1.08] mb-3"
              style={{ textShadow: TITLE_AURA, textWrap: 'balance' }}
            >
              {slide.title}
            </motion.h1>

            {slide.subtitle && (
              <p
                className="font-display text-xl sm:text-3xl font-semibold text-[#A7F3D0] mb-6"
                style={{ textShadow: BODY_AURA }}
              >
                {slide.subtitle}
              </p>
            )}

            {/* Full-Screen Content Grid (Enlarged Text + Verified Internet Scientific Diagrams) */}
            <div
              className={`mt-4 grid gap-7 lg:gap-10 items-center ${
                slide.imageUrl
                  ? 'grid-cols-1 lg:grid-cols-12'
                  : 'grid-cols-1'
              }`}
            >
              {/* Text Sections */}
              <div
                className={`${
                  slide.imageUrl
                    ? `space-y-5 ${
                        zoomedImg ? 'lg:col-span-5' : 'lg:col-span-6'
                      }`
                    : slide.sections.length > 1
                    ? 'grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8'
                    : 'space-y-6 max-w-6xl'
                }`}
              >
                {slide.sections.map((sec, sIdx) => (
                  <div
                    key={sIdx}
                    className="rounded-2xl bg-[#04100D]/68 border border-emerald-400/25 p-5 sm:p-7 shadow-xl"
                  >
                    {sec.heading && (
                      <h2
                        className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-[#86EFAC] mb-3.5"
                        style={{ textShadow: BODY_AURA }}
                      >
                        {sec.heading}
                      </h2>
                    )}
                    <ul className="space-y-3 sm:space-y-3.5 list-none p-0 m-0">
                      {sec.points.map((pt, pIdx) => (
                        <li
                          key={pIdx}
                          className={`${
                            slide.imageUrl
                              ? 'text-lg sm:text-xl lg:text-[22px]'
                              : 'text-xl sm:text-2xl lg:text-[25px]'
                          } text-[#ECFDF5] leading-relaxed pl-5 relative font-medium`}
                          style={{ textShadow: BODY_AURA }}
                        >
                          <span
                            aria-hidden="true"
                            className="absolute left-0 top-[12px] w-2.5 h-2.5 rounded-full bg-emerald-400"
                          />
                          {pt}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Verified Internet Scientific Diagram */}
              {slide.imageUrl && (
                <div
                  className={
                    zoomedImg ? 'lg:col-span-7' : 'lg:col-span-6'
                  }
                >
                  <div
                    onClick={() => setZoomedImg((prev) => !prev)}
                    title="Click diagram to toggle size"
                    className="rounded-2xl overflow-hidden bg-white border-2 border-emerald-400/50 shadow-2xl p-4 cursor-zoom-in"
                  >
                    <img
                      src={slide.imageUrl}
                      alt={slide.imageAlt ?? slide.title}
                      className={`w-full object-contain transition-all duration-200 ${
                        zoomedImg
                          ? 'h-[450px] sm:h-[560px] lg:h-[620px]'
                          : 'h-[360px] sm:h-[450px] lg:h-[510px]'
                      }`}
                    />
                  </div>
                  {slide.imageCaption && (
                    <p
                      className="mt-3 font-mono text-sm sm:text-base font-semibold text-[#A7F3D0] text-center"
                      style={{ textShadow: BODY_AURA }}
                    >
                      {slide.imageCaption}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
