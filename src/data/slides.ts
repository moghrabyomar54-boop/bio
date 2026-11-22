export type ProteinControlType =
  | 'hemoglobin-oxygen'
  | 'collagen-twist'
  | 'enzyme-catalysis'
  | 'keratin-motif'
  | 'chaperone-cycle';

export interface SlideStat {
  label: string;
  value: string;
  unit: string;
}

export interface MicroscopeDetail {
  part: string;
  role: string;
  color: string;
}

export interface MindMapBranch {
  id: string;
  label: string;
  shortValue: string;
  detail: string;
  color: string;
}

export interface ProteinSlide {
  id: string;
  index: number;
  chapter: string;
  worldName: string;
  worldShort: string;
  worldVibe: string;
  worldAction: string;
  worldBgHex: string;
  worldRimHex: string;
  scaleLabel: string;
  title: string;
  subtitle: string;
  mindMapBranches: MindMapBranch[];
  stats: SlideStat[];
  speakerNotes: string;
  controlType: ProteinControlType;
  diagramType: 'oxygen' | 'collagen' | 'energy' | 'keratin' | 'chaperone';
  stationPos: [number, number, number];
  cameraOffset: [number, number, number];
  lookAtOffset: [number, number, number];
  microscopeOffset: [number, number, number];
  microscopeLookAtOffset: [number, number, number];
  microscopeMagnification: string;
  microscopeScaleBar: string;
  microscopeTargetName: string;
  microscopeSummary: string;
  microscopeDetails: MicroscopeDetail[];
  referenceImage: string;
  accentColor: string;
}

export interface PresentationSimState {
  hemoglobinOxy: boolean;
  collagenHighlightMotif: boolean;
  catalysisActive: boolean;
  keratinHighlightSheets: boolean;
  chaperoneAdpBound: boolean;
}

export const INITIAL_SIM_STATE: PresentationSimState = {
  hemoglobinOxy: true,
  collagenHighlightMotif: true,
  catalysisActive: true,
  keratinHighlightSheets: true,
  chaperoneAdpBound: false,
};

export const PROTEIN_SLIDES: ProteinSlide[] = [
  {
    id: 'hemoglobin',
    index: 0,
    chapter: '01 / 05',
    worldName: 'The Bloodstream / Red Blood Cell World',
    worldShort: 'Bloodstream',
    worldVibe: 'High-speed red river and bustling oxygen cargo hub inside a Red Blood Cell.',
    worldAction: 'Picking up O₂ molecules in the lungs and delivering them to oxygen-starved tissues.',
    worldBgHex: '#130509',
    worldRimHex: '#FB7185',
    scaleLabel: '6.5 nm · Transport Protein',
    title: 'Hemoglobin',
    subtitle:
      'Tetrameric oxygen-transport metalloprotein housed inside Red Blood Cells, composed of two α chains and two β chains cradling iron-bearing Heme groups.',
    mindMapBranches: [
      {
        id: 'world',
        label: 'World Hub',
        shortValue: 'Red Blood Cell',
        detail: 'High-speed red river and bustling oxygen cargo hub inside a Red Blood Cell.',
        color: '#FB7185',
      },
      {
        id: 'structure',
        label: 'Architecture',
        shortValue: 'α₁, α₂ & β₁, β₂',
        detail: 'Four globin chains (α chain 1, α chain 2, β chain 1, β chain 2) form the tetramer.',
        color: '#E1341E',
      },
      {
        id: 'core',
        label: 'Active Core',
        shortValue: '4 × Heme (Fe²⁺)',
        detail: 'Each subunit holds a planar Heme disk with a central Fe²⁺ iron atom.',
        color: '#FDE68A',
      },
      {
        id: 'action',
        label: 'Delivery Shift',
        shortValue: 'Lungs → Tissues',
        detail: 'Picking up O₂ molecules in the lungs and delivering them to oxygen-starved tissues.',
        color: '#38BDF8',
      },
    ],
    stats: [
      { label: 'Quaternary', value: 'α₂β₂', unit: '4 chains' },
      { label: 'Heme Centers', value: '4 × Fe²⁺', unit: 'iron core' },
      { label: 'Molecular Mass', value: '64.5', unit: 'kDa' },
    ],
    speakerNotes:
      'In the Bloodstream World, you see the intact Red Blood Cell. Press E to zoom the microscope inside the Red Blood Cell and reveal the 3D Hemoglobin tetramer (α chain 1, α chain 2, β chain 1, β chain 2, Heme, and Fe²⁺).',
    controlType: 'hemoglobin-oxygen',
    diagramType: 'oxygen',
    stationPos: [0, 0, 0],
    cameraOffset: [-1.6, 1.4, 11.8],
    lookAtOffset: [-2.3, 0.0, 0],
    microscopeOffset: [-1.0, 0.25, 6.4],
    microscopeLookAtOffset: [-1.35, 0.0, 0.0],
    microscopeMagnification: '1,800,000×',
    microscopeScaleBar: '0.5 nm · 5 Å',
    microscopeTargetName: 'Hemoglobin Tetramer (α₁, α₂, β₁, β₂ & Heme Fe²⁺)',
    microscopeSummary:
      'Inside the Red Blood Cell, four globin polypeptide chains—β chain 1, β chain 2, α chain 1, and α chain 2—each cradle a gold Heme disk with a central Fe²⁺ ion.',
    microscopeDetails: [
      {
        part: 'β chain 1',
        role: 'Vermilion-red upper-left globin subunit cradling an O₂-binding Heme group',
        color: '#E1341E',
      },
      {
        part: 'β chain 2',
        role: 'Terracotta-orange upper-right subunit shifting during allosteric O₂ uptake',
        color: '#DF8656',
      },
      {
        part: 'α chain 1',
        role: 'Deep maroon lower-left globin subunit anchoring the tetramer interface',
        color: '#782C2E',
      },
      {
        part: 'α chain 2 & Heme (Fe²⁺)',
        role: 'Coral-pink lower-right chain holding the cream-gold Heme disk and Fe²⁺ ion',
        color: '#F26B7A',
      },
    ],
    referenceImage: '/assets/aistudio/image_952afb42.png',
    accentColor: '#FB7185',
  },
  {
    id: 'collagen',
    index: 1,
    chapter: '02 / 05',
    worldName: 'The Tendon / Bone Matrix World',
    worldShort: 'Tendon Matrix',
    worldVibe: 'Massive structural construction zone made of braided steel-like cables and scaffolding.',
    worldAction: 'Triple-helix ropes lock together to resist stretching and hold the body’s frame together.',
    worldBgHex: '#071014',
    worldRimHex: '#6EE7B7',
    scaleLabel: '1.5 nm × 300 nm · Fibrous Protein',
    title: 'Collagen',
    subtitle:
      'High-tensile triple-helical structural cable formed by three intertwined polypeptide chains rich in Glycine, Proline, and Hydroxyproline.',
    mindMapBranches: [
      {
        id: 'world',
        label: 'World Hub',
        shortValue: 'Tendon & Bone',
        detail: 'Massive structural construction zone made of braided steel-like cables and scaffolding.',
        color: '#6EE7B7',
      },
      {
        id: 'structure',
        label: 'Architecture',
        shortValue: '3-Chain Superhelix',
        detail: 'Repeating Gly–X–Y triplet places tiny Glycine inside the crowded helix core.',
        color: '#C4B5FD',
      },
      {
        id: 'core',
        label: 'Key Rings',
        shortValue: 'Proline & Hyp',
        detail: 'Proline and Hydroxyproline rings lock the tight left-handed helical twist.',
        color: '#FDBA74',
      },
      {
        id: 'action',
        label: 'Mechanical Role',
        shortValue: 'Resist Stretching',
        detail: 'Triple-helix ropes lock together to resist stretching and hold the body’s frame together.',
        color: '#FACC15',
      },
    ],
    stats: [
      { label: 'Triple Helix', value: '3', unit: 'α-chains' },
      { label: 'Triplet Motif', value: 'Gly–Pro–Hyp', unit: 'repeat' },
      { label: 'Tensile Strength', value: '~120', unit: 'MPa' },
    ],
    speakerNotes:
      'World 2 is the Tendon & Bone Matrix construction zone. Press E to zoom the microscope into the Glycine–Hydroxyproline–Proline–Alanine triple-helix core.',
    controlType: 'collagen-twist',
    diagramType: 'collagen',
    stationPos: [0, 0, 0],
    cameraOffset: [-1.6, 1.2, 11.8],
    lookAtOffset: [-2.3, 0.0, 0],
    microscopeOffset: [-1.0, 0.45, 4.7],
    microscopeLookAtOffset: [-1.3, 0.25, 0.0],
    microscopeMagnification: '2,400,000×',
    microscopeScaleBar: '0.4 nm · 4 Å',
    microscopeTargetName: 'Gly–Pro–Hyp Triple-Helix Core',
    microscopeSummary:
      'Glycine’s single hydrogen side chain fits cleanly inside the central axis while Hydroxyproline hydroxyl groups form stabilizing inter-strand hydrogen bridges.',
    microscopeDetails: [
      {
        part: 'Glycine (Gly)',
        role: 'Every 3rd residue; smallest amino acid fitting the tight central axis',
        color: '#FACC15',
      },
      {
        part: 'Hydroxyproline (Hyp)',
        role: 'Vitamin-C-dependent ring stabilizing inter-chain H-bonds',
        color: '#6EE7B7',
      },
      {
        part: 'Proline & Alanine',
        role: 'Rigid pyrrolidine rings enforcing the left-handed superhelix pitch',
        color: '#FDBA74',
      },
      {
        part: '3-Chain Spacefill Braid',
        role: 'Mint, peach, and lavender chains twisted into a right-handed rope',
        color: '#C4B5FD',
      },
    ],
    referenceImage: '/assets/aistudio/image_0ed1b1bc.png',
    accentColor: '#6EE7B7',
  },
  {
    id: 'enzymes',
    index: 2,
    chapter: '03 / 05',
    worldName: 'The Cytoplasm / Metabolic Workshop World',
    worldShort: 'Metabolic Workshop',
    worldVibe: 'Fast-paced molecular factory inside the Cytoplasm and Mitochondrion.',
    worldAction: 'Substrates snap into the enzyme’s Active Site (Induced Fit) and transform into products at lightning speed.',
    worldBgHex: '#070B19',
    worldRimHex: '#F97316',
    scaleLabel: '12 nm · Catalytic Complex',
    title: 'Enzymes',
    subtitle:
      'Multi-domain macromolecular catalysts folded into dense α-helical rings with sculpted crimson active-site pockets.',
    mindMapBranches: [
      {
        id: 'world',
        label: 'World Hub',
        shortValue: 'Cytoplasm Factory',
        detail: 'Fast-paced molecular factory inside the Cytoplasm and Mitochondrion.',
        color: '#F97316',
      },
      {
        id: 'structure',
        label: 'Architecture',
        shortValue: '4 Helical Domains',
        detail: 'Subunit interfaces form recessed active-site clefts for substrate specificity.',
        color: '#93C5FD',
      },
      {
        id: 'core',
        label: 'Catalytic Site',
        shortValue: 'Crimson Pocket',
        detail: 'Stabilize the reaction transition state to accelerate rates by 10⁶–10¹⁷×.',
        color: '#EF4444',
      },
      {
        id: 'action',
        label: 'Induced Fit',
        shortValue: 'Fast Product Flow',
        detail: 'Substrates snap into the Active Site and transform into products without consuming the enzyme.',
        color: '#34D399',
      },
    ],
    stats: [
      { label: 'Active Sites', value: '4', unit: 'catalytic clefts' },
      { label: 'Rate Gain', value: '10⁸–10¹⁴', unit: 'fold' },
      { label: 'Net Equilibrium', value: 'ΔG', unit: 'unchanged' },
    ],
    speakerNotes:
      'World 3 is the Cytoplasm Metabolic Workshop. Press E to zoom straight into a crimson Active-Site pocket and inspect the cofactor geometry.',
    controlType: 'enzyme-catalysis',
    diagramType: 'energy',
    stationPos: [0, 0, 0],
    cameraOffset: [-1.6, 1.4, 12.0],
    lookAtOffset: [-2.3, 0.0, 0],
    microscopeOffset: [0.0, 1.05, 4.8],
    microscopeLookAtOffset: [-0.45, 0.7, 0.2],
    microscopeMagnification: '1,250,000×',
    microscopeScaleBar: '1.0 nm · 10 Å',
    microscopeTargetName: 'Crimson Active-Site Pocket & Cofactor',
    microscopeSummary:
      'Surrounding α-helices position charged catalytic residues inside the crimson pocket to strain substrate bonds and lower the transition-state barrier.',
    microscopeDetails: [
      {
        part: 'Four Helical Subunits',
        role: 'Mint, periwinkle, rose, and pale-gold domains forming the catalytic ring',
        color: '#93C5FD',
      },
      {
        part: 'Crimson Active-Site Cleft',
        role: 'Recessed binding surface sculpted for lock-and-key / induced fit',
        color: '#EF4444',
      },
      {
        part: 'Substrate & Cofactor',
        role: 'Docked chemical reactants undergoing bond cleavage and release',
        color: '#F59E0B',
      },
      {
        part: 'Central Catalytic Cavity',
        role: 'Solvent-accessible lumen regulating allosteric subunit crosstalk',
        color: '#FDE047',
      },
    ],
    referenceImage: '/assets/aistudio/image_9bf0ebab.png',
    accentColor: '#F97316',
  },
  {
    id: 'keratin',
    index: 3,
    chapter: '04 / 05',
    worldName: 'The Hair Fiber World',
    worldShort: 'Hair Fiber',
    worldVibe: 'Springy, elastic tower woven from coiled α-helix ropes inside a Hair Strand.',
    worldAction: 'Stretching under tension and bouncing back without breaking.',
    worldBgHex: '#120715',
    worldRimHex: '#EC4899',
    scaleLabel: '3.5 nm · Structural Filament',
    title: 'Keratin',
    subtitle:
      'Resilient fibrous protein combining coiled magenta α-helices and golden pleated β-sheets cross-linked by disulfide bonds.',
    mindMapBranches: [
      {
        id: 'world',
        label: 'World Hub',
        shortValue: 'Hair Strand Tower',
        detail: 'Springy, elastic tower woven from coiled α-helix ropes inside a Hair Strand.',
        color: '#EC4899',
      },
      {
        id: 'structure',
        label: 'α-Keratin',
        shortValue: 'Magenta α-Helices',
        detail: 'α-Keratin forms coiled-coil helical ropes rich in stabilizing cysteine links.',
        color: '#DB2777',
      },
      {
        id: 'core',
        label: 'β-Keratin',
        shortValue: 'Golden β-Sheets',
        detail: 'β-Keratin arranges stacked zigzag pleated sheets for rigid durability.',
        color: '#EAB308',
      },
      {
        id: 'action',
        label: 'Elasticity',
        shortValue: 'Stretch & Rebound',
        detail: 'Stretching under tension and bouncing back without breaking.',
        color: '#38BDF8',
      },
    ],
    stats: [
      { label: 'α-Helix Pitch', value: '5.4', unit: 'Å / turn' },
      { label: 'β-Sheet Repeat', value: '7.0', unit: 'Å pleat' },
      { label: 'Cross-Links', value: 'S–S', unit: 'disulfide' },
    ],
    speakerNotes:
      'World 4 places you inside a Hair Fiber cortex where elastic α-helix towers stretch and rebound. Press E to zoom into the α-helix & β-pleated sheet interface.',
    controlType: 'keratin-motif',
    diagramType: 'keratin',
    stationPos: [0, 0, 0],
    cameraOffset: [-1.6, 1.4, 11.8],
    lookAtOffset: [-2.3, 0.0, 0],
    microscopeOffset: [-0.9, -0.4, 4.7],
    microscopeLookAtOffset: [-1.2, -0.45, 0.1],
    microscopeMagnification: '2,100,000×',
    microscopeScaleBar: '0.5 nm · 5 Å',
    microscopeTargetName: 'α-Helix Ribbon & Pleated β-Sheet Array',
    microscopeSummary:
      'Magenta α-helices provide elastic spring recovery while stacked golden zigzag β-pleated sheets distribute mechanical shear across hydrogen-bonded strands.',
    microscopeDetails: [
      {
        part: 'Magenta α-Helix Coils',
        role: 'Right-handed helical ribbons (3.6 residues/turn) giving elastic stretch',
        color: '#EC4899',
      },
      {
        part: 'Golden Zigzag β-Sheets',
        role: 'Pleated parallel/antiparallel arrays providing rigid surface armor',
        color: '#EAB308',
      },
      {
        part: 'Silver-Blue Loop Turns',
        role: 'Flexible polypeptide hinges connecting helices and sheet domains',
        color: '#94A3B8',
      },
      {
        part: 'Disulfide Cysteine Bridges',
        role: 'Covalent S–S links locking adjacent keratin strands together',
        color: '#FBBF24',
      },
    ],
    referenceImage: '/assets/aistudio/image_f4149278.png',
    accentColor: '#EC4899',
  },
  {
    id: 'chaperone',
    index: 4,
    chapter: '05 / 05',
    worldName: 'The Ribosome / Protein Repair Chamber',
    worldShort: 'Repair Chamber',
    worldVibe: 'Protective folding sanctuary right next to the Ribosomes and rescue pod arches.',
    worldAction: 'Helping stressed or misfolded proteins refold back into their proper 3D native shape after denaturation.',
    worldBgHex: '#061117',
    worldRimHex: '#2DD4BF',
    scaleLabel: '7.0 nm · Folding Machine',
    title: 'Chaperone Protein',
    subtitle:
      'ATP-driven Hsp70 molecular chaperone featuring a nucleotide-binding domain (NBD) and hinged SBDα lid guiding native folding.',
    mindMapBranches: [
      {
        id: 'world',
        label: 'World Hub',
        shortValue: 'Ribosome Sanctuary',
        detail: 'Protective folding sanctuary right next to the Ribosomes and rescue pod arches.',
        color: '#2DD4BF',
      },
      {
        id: 'structure',
        label: 'NBD Motor',
        shortValue: 'ATP → ADP Fuel',
        detail: 'Nucleotide-Binding Domain (NBD) hydrolyzes ATP → ADP to power conformation shifts.',
        color: '#3B82F6',
      },
      {
        id: 'core',
        label: 'Rescue Lid',
        shortValue: 'SBDα & SBDβ',
        detail: 'ATP opens SBDα lid for unfolded peptides; ADP clamps SBDα shut for safe folding.',
        color: '#94A3B8',
      },
      {
        id: 'action',
        label: 'Repair Action',
        shortValue: 'Native Refolding',
        detail: 'Helping stressed or misfolded proteins refold back into their proper 3D native shape.',
        color: '#EF4444',
      },
    ],
    stats: [
      { label: 'Energy Fuel', value: 'ATP → ADP', unit: 'hydrolysis' },
      { label: 'Domains', value: 'NBD + SBD', unit: 'α lid / β base' },
      { label: 'Client State', value: 'Folded', unit: 'aggregation-free' },
    ],
    speakerNotes:
      'World 5 is the Ribosome & Protein Repair Chamber sanctuary. Toggle ATP vs ADP to refold the damaged chain, and press E for Microscope zoom.',
    controlType: 'chaperone-cycle',
    diagramType: 'chaperone',
    stationPos: [0, 0, 0],
    cameraOffset: [-1.6, 1.4, 11.8],
    lookAtOffset: [-2.3, 0.0, 0],
    microscopeOffset: [-0.5, 0.3, 5.2],
    microscopeLookAtOffset: [-0.85, 0.0, 0.0],
    microscopeMagnification: '1,600,000×',
    microscopeScaleBar: '0.8 nm · 8 Å',
    microscopeTargetName: 'Chaperone Crystal Ribbon & Nucleotide Cleft',
    microscopeSummary:
      'Copper-orange α-helices and sky-blue β-sheet arrows wrap a central ATP nucleotide and coordinated Mg²⁺ / K⁺ ions to drive stress-damaged protein refolding.',
    microscopeDetails: [
      {
        part: 'Copper-Orange α-Helices',
        role: 'Coiled helical bundles wrapping the upper and lower ATPase folding lobes',
        color: '#D9480F',
      },
      {
        part: 'Sky-Blue β-Sheet Arrows',
        role: 'Parallel and antiparallel β-strands forming the rigid cleft scaffold',
        color: '#38BDF8',
      },
      {
        part: 'Violet Connecting Loops',
        role: 'Flexible polypeptide coil turns linking α-helices and β-sheet arrays',
        color: '#A855F7',
      },
      {
        part: 'ATP & Mg²⁺ / K⁺ Cofactors',
        role: 'Central nucleotide ligand with lime Mg²⁺ and purple K⁺ ions powering folding',
        color: '#4ADE80',
      },
    ],
    referenceImage: '/assets/aistudio/image_c9e289ce.png',
    accentColor: '#2DD4BF',
  },
];
