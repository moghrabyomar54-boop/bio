export interface CurriculumSection {
  heading?: string;
  points: string[];
}

export interface CurriculumGalleryImage {
  url: string;
  caption: string;
  alt: string;
  darkBg?: boolean;
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
  galleryImages?: CurriculumGalleryImage[];
}

export const CURRICULUM_SLIDES: CurriculumSlide[] = [
  {
    id: 'overview',
    numberLabel: 'Title & Overview',
    title: 'Proteins & Enzymes (LO5 Biology)',
    subtitle:
      'Topics: Introduction, Functions of Proteins in Cells, Protein Classification, Amino Acids, Proteins in Cells & Enzymes',
    sections: [
      {
        heading: 'Core Presentation Flow',
        points: [
          '1. Introduction to Proteins — Macromolecular polymers & composition (C, H, O, N, S)',
          '2. Functions of Proteins in Cells — Structural, Transport, Enzymatic, Defense, Signaling, Movement, Storage & Conclusion',
          '3. Protein Classification — Fibrous, Globular, Simple & Conjugated proteins',
          '4. Amino Acids & 5. Proteins in Cells — Building units, peptide bonds, 9 essential amino acids & ribosomes',
          '6. Structure & Function — Folding forces, native state & molecular recognition',
          '7. Levels of Protein Structure (1°–4°), 8. Denaturation & 9. Mutation / Misfolding',
        ],
      },
    ],
  },
  {
    id: 'intro-proteins',
    numberLabel: 'Slide 01 / 10',
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
    id: 'functions-of-proteins-1',
    numberLabel: 'Slide 02 / 10',
    title: '2. Functions of Proteins in Cells',
    subtitle: '1. Structural · 2. Transport · 3. Enzymatic · 4. Defense Proteins',
    sections: [
      {
        heading: '1. Structural Proteins',
        points: [
          'Structural proteins provide support and strength to cells and tissues.',
          'They help maintain the shape and structure of cells.',
          'Examples: Collagen and Keratin.',
        ],
      },
      {
        heading: '2. Transport Proteins',
        points: [
          'Transport proteins help move substances from one place to another.',
          'They carry molecules and ions inside and outside cells.',
          'Examples: Hemoglobin and Membrane Transport Proteins.',
        ],
      },
      {
        heading: '3. Enzymatic Proteins',
        points: [
          'Enzymes speed up chemical reactions inside cells.',
          'They help the body perform important biological processes.',
          'Examples: Amylase and Catalase.',
        ],
      },
      {
        heading: '4. Defense Proteins',
        points: [
          'Defense proteins help protect the body against harmful pathogens.',
          'They are an important part of the immune system.',
          'Example: Antibodies.',
        ],
      },
    ],
    galleryImages: [
      {
        url: '/assets/internet/membrane_transport_proteins.svg',
        caption: 'Transport Proteins · Membrane Channels & Active Pumps',
        alt: 'Diagram comparing passive and active membrane transport proteins',
      },
      {
        url: '/assets/internet/defense_antibody_structure.svg',
        caption: 'Defense Proteins · Y-Shaped Antibody',
        alt: 'Structure of an IgG defense antibody molecule',
      },
      {
        url: '/assets/internet/structure_function_enzyme.svg',
        caption: 'Enzymatic Proteins · Active-Site Catalysis',
        alt: 'Induced-fit enzyme reaction diagram',
      },
    ],
  },
  {
    id: 'functions-of-proteins-2',
    numberLabel: 'Slide 03 / 10',
    title: '2. Functions of Proteins in Cells (Continued)',
    subtitle: '5. Hormonal / Signaling · 6. Movement · 7. Storage · Conclusion',
    sections: [
      {
        heading: '5. Hormonal / Signaling Proteins',
        points: [
          'These proteins help cells communicate with each other.',
          'They send signals that control different body functions.',
          'Example: Insulin.',
        ],
      },
      {
        heading: '6. Movement Proteins',
        points: [
          'Movement proteins help muscles contract and relax.',
          'They allow cells and body parts to move.',
          'Examples: Actin and Myosin.',
        ],
      },
      {
        heading: '7. Storage Proteins',
        points: [
          'Storage proteins store important substances for future use.',
          'They provide cells and organisms with essential nutrients.',
          'Examples: Ferritin and Casein.',
        ],
      },
      {
        heading: 'Conclusion',
        points: [
          'Proteins perform many essential functions in cells.',
          'They support cell structure, transport substances, and speed up chemical reactions.',
          'They also help in defense, signaling, movement, and storage.',
          'Without proteins, cells cannot function properly.',
        ],
      },
    ],
    galleryImages: [
      {
        url: '/assets/internet/movement_actin_myosin.svg',
        caption: 'Movement Proteins · Actin & Myosin Sarcomere Contraction',
        alt: 'Sarcomere diagram showing actin and myosin filaments for muscle movement',
      },
      {
        url: '/assets/internet/insulin_signaling.svg',
        caption: 'Hormonal / Signaling · Insulin Communication',
        alt: 'Insulin hormone signaling glucose regulation diagram',
      },
      {
        url: '/assets/internet/ferritin_storage.png',
        caption: 'Storage Proteins · Ferritin Iron Storage Complex',
        alt: '3D spherical ferritin protein complex storing iron',
      },
    ],
  },
  {
    id: 'protein-classification',
    numberLabel: 'Slide 04 / 10',
    title: '3. Protein Classification',
    subtitle:
      'Proteins are classified into different types based on their shape and chemical composition.',
    sections: [
      {
        heading: '3.1 Fibrous Proteins',
        points: [
          'Have long, narrow, fiber-like structures.',
          'Provide strength and structural support to body tissues.',
          'Usually insoluble in water.',
          'Examples: Collagen, Keratin, and Elastin.',
        ],
      },
      {
        heading: '3.2 Globular Proteins',
        points: [
          'Have compact and rounded three-dimensional structures.',
          'Usually soluble in water.',
          'Perform various biological functions in the body.',
          'Examples: Hemoglobin, Enzymes, and Antibodies.',
        ],
      },
      {
        heading: '3.3 Simple Proteins',
        points: [
          'Consist only of amino acids.',
          'Do not contain non-protein components.',
          'Produce only amino acids when broken down.',
          'Examples: Albumin and Globulins.',
        ],
      },
      {
        heading: '3.4 Conjugated Proteins',
        points: [
          'Consist of amino acids attached to a non-protein component.',
          'The non-protein part is called a prosthetic group.',
          'This component helps the protein perform specific functions.',
          'Examples: Hemoglobin, Glycoproteins, and Lipoproteins.',
        ],
      },
    ],
    galleryImages: [
      {
        url: '/assets/internet/globular_conjugated_hemoglobin.png',
        caption: 'Globular & Conjugated · Hemoglobin (4 Globin Chains + Heme Prosthetic Groups)',
        alt: '3D structure of Hemoglobin showing rounded globular fold and heme prosthetic groups',
      },
      {
        url: '/assets/internet/collagen_triple_helix.png',
        caption: 'Fibrous Protein · Collagen Triple Helix',
        alt: 'Elongated fibrous collagen triple-helix model',
      },
      {
        url: '/assets/internet/albumin_simple_protein.png',
        caption: 'Simple Globular Protein · Serum Albumin',
        alt: '3D ribbon model of simple protein serum albumin',
      },
    ],
  },
  {
    id: 'amino-acids',
    numberLabel: 'Slide 05 / 10',
    title: '4. Amino Acids (Building Units of Proteins)',
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
    numberLabel: 'Slide 06 / 10',
    title: '5. Proteins in Cells',
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
    numberLabel: 'Slide 07 / 10',
    title: '6. Relation Between Structure and Function',
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
    numberLabel: 'Slide 08 / 10',
    title: '7. Levels of Protein Structure',
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
    numberLabel: 'Slide 09 / 10',
    title: '8. Denaturation',
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
    numberLabel: 'Slide 10 / 10',
    title: '9. Mutation & Protein Misfolding',
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

export const PRE_STORY_ENZYMES_SLIDE: CurriculumSlide = {
  id: 'what-are-enzymes',
  numberLabel: 'Before the Story · Enzymes',
  title: 'What are enzymes?',
  subtitle: 'Enzymes, Functions, Activation Energy & Biological Catalysts',
  sections: [
    {
      heading: 'What are enzymes?',
      points: [
        'Enzymes are proteins in your body that speed up the chemical reactions.',
        'Ex: Amylase in your saliva breaks down starch as soon as you put food in your mouth.',
        'Note: Without enzymes these reactions could take millions of years.',
      ],
    },
    {
      heading: 'Enzymes Functions',
      points: [
        'Speeding up the reaction millions of times.',
        'Digest food like pepsin that breaks down protein in the stomach.',
        'Build new materials for the body and breakdown the harmful substance.',
        'Reusable that can be used again after the reaction.',
      ],
    },
    {
      heading: 'Activation Energy',
      points: [
        'Is the energy a reaction needs to start.',
        'What does the enzyme do in the activation energy? It lowers the energy of activation, so the enzymes make the reaction start with low energy and very fast.',
      ],
    },
    {
      heading: 'Why Enzymes are biological catalysts?',
      points: [
        'Because the word catalyst means something that speeds up the reaction without changing itself.',
      ],
    },
  ],
  galleryImages: [
    {
      url: '/assets/internet/enzyme_activation_energy.svg',
      caption: 'Activation Energy · Enzymes Lower ΔG‡ Reaction Barrier',
      alt: 'Graph comparing activation energy with and without an enzyme catalyst',
    },
    {
      url: '/assets/internet/enzyme_catalysis_cycle.svg',
      caption: 'Reusable Catalyst · Substrate → Products',
      alt: 'Induced-fit enzyme catalysis cycle showing reusable enzyme',
    },
    {
      url: '/assets/internet/salivary_amylase.png',
      caption: 'Salivary Amylase · Breaks Down Starch in Mouth',
      alt: '3D molecular view of salivary amylase enzyme breaking down starch',
      darkBg: true,
    },
  ],
};
