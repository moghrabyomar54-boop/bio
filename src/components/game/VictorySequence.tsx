import { useState } from 'react';
import { playMachineInsertSound } from '../../utils/soundEffects';

interface VictorySequenceProps {
  elapsedSec: number;
  onReplayLevel: () => void;
  onActivateCureIn3DRoom: () => void;
}

interface ProteinSpec {
  id: string;
  name: string;
  color: string;
  structuralClass: string;
  architecture: string;
  keyDifference: string;
  cellularRole: string;
}

const PROTEIN_DIFFERENCES: ProteinSpec[] = [
  {
    id: 'hemoglobin',
    name: 'Hemoglobin',
    color: '#FB7185',
    structuralClass: 'Globular · Quaternary (4°)',
    architecture: '4 globin chains (α₁, α₂, β₁, β₂) + 4 planar Heme disks with Fe²⁺',
    keyDifference:
      'Only reversible O₂-carrying metalloprotein tetramer shifting between R-State (lungs) & T-State (tissues).',
    cellularRole: 'Transports oxygen inside Red Blood Cells across the bloodstream.',
  },
  {
    id: 'collagen',
    name: 'Collagen',
    color: '#34D399',
    structuralClass: 'Fibrous · Triple Helix',
    architecture: '3 left-handed polypeptide chains twisted into a right-handed Gly–X–Y superhelix',
    keyDifference:
      'Tiny Glycine at every 3rd amino acid + Hydroxyproline H-bonds engineered for steel-like tensile strength.',
    cellularRole: 'Builds tendons, ligaments, cartilage, skin, and bone extracellular matrix.',
  },
  {
    id: 'enzymes',
    name: 'Enzymes',
    color: '#FB923C',
    structuralClass: 'Globular · Biological Catalysts',
    architecture: 'Folded 3D domain with precision Active-Site cleft & cofactor ions',
    keyDifference:
      'Speeds biochemical reactions 10⁸–10¹⁴× by lowering Activation Energy (ΔG‡) via Induced Fit without being consumed.',
    cellularRole: 'Drives digestion, DNA replication, and metabolic pathways inside cytoplasm.',
  },
  {
    id: 'keratin',
    name: 'Keratin',
    color: '#F472B6',
    structuralClass: 'Fibrous · Coiled-Coil & β-Sheets',
    architecture: 'Coiled α-keratin ropes + golden pleated β-keratin armor locked by Cysteine −S−S− bridges',
    keyDifference:
      'Rich in sulfur Cysteine disulfide bonds (−S−S−), giving hair elastic stretch and waterproof armor.',
    cellularRole: 'Forms hair fibers, nails, claws, and outer protective epithelial layers.',
  },
  {
    id: 'chaperone',
    name: 'Chaperone Protein',
    color: '#2DD4BF',
    structuralClass: 'Globular · ATP Foldase Machine',
    architecture: 'Nucleotide-Binding Domain (NBD) + Substrate Domain (SBDβ) + Hinged SBDα Lid',
    keyDifference:
      'Uses ATP → ADP energy (+ Mg²⁺/K⁺) to grab and refold stressed proteins before hydrophobic cores clump.',
    cellularRole: 'Protects cellular proteome quality control inside Ribosome Repair Chambers.',
  },
];

const CELL_CONSTRUCTION_PARTS = [
  {
    organelle: 'Plasma Membrane',
    color: '#34D399',
    detail:
      'Selective phospholipid bilayer studded with transmembrane transport & receptor proteins controlling everything entering or leaving the cell.',
  },
  {
    organelle: 'Nucleus & Nucleolus',
    color: '#A78BFA',
    detail:
      'Double-membrane command vault storing genomic DNA chromosomes transcribed into mRNA blueprints for every protein.',
  },
  {
    organelle: 'Ribosomes & Rough ER',
    color: '#38BDF8',
    detail:
      'Molecular assembly machines translating mRNA codons into polypeptide chains of the 20 amino acids.',
  },
  {
    organelle: 'Mitochondria',
    color: '#F59E0B',
    detail:
      'Double-membraned cellular powerhouses generating ATP energy molecules required for enzymes and chaperone folding.',
  },
  {
    organelle: 'Golgi Apparatus',
    color: '#FB7185',
    detail:
      'Stacked membrane cisternae that fold, glycosylate, and ship mature proteins to their target destinations.',
  },
];

const GREEN_AURA_LG =
  '0 0 12px rgba(74, 222, 128, 0.95), 0 0 28px rgba(34, 197, 94, 0.65)';
const GREEN_AURA_SM =
  '0 0 8px rgba(74, 222, 128, 0.85), 0 0 18px rgba(34, 197, 94, 0.48)';

export function VictorySequence({
  elapsedSec,
  onReplayLevel,
  onActivateCureIn3DRoom,
}: VictorySequenceProps) {
  const [machineInserted, setMachineInserted] = useState(false);
  const [selectedProteinId, setSelectedProteinId] = useState('hemoglobin');

  const activeProtein =
    PROTEIN_DIFFERENCES.find((p) => p.id === selectedProteinId) ??
    PROTEIN_DIFFERENCES[0];

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#050706]/95 flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-6xl border-2 border-[#4d6b38] bg-[#0b0f0c] p-6 sm:p-8 shadow-[8px_8px_0px_#020305] my-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#2a3822] pb-4 mb-5">
          <div>
            <div
              className="font-mono text-xs sm:text-sm font-bold text-[#D97706] tracking-widest uppercase"
              style={{ textShadow: GREEN_AURA_SM }}
            >
              CELLULAR BIO-SYNTHESIS TERMINAL · RUN TIME {formatTimer(elapsedSec)}
            </div>
            <h2
              className="font-display text-2xl sm:text-4xl font-black uppercase text-[#F1F5F9] mt-1"
              style={{ textShadow: GREEN_AURA_LG }}
            >
              {machineInserted
                ? 'Master DNA Accepted — All Protein Differences & Cell Construction'
                : 'Insert the Master Protein & Cell DNA into the Machine'}
            </h2>
          </div>

          {machineInserted && (
            <button
              type="button"
              onClick={onActivateCureIn3DRoom}
              className="px-6 py-3 border-2 border-white bg-[#65a30d] hover:bg-[#84cc16] text-slate-950 font-mono text-base sm:text-lg font-black shadow-[4px_4px_0px_#020305] cursor-pointer transition-colors"
            >
              Use Cure · Grow Back in 3D Room! →
            </button>
          )}
        </div>

        {!machineInserted ? (
          <div className="py-10 flex flex-col items-center text-center gap-6">
            <div className="w-60 h-40 border-2 border-dashed border-[#84cc16] bg-[#101611] flex flex-col items-center justify-center gap-3 shadow-[5px_5px_0px_#020305]">
              <svg viewBox="0 0 80 44" className="w-24 h-12" fill="none" aria-hidden="true">
                <path
                  d="M8 10 L22 10 L40 34 L58 34 L72 10"
                  stroke="#22D3EE"
                  strokeWidth="3.5"
                />
                <path
                  d="M8 34 L22 34 L40 10 L58 10 L72 34"
                  stroke="#84cc16"
                  strokeWidth="3.5"
                />
                <line x1="18" y1="14" x2="18" y2="30" stroke="#FDE047" strokeWidth="2.5" />
                <line x1="40" y1="12" x2="40" y2="32" stroke="#FB7185" strokeWidth="2.5" />
                <line x1="62" y1="14" x2="62" y2="30" stroke="#FDE047" strokeWidth="2.5" />
              </svg>
              <span
                className="font-mono text-sm font-bold text-[#A3E635]"
                style={{ textShadow: GREEN_AURA_SM }}
              >
                DNA HELIX RECEPTACLE READY
              </span>
            </div>

            <p
              className="font-mono text-sm sm:text-lg text-[#CBD5E1] max-w-xl"
              style={{ textShadow: GREEN_AURA_SM }}
            >
              You entered the 3D Bio-Machine! Insert the Double-Helix DNA delivered by the rescue Cell to unlock all 5 protein differences, inspect full cell construction, and grow back inside your 3D Dorm Room!
            </p>

            <button
              type="button"
              onClick={() => {
                playMachineInsertSound();
                setMachineInserted(true);
              }}
              className="px-8 py-4 border-2 border-white bg-[#22D3EE] hover:bg-[#67E8F9] text-slate-950 font-mono text-lg font-black shadow-[5px_5px_0px_#020305] cursor-pointer transition-colors"
            >
              Insert Master DNA into Machine
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {PROTEIN_DIFFERENCES.map((p) => {
                const selected = p.id === activeProtein.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedProteinId(p.id)}
                    className={`px-3 py-2.5 border-2 text-left cursor-pointer transition-colors ${
                      selected
                        ? 'bg-[#192417] border-[#84cc16] shadow-[3px_3px_0px_#020305]'
                        : 'bg-[#101511] border-[#2e3a28] hover:border-[#4d6b38]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 shrink-0 border border-[#020305]"
                        style={{ backgroundColor: p.color }}
                      />
                      <span className="font-mono text-sm font-bold text-[#F1F5F9] truncate">
                        {p.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 space-y-4">
                <div className="border-2 border-[#4d6b38] bg-[#101511] p-4 shadow-[4px_4px_0px_#020305]">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <h3
                      className="font-display text-xl sm:text-2xl font-black uppercase text-[#F1F5F9]"
                      style={{ textShadow: GREEN_AURA_SM }}
                    >
                      {activeProtein.name} · {activeProtein.structuralClass}
                    </h3>
                    <span
                      className="px-2.5 py-0.5 font-mono text-xs font-black text-slate-950 border border-[#020305]"
                      style={{ backgroundColor: activeProtein.color }}
                    >
                      PROTEIN DNA DATA
                    </span>
                  </div>
                  <p className="font-body text-sm sm:text-base text-[#D1FAE5] mb-1.5">
                    <strong className="text-[#4ADE80]">Architecture:</strong>{' '}
                    {activeProtein.architecture}
                  </p>
                  <p className="font-body text-sm sm:text-base text-[#ECFDF5] mb-1.5">
                    <strong className="text-[#FDE047]">Key Difference:</strong>{' '}
                    {activeProtein.keyDifference}
                  </p>
                  <p className="font-body text-sm sm:text-base text-[#A7F3D0]">
                    <strong className="text-[#4ADE80]">Cellular Role:</strong>{' '}
                    {activeProtein.cellularRole}
                  </p>
                </div>

                <div className="overflow-x-auto border-2 border-[#4d6b38] shadow-[4px_4px_0px_#020305]">
                  <table className="w-full text-left border-collapse font-mono text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-[#141c13] text-[#A3E635] uppercase">
                        <th className="p-2.5 border-b-2 border-[#4d6b38]">Protein</th>
                        <th className="p-2.5 border-b-2 border-[#4d6b38]">Class</th>
                        <th className="p-2.5 border-b-2 border-[#4d6b38]">
                          Defining Difference
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {PROTEIN_DIFFERENCES.map((row) => (
                        <tr
                          key={row.id}
                          onClick={() => setSelectedProteinId(row.id)}
                          className={`cursor-pointer border-b border-[#2e3a28] ${
                            row.id === activeProtein.id
                              ? 'bg-[#192417]'
                              : 'bg-[#0b0f0c] hover:bg-[#131913]'
                          }`}
                        >
                          <td className="p-2.5 font-bold text-[#F1F5F9] whitespace-nowrap">
                            <span
                              className="inline-block w-2.5 h-2.5 mr-2 border border-[#020305]"
                              style={{ backgroundColor: row.color }}
                            />
                            {row.name}
                          </td>
                          <td className="p-2.5 text-[#A3E635] whitespace-nowrap">
                            {row.structuralClass}
                          </td>
                          <td className="p-2.5 text-[#CBD5E1]">{row.keyDifference}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="border-2 border-[#4d6b38] bg-[#101511] p-4 flex flex-col gap-3 shadow-[4px_4px_0px_#020305]">
                <h3
                  className="font-display text-lg sm:text-xl font-black uppercase text-[#A3E635] border-b-2 border-[#2a3822] pb-2"
                  style={{ textShadow: GREEN_AURA_SM }}
                >
                  Construction of the Cell
                </h3>
                {CELL_CONSTRUCTION_PARTS.map((part) => (
                  <div
                    key={part.organelle}
                    className="bg-[#0a0d0b] border border-[#2e3a28] p-2.5"
                  >
                    <div className="font-mono text-sm font-bold text-[#F1F5F9] flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 shrink-0 border border-[#020305]"
                        style={{ backgroundColor: part.color }}
                      />
                      {part.organelle}
                    </div>
                    <p className="font-body text-xs text-[#CBD5E1] mt-1 leading-snug">
                      {part.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={onReplayLevel}
                className="px-5 py-2.5 border-2 border-[#4d6b38] bg-[#111711] hover:bg-[#1d281c] font-mono text-sm sm:text-base font-bold text-[#A3E635] cursor-pointer shadow-[3px_3px_0px_#020305]"
              >
                Replay Bio-Doom Level
              </button>
              <button
                type="button"
                onClick={onActivateCureIn3DRoom}
                className="px-8 py-3.5 border-2 border-white bg-[#65a30d] hover:bg-[#84cc16] text-slate-950 font-mono text-base sm:text-lg font-black shadow-[4px_4px_0px_#020305] cursor-pointer"
              >
                Activate Protein Cure · Grow Back in 3D Room →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
