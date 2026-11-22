export interface CurriculumSection {
  heading?: string;
  points: string[];
}

export interface CurriculumSlide {
  id: string;
  numberLabel: string;
  title: string;
  subtitle?: string;
  sections: CurriculumSection[];
  imageUrl?: string;
  imageCaption?: string;
  imageAlt?: string;
}

export const CURRICULUM_SLIDES: CurriculumSlide[] = [
  {
    id: 'overview',
    numberLabel: 'Title & Overview',
    title: 'Proteins & Enzymes (LO5 Biology)',
    subtitle: 'Topics: Introduction, Amino acids, Proteins in cells',
    sections: [
      {
        heading: 'Core Presentation Flow',
        points: [
          '1. Introduction to Proteins — Macromolecular polymers & composition (C, H, O, N, S)',
          '2. Amino Acids — Building units, peptide bonds & 9 essential amino acids',
          '3. Proteins in Cells — Abundance (>50% dry weight), synthesis & cellular locations',
          '4. Structure & Function — Folding forces, native state & molecular recognition',
          '5. Levels of Protein Structure — Primary (1°), Secondary (2°), Tertiary (3°), Quaternary (4°)',
          '6. Denaturation & 7. Mutation — Environmental loss of shape & sickle cell / misfolding diseases',
        ],
      },
    ],
  },
  {
    id: 'intro-proteins',
    numberLabel: 'Slide 01 / 07',
    title: '1. Introduction to Proteins',
    sections: [
      {
        heading: 'Definition & Composition (C, H, O, N, S)',
        points: [
          'Large, complex macromolecules essential for all living organisms.',
          'Polymers made of long chains of amino acids.',
          'Perform most of the work inside cells and regulate body tissues and organs.',
          'Core elemental composition: Carbon (C), Hydrogen (H), Oxygen (O), Nitrogen (N), and Sulfur (S).',
        ],
      },
      {
        heading: 'Amino Acid Chemical Backbone',
        points: [
          'Features a central α-carbon bonded to an amino group (H₂N−), hydrogen atom (−H), carboxyl group (−COOH), and variable R side chain.',
          'Monomers fold into 3D ribbons built from coiled α-helices and flat β-sheets.',
        ],
      },
    ],
    imageUrl: '/assets/internet/protein_3d_structure.png',
    imageCaption: 'Protein (3D Structure) — Folded α-Helices & β-Sheets with Backbone Chemistry',
    imageAlt: 'Protein 3D structure showing alpha helices and beta sheets',
  },
  {
    id: 'amino-acids',
    numberLabel: 'Slide 02 / 07',
    title: '2. Amino Acids (Building Units of Proteins)',
    sections: [
      {
        heading: 'Basic Structure of an Amino Acid',
        points: [
          '20 standard amino acids combine in different sequences to form various proteins.',
          'Central Carbon atom (α-carbon) bonded to an Amino group (−NH₂), Carboxyl group (−COOH), Hydrogen (−H), and R-group.',
          'Linked together by covalent Peptide Bonds to form long polypeptide chains.',
        ],
      },
      {
        heading: '9 Essential Amino Acids (From Food)',
        points: [
          'Only 9 out of the 20 amino acids cannot be made independently by the human body and must be taken externally from food:',
          'Histidine · Isoleucine · Leucine · Lysine · Methionine · Phenylalanine · Threonine · Tryptophan · Valine',
        ],
      },
    ],
    imageUrl: '/assets/internet/amino_acids_chart.svg',
    imageCaption: 'Structure of the 20 Standard Amino Acids (Glycine, Alanine, Serine, Cysteine, Valine, etc.)',
    imageAlt: 'Chart of the 20 standard amino acid structures and formulas',
  },
  {
    id: 'proteins-in-cells',
    numberLabel: 'Slide 03 / 07',
    title: '3. Proteins in Cells',
    sections: [
      {
        heading: 'Cellular Abundance & Synthesis',
        points: [
          'Abundance: Make up more than 50% of the dry weight of most living cells.',
          'Synthesis: Synthesized inside Ribosomes using genetic instructions carried from DNA/mRNA (Translation).',
        ],
      },
      {
        heading: '3D Structure = Function & Location',
        points: [
          '3D Structure = Function: Newly translated polypeptide chains fold into specific 3D shapes to become biologically active.',
          'Location: Found everywhere in the cell — embedded in the cell membrane, suspended in the cytoplasm, inside the nucleus, and across organelles.',
        ],
      },
    ],
  },
  {
    id: 'structure-function',
    numberLabel: 'Slide 04 / 07',
    title: '4. Relation Between Structure and Function',
    sections: [
      {
        heading: 'Conformation & Chemical Interactions Driving Folding',
        points: [
          'Conformation (Native State): Every functional protein folds into a unique, energetically stable 3D shape determined by its amino acid sequence.',
          'Hydrophobic Interactions: Non-polar R-groups cluster in the interior away from water; hydrophilic R-groups face the exterior.',
          'Hydrogen Bonds: Stabilize local folding patterns (α-helices and β-pleated sheets).',
          'Ionic Bonds (Salt Bridges): Electrostatic attractions between positively and negatively charged R-groups.',
          'Disulfide Bridges (−S−S−): Strong covalent bonds between sulfur atoms of two Cysteine residues locking the 3D structure.',
        ],
      },
      {
        heading: 'Molecular Recognition',
        points: [
          'A protein’s surface contours, Active Site, and polar patches recognize and bind target ligands/substrates with high precision.',
          'Enzyme-Substrate Complex → Products + Enzyme (Unchanged).',
        ],
      },
    ],
    imageUrl: '/assets/internet/structure_function_enzyme.svg',
    imageCaption: 'Structure Determines Function: Molecular Recognition & Enzyme-Substrate Induced Fit',
    imageAlt: 'Induced fit enzyme-substrate binding and catalysis diagram',
  },
  {
    id: 'protein-levels',
    numberLabel: 'Slide 05 / 07',
    title: '5. Levels of Protein Structure',
    sections: [
      {
        heading: 'Primary (1°) & Secondary (2°)',
        points: [
          'Primary Structure (1°): Exact linear sequence of amino acids linked by covalent peptide bonds, dictated directly by DNA. Changing one amino acid alters all subsequent folding.',
          'Secondary Structure (2°): Local repetitive folding stabilized by backbone hydrogen bonds (α-helices and β-pleated sheets), providing strength (silk β-sheets) or elasticity (hair keratin α-helices).',
        ],
      },
      {
        heading: 'Tertiary (3°) & Quaternary (4°)',
        points: [
          'Tertiary Structure (3°): Overall 3D folding of a single polypeptide chain driven by R-group interactions (hydrophobic, H-bonds, ionic, −S−S−), creating pockets like an Active Site.',
          'Quaternary Structure (4°): Assembly of two or more polypeptide chains (subunits) into one macromolecule, enabling allosteric regulation and cooperativity. Disrupting any level causes denaturation.',
        ],
      },
    ],
    imageUrl: '/assets/internet/protein_levels.svg',
    imageCaption: 'Hierarchy of Protein Structure: 1° Sequence → 2° Helix/Sheet → 3° Folded Chain → 4° Subunits',
    imageAlt: 'Four levels of protein structural organization diagram',
  },
  {
    id: 'denaturation',
    numberLabel: 'Slide 06 / 07',
    title: '6. Denaturation',
    sections: [
      {
        heading: 'What is Denaturation?',
        points: [
          'The loss of a protein’s 2°, 3°, and 4° structures without breaking its primary (1°) peptide bonds.',
          'The unfolded polypeptide chain becomes biologically inactive and often insoluble (precipitates).',
        ],
      },
      {
        heading: 'Environmental Triggers & Recovery',
        points: [
          'High Temperature: Increases kinetic energy, vibrating atoms until weak hydrogen and hydrophobic bonds snap.',
          'Extreme pH (Acids/Bases): Alters ionization states of acidic and basic R-groups, breaking ionic salt bridges and H-bonds.',
          'Heavy Metals & Organic Solvents: Disrupt disulfide bridges (−S−S−) and hydrophobic interior cores.',
          'Renaturation vs. Irreversible Damage: Some proteins refold when normal conditions return (aided by Chaperone proteins), whereas extreme heat (like cooking an egg) causes permanent damage.',
        ],
      },
    ],
  },
  {
    id: 'mutation-misfolding',
    numberLabel: 'Slide 07 / 07',
    title: '7. Mutation & Protein Misfolding',
    sections: [
      {
        heading: 'Sickle Cell Hemoglobin Mutation (A → T)',
        points: [
          'In the β-globin chain of hemoglobin, a single DNA mutation (A → T) substitutes hydrophilic Glutamic Acid (−) with hydrophobic Valine at position 6 (Glu → Val).',
          'Structural Consequence: Under low O₂, hydrophobic Valine patches stick together, causing HbS molecules to polymerize into rigid fibers.',
          'Functional Consequence: Red blood cells deform into a rigid sickle shape, blocking capillaries and impairing oxygen delivery.',
        ],
      },
      {
        heading: 'Protein Misfolding Diseases',
        points: [
          'Improperly folded proteins can aggregate into toxic amyloid fibril plaques, leading to neurodegenerative disorders such as Alzheimer’s and Parkinson’s diseases.',
        ],
      },
    ],
    imageUrl: '/assets/internet/sickle_cell_mutation.svg',
    imageCaption: 'Effect of Mutation: Normal Hemoglobin (HbA) vs. Sickle Cell Hemoglobin (HbS) & Sickled RBC',
    imageAlt: 'Sickle cell anemia point mutation Glu to Val diagram',
  },
];
