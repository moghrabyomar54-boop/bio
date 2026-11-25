import { AnimatePresence, motion } from 'motion/react';

interface VoidAmbientOverlayProps {
  active: boolean;
}

// Harsh angular pixel-grid biological schematics (replaces soft rounded cute organelle vectors)
function PixelHelixGrid({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 320"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* Stepped Pixelated DNA Rungs */}
      {[20, 48, 76, 104, 132, 160, 188, 216, 244, 272, 300].map((y, idx) => {
        const offset = Math.round(Math.sin(idx * 0.9) * 28);
        const x1 = 60 - Math.abs(offset);
        const x2 = 60 + Math.abs(offset);
        return (
          <g key={y}>
            <rect x={x1} y={y} width={Math.max(4, x2 - x1)} height="3" fill="#365314" />
            <rect x={x1 - 4} y={y - 3} width="8" height="8" fill="#4d7c0f" />
            <rect x={x2 - 4} y={y - 3} width="8" height="8" fill="#84cc16" />
          </g>
        );
      })}
    </svg>
  );
}

function PixelBioGridFrame({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 180 180"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect x="10" y="10" width="160" height="160" stroke="#3f4d36" strokeWidth="3" />
      <rect x="26" y="26" width="128" height="128" stroke="#75391e" strokeWidth="2" strokeDasharray="8 6" />
      <rect x="58" y="58" width="64" height="64" stroke="#4d7c0f" strokeWidth="3" fill="rgba(26, 46, 5, 0.25)" />
      <line x1="90" y1="0" x2="90" y2="180" stroke="#3f4d36" strokeWidth="1.5" />
      <line x1="0" y1="90" x2="180" y2="90" stroke="#3f4d36" strokeWidth="1.5" />
      <rect x="84" y="84" width="12" height="12" fill="#65a30d" />
    </svg>
  );
}

export function VoidAmbientOverlay({ active }: VoidAmbientOverlayProps) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="void-ambient-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          aria-hidden="true"
          className="fixed inset-0 z-10 pointer-events-none overflow-hidden"
        >
          {/* Left Pixel DNA Ladder */}
          <div className="absolute left-3 sm:left-6 top-8 w-24 sm:w-32 opacity-25">
            <PixelHelixGrid className="w-full h-auto" />
          </div>

          {/* Right Pixel DNA Ladder */}
          <div className="absolute right-3 sm:right-6 bottom-20 w-24 sm:w-32 opacity-22">
            <PixelHelixGrid className="w-full h-auto" />
          </div>

          {/* Angular Bio-Cell Reticle Grid */}
          <div className="absolute left-[10%] bottom-24 w-36 sm:w-44 opacity-20 hidden md:block">
            <PixelBioGridFrame className="w-full h-auto" />
          </div>

          <div className="absolute right-[10%] top-12 w-32 sm:w-40 opacity-20 hidden md:block">
            <PixelBioGridFrame className="w-full h-auto" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
