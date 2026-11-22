import { MindMapBranch } from '../data/slides';

interface ProteinMindMapProps {
  rootTitle: string;
  accentColor: string;
  branches: MindMapBranch[];
  activeBranchIndex: number;
  onSelectBranchIndex: (idx: number) => void;
}

const GREEN_TEXT_AURA =
  '0 0 8px rgba(74, 222, 128, 0.72), 0 0 20px rgba(34, 197, 94, 0.42)';

export function ProteinMindMap({
  rootTitle,
  accentColor,
  branches,
  activeBranchIndex,
  onSelectBranchIndex,
}: ProteinMindMapProps) {
  const safeIndex =
    branches.length > 0
      ? ((activeBranchIndex % branches.length) + branches.length) %
        branches.length
      : 0;
  const activeBranch = branches[safeIndex] ?? branches[0];

  const nodeYs = [31, 91, 151, 211];
  const rootX = 76;
  const rootY = 121;
  const branchX = 248;

  return (
    <div className="space-y-2.5">
      <div
        className="flex items-center justify-between text-sm sm:text-base font-mono text-[#86EFAC]"
        style={{ textShadow: GREEN_TEXT_AURA }}
      >
        <span className="font-semibold">Mind Map</span>
        <span>
          Press <kbd className="px-2 py-0.5 text-sm bg-[#061510] border border-emerald-400/40 rounded text-[#ECFDF5]">Q</kbd> · Switch Node
        </span>
      </div>

      <div className="relative w-full h-[242px] bg-[#040B0A]/85 border border-emerald-400/25 rounded-lg overflow-hidden">
        <svg
          viewBox="0 0 480 242"
          className="absolute inset-0 w-full h-full pointer-events-none"
          aria-hidden="true"
        >
          {branches.slice(0, 4).map((b, idx) => {
            const targetY = nodeYs[idx] ?? 121;
            const isSelected = idx === safeIndex;
            const d = `M ${rootX + 64} ${rootY} C ${rootX + 114} ${rootY}, ${
              branchX - 50
            } ${targetY}, ${branchX} ${targetY}`;
            return (
              <g key={b.id}>
                <path
                  d={d}
                  fill="none"
                  stroke={isSelected ? '#4ADE80' : 'rgba(74, 222, 128, 0.25)'}
                  strokeWidth={isSelected ? 3 : 1.5}
                />
                <circle
                  cx={branchX}
                  cy={targetY}
                  r={isSelected ? 5 : 3.2}
                  fill={isSelected ? '#4ADE80' : 'rgba(74, 222, 128, 0.45)'}
                />
              </g>
            );
          })}
        </svg>

        <div
          className="absolute left-3 top-1/2 -translate-y-1/2 w-[144px] px-3 py-3 rounded-lg bg-[#061510] border text-center shadow-lg"
          style={{ borderColor: accentColor }}
        >
          <div
            className="font-display text-base sm:text-lg font-bold text-[#ECFDF5] leading-snug"
            style={{ textShadow: GREEN_TEXT_AURA }}
          >
            {rootTitle}
          </div>
        </div>

        <div
          role="listbox"
          aria-label="Protein mind map branches"
          className="absolute right-2.5 top-0 bottom-0 w-[262px] flex flex-col justify-between py-2"
        >
          {branches.slice(0, 4).map((b, idx) => {
            const isSelected = idx === safeIndex;
            return (
              <div
                key={b.id}
                role="option"
                aria-selected={isSelected}
                tabIndex={0}
                onClick={() => onSelectBranchIndex(idx)}
                onMouseEnter={() => onSelectBranchIndex(idx)}
                onFocus={() => onSelectBranchIndex(idx)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectBranchIndex(idx);
                  }
                }}
                className={`w-full text-left px-3 py-1 rounded-md border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400 ${
                  isSelected
                    ? 'bg-[#081F17] text-[#ECFDF5] border-emerald-400'
                    : 'bg-[#05100C]/90 border-emerald-400/20 text-[#DCFCE7] hover:text-white hover:border-emerald-400/50'
                }`}
              >
                <div
                  className="text-xs sm:text-sm font-mono leading-tight text-[#86EFAC]"
                  style={{ textShadow: GREEN_TEXT_AURA }}
                >
                  {b.label}
                </div>
                <div
                  className="text-base sm:text-[17px] font-bold truncate text-[#ECFDF5] leading-snug"
                  style={{ textShadow: GREEN_TEXT_AURA }}
                >
                  {b.shortValue}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {activeBranch && (
        <div className="px-4 py-2.5 rounded-lg bg-[#05130E] border border-emerald-400/25 text-base sm:text-[17px] text-[#ECFDF5] leading-snug">
          <span
            className="font-bold mr-1.5 text-[#4ADE80]"
            style={{ textShadow: GREEN_TEXT_AURA }}
          >
            {activeBranch.label}:
          </span>
          <span style={{ textShadow: GREEN_TEXT_AURA }}>{activeBranch.detail}</span>
        </div>
      )}
    </div>
  );
}
