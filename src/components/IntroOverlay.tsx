import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  playMusicTrack,
  preloadAllMusicTracks,
  stopAllMusic,
  unlockAudioFromGesture,
} from '../utils/musicPlayer';

interface IntroOverlayProps {
  mode: 'intro' | 'outro' | 'hidden';
  onExitOutro?: () => void;
}

const TEAM_NAMES = [
  '1-Eyad alaa',
  '2- mohammed ahmed',
  '3-Omar Sherief',
  '4-Adham Talal',
  '5-Abdelrahman Ahmed',
  '6-Malek Amr',
];

const HEADING_AURA =
  '0 0 14px rgba(74, 222, 128, 0.95), 0 0 36px rgba(34, 197, 94, 0.75), 0 0 72px rgba(16, 185, 129, 0.5)';

const NAME_AURA =
  '0 0 10px rgba(74, 222, 128, 0.85), 0 0 24px rgba(34, 197, 94, 0.58), 0 0 44px rgba(16, 185, 129, 0.35)';

const CREDIT_MODULES = [
  {
    code: '01',
    topic: 'Introduction to Proteins',
    detail: 'Large complex macromolecules · Amino acid polymers · Elements C, H, O, N, S',
  },
  {
    code: '02',
    topic: 'Functions of Proteins in Cells',
    detail: 'Structural, Transport, Enzymatic, Defense, Hormonal/Signaling, Movement & Storage Proteins',
  },
  {
    code: '03',
    topic: 'Protein Classification',
    detail: 'Fibrous & Globular Shapes · Simple & Conjugated (Prosthetic Group) Proteins',
  },
  {
    code: '04',
    topic: 'Amino Acids (Building Units)',
    detail: '20 standard amino acids · α-carbon (−NH₂, −COOH, R-group) · Peptide bonds · 9 Essential',
  },
  {
    code: '05',
    topic: 'Proteins in Cells',
    detail: '>50% dry cellular weight · Ribosomal synthesis · Cytoplasm, membranes & nucleus',
  },
  {
    code: '06',
    topic: 'Structure & Function',
    detail: 'Native state folding · Hydrophobic, Hydrogen, Ionic & Disulfide (−S−S−) bridges',
  },
  {
    code: '07',
    topic: 'Levels of Protein Structure',
    detail: 'Primary (1°) · Secondary (2° α/β) · Tertiary (3° 3D fold) · Quaternary (4° Subunits)',
  },
  {
    code: '08',
    topic: 'Denaturation',
    detail: 'Loss of 2°/3°/4° shape from heat, extreme pH, or heavy metals · Refolding vs. permanent',
  },
  {
    code: '09',
    topic: 'Mutation & Misfolding',
    detail: 'Sickle cell point mutation (A → T · Glu → Val) · Polymerized HbS & amyloid plaques',
  },
  {
    code: '10',
    topic: 'What Are Enzymes?',
    detail: 'Biological catalysts · Lower activation energy · Reusable speed-up of cellular reactions',
  },
];

const CREDIT_WORLDS = [
  {
    protein: 'Hemoglobin',
    world: 'The Bloodstream / Red Blood Cell World',
    role: 'Quaternary α₂β₂ tetramer transporting 4 × O₂ via Heme Fe²⁺ centers from lungs to tissues',
  },
  {
    protein: 'Collagen',
    world: 'The Tendon / Bone Matrix World',
    role: 'Triple-helix Gly-X-Y braided cables providing tensile strength across bone and tendons',
  },
  {
    protein: 'Enzymes',
    world: 'The Cytoplasm / Metabolic Workshop World',
    role: 'Induced-fit Active Sites accelerating cellular biochemical catalysis with zero consumption',
  },
  {
    protein: 'Keratin',
    world: 'The Hair Fiber World',
    role: 'Coiled α-helices and −S−S− disulfide cross-links engineered for resilient fiber elasticity',
  },
  {
    protein: 'Chaperone Proteins',
    world: 'The Ribosome / Protein Repair Chamber',
    role: 'ATP-fueled Hsp70/chaperonin folding sanctuary rescuing misfolded chains after stress',
  },
];

export function IntroOverlay({ mode, onExitOutro }: IntroOverlayProps) {
  const isIntro = mode === 'intro';
  const isOutro = mode === 'outro';

  // Movie-style outro choreography:
  // 'thankyou' (0..2.3s) -> 'credits' (black screen with sliding glow credits) -> 'finale' (settled lockup)
  const [outroStage, setOutroStage] = useState<'thankyou' | 'credits' | 'finale'>('thankyou');
  const [creditsRunKey, setCreditsRunKey] = useState(0);

  useEffect(() => {
    preloadAllMusicTracks();
  }, []);

  useEffect(() => {
    if (!isOutro) {
      return;
    }

    playMusicTrack('credits', { volume: 0.72, loop: true, startTime: 0 });

    const resumeOnGesture = () => {
      unlockAudioFromGesture();
    };
    window.addEventListener('pointerdown', resumeOnGesture, { once: true });
    window.addEventListener('keydown', resumeOnGesture, { once: true });

    return () => {
      window.removeEventListener('pointerdown', resumeOnGesture);
      window.removeEventListener('keydown', resumeOnGesture);
      stopAllMusic();
    };
  }, [isOutro]);

  useEffect(() => {
    if (!isOutro) {
      setOutroStage('thankyou');
      return;
    }
    setOutroStage('thankyou');
    const timer = window.setTimeout(() => {
      setOutroStage('credits');
    }, 2350);
    return () => window.clearTimeout(timer);
  }, [isOutro, creditsRunKey]);

  const handleReplayCredits = () => {
    setOutroStage('thankyou');
    setCreditsRunKey((k) => k + 1);
    playMusicTrack('credits', { volume: 0.72, loop: true, startTime: 0 });
  };

  return (
    <>
      <AnimatePresence mode="wait">
      {isIntro && (
        <motion.section
          key="intro-full-screen"
          aria-label="LO5 (Biology) Introduction"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 bottom-20 z-15 flex flex-col items-center justify-center px-6 sm:px-12 pointer-events-none"
        >
          <div className="flex flex-col items-center text-center max-w-5xl w-full">
            <motion.h1
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 5.2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="font-display text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-[#ECFDF5] mb-9"
              style={{ textShadow: HEADING_AURA, textWrap: 'balance' }}
            >
              LO5 (Biology)
            </motion.h1>

            <ul className="flex flex-col items-center gap-4 sm:gap-5 list-none p-0 m-0">
              {TEAM_NAMES.map((entry, idx) => (
                <motion.li
                  key={entry}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: 1,
                    y: [0, idx % 2 === 0 ? -7 : -5, 0],
                  }}
                  transition={{
                    opacity: { duration: 0.55, delay: 0.07 * idx },
                    y: {
                      duration: 4.2 + idx * 0.45,
                      delay: idx * 0.25,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    },
                  }}
                  className="font-display text-2xl sm:text-4xl font-semibold tracking-wide text-[#DCFCE7]"
                  style={{ textShadow: NAME_AURA }}
                >
                  {entry}
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.section>
      )}

      {isOutro && (
        <motion.section
          key={`outro-movie-credits-${creditsRunKey}`}
          aria-label="Thank You Movie Credits"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-40 overflow-hidden select-none"
        >
          {/* Stage 1: Heroic Glowing "Thank You" Appears First */}
          <AnimatePresence>
            {outroStage === 'thankyou' && (
              <motion.div
                key="outro-thankyou-card"
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 bg-[#020806]/90 flex flex-col items-center justify-center px-8 text-center"
              >
                <h1
                  className="font-display text-6xl sm:text-8xl lg:text-9xl font-bold tracking-tight text-[#ECFDF5] mb-4"
                  style={{ textShadow: HEADING_AURA, textWrap: 'balance' }}
                >
                  Thank You
                </h1>
                <p
                  className="font-display text-2xl sm:text-4xl font-semibold tracking-wide text-[#A7F3D0]"
                  style={{ textShadow: NAME_AURA }}
                >
                  LO5 (Biology) · Proteins &amp; Enzymes
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stage 2 & 3: Pure Black Screen With Detailed Sliding Credits (Keeping Exact Glow) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: outroStage === 'thankyou' ? 0 : 1 }}
            transition={{ duration: 0.85, ease: 'easeInOut' }}
            className="absolute inset-0 bg-black flex flex-col items-center justify-center overflow-hidden"
          >
            {outroStage === 'credits' && (
              <motion.div
                initial={{ y: '78vh' }}
                animate={{ y: '-105%' }}
                transition={{ duration: 24, ease: 'linear' }}
                onAnimationComplete={() => setOutroStage('finale')}
                className="w-full max-w-4xl px-8 py-10 flex flex-col items-center text-center will-change-transform"
              >
                {/* Credits Title Lockup */}
                <h2
                  className="font-display text-5xl sm:text-7xl font-bold tracking-tight text-[#ECFDF5] mb-3"
                  style={{ textShadow: HEADING_AURA }}
                >
                  LO5 (Biology)
                </h2>
                <p
                  className="font-display text-2xl sm:text-3xl font-semibold text-[#A7F3D0] mb-14"
                  style={{ textShadow: NAME_AURA }}
                >
                  Proteins &amp; Enzymes — Molecular Worlds Presentation
                </p>

                {/* Cast / Presenters — Prominent Sliding Team Names */}
                <div className="w-full mb-16 pb-12 border-b border-emerald-400/20">
                  <p
                    className="font-mono text-sm sm:text-base uppercase tracking-[0.28em] text-[#86EFAC] mb-7"
                    style={{ textShadow: NAME_AURA }}
                  >
                    Presented By
                  </p>
                  <ul className="flex flex-col items-center gap-5 sm:gap-6 list-none p-0 m-0">
                    {TEAM_NAMES.map((entry) => (
                      <li
                        key={entry}
                        className="font-display text-3xl sm:text-5xl font-bold tracking-wide text-[#DCFCE7]"
                        style={{ textShadow: HEADING_AURA }}
                      >
                        {entry}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Detailed Curriculum Breakdown */}
                <div className="w-full mb-16 pb-12 border-b border-emerald-400/20">
                  <p
                    className="font-mono text-sm sm:text-base uppercase tracking-[0.28em] text-[#86EFAC] mb-8"
                    style={{ textShadow: NAME_AURA }}
                  >
                    Curriculum Topics Covered
                  </p>
                  <div className="space-y-6 text-center">
                    {CREDIT_MODULES.map((mod) => (
                      <div key={mod.code}>
                        <h3
                          className="font-display text-2xl sm:text-3xl font-bold text-[#ECFDF5]"
                          style={{ textShadow: NAME_AURA }}
                        >
                          {mod.code}. {mod.topic}
                        </h3>
                        <p
                          className="text-lg sm:text-xl text-[#A7F3D0] mt-1.5"
                          style={{ textShadow: NAME_AURA }}
                        >
                          {mod.detail}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Detailed 5 Molecular Worlds Summary */}
                <div className="w-full mb-16 pb-12 border-b border-emerald-400/20">
                  <p
                    className="font-mono text-sm sm:text-base uppercase tracking-[0.28em] text-[#86EFAC] mb-8"
                    style={{ textShadow: NAME_AURA }}
                  >
                    3D Protein Worlds Featured
                  </p>
                  <div className="space-y-6 text-center">
                    {CREDIT_WORLDS.map((w) => (
                      <div key={w.protein}>
                        <h3
                          className="font-display text-2xl sm:text-3xl font-bold text-[#ECFDF5]"
                          style={{ textShadow: NAME_AURA }}
                        >
                          {w.protein} — {w.world}
                        </h3>
                        <p
                          className="text-lg sm:text-xl text-[#A7F3D0] mt-1.5"
                          style={{ textShadow: NAME_AURA }}
                        >
                          {w.role}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Closing Sign-off Inside Roll */}
                <div className="pt-4">
                  <p
                    className="font-display text-4xl sm:text-6xl font-bold text-[#ECFDF5] mb-3"
                    style={{ textShadow: HEADING_AURA }}
                  >
                    Thank You for Watching
                  </p>
                  <p
                    className="font-display text-xl sm:text-2xl text-[#86EFAC]"
                    style={{ textShadow: NAME_AURA }}
                  >
                    LO5 (Biology) · Proteome Atlas
                  </p>
                </div>
              </motion.div>
            )}

            {/* Final Resting Card on Black Screen After Roll Completes */}
            {outroStage === 'finale' && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center text-center px-6 max-w-4xl"
              >
                <h2
                  className="font-display text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-[#ECFDF5] mb-3"
                  style={{ textShadow: HEADING_AURA }}
                >
                  Thank You
                </h2>
                <p
                  className="font-display text-2xl sm:text-3xl font-semibold text-[#A7F3D0] mb-8"
                  style={{ textShadow: NAME_AURA }}
                >
                  LO5 (Biology) · Proteins &amp; Enzymes
                </p>
                <ul className="flex flex-col items-center gap-3.5 sm:gap-4 list-none p-0 m-0">
                  {TEAM_NAMES.map((entry) => (
                    <li
                      key={entry}
                      className="font-display text-2xl sm:text-3xl font-semibold tracking-wide text-[#DCFCE7]"
                      style={{ textShadow: NAME_AURA }}
                    >
                      {entry}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Subtle Controls on Black Screen Edge (Replay Credits / Return) */}
            {outroStage !== 'thankyou' && (
              <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 opacity-45 hover:opacity-100 transition-opacity duration-200">
                <button
                  type="button"
                  onClick={handleReplayCredits}
                  className="px-4 py-2 rounded-lg border border-emerald-400/40 bg-black/80 font-mono text-xs sm:text-sm text-[#86EFAC] hover:bg-emerald-950/60 cursor-pointer"
                  style={{ textShadow: NAME_AURA }}
                >
                  Replay Credits
                </button>
                {onExitOutro && (
                  <button
                    type="button"
                    onClick={onExitOutro}
                    className="px-4 py-2 rounded-lg border border-emerald-400/40 bg-black/80 font-mono text-xs sm:text-sm text-[#ECFDF5] hover:bg-emerald-950/60 cursor-pointer"
                    style={{ textShadow: NAME_AURA }}
                  >
                    Back to Slides
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </motion.section>
      )}
    </AnimatePresence>
    </>
  );
}
