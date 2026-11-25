import { MindMapBranch } from '../data/slides';

interface ProteinMindMapProps {
  rootTitle: string;
  accentColor: string;
  branches: MindMapBranch[];
  activeBranchIndex: number;
  onSelectBranchIndex: (idx: number) => void;
}

const HEADING_AURA =
  '0 0 10px rgba(74, 222, 128, 0.9), 0 0 24px rgba(34, 197, 94, 0.55)';

const TEXT_AURA =
  '0 0 8px rgba(74, 222, 128, 0.72), 0 0 20px rgba(34, 197, 94, 0.4)';

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
        style={{ textShadow: TEXT_AURA }}
      >
        <span className="font-bold uppercase tracking-wider text-[#4ADE80]">
          Mind Map
        </span>
        <span>
          Press{' '}
          <kbd className="px-2 py-0.5 text-sm bg-[#061510] border border-emerald-400/40 rounded text-[#ECFDF5]">
            Q
          </kbd>{' '}
          · Switch Node
        </span>
      </div>

      <div className="relative w-full h-[242px] rounded-xl bg-[#040E0C]/76 border border-emerald-400/25 shadow-[0_0_24px_rgba(34,197,94,0.12)] overflow-hidden">
        <svg
          viewBox="0 0 480 242"
          className="absolute inset-0 w-full h-full pointer-events-none"
          aria-hidden="true"
        >
          {branches.slice(0, 4).map((b, idx) => {
            const targetY = nodeYs[idx] ?? 121;
            const isSelected = idx === safeIndex;
            const startX = rootX + 66;
            const midX = Math.round((startX + branchX) / 2);
            const d = `M ${startX} ${rootY} C ${midX} ${rootY}, ${midX} ${targetY}, ${branchX} ${targetY}`;
            return (
              <g key={b.id}>
                <path
                  d={d}
                  fill="none"
                  stroke={isSelected ? '#4ADE80' : 'rgba(74, 222, 128, 0.28)'}
                  strokeWidth={isSelected ? 2.6 : 1.5}
                />
                <circle
                  cx={branchX}
                  cy={targetY}
                  r={isSelected ? 4.5 : 3}
                  fill={isSelected ? '#4ADE80' : 'rgba(74, 222, 128, 0.42)'}
                />
              </g>
            );
          })}
        </svg>

        <div
          className="absolute left-3 top-1/2 -translate-y-1/2 w-[144px] px-3 py-3 rounded-xl bg-[#051511]/90 border text-center"
          style={{
            borderColor: accentColor,
            boxShadow: `0 0 18px ${accentColor}38`,
          }}
        >
          <div
            className="font-display text-base sm:text-lg font-bold text-[#ECFDF5] leading-snug"
            style={{ textShadow: HEADING_AURA }}
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
                className={`w-full text-left px-3 py-1 rounded-xl border transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#4ADE80] ${
                  isSelected
                    ? 'bg-emerald-500/18 text-[#ECFDF5] border-[#4ADE80]/70 shadow-[0_0_16px_rgba(74,222,128,0.28)]'
                    : 'bg-[#05110E]/75 border-emerald-400/18 text-[#A7F3D0] hover:text-[#ECFDF5] hover:border-emerald-400/45'
                }`}
              >
                <div
                  className="text-xs sm:text-sm font-mono leading-tight text-[#86EFAC]"
                  style={{ textShadow: TEXT_AURA }}
                >
                  {b.label}
                </div>
                <div
                  className="text-base sm:text-[17px] font-semibold truncate text-[#ECFDF5] leading-snug"
                  style={{ textShadow: TEXT_AURA }}
                >
                  {b.shortValue}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {activeBranch && (
        <div className="px-4 py-2.5 rounded-xl bg-[#040E0C]/78 border border-emerald-400/24 text-base sm:text-[17px] text-[#ECFDF5] leading-snug">
          <span
            className="font-bold mr-1.5 text-[#4ADE80]"
            style={{ textShadow: TEXT_AURA }}
          >
            {activeBranch.label}:
          </span>
          <span style={{ textShadow: TEXT_AURA }}>{activeBranch.detail}</span>
        </div>
      )}
    </div>
  );
}
