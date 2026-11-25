export interface BioQuizQuestion {
  id: string;
  topic: string;
  contextClue: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const BIO_QUIZ_QUESTIONS: BioQuizQuestion[] = [
  // Protein Classification (1–6)
  {
    id: 'pc-1-classification-bases',
    topic: '3. Protein Classification',
    contextClue:
      'From Slide 04 (Protein Classification): Proteins are grouped into Fibrous/Globular and Simple/Conjugated categories.',
    question: 'What are the two main bases used to classify proteins?',
    options: [
      'Solubility and molecular weight',
      'Shape and chemical composition',
      'Amino acid sequence and reaction speed',
      'Cellular location and digestion rate',
    ],
    correctIndex: 1,
    explanation:
      'Proteins are classified into different types based on their shape (fibrous vs. globular) and chemical composition (simple vs. conjugated).',
  },
  {
    id: 'pc-2-fibrous-traits',
    topic: '3. Protein Classification · 3.1 Fibrous Proteins',
    contextClue:
      'From Section 3.1 (Fibrous Proteins): Think of Collagen, Keratin, and Elastin forming strong body fibers.',
    question: 'Which set of traits describes fibrous proteins?',
    options: [
      'Compact and rounded shape, soluble in water, catalytic role',
      'Long, narrow fiber-like structure, usually insoluble in water, structural support',
      'Rounded structure, water-soluble, immune defense',
      'Amino acids plus a non-protein prosthetic group, soluble in water',
    ],
    correctIndex: 1,
    explanation:
      'Fibrous proteins have long, narrow, fiber-like structures, are usually insoluble in water, and provide strength and structural support to tissues.',
  },
  {
    id: 'pc-3-globular-example',
    topic: '3. Protein Classification · 3.2 Globular Proteins',
    contextClue:
      'From Section 3.2 (Globular Proteins): Compact, rounded 3D proteins that are usually soluble in water.',
    question: 'Which of the following is an example of a globular protein?',
    options: ['Collagen', 'Keratin', 'Hemoglobin', 'Elastin'],
    correctIndex: 2,
    explanation:
      'Hemoglobin (along with Enzymes and Antibodies) is a globular protein, whereas Collagen, Keratin, and Elastin are fibrous proteins.',
  },
  {
    id: 'pc-4-simple-proteins',
    topic: '3. Protein Classification · 3.3 Simple Proteins',
    contextClue:
      'From Section 3.3 (Simple Proteins): Examples include Albumin and Globulins.',
    question: 'What do simple proteins yield when broken down?',
    options: [
      'Amino acids and lipids',
      'Only amino acids',
      'Amino acids and carbohydrates',
      'Amino acids and a prosthetic group',
    ],
    correctIndex: 1,
    explanation:
      'Simple proteins consist solely of amino acids with no non-protein components, so they produce only amino acids when broken down.',
  },
  {
    id: 'pc-5-prosthetic-group',
    topic: '3. Protein Classification · 3.4 Conjugated Proteins',
    contextClue:
      'From Section 3.4 (Conjugated Proteins): Amino acids attached to a non-protein helper component.',
    question:
      'In conjugated proteins, what is the non-protein component attached to amino acids called?',
    options: ['Active site', 'Substrate', 'Prosthetic group', 'Peptide bond'],
    correctIndex: 2,
    explanation:
      'The non-protein part attached to amino acids in conjugated proteins is called a prosthetic group.',
  },
  {
    id: 'pc-6-conjugated-examples',
    topic: '3. Protein Classification · 3.4 Conjugated Proteins',
    contextClue:
      'From Section 3.4: Lipoproteins contain lipids and glycoproteins contain carbohydrates attached to protein.',
    question: 'Which group includes lipoproteins and glycoproteins?',
    options: [
      'Fibrous proteins',
      'Simple proteins',
      'Conjugated proteins',
      'Structural proteins',
    ],
    correctIndex: 2,
    explanation:
      'Conjugated proteins include Hemoglobin, Glycoproteins, and Lipoproteins because each carries a non-protein prosthetic group.',
  },

  // Functions of Proteins in Cells (7–13)
  {
    id: 'fp-1-structural-pair',
    topic: '2. Functions of Proteins · 1. Structural Proteins',
    contextClue:
      'From Slide 02 (Structural Proteins): They maintain the shape, strength, and support of cells and tissues.',
    question:
      'Which pair of proteins provides structural support and strength to cells and tissues?',
    options: [
      'Actin and Myosin',
      'Collagen and Keratin',
      'Ferritin and Casein',
      'Amylase and Catalase',
    ],
    correctIndex: 1,
    explanation:
      'Collagen and Keratin are classic structural proteins that support and strengthen cells and tissues.',
  },
  {
    id: 'fp-2-transport-role',
    topic: '2. Functions of Proteins · 2. Transport Proteins',
    contextClue:
      'From Slide 02 (Transport Proteins): Examples include Hemoglobin and Membrane Transport Proteins.',
    question:
      'What is the primary role of transport proteins such as hemoglobin and membrane transport proteins?',
    options: [
      'Speeding up metabolic reactions',
      'Storing essential nutrients for future use',
      'Moving molecules and ions inside and outside cells',
      'Protecting the body from harmful pathogens',
    ],
    correctIndex: 2,
    explanation:
      'Transport proteins move substances by carrying molecules and ions inside and outside cells.',
  },
  {
    id: 'fp-3-enzymatic-category',
    topic: '2. Functions of Proteins · 3. Enzymatic Proteins',
    contextClue:
      'From Slide 02 (Enzymatic Proteins): Examples are Amylase and Catalase.',
    question:
      'Which type of protein speeds up chemical reactions inside cells, with amylase and catalase as examples?',
    options: [
      'Enzymatic proteins',
      'Defense proteins',
      'Structural proteins',
      'Movement proteins',
    ],
    correctIndex: 0,
    explanation:
      'Enzymatic proteins (enzymes like Amylase and Catalase) accelerate chemical reactions inside cells.',
  },
  {
    id: 'fp-4-defense-antibodies',
    topic: '2. Functions of Proteins · 4. Defense Proteins',
    contextClue:
      'From Slide 02 (Defense Proteins): An important part of the immune system protecting against pathogens.',
    question: 'Antibodies belong to which functional group of proteins?',
    options: [
      'Hormonal / Signaling proteins',
      'Storage proteins',
      'Defense proteins',
      'Transport proteins',
    ],
    correctIndex: 2,
    explanation:
      'Antibodies are defense proteins that protect the body against harmful pathogens.',
  },
  {
    id: 'fp-5-insulin-signaling',
    topic: '2. Functions of Proteins · 5. Hormonal / Signaling Proteins',
    contextClue:
      'From Slide 03 (Hormonal / Signaling Proteins): Insulin is highlighted as the key example.',
    question: 'How does insulin function in the body according to the notes?',
    options: [
      'It helps muscles contract and relax',
      'It sends signals that help cells communicate and control body functions',
      'It maintains cell shape and tissue strength',
      'It carries oxygen across cell membranes',
    ],
    correctIndex: 1,
    explanation:
      'Insulin is a hormonal / signaling protein that sends signals so cells can communicate and regulate body functions.',
  },
  {
    id: 'fp-6-movement-proteins',
    topic: '2. Functions of Proteins · 6. Movement Proteins',
    contextClue:
      'From Slide 03 (Movement Proteins): Responsible for moving cells and body parts.',
    question:
      'Which proteins allow muscles to contract and relax so cells and body parts can move?',
    options: [
      'Ferritin and Casein',
      'Collagen and Keratin',
      'Actin and Myosin',
      'Hemoglobin and Antibodies',
    ],
    correctIndex: 2,
    explanation:
      'Actin and Myosin are movement proteins that enable muscles to contract and relax.',
  },
  {
    id: 'fp-7-storage-proteins',
    topic: '2. Functions of Proteins · 7. Storage Proteins',
    contextClue:
      'From Slide 03 (Storage Proteins): Ferritin and Casein provide organisms with reserved nutrients.',
    question:
      'Ferritin and casein are examples of which protein category?',
    options: [
      'Storage proteins, which store important substances and nutrients for future use',
      'Enzymatic proteins, which accelerate biological processes',
      'Transport proteins, which move ions across membranes',
      'Defense proteins, which fight pathogens in the immune system',
    ],
    correctIndex: 0,
    explanation:
      'Ferritin and Casein are storage proteins that store important substances and essential nutrients for future use.',
  },

  // What Are Enzymes?, Activation Energy & Integrated Concepts (14–23)
  {
    id: 'ez-1-without-enzymes',
    topic: 'What Are Enzymes? · Reaction Speed',
    contextClue:
      'From Pre-Story Slide (What are enzymes?): Enzymes are biological proteins that speed up chemical reactions inside your body.',
    question:
      'What happens to the time needed for a body chemical reaction if enzymes are absent?',
    options: [
      'It speeds up millions of times',
      'It could take millions of years',
      'It stops using amino acids',
      'It turns into a storage protein',
    ],
    correctIndex: 1,
    explanation:
      'Without enzymes, vital biochemical reactions inside the body could take millions of years instead of occurring rapidly.',
  },
  {
    id: 'ez-2-salivary-amylase',
    topic: 'What Are Enzymes? · Saliva Digestion',
    contextClue:
      'From Pre-Story Slide: Food digestion begins immediately in your mouth before food even reaches your stomach (pepsin).',
    question:
      'Which enzyme starts breaking down starch in the mouth as soon as food enters?',
    options: ['Pepsin', 'Catalase', 'Amylase', 'Ferritin'],
    correctIndex: 2,
    explanation:
      'Amylase in saliva begins breaking down starch as soon as you put food in your mouth.',
  },
  {
    id: 'ez-3-other-roles',
    topic: 'What Are Enzymes? · Enzymes Functions',
    contextClue:
      'From Pre-Story Slide (Enzymes Functions): Enzymes speed reactions millions of times, digest food (pepsin), and remain reusable.',
    question:
      'Besides speeding up reactions and digesting food, what other roles do enzymes perform in the body?',
    options: [
      'Building new materials and breaking down harmful substances',
      'Forming hair keratin and storing iron',
      'Contracting muscles and carrying oxygen',
      'Sending long-distance hormones only',
    ],
    correctIndex: 0,
    explanation:
      'Enzymes also build new materials for the body and break down harmful substances, and are reusable after each reaction.',
  },
  {
    id: 'ez-4-activation-energy',
    topic: 'What Are Enzymes? · Activation Energy',
    contextClue:
      'From Pre-Story Slide (Activation Energy): Enzymes act as biological catalysts without changing themselves.',
    question:
      'How does lowering activation energy affect a chemical reaction?',
    options: [
      'It consumes the enzyme permanently',
      'It lets the reaction start with low energy and happen very fast',
      'It converts the reaction into a fibrous structure',
      'It stops the reaction from starting',
    ],
    correctIndex: 1,
    explanation:
      'Lowering activation energy allows a chemical reaction to start with less energy and proceed very fast.',
  },
  {
    id: 'pc-7-fibrous-insoluble',
    topic: 'Protein Classification & Structural Strength',
    contextClue:
      'From Slides 02 & 04: Strong tissue fibers resist dissolving in water.',
    question:
      'Which pair of structural proteins is usually insoluble in water and provides tissue strength?',
    options: [
      'Albumin and Globulins',
      'Collagen and Keratin',
      'Hemoglobin and Insulin',
      'Ferritin and Casein',
    ],
    correctIndex: 1,
    explanation:
      'Collagen and Keratin are fibrous structural proteins that are usually insoluble in water and strengthen body tissues.',
  },
  {
    id: 'pc-8-globular-vs-fibrous',
    topic: '3. Protein Classification · 3.2 Globular Proteins',
    contextClue:
      'From Section 3.2 (Globular Proteins): Contrast rounded functional proteins against long fibrous strands.',
    question:
      'Which trait is typical of globular proteins compared to fibrous proteins?',
    options: [
      'Long, narrow, fiber-like shape',
      'Compact, rounded 3D structure and usually water-soluble',
      'Made strictly of one amino acid with no 3D folding',
      'Always insoluble in water',
    ],
    correctIndex: 1,
    explanation:
      'Globular proteins fold into compact, rounded 3D shapes and are usually soluble in water.',
  },
  {
    id: 'pc-9-simple-vs-conjugated',
    topic: '3. Protein Classification · 3.3 Simple Proteins',
    contextClue:
      'From Sections 3.3 & 3.4: Distinguish proteins containing only amino acids from those carrying prosthetic groups.',
    question:
      'Which example belongs to simple proteins rather than conjugated proteins?',
    options: ['Lipoproteins', 'Glycoproteins', 'Albumin', 'Hemoglobin'],
    correctIndex: 2,
    explanation:
      'Albumin (along with Globulins) is a simple protein composed strictly of amino acids, whereas Hemoglobin, Glycoproteins, and Lipoproteins are conjugated.',
  },
  {
    id: 'pc-10-hemoglobin-dual-class',
    topic: '3. Protein Classification · Shape & Composition',
    contextClue:
      'From Sections 3.2 & 3.4: Hemoglobin appears as an example under BOTH Globular and Conjugated proteins.',
    question:
      'Why can hemoglobin appear in both globular and conjugated classifications?',
    options: [
      'It has a compact rounded shape and includes a non-protein prosthetic group',
      'It is a fibrous protein made only of starch',
      'It is a simple protein with zero amino acids',
      'It acts only as a storage molecule in milk',
    ],
    correctIndex: 0,
    explanation:
      'Hemoglobin is classified as globular by its compact rounded shape and as conjugated because it contains a non-protein heme prosthetic group.',
  },
  {
    id: 'fp-8-catalase-amylase',
    topic: '2. Functions of Proteins · 3. Enzymatic Proteins',
    contextClue:
      'From Slide 02 (Enzymatic Proteins): Two named cellular enzymes work inside the body.',
    question:
      'Which cellular role is carried out by catalase alongside amylase in the notes?',
    options: [
      'Enzymatic speed-up of chemical reactions',
      'Muscle contraction via actin filaments',
      'Long-term nutrient storage in tissues',
      'Immune defense against pathogens',
    ],
    correctIndex: 0,
    explanation:
      'Catalase and Amylase are examples of enzymatic proteins that speed up chemical reactions inside cells.',
  },
  {
    id: 'fp-9-conclusion',
    topic: '2. Functions of Proteins · Conclusion',
    contextClue:
      'From Slide 03 (Conclusion): Proteins drive structure, transport, catalysis, defense, signaling, movement, and storage.',
    question: 'What happens to a cell if it lacks essential proteins overall?',
    options: [
      'It gains extra activation energy',
      'It cannot function properly',
      'It converts all carbohydrates into prosthetic groups',
      'It no longer needs signaling molecules',
    ],
    correctIndex: 1,
    explanation:
      'Because proteins carry out structural, transport, enzymatic, defense, signaling, movement, and storage roles, cells cannot function properly without them.',
  },
];
