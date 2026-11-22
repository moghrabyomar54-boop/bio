import * as THREE from 'three';

export interface ProteinMaterialLibrary {
  // Hemoglobin (image_952afb42)
  hbBeta1Red: THREE.MeshPhysicalMaterial;
  hbBeta2Orange: THREE.MeshPhysicalMaterial;
  hbAlpha1Maroon: THREE.MeshPhysicalMaterial;
  hbAlpha2Coral: THREE.MeshPhysicalMaterial;
  hbHemeGold: THREE.MeshPhysicalMaterial;
  hbIronCrimson: THREE.MeshPhysicalMaterial;

  // Collagen (image_0ed1b1bc)
  colMint: THREE.MeshPhysicalMaterial;
  colPeach: THREE.MeshPhysicalMaterial;
  colLavender: THREE.MeshPhysicalMaterial;

  // Enzymes (image_9bf0ebab)
  enzMint: THREE.MeshPhysicalMaterial;
  enzPeriwinkle: THREE.MeshPhysicalMaterial;
  enzRose: THREE.MeshPhysicalMaterial;
  enzButter: THREE.MeshPhysicalMaterial;
  enzActiveCrimson: THREE.MeshPhysicalMaterial;
  enzCofactorOrange: THREE.MeshPhysicalMaterial;

  // Keratin (image_f4149278)
  kerMagentaHelix: THREE.MeshPhysicalMaterial;
  kerGoldSheet: THREE.MeshPhysicalMaterial;
  kerSilverLoop: THREE.MeshPhysicalMaterial;

  // Chaperone (image_c9e289ce crystal structure)
  chapCopperHelix: THREE.MeshPhysicalMaterial;
  chapSkyBetaSheet: THREE.MeshPhysicalMaterial;
  chapVioletLoop: THREE.MeshPhysicalMaterial;
  chapIonLime: THREE.MeshPhysicalMaterial;
  chapIonPurple: THREE.MeshPhysicalMaterial;
  chapAtpLavender: THREE.MeshPhysicalMaterial;
  chapAdpCyan: THREE.MeshPhysicalMaterial;

  // Intro floating void DNA, bacteria & cells
  introDnaEmerald: THREE.MeshPhysicalMaterial;
  introDnaCyan: THREE.MeshPhysicalMaterial;
  introBacteriaShell: THREE.MeshPhysicalMaterial;
  introCellMembrane: THREE.MeshPhysicalMaterial;
  introCellNucleus: THREE.MeshPhysicalMaterial;

  // Shared CPK & bond materials
  carbonAtom: THREE.MeshStandardMaterial;
  nitrogenAtom: THREE.MeshStandardMaterial;
  oxygenAtom: THREE.MeshStandardMaterial;
  hydrogenAtom: THREE.MeshStandardMaterial;
  sulfurGold: THREE.MeshStandardMaterial;
  covalentBond: THREE.MeshStandardMaterial;
  hydrogenBond: THREE.MeshStandardMaterial;

  dispose: () => void;
}

function createOrganicRoughnessTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#999999';
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 1600; i++) {
      const x = (Math.sin(i * 12.9898) * 43758.5453) % 1;
      const y = (Math.sin(i * 78.233) * 43758.5453) % 1;
      const px = Math.abs(x) * size;
      const py = Math.abs(y) * size;
      const r = 1 + (i % 4);
      ctx.fillStyle =
        i % 2 === 0 ? 'rgba(255,255,255,0.08)' : 'rgba(35,35,35,0.08)';
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  tex.anisotropy = maxAnisotropy;
  return tex;
}

export function createMaterialLibrary(
  maxAnisotropy: number,
  _isSoftwareGl: boolean
): ProteinMaterialLibrary {
  const microRoughness = createOrganicRoughnessTexture(maxAnisotropy);

  const hbBeta1Red = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#E1341E'),
    roughness: 0.3,
    metalness: 0.06,
    clearcoat: 0.55,
    clearcoatRoughness: 0.22,
    roughnessMap: microRoughness,
  });

  const hbBeta2Orange = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#DF8656'),
    roughness: 0.32,
    metalness: 0.06,
    clearcoat: 0.5,
    clearcoatRoughness: 0.25,
    roughnessMap: microRoughness,
  });

  const hbAlpha1Maroon = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#782C2E'),
    roughness: 0.34,
    metalness: 0.08,
    clearcoat: 0.5,
    clearcoatRoughness: 0.25,
    roughnessMap: microRoughness,
  });

  const hbAlpha2Coral = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#F26B7A'),
    roughness: 0.3,
    metalness: 0.06,
    clearcoat: 0.55,
    clearcoatRoughness: 0.22,
    roughnessMap: microRoughness,
  });

  const hbHemeGold = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#FDE68A'),
    roughness: 0.24,
    metalness: 0.4,
    clearcoat: 0.65,
  });

  const hbIronCrimson = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#DC2626'),
    emissive: new THREE.Color('#7F1D1D'),
    emissiveIntensity: 0.45,
    roughness: 0.16,
    metalness: 0.88,
    clearcoat: 0.6,
  });

  const colMint = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#86EFAC'),
    roughness: 0.32,
    metalness: 0.05,
    clearcoat: 0.45,
    roughnessMap: microRoughness,
  });

  const colPeach = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#FDBA74'),
    roughness: 0.34,
    metalness: 0.05,
    clearcoat: 0.45,
    roughnessMap: microRoughness,
  });

  const colLavender = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#DDD6FE'),
    roughness: 0.32,
    metalness: 0.05,
    clearcoat: 0.45,
    roughnessMap: microRoughness,
  });

  const enzMint = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#A7F3D0'),
    roughness: 0.36,
    metalness: 0.06,
    clearcoat: 0.35,
    roughnessMap: microRoughness,
  });

  const enzPeriwinkle = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#A5B4FC'),
    roughness: 0.36,
    metalness: 0.06,
    clearcoat: 0.35,
    roughnessMap: microRoughness,
  });

  const enzRose = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#F9A8D4'),
    roughness: 0.36,
    metalness: 0.06,
    clearcoat: 0.35,
    roughnessMap: microRoughness,
  });

  const enzButter = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#FEF08A'),
    roughness: 0.36,
    metalness: 0.06,
    clearcoat: 0.35,
    roughnessMap: microRoughness,
  });

  const enzActiveCrimson = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#DC2626'),
    emissive: new THREE.Color('#7F1D1D'),
    emissiveIntensity: 0.35,
    roughness: 0.25,
    metalness: 0.12,
    clearcoat: 0.6,
  });

  const enzCofactorOrange = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#F97316'),
    emissive: new THREE.Color('#9A3412'),
    emissiveIntensity: 0.3,
    roughness: 0.2,
    metalness: 0.2,
    clearcoat: 0.75,
  });

  const kerMagentaHelix = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#DB2777'),
    roughness: 0.28,
    metalness: 0.08,
    clearcoat: 0.6,
    roughnessMap: microRoughness,
  });

  const kerGoldSheet = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#EAB308'),
    roughness: 0.26,
    metalness: 0.18,
    clearcoat: 0.55,
    side: THREE.DoubleSide,
  });

  const kerSilverLoop = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#CBD5E1'),
    roughness: 0.35,
    metalness: 0.2,
    clearcoat: 0.4,
  });

  const chapCopperHelix = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#D9480F'),
    emissive: new THREE.Color('#431407'),
    emissiveIntensity: 0.16,
    roughness: 0.24,
    metalness: 0.22,
    clearcoat: 0.65,
    side: THREE.DoubleSide,
    roughnessMap: microRoughness,
  });

  const chapSkyBetaSheet = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#38BDF8'),
    emissive: new THREE.Color('#0C4A6E'),
    emissiveIntensity: 0.15,
    roughness: 0.22,
    metalness: 0.18,
    clearcoat: 0.6,
    side: THREE.DoubleSide,
  });

  const chapVioletLoop = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#A855F7'),
    roughness: 0.3,
    metalness: 0.12,
    clearcoat: 0.45,
  });

  const chapIonLime = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#4ADE80'),
    emissive: new THREE.Color('#166534'),
    emissiveIntensity: 0.5,
    roughness: 0.18,
    metalness: 0.35,
    clearcoat: 0.8,
  });

  const chapIonPurple = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#C084FC'),
    emissive: new THREE.Color('#6B21A8'),
    emissiveIntensity: 0.45,
    roughness: 0.18,
    metalness: 0.35,
    clearcoat: 0.8,
  });

  const chapAtpLavender = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#C4B5FD'),
    emissive: new THREE.Color('#6D28D9'),
    emissiveIntensity: 0.35,
    roughness: 0.2,
    metalness: 0.15,
    clearcoat: 0.7,
  });

  const chapAdpCyan = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#38BDF8'),
    emissive: new THREE.Color('#0369A1'),
    emissiveIntensity: 0.35,
    roughness: 0.2,
    metalness: 0.15,
    clearcoat: 0.7,
  });

  const introDnaEmerald = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#4ADE80'),
    emissive: new THREE.Color('#15803D'),
    emissiveIntensity: 0.55,
    roughness: 0.22,
    metalness: 0.15,
    clearcoat: 0.7,
  });

  const introDnaCyan = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#2DD4BF'),
    emissive: new THREE.Color('#0F766E'),
    emissiveIntensity: 0.45,
    roughness: 0.24,
    metalness: 0.15,
    clearcoat: 0.65,
  });

  const introBacteriaShell = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#22C55E'),
    emissive: new THREE.Color('#052E16'),
    emissiveIntensity: 0.4,
    roughness: 0.28,
    metalness: 0.1,
    clearcoat: 0.75,
    transparent: true,
    opacity: 0.86,
  });

  const introCellMembrane = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#10B981'),
    emissive: new THREE.Color('#064E3B'),
    emissiveIntensity: 0.32,
    roughness: 0.15,
    metalness: 0.05,
    clearcoat: 0.85,
    transparent: true,
    opacity: 0.32,
    depthWrite: false,
  });

  const introCellNucleus = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#86EFAC'),
    emissive: new THREE.Color('#16A34A'),
    emissiveIntensity: 0.6,
    roughness: 0.25,
    metalness: 0.1,
    clearcoat: 0.6,
  });

  const carbonAtom = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#64748B'),
    roughness: 0.4,
    metalness: 0.25,
  });

  const nitrogenAtom = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#2563EB'),
    roughness: 0.28,
    metalness: 0.12,
  });

  const oxygenAtom = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#EF4444'),
    roughness: 0.24,
    metalness: 0.12,
  });

  const hydrogenAtom = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#E2E8F0'),
    roughness: 0.22,
    metalness: 0.05,
  });

  const sulfurGold = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#FBBF24'),
    emissive: new THREE.Color('#92400E'),
    emissiveIntensity: 0.3,
    roughness: 0.2,
    metalness: 0.75,
  });

  const covalentBond = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#94A3B8'),
    roughness: 0.45,
    metalness: 0.35,
  });

  const hydrogenBond = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#67E8F9'),
    emissive: new THREE.Color('#06B6D4'),
    emissiveIntensity: 0.85,
    roughness: 0.2,
    metalness: 0.0,
    transparent: true,
    opacity: 0.85,
  });

  const allMaterials: THREE.Material[] = [
    hbBeta1Red,
    hbBeta2Orange,
    hbAlpha1Maroon,
    hbAlpha2Coral,
    hbHemeGold,
    hbIronCrimson,
    colMint,
    colPeach,
    colLavender,
    enzMint,
    enzPeriwinkle,
    enzRose,
    enzButter,
    enzActiveCrimson,
    enzCofactorOrange,
    kerMagentaHelix,
    kerGoldSheet,
    kerSilverLoop,
    chapCopperHelix,
    chapSkyBetaSheet,
    chapVioletLoop,
    chapIonLime,
    chapIonPurple,
    chapAtpLavender,
    chapAdpCyan,
    introDnaEmerald,
    introDnaCyan,
    introBacteriaShell,
    introCellMembrane,
    introCellNucleus,
    carbonAtom,
    nitrogenAtom,
    oxygenAtom,
    hydrogenAtom,
    sulfurGold,
    covalentBond,
    hydrogenBond,
  ];

  return {
    hbBeta1Red,
    hbBeta2Orange,
    hbAlpha1Maroon,
    hbAlpha2Coral,
    hbHemeGold,
    hbIronCrimson,
    colMint,
    colPeach,
    colLavender,
    enzMint,
    enzPeriwinkle,
    enzRose,
    enzButter,
    enzActiveCrimson,
    enzCofactorOrange,
    kerMagentaHelix,
    kerGoldSheet,
    kerSilverLoop,
    chapCopperHelix,
    chapSkyBetaSheet,
    chapVioletLoop,
    chapIonLime,
    chapIonPurple,
    chapAtpLavender,
    chapAdpCyan,
    introDnaEmerald,
    introDnaCyan,
    introBacteriaShell,
    introCellMembrane,
    introCellNucleus,
    carbonAtom,
    nitrogenAtom,
    oxygenAtom,
    hydrogenAtom,
    sulfurGold,
    covalentBond,
    hydrogenBond,
    dispose: () => {
      microRoughness.dispose();
      allMaterials.forEach((m) => m.dispose());
    },
  };
}
