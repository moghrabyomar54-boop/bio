import { PresentationSimState, ProteinSlide } from '../data/slides';

interface ScientificDiagramsProps {
  slide: ProteinSlide;
  simState: PresentationSimState;
}

const TEXT_AURA =
  '0 0 8px rgba(74, 222, 128, 0.72), 0 0 20px rgba(34, 197, 94, 0.4)';

export function ScientificDiagrams({ slide, simState }: ScientificDiagramsProps) {
  switch (slide.diagramType) {
    case 'oxygen':
      return (
        <div className="pt-2.5 border-t border-emerald-400/20">
          <div
            className="flex items-center justify-between text-base font-semibold text-[#86EFAC] mb-1.5"
            style={{ textShadow: TEXT_AURA }}
          >
            <span>Cooperative O₂ Dissociation</span>
            <span className="font-mono text-[#ECFDF5] font-bold">
              {simState.hemoglobinOxy ? 'R-State · 4 O₂ Bound' : 'T-State · Deoxy'}
            </span>
          </div>
          <svg
            viewBox="0 0 440 84"
            className="w-full h-20"
            aria-label="Hemoglobin oxygen dissociation curve"
          >
            <line x1="20" y1="68" x2="188" y2="68" stroke="rgba(74,222,128,0.4)" strokeWidth="2" />
            <line x1="20" y1="10" x2="20" y2="68" stroke="rgba(74,222,128,0.4)" strokeWidth="2" />
            <path
              d="M20 67 C54 66 72 40 94 25 C116 12 146 11 184 10"
              fill="none"
              stroke="#4ADE80"
              strokeWidth="3"
            />
            <circle
              cx={simState.hemoglobinOxy ? 164 : 58}
              cy={simState.hemoglobinOxy ? 11 : 53}
              r="5.5"
              fill={simState.hemoglobinOxy ? '#ECFDF5' : '#F59E0B'}
              stroke="#4ADE80"
              strokeWidth="2"
            />
            <text x="202" y="25" fill="#ECFDF5" fontSize="15.5" fontWeight="700">
              R-State (Lungs · 100 mmHg)
            </text>
            <text x="202" y="49" fill="#A7F3D0" fontSize="15">
              T-State (Tissue · 40 mmHg)
            </text>
            <text x="202" y="72" fill="#86EFAC" fontSize="14.5">
              4 Heme b · Central Fe²⁺
            </text>
          </svg>
        </div>
      );

    case 'collagen':
      return (
        <div className="pt-2.5 border-t border-emerald-400/20">
          <div
            className="flex items-center justify-between text-base font-semibold text-[#86EFAC] mb-1.5"
            style={{ textShadow: TEXT_AURA }}
          >
            <span>Repeating Triplet Sequence</span>
            <span className="font-mono text-[#ECFDF5] font-bold">Gly – X – Y Motif</span>
          </div>
          <svg
            viewBox="0 0 440 80"
            className="w-full h-20"
            aria-label="Collagen Gly-Pro-Hyp sequence motif"
          >
            {[
              { x: 6, label: 'Glycine', sub: 'Core Axis', color: '#4ADE80' },
              { x: 150, label: 'Proline', sub: 'Twist Pitch', color: '#34D399' },
              { x: 294, label: 'Hydroxyproline', sub: 'H-Bond Lock', color: '#86EFAC' },
            ].map((item) => (
              <g key={item.label}>
                <rect
                  x={item.x}
                  y="6"
                  width="138"
                  height="64"
                  rx="10"
                  fill="rgba(4, 16, 13, 0.78)"
                  stroke={item.color}
                  strokeWidth="1.6"
                  strokeOpacity={simState.collagenHighlightMotif ? 0.9 : 0.45}
                />
                <text
                  x={item.x + 69}
                  y="33"
                  textAnchor="middle"
                  fill="#ECFDF5"
                  fontSize="15.5"
                  fontWeight="700"
                >
                  {item.label}
                </text>
                <text
                  x={item.x + 69}
                  y="56"
                  textAnchor="middle"
                  fill="#86EFAC"
                  fontSize="13.5"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {item.sub}
                </text>
              </g>
            ))}
          </svg>
        </div>
      );

    case 'energy':
      return (
        <div className="pt-2.5 border-t border-emerald-400/20">
          <div
            className="flex items-center justify-between text-base font-semibold text-[#86EFAC] mb-1.5"
            style={{ textShadow: TEXT_AURA }}
          >
            <span>Activation Energy Profile</span>
            <span className="font-mono text-[#ECFDF5] font-bold">
              {simState.catalysisActive ? 'Catalysis Active' : 'Paused'}
            </span>
          </div>
          <svg
            viewBox="0 0 440 84"
            className="w-full h-20"
            aria-label="Enzyme activation energy diagram"
          >
            <line x1="16" y1="68" x2="188" y2="68" stroke="rgba(74,222,128,0.4)" strokeWidth="2" />
            <path
              d="M20 44 Q86 -4 146 60 L184 60"
              fill="none"
              stroke="#FB923C"
              strokeDasharray="4 3"
              strokeWidth="2.4"
            />
            <path
              d="M20 44 Q62 24 88 30 Q116 24 146 60 L184 60"
              fill="none"
              stroke="#4ADE80"
              strokeWidth="3"
            />
            <text x="202" y="25" fill="#A7F3D0" fontSize="15">
              Uncatalyzed ΔG‡
            </text>
            <text x="202" y="49" fill="#ECFDF5" fontSize="15.5" fontWeight="700">
              Active-Site ΔG‡ Lowered
            </text>
            <text x="202" y="72" fill="#86EFAC" fontSize="14.5">
              4 Catalytic Subunit Pockets
            </text>
          </svg>
        </div>
      );

    case 'keratin':
      return (
        <div className="pt-2.5 border-t border-emerald-400/20">
          <div
            className="flex items-center justify-between text-base font-semibold text-[#86EFAC] mb-1.5"
            style={{ textShadow: TEXT_AURA }}
          >
            <span>Secondary Structural Motifs</span>
            <span className="font-mono text-[#ECFDF5] font-bold">α-Helix + β-Sheet</span>
          </div>
          <svg
            viewBox="0 0 440 80"
            className="w-full h-20"
            aria-label="Keratin alpha-helix and beta-sheet motif diagram"
          >
            <path
              d="M22 34 Q31 12 40 34 T58 34 T76 34 T94 34 T112 34 T130 34 T148 34 T166 34"
              fill="none"
              stroke="#4ADE80"
              strokeWidth="3.2"
            />
            <text x="94" y="66" textAnchor="middle" fill="#ECFDF5" fontSize="15.5" fontWeight="700">
              (b) α-Helix Coil
            </text>
            <polyline
              points="232,22 258,10 284,22 310,10 336,22 362,10 388,22"
              fill="none"
              stroke="#F472B6"
              strokeWidth="3.2"
            />
            <polyline
              points="232,42 258,30 284,42 310,30 336,42 362,30 388,42"
              fill="none"
              stroke="#F472B6"
              strokeWidth="3.2"
            />
            <text x="310" y="66" textAnchor="middle" fill="#ECFDF5" fontSize="15.5" fontWeight="700">
              (c) β-Pleated Sheets
            </text>
          </svg>
        </div>
      );

    case 'chaperone':
      return (
        <div className="pt-2.5 border-t border-emerald-400/20">
          <div
            className="flex items-center justify-between text-base font-semibold text-[#86EFAC] mb-1.5"
            style={{ textShadow: TEXT_AURA }}
          >
            <span>Chaperone Folding Cycle</span>
            <span className="font-mono text-[#ECFDF5] font-bold">
              ATP · Mg²⁺ / K⁺ Cleft
            </span>
          </div>
          <svg
            viewBox="0 0 440 80"
            className="w-full h-20"
            aria-label="Chaperone ATP to ADP folding cycle"
          >
            <rect
              x="8"
              y="8"
              width="186"
              height="62"
              rx="10"
              fill="rgba(4, 16, 13, 0.78)"
              stroke="#4ADE80"
              strokeWidth="1.6"
            />
            <text x="101" y="34" textAnchor="middle" fill="#ECFDF5" fontSize="15.5" fontWeight="700">
              ATP Bound (Open)
            </text>
            <text x="101" y="56" textAnchor="middle" fill="#86EFAC" fontSize="13.5">
              Captures Unfolded Chain
            </text>
            <path d="M200 39 L240 39" stroke="#4ADE80" strokeWidth="2.8" />
            <rect
              x="246"
              y="8"
              width="186"
              height="62"
              rx="10"
              fill="rgba(4, 16, 13, 0.78)"
              stroke="#2DD4BF"
              strokeWidth="1.6"
            />
            <text x="339" y="34" textAnchor="middle" fill="#ECFDF5" fontSize="15.5" fontWeight="700">
              ADP Bound (Refold)
            </text>
            <text x="339" y="56" textAnchor="middle" fill="#A7F3D0" fontSize="13.5">
              Rescues Native 3D Shape
            </text>
          </svg>
        </div>
      );
  }
}
