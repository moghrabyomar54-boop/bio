import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CurriculumGalleryImage, CurriculumSlide } from '../data/curriculumSlides';

interface CurriculumOverlayProps {
  slide: CurriculumSlide | null;
  onBackToProteins?: () => void;
  onContinueToStory?: () => void;
}

const TITLE_AURA =
  '0 0 14px rgba(74, 222, 128, 0.95), 0 0 36px rgba(34, 197, 94, 0.72), 0 0 68px rgba(16, 185, 129, 0.48)';

const BODY_AURA =
  '0 0 9px rgba(74, 222, 128, 0.62), 0 0 22px rgba(34, 197, 94, 0.36)';

export function CurriculumOverlay({
  slide,
  onBackToProteins,
  onContinueToStory,
}: CurriculumOverlayProps) {
  const [zoomedImg, setZoomedImg] = useState(false);
  const [modalGalleryImg, setModalGalleryImg] =
    useState<CurriculumGalleryImage | null>(null);

  useEffect(() => {
    setZoomedImg(false);
    setModalGalleryImg(null);
  }, [slide?.id]);

  useEffect(() => {
    if (!modalGalleryImg) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setModalGalleryImg(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modalGalleryImg]);

  const hasGallery = Boolean(slide?.galleryImages && slide.galleryImages.length > 0);
  const hasMediaColumn = Boolean(slide?.imageUrl || hasGallery);

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
          className={`fixed inset-0 z-15 flex flex-col justify-between bg-[#020907]/58 ${
            hasGallery
              ? `pt-5 sm:pt-7 ${onContinueToStory ? 'pb-6' : 'pb-24'} px-5 sm:px-10 lg:px-14`
              : 'pt-7 sm:pt-10 pb-24 px-6 sm:px-14 lg:px-20'
          } overflow-y-auto`}
        >
          <div className="w-full max-w-[1680px] mx-auto my-auto flex flex-col justify-center">
            {/* Header Kicker */}
            <div className={hasGallery ? 'mb-1.5' : 'mb-2.5'}>
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
              className={`font-display font-bold tracking-tight text-[#ECFDF5] leading-[1.08] ${
                hasGallery
                  ? 'text-3xl sm:text-5xl lg:text-[54px] mb-1.5'
                  : 'text-4xl sm:text-6xl lg:text-[64px] mb-3'
              }`}
              style={{ textShadow: TITLE_AURA, textWrap: 'balance' }}
            >
              {slide.title}
            </motion.h1>

            {slide.subtitle && (
              <p
                className={`font-display font-semibold text-[#A7F3D0] ${
                  hasGallery
                    ? 'text-base sm:text-xl mb-4'
                    : 'text-xl sm:text-3xl mb-6'
                }`}
                style={{ textShadow: BODY_AURA }}
              >
                {slide.subtitle}
              </p>
            )}

            {/* Full-Screen Content Grid (Enlarged Text + Verified Internet Scientific Diagrams) */}
            <div
              className={`${hasGallery ? 'mt-2 gap-5 lg:gap-7' : 'mt-4 gap-7 lg:gap-10'} grid items-center ${
                hasMediaColumn ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'
              }`}
            >
              {/* Text Sections */}
              <div
                className={`${
                  hasGallery
                    ? 'lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 items-stretch'
                    : slide.imageUrl
                    ? `space-y-5 ${
                        zoomedImg ? 'lg:col-span-5' : 'lg:col-span-6'
                      }`
                    : slide.sections.length > 1
                    ? 'grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6'
                    : 'space-y-6 max-w-6xl'
                }`}
              >
                {slide.sections.map((sec, sIdx) => {
                  const compactCards =
                    hasGallery || (!slide.imageUrl && slide.sections.length >= 4);
                  return (
                    <div
                      key={sIdx}
                      className={`rounded-2xl bg-[#04100D]/76 border border-emerald-400/28 shadow-xl ${
                        hasGallery
                          ? 'p-4 sm:p-5'
                          : compactCards
                          ? 'p-4 sm:p-5'
                          : 'p-5 sm:p-7'
                      }`}
                    >
                      {sec.heading && (
                        <h2
                          className={`font-display font-bold text-[#86EFAC] ${
                            hasGallery
                              ? 'text-lg sm:text-xl mb-2.5'
                              : compactCards
                              ? 'text-lg sm:text-xl lg:text-2xl mb-2.5'
                              : 'text-xl sm:text-2xl lg:text-3xl mb-3.5'
                          }`}
                          style={{ textShadow: BODY_AURA }}
                        >
                          {sec.heading}
                        </h2>
                      )}
                      <ul
                        className={`${
                          compactCards ? 'space-y-2' : 'space-y-3 sm:space-y-3.5'
                        } list-none p-0 m-0`}
                      >
                        {sec.points.map((pt, pIdx) => (
                          <li
                            key={pIdx}
                            className={`${
                              hasGallery
                                ? 'text-sm sm:text-base lg:text-[17px]'
                                : slide.imageUrl
                                ? 'text-lg sm:text-xl lg:text-[22px]'
                                : compactCards
                                ? 'text-base sm:text-lg lg:text-[19px]'
                                : 'text-xl sm:text-2xl lg:text-[25px]'
                            } text-[#ECFDF5] leading-relaxed pl-5 relative font-medium`}
                            style={{ textShadow: BODY_AURA }}
                          >
                            <span
                              aria-hidden="true"
                              className={`absolute left-0 rounded-full bg-emerald-400 ${
                                compactCards
                                  ? 'top-[9px] w-2 h-2'
                                  : 'top-[12px] w-2.5 h-2.5'
                              }`}
                            />
                            {pt}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>

              {/* Single Verified Internet Scientific Diagram */}
              {slide.imageUrl && (
                <div className={zoomedImg ? 'lg:col-span-7' : 'lg:col-span-6'}>
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

              {/* Multi-Picture Online Visual Showcase (Enzymes / Activation Energy / Salivary Amylase) */}
              {hasGallery && slide.galleryImages && (
                <div className="lg:col-span-5 flex flex-col gap-3.5">
                  {/* Featured Primary Diagram */}
                  <button
                    type="button"
                    onClick={() => setModalGalleryImg(slide.galleryImages![0])}
                    title="Click image to inspect larger"
                    className="group text-left rounded-2xl overflow-hidden border-2 border-emerald-400/55 bg-white p-3 shadow-2xl cursor-zoom-in transition-transform hover:scale-[1.01]"
                  >
                    <img
                      src={slide.galleryImages[0].url}
                      alt={slide.galleryImages[0].alt}
                      className="w-full h-[210px] sm:h-[240px] object-contain"
                    />
                    <div className="mt-2 pt-2 border-t border-slate-200 text-xs font-mono font-bold text-slate-800 text-center">
                      {slide.galleryImages[0].caption}
                    </div>
                  </button>

                  {/* Secondary 2 Online Diagrams Side-by-Side */}
                  {slide.galleryImages.length > 1 && (
                    <div className="grid grid-cols-2 gap-3.5">
                      {slide.galleryImages.slice(1).map((img) => (
                        <button
                          key={img.url}
                          type="button"
                          onClick={() => setModalGalleryImg(img)}
                          title="Click image to inspect larger"
                          className={`group text-left rounded-2xl overflow-hidden border-2 border-emerald-400/45 p-2.5 shadow-xl cursor-zoom-in transition-transform hover:scale-[1.02] ${
                            img.darkBg ? 'bg-[#090705]' : 'bg-white'
                          }`}
                        >
                          <img
                            src={img.url}
                            alt={img.alt}
                            className="w-full h-[135px] sm:h-[155px] object-contain rounded-lg"
                          />
                          <div
                            className={`mt-2 pt-1.5 border-t text-[11px] font-mono font-semibold leading-snug text-center ${
                              img.darkBg
                                ? 'border-emerald-400/25 text-[#A7F3D0]'
                                : 'border-slate-200 text-slate-800'
                            }`}
                          >
                            {img.caption}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Optional Pre-Story Navigation Actions */}
            {(onBackToProteins || onContinueToStory) && (
              <div className="mt-5 pt-4 border-t border-emerald-400/25 flex flex-wrap items-center justify-between gap-4">
                {onBackToProteins ? (
                  <button
                    type="button"
                    onClick={onBackToProteins}
                    className="px-5 py-2.5 rounded-xl border border-emerald-400/40 bg-[#05120D]/85 hover:bg-emerald-950/80 font-display text-sm sm:text-base font-semibold text-[#A7F3D0] cursor-pointer transition-colors"
                    style={{ textShadow: BODY_AURA }}
                  >
                    ← Back to Proteins (←)
                  </button>
                ) : (
                  <div />
                )}

                {onContinueToStory && (
                  <button
                    type="button"
                    onClick={onContinueToStory}
                    className="px-7 py-3 rounded-xl bg-[#4ADE80] hover:bg-[#86EFAC] text-slate-950 font-display text-base sm:text-xl font-bold shadow-[0_0_28px_rgba(74,222,128,0.65)] cursor-pointer transition-all hover:scale-[1.02]"
                  >
                    Begin Story &amp; 3D Bio-Game (→ / Space) →
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Click-to-Zoom Lightbox for Online Gallery Pictures */}
          {modalGalleryImg && (
            <div
              role="dialog"
              aria-modal="true"
              aria-label={modalGalleryImg.alt}
              onClick={() => setModalGalleryImg(null)}
              className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 sm:p-8"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="max-w-4xl w-full rounded-2xl border-2 border-emerald-400/65 bg-[#04100D] p-4 sm:p-6 shadow-2xl"
              >
                <div
                  className={`rounded-xl p-4 flex items-center justify-center ${
                    modalGalleryImg.darkBg ? 'bg-[#090705]' : 'bg-white'
                  }`}
                >
                  <img
                    src={modalGalleryImg.url}
                    alt={modalGalleryImg.alt}
                    className="w-full max-h-[65vh] object-contain"
                  />
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                  <p
                    className="font-mono text-sm sm:text-base text-[#A7F3D0]"
                    style={{ textShadow: BODY_AURA }}
                  >
                    {modalGalleryImg.caption}
                  </p>
                  <button
                    type="button"
                    onClick={() => setModalGalleryImg(null)}
                    className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs sm:text-sm font-bold cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.section>
      )}
    </AnimatePresence>
  );
}
