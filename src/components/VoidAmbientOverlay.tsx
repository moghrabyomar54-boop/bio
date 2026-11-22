import { AnimatePresence, motion } from 'motion/react';

interface VoidAmbientOverlayProps {
  active: boolean;
}

const VOID_GLOW =
  'drop-shadow(0 0 10px rgba(74, 222, 128, 0.55)) drop-shadow(0 0 26px rgba(16, 185, 129, 0.3))';

function DnaStrandGraphic({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 340"
      fill="none"
      className={className}
      style={{ filter: VOID_GLOW }}
      aria-hidden="true"
    >
      {/* Backbone Strand A */}
      <path
        d="M28 12 C92 52, 92 92, 28 132 C-10 156, 92 212, 28 252 C-6 274, 72 304, 88 328"
        stroke="#4ADE80"
        strokeWidth="3.5"
        strokeLinecap="round"
        opacity="0.85"
      />
      {/* Backbone Strand B */}
      <path
        d="M92 12 C28 52, 28 92, 92 132 C130 156, 28 212, 92 252 C126 274, 48 304, 32 328"
        stroke="#2DD4BF"
        strokeWidth="3.5"
        strokeLinecap="round"
        opacity="0.85"
      />
      {/* Base-Pair Hydrogen Bond Rungs */}
      {[28, 48, 72, 92, 114, 150, 172, 194, 214, 234, 272, 294, 314].map((y, idx) => (
        <line
          key={y}
          x1={idx % 2 === 0 ? 34 : 42}
          y1={y}
          x2={idx % 2 === 0 ? 86 : 78}
          y2={y}
          stroke="#A7F3D0"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeDasharray={idx % 3 === 0 ? '4 4' : undefined}
          opacity="0.72"
        />
      ))}
    </svg>
  );
}

function MitochondrionGraphic({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 220 120"
      fill="none"
      className={className}
      style={{ filter: VOID_GLOW }}
      aria-hidden="true"
    >
      {/* Outer Membrane */}
      <rect
        x="10"
        y="14"
        width="200"
        height="92"
        rx="46"
        stroke="#4ADE80"
        strokeWidth="3"
        fill="rgba(16, 185, 129, 0.06)"
      />
      {/* Folded Inner Cristae Membrane */}
      <path
        d="M34 60 C34 34, 54 34, 54 62 C54 84, 72 84, 72 48 C72 28, 92 28, 92 66 C92 88, 110 88, 110 46 C110 26, 130 26, 130 68 C130 88, 148 88, 148 48 C148 30, 168 30, 168 62 C168 82, 186 82, 186 60"
        stroke="#2DD4BF"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.88"
      />
      {/* ATP Granules */}
      <circle cx="63" cy="52" r="3.2" fill="#86EFAC" opacity="0.85" />
      <circle cx="101" cy="64" r="2.8" fill="#86EFAC" opacity="0.75" />
      <circle cx="139" cy="54" r="3.4" fill="#86EFAC" opacity="0.85" />
    </svg>
  );
}

function EukaryoticCellGraphic({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      className={className}
      style={{ filter: VOID_GLOW }}
      aria-hidden="true"
    >
      {/* Plasma Membrane */}
      <path
        d="M100 12 C152 10, 188 46, 186 100 C184 154, 152 188, 98 186 C44 184, 12 150, 14 98 C16 46, 48 14, 100 12 Z"
        stroke="#4ADE80"
        strokeWidth="2.8"
        fill="rgba(16, 185, 129, 0.05)"
      />
      {/* Inner Membrane Ring */}
      <circle
        cx="100"
        cy="100"
        r="74"
        stroke="#2DD4BF"
        strokeWidth="1.2"
        strokeDasharray="6 6"
        opacity="0.55"
      />
      {/* Nucleus + Nucleolus */}
      <circle
        cx="96"
        cy="98"
        r="34"
        stroke="#86EFAC"
        strokeWidth="2.6"
        fill="rgba(74, 222, 128, 0.1)"
      />
      <circle cx="102" cy="94" r="12" fill="#4ADE80" opacity="0.55" />
      {/* Endoplasmic Reticulum Arcs */}
      <path
        d="M54 88 C46 112, 58 134, 82 142"
        stroke="#2DD4BF"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.75"
      />
      <path
        d="M138 72 C148 92, 144 118, 126 134"
        stroke="#2DD4BF"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.75"
      />
      {/* Ribosomes / Vesicles */}
      <circle cx="62" cy="54" r="5" stroke="#86EFAC" strokeWidth="1.8" />
      <circle cx="144" cy="56" r="4" fill="#2DD4BF" opacity="0.7" />
      <circle cx="136" cy="148" r="6" stroke="#4ADE80" strokeWidth="1.8" />
      <circle cx="54" cy="140" r="3.5" fill="#86EFAC" opacity="0.75" />
    </svg>
  );
}

function GolgiGraphic({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 180 140"
      fill="none"
      className={className}
      style={{ filter: VOID_GLOW }}
      aria-hidden="true"
    >
      {/* Stacked Cisternae */}
      <path
        d="M32 34 C72 18, 112 18, 148 34 C156 38, 152 48, 142 44 C108 32, 74 32, 38 44 C28 48, 24 38, 32 34 Z"
        stroke="#4ADE80"
        strokeWidth="2.4"
        fill="rgba(74, 222, 128, 0.08)"
      />
      <path
        d="M24 58 C68 42, 114 42, 154 58 C162 62, 158 72, 148 68 C110 56, 70 56, 30 68 C20 72, 16 62, 24 58 Z"
        stroke="#2DD4BF"
        strokeWidth="2.4"
        fill="rgba(45, 212, 191, 0.08)"
      />
      <path
        d="M36 82 C72 68, 110 68, 144 82 C152 86, 148 96, 138 92 C106 80, 74 80, 42 92 C32 96, 28 86, 36 82 Z"
        stroke="#86EFAC"
        strokeWidth="2.4"
        fill="rgba(134, 239, 172, 0.08)"
      />
      {/* Budding Secretory Vesicles */}
      <circle cx="164" cy="46" r="6" stroke="#4ADE80" strokeWidth="2" />
      <circle cx="16" cy="76" r="5" stroke="#2DD4BF" strokeWidth="2" />
      <circle cx="152" cy="108" r="7" stroke="#86EFAC" strokeWidth="2" />
      <circle cx="92" cy="116" r="4.5" fill="#4ADE80" opacity="0.65" />
    </svg>
  );
}

function RibosomeTranslatingGraphic({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 180 160"
      fill="none"
      className={className}
      style={{ filter: VOID_GLOW }}
      aria-hidden="true"
    >
      {/* Emerging Polypeptide Folding Chain */}
      <path
        d="M90 42 C96 24, 122 20, 128 34 C134 48, 114 54, 126 66 C138 78, 154 62, 152 46"
        stroke="#86EFAC"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeDasharray="1 5"
      />
      {/* 60S Large Ribosomal Subunit */}
      <path
        d="M38 86 C34 48, 62 32, 94 34 C126 36, 146 56, 138 86 Z"
        stroke="#4ADE80"
        strokeWidth="2.6"
        fill="rgba(74, 222, 128, 0.08)"
      />
      {/* 40S Small Ribosomal Subunit */}
      <rect
        x="42"
        y="94"
        width="92"
        height="34"
        rx="17"
        stroke="#2DD4BF"
        strokeWidth="2.6"
        fill="rgba(45, 212, 191, 0.08)"
      />
      {/* mRNA Strand */}
      <path
        d="M12 91 Q90 88 168 91"
        stroke="#A7F3D0"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.8"
      />
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
          transition={{ duration: 0.6 }}
          aria-hidden="true"
          className="fixed inset-0 z-10 pointer-events-none overflow-hidden"
        >
          {/* Left-Upper Tall Floating DNA Double Helix */}
          <div className="animate-void-float-slow absolute -left-6 sm:left-6 top-6 w-28 sm:w-40 opacity-35">
            <DnaStrandGraphic className="w-full h-auto rotate-12" />
          </div>

          {/* Right-Upper Diagonal DNA Strand */}
          <div
            className="animate-void-float-reverse absolute -right-4 sm:right-8 top-10 w-28 sm:w-40 opacity-30"
            style={{ animationDelay: '-4s' }}
          >
            <DnaStrandGraphic className="w-full h-auto -rotate-15" />
          </div>

          {/* Lower-Left Eukaryotic Cell + Nucleus Organelle */}
          <div
            className="animate-void-float-reverse absolute left-4 sm:left-14 bottom-20 w-36 sm:w-52 opacity-28"
            style={{ animationDelay: '-7s' }}
          >
            <EukaryoticCellGraphic className="w-full h-auto" />
          </div>

          {/* Top-Center-Left Mitochondrion Organelle */}
          <div
            className="animate-void-float-slow absolute left-[18%] top-[14%] w-36 sm:w-48 opacity-24 hidden md:block"
            style={{ animationDelay: '-9s' }}
          >
            <MitochondrionGraphic className="w-full h-auto -rotate-12" />
          </div>

          {/* Right-Mid Golgi Apparatus & Budding Vesicles */}
          <div
            className="animate-void-float-slow absolute right-[8%] top-[46%] w-32 sm:w-44 opacity-26 hidden sm:block"
            style={{ animationDelay: '-2.5s' }}
          >
            <GolgiGraphic className="w-full h-auto rotate-6" />
          </div>

          {/* Bottom-Right Translating Ribosome & Emerging Peptide */}
          <div
            className="animate-void-float-reverse absolute right-8 sm:right-20 bottom-24 w-32 sm:w-44 opacity-28"
            style={{ animationDelay: '-11s' }}
          >
            <RibosomeTranslatingGraphic className="w-full h-auto" />
          </div>

          {/* Deep Rotating Plasmid Ring Accent */}
          <div className="animate-void-spin-slow absolute left-[62%] top-[18%] w-36 h-36 opacity-20 hidden lg:block">
            <svg viewBox="0 0 120 120" fill="none" className="w-full h-full" style={{ filter: VOID_GLOW }}>
              <circle
                cx="60"
                cy="60"
                r="46"
                stroke="#4ADE80"
                strokeWidth="2.5"
                strokeDasharray="16 8 6 8"
              />
              <circle
                cx="60"
                cy="60"
                r="38"
                stroke="#2DD4BF"
                strokeWidth="1.5"
                strokeDasharray="10 12"
              />
            </svg>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
