import * as THREE from 'three';
import { PresentationSimState, PROTEIN_SLIDES } from '../data/slides';
import { ProteinMaterialLibrary } from './materials';

// Pre-allocated math helpers for zero-GC per-frame updates
const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);
const _quat = new THREE.Quaternion();
const _euler = new THREE.Euler();
const _mat4 = new THREE.Matrix4();
const _scale = new THREE.Vector3();

export interface ProteinUniverse {
  root: THREE.Group;
  update: (
    elapsed: number,
    delta: number,
    sim: PresentationSimState,
    microscopeMode: boolean,
    activeSlideIndex: number,
    showIntro: boolean
  ) => void;
  dispose: () => void;
}

function orientCylinderBetween(
  mesh: THREE.Object3D,
  p1: THREE.Vector3,
  p2: THREE.Vector3,
  radius = 0.06
) {
  _v1.addVectors(p1, p2).multiplyScalar(0.5);
  mesh.position.copy(_v1);
  _v2.subVectors(p2, p1);
  const len = _v2.length();
  if (len > 0.0001) {
    _v2.divideScalar(len);
    _quat.setFromUnitVectors(_up, _v2);
    mesh.quaternion.copy(_quat);
    mesh.scale.set(radius, len, radius);
  }
}

export function buildProteinUniverse(mats: ProteinMaterialLibrary): ProteinUniverse {
  const root = new THREE.Group();
  const geometries: THREE.BufferGeometry[] = [];
  const extraMaterials: THREE.Material[] = [];

  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    geometries.push(g);
    return g;
  };
  const trackMat = <T extends THREE.Material>(m: T): T => {
    extraMaterials.push(m);
    return m;
  };

  const sphereUnit = trackGeo(new THREE.SphereGeometry(1, 24, 24));
  const smallSphereUnit = trackGeo(new THREE.SphereGeometry(1, 16, 16));
  const cylUnit = trackGeo(new THREE.CylinderGeometry(1, 1, 1, 14, 1));

  // =========================================================================
  // AMBIENT STAGE PARTICLES (VISIBLE ACROSS INTRO VOID & ALL PROTEIN WORLDS)
  // =========================================================================
  const particleCount = 190;
  const particleGeo = trackGeo(new THREE.SphereGeometry(0.085, 10, 10));
  const particleMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.3,
      metalness: 0.1,
      transparent: true,
      opacity: 0.45,
    })
  );
  const particles = new THREE.InstancedMesh(particleGeo, particleMat, particleCount);
  particles.frustumCulled = false;

  const pBasePos: THREE.Vector3[] = [];
  const pSpeed: number[] = [];
  const pPhase: number[] = [];
  const pScale: number[] = [];
  const colorPalette = [
    new THREE.Color('#4ADE80'),
    new THREE.Color('#2DD4BF'),
    new THREE.Color('#FB7185'),
    new THREE.Color('#38BDF8'),
    new THREE.Color('#A855F7'),
  ];

  for (let i = 0; i < particleCount; i++) {
    const angle = i * 2.39996;
    const radius = 5 + ((i * 19) % 20);
    const x = Math.cos(angle) * radius * 1.15;
    const y = Math.sin(angle * 1.37) * (radius * 0.58);
    const z = THREE.MathUtils.lerp(-26, 8, (i % 32) / 31);
    pBasePos.push(new THREE.Vector3(x, y, z));
    pSpeed.push(0.25 + (i % 7) * 0.08);
    pPhase.push(i * 0.61);
    pScale.push(0.42 + (i % 5) * 0.2);

    _mat4.compose(pBasePos[i], _quat.identity(), _scale.setScalar(pScale[i]));
    particles.setMatrixAt(i, _mat4);
    particles.setColorAt(i, colorPalette[i % colorPalette.length]);
  }
  particles.instanceMatrix.needsUpdate = true;
  if (particles.instanceColor) particles.instanceColor.needsUpdate = true;
  particles.computeBoundingSphere();
  root.add(particles);

  // =========================================================================
  // INTRO VOID BIOLOGY BACKGROUND: FLOATING DNAs, BACTERIA & CELLS
  // =========================================================================
  const introGroup = new THREE.Group();
  root.add(introGroup);

  // 1. Floating 3D DNA Double Helices
  const dnaStrands: Array<{
    group: THREE.Group;
    base: THREE.Vector3;
    rotSpeed: number;
    phase: number;
  }> = [];

  const dnaBackbonePointsA: THREE.Vector3[] = [];
  const dnaBackbonePointsB: THREE.Vector3[] = [];
  for (let i = 0; i <= 40; i++) {
    const u = i / 40;
    const ang = u * Math.PI * 4.5;
    const y = (u - 0.5) * 6.2;
    dnaBackbonePointsA.push(new THREE.Vector3(Math.cos(ang) * 0.72, y, Math.sin(ang) * 0.72));
    dnaBackbonePointsB.push(
      new THREE.Vector3(Math.cos(ang + Math.PI) * 0.72, y, Math.sin(ang + Math.PI) * 0.72)
    );
  }
  const dnaGeoA = trackGeo(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(dnaBackbonePointsA), 56, 0.09, 10, false)
  );
  const dnaGeoB = trackGeo(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(dnaBackbonePointsB), 56, 0.09, 10, false)
  );

  const dnaConfigs = [
    { pos: new THREE.Vector3(-8.2, 2.2, -5.5), rot: new THREE.Euler(0.35, 0.2, 0.55), scale: 1.05 },
    { pos: new THREE.Vector3(8.5, 1.4, -6.5), rot: new THREE.Euler(-0.3, 0.4, -0.48), scale: 1.1 },
    { pos: new THREE.Vector3(-6.2, -3.5, -9.0), rot: new THREE.Euler(0.25, -0.5, 0.8), scale: 0.88 },
    { pos: new THREE.Vector3(6.6, -3.2, -10.5), rot: new THREE.Euler(-0.4, 0.3, -0.75), scale: 0.92 },
  ];

  dnaConfigs.forEach((cfg, idx) => {
    const dg = new THREE.Group();
    dg.position.copy(cfg.pos);
    dg.rotation.copy(cfg.rot);
    dg.scale.setScalar(cfg.scale);
    dg.add(new THREE.Mesh(dnaGeoA, mats.introDnaEmerald));
    dg.add(new THREE.Mesh(dnaGeoB, mats.introDnaCyan));

    for (let r = 2; r < 39; r += 3) {
      const rung = new THREE.Mesh(cylUnit, mats.hydrogenBond);
      orientCylinderBetween(rung, dnaBackbonePointsA[r], dnaBackbonePointsB[r], 0.04);
      dg.add(rung);
    }

    introGroup.add(dg);
    dnaStrands.push({
      group: dg,
      base: cfg.pos.clone(),
      rotSpeed: (idx % 2 === 0 ? 1 : -1) * (0.35 + idx * 0.08),
      phase: idx * 1.4,
    });
  });

  // 2. Floating 3D Bacteria (Bacillus capsules + waving flagella tails + pili)
  const bacteriaList: Array<{
    group: THREE.Group;
    base: THREE.Vector3;
    phase: number;
    driftSpeed: number;
  }> = [];
  const bacBodyGeo = trackGeo(new THREE.CapsuleGeometry(0.38, 1.25, 10, 18));
  const flagellumPts = [
    new THREE.Vector3(0, -0.85, 0),
    new THREE.Vector3(0.22, -1.4, 0.12),
    new THREE.Vector3(-0.24, -2.0, -0.1),
    new THREE.Vector3(0.2, -2.6, 0.14),
    new THREE.Vector3(-0.15, -3.15, -0.06),
  ];
  const flagellumGeo = trackGeo(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(flagellumPts), 28, 0.038, 8, false)
  );

  const bacPositions = [
    new THREE.Vector3(-9.5, -0.8, -11.5),
    new THREE.Vector3(9.4, 3.8, -12.0),
    new THREE.Vector3(4.2, 4.6, -14.5),
    new THREE.Vector3(-4.5, 4.4, -13.5),
    new THREE.Vector3(0.4, -4.4, -12.8),
  ];

  bacPositions.forEach((pos, idx) => {
    const bg = new THREE.Group();
    bg.position.copy(pos);
    bg.rotation.set(0.5 + idx * 0.3, idx * 0.9, 1.15 - idx * 0.4);
    bg.scale.setScalar(0.85 + (idx % 3) * 0.16);

    const body = new THREE.Mesh(bacBodyGeo, mats.introBacteriaShell);
    const innerNucleoid = new THREE.Mesh(smallSphereUnit, mats.introCellNucleus);
    innerNucleoid.scale.set(0.2, 0.62, 0.2);
    const tail = new THREE.Mesh(flagellumGeo, mats.introDnaCyan);
    bg.add(body, innerNucleoid, tail);

    for (let p = 0; p < 6; p++) {
      const pilus = new THREE.Mesh(cylUnit, mats.introDnaEmerald);
      const pa = (p / 6) * Math.PI * 2;
      const py = ((p % 3) - 1) * 0.45;
      pilus.position.set(Math.cos(pa) * 0.48, py, Math.sin(pa) * 0.48);
      pilus.rotation.set(0, 0, Math.PI / 2);
      pilus.rotation.y = -pa;
      pilus.scale.set(0.022, 0.28, 0.022);
      bg.add(pilus);
    }

    introGroup.add(bg);
    bacteriaList.push({
      group: bg,
      base: pos.clone(),
      phase: idx * 1.7,
      driftSpeed: 0.45 + idx * 0.12,
    });
  });

  // 3. Floating 3D Eukaryotic Cells (translucent outer membrane + glowing nucleus + organelles)
  const introCells: Array<{
    group: THREE.Group;
    base: THREE.Vector3;
    phase: number;
  }> = [];
  const introCellCoords = [
    { pos: new THREE.Vector3(-10.8, 4.4, -14.0), scale: 1.55 },
    { pos: new THREE.Vector3(10.8, -1.6, -13.5), scale: 1.65 },
    { pos: new THREE.Vector3(-3.2, -5.0, -15.5), scale: 1.35 },
    { pos: new THREE.Vector3(5.8, -5.2, -16.0), scale: 1.25 },
    { pos: new THREE.Vector3(0.0, 5.2, -17.0), scale: 1.45 },
  ];

  introCellCoords.forEach((cfg, idx) => {
    const cg = new THREE.Group();
    cg.position.copy(cfg.pos);
    cg.scale.setScalar(cfg.scale);

    const membrane = new THREE.Mesh(sphereUnit, mats.introCellMembrane);
    membrane.renderOrder = 3;
    const nucleus = new THREE.Mesh(sphereUnit, mats.introCellNucleus);
    nucleus.scale.setScalar(0.36);
    cg.add(membrane, nucleus);

    for (let o = 0; o < 5; o++) {
      const org = new THREE.Mesh(smallSphereUnit, mats.introDnaCyan);
      const oa = o * 1.25 + idx;
      org.position.set(
        Math.cos(oa) * 0.62,
        Math.sin(oa * 1.5) * 0.48,
        Math.sin(oa) * 0.56
      );
      org.scale.set(0.11, 0.07, 0.07);
      org.rotation.y = oa;
      cg.add(org);
    }

    introGroup.add(cg);
    introCells.push({
      group: cg,
      base: cfg.pos.clone(),
      phase: idx * 1.3,
    });
  });

  // =========================================================================
  // WORLD 0: HEMOGLOBIN -> THE BLOODSTREAM / RED BLOOD CELL WORLD
  // =========================================================================
  const s0 = new THREE.Group();
  s0.position.set(...PROTEIN_SLIDES[0].stationPos);
  root.add(s0);

  // World Environment: Arterial Bloodstream Tunnel Rings + Biconcave RBCs + Oxygen Cargo River
  const vesselRingMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x7f1d1d,
      emissive: 0x450a0a,
      emissiveIntensity: 0.5,
      roughness: 0.45,
      transparent: true,
      opacity: 0.35,
    })
  );
  const vesselRingGeo = trackGeo(new THREE.TorusGeometry(9.2, 0.16, 12, 56));
  for (let r = -2; r <= 2; r++) {
    const ring = new THREE.Mesh(vesselRingGeo, vesselRingMat);
    ring.position.set(r * 1.4, Math.sin(r) * 0.5, r * 4.8 - 2);
    ring.rotation.y = 0.25;
    s0.add(ring);
  }

  // Biconcave Red Blood Cell LatheGeometry
  const rbcPts = [
    new THREE.Vector2(0.01, 0.1),
    new THREE.Vector2(0.35, 0.16),
    new THREE.Vector2(0.68, 0.34),
    new THREE.Vector2(0.95, 0.24),
    new THREE.Vector2(1.0, 0.0),
    new THREE.Vector2(0.95, -0.24),
    new THREE.Vector2(0.68, -0.34),
    new THREE.Vector2(0.35, -0.16),
    new THREE.Vector2(0.01, -0.1),
  ];
  const rbcGeo = trackGeo(new THREE.LatheGeometry(rbcPts, 24));
  const rbcMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0xb91c1c,
      roughness: 0.35,
      metalness: 0.08,
      clearcoat: 0.65,
    })
  );
  const rbcCount = 26;
  const rbcInst = new THREE.InstancedMesh(rbcGeo, rbcMat, rbcCount);
  rbcInst.frustumCulled = false;
  s0.add(rbcInst);

  // Flowing Oxygen cargo bubbles in the bloodstream river
  const riverO2Count = 32;
  const riverO2Mat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xfda4af,
      emissive: 0xe11d48,
      emissiveIntensity: 0.55,
      roughness: 0.2,
    })
  );
  const riverO2Inst = new THREE.InstancedMesh(smallSphereUnit, riverO2Mat, riverO2Count);
  riverO2Inst.frustumCulled = false;
  s0.add(riverO2Inst);

  // Hero Red Blood Cell (solid in normal view; opens smoothly when zooming in with E)
  const heroRbcMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0xdc2626,
      emissive: 0x7f1d1d,
      emissiveIntensity: 0.22,
      roughness: 0.26,
      metalness: 0.06,
      clearcoat: 0.75,
      transparent: true,
      opacity: 1.0,
      depthWrite: true,
      side: THREE.DoubleSide,
    })
  );
  const heroRbcMesh = new THREE.Mesh(rbcGeo, heroRbcMat);
  heroRbcMesh.scale.set(3.85, 4.4, 3.85);
  heroRbcMesh.rotation.set(1.18, 0.22, -0.15);
  heroRbcMesh.renderOrder = 2;
  s0.add(heroRbcMesh);

  let heroRbcOpenBlend = 0;

  // Hero Hemoglobin Model (matches image_952afb42.png — revealed inside RBC on Microscope Zoom E)
  const hbGroup = new THREE.Group();
  hbGroup.scale.setScalar(0.001);
  hbGroup.visible = false;
  s0.add(hbGroup);

  const dimerA = new THREE.Group();
  const dimerB = new THREE.Group();
  hbGroup.add(dimerA, dimerB);

  const hemeDiskGeo = trackGeo(new THREE.CylinderGeometry(0.56, 0.56, 0.14, 28));
  const o2Groups: THREE.Group[] = [];
  const o2RestOffsets = [
    new THREE.Vector3(-2.6, 2.3, 1.6),
    new THREE.Vector3(2.6, 2.3, -1.4),
    new THREE.Vector3(-2.6, -2.3, -1.4),
    new THREE.Vector3(2.6, -2.3, 1.6),
  ];
  const o2DockedTargets: THREE.Vector3[] = [];

  const hbConfigs: Array<{
    parent: THREE.Group;
    pos: [number, number, number];
    mat: THREE.Material;
    seed: number;
    hemeLocal: [number, number, number];
    hemeRot: [number, number, number];
  }> = [
    // Top-left: β chain 1 (Vermilion Red)
    {
      parent: dimerA,
      pos: [-1.25, 1.15, 0.4],
      mat: mats.hbBeta1Red,
      seed: 0.3,
      hemeLocal: [0.35, -0.25, 0.65],
      hemeRot: [0.25, 0.45, 0.1],
    },
    // Top-right: β chain 2 (Terracotta Orange)
    {
      parent: dimerB,
      pos: [1.25, 1.15, -0.3],
      mat: mats.hbBeta2Orange,
      seed: 1.9,
      hemeLocal: [-0.25, -0.2, 0.65],
      hemeRot: [0.35, -0.45, -0.15],
    },
    // Bottom-left: α chain 1 (Deep Maroon)
    {
      parent: dimerB,
      pos: [-1.25, -1.15, -0.3],
      mat: mats.hbAlpha1Maroon,
      seed: 3.4,
      hemeLocal: [0.35, 0.25, 0.65],
      hemeRot: [-0.25, 0.4, 0.2],
    },
    // Bottom-right: α chain 2 (Coral Pink)
    {
      parent: dimerA,
      pos: [1.25, -1.15, 0.4],
      mat: mats.hbAlpha2Coral,
      seed: 4.9,
      hemeLocal: [-0.35, 0.2, 0.65],
      hemeRot: [-0.2, -0.4, -0.1],
    },
  ];

  hbConfigs.forEach((cfg) => {
    const sub = new THREE.Group();
    sub.position.set(...cfg.pos);
    cfg.parent.add(sub);

    // Dense rounded globin tubing coil matching image_952afb42.png
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 54; i++) {
      const u = i / 54;
      const a = u * Math.PI * 6 + cfg.seed;
      const r = 0.96 + Math.sin(u * Math.PI * 3) * 0.38;
      pts.push(
        new THREE.Vector3(
          Math.cos(a) * r,
          Math.sin(a * 0.72 + cfg.seed) * 0.98,
          Math.sin(a) * r * 0.58
        )
      );
    }
    const curve = new THREE.CatmullRomCurve3(pts, true);
    const tubeGeo = trackGeo(new THREE.TubeGeometry(curve, 108, 0.27, 14, true));
    const ribbon = new THREE.Mesh(tubeGeo, cfg.mat);
    ribbon.castShadow = true;
    sub.add(ribbon);

    // Heme disk (pale cream-gold) + central red Fe2+ iron sphere
    const hemeHolder = new THREE.Group();
    hemeHolder.position.set(...cfg.hemeLocal);
    hemeHolder.rotation.set(...cfg.hemeRot);
    sub.add(hemeHolder);

    const hemeDisk = new THREE.Mesh(hemeDiskGeo, mats.hbHemeGold);
    hemeDisk.rotation.x = Math.PI / 2;
    hemeHolder.add(hemeDisk);

    const ironCore = new THREE.Mesh(sphereUnit, mats.hbIronCrimson);
    ironCore.scale.setScalar(0.2);
    ironCore.position.set(0, 0, 0.08);
    hemeHolder.add(ironCore);

    const o2 = new THREE.Group();
    const oA = new THREE.Mesh(smallSphereUnit, mats.oxygenAtom);
    oA.scale.setScalar(0.16);
    oA.position.set(-0.12, 0, 0);
    const oB = new THREE.Mesh(smallSphereUnit, mats.oxygenAtom);
    oB.scale.setScalar(0.16);
    oB.position.set(0.12, 0, 0);
    const oBond = new THREE.Mesh(cylUnit, mats.covalentBond);
    oBond.rotation.z = Math.PI / 2;
    oBond.scale.set(0.055, 0.24, 0.055);
    o2.add(oA, oB, oBond);
    cfg.parent.add(o2);
    o2Groups.push(o2);

    o2DockedTargets.push(
      new THREE.Vector3(
        cfg.pos[0] + cfg.hemeLocal[0],
        cfg.pos[1] + cfg.hemeLocal[1] + 0.14,
        cfg.pos[2] + cfg.hemeLocal[2] + 0.25
      )
    );
  });

  let hbOxyBlend = 1;

  // =========================================================================
  // WORLD 1: COLLAGEN -> THE TENDON / BONE MATRIX WORLD
  // =========================================================================
  const s1 = new THREE.Group();
  s1.position.set(...PROTEIN_SLIDES[1].stationPos);
  root.add(s1);

  // World Environment: Structural Steel-like Matrix Cables, Cross-Trusses & Hydroxyapatite Mineral Plates
  const cableMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.35,
      metalness: 0.72,
    })
  );
  const matrixPlateMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.4,
      metalness: 0.55,
      transparent: true,
      opacity: 0.65,
    })
  );

  // Flanking braided load-bearing matrix cables
  const matrixCables: THREE.Group[] = [];
  const cableSpots: Array<[number, number, number]> = [
    [-5.8, 0, -4.2],
    [5.8, 0, -3.8],
    [4.4, 0, -7.2],
    [-4.2, 0, -7.5],
  ];
  cableSpots.forEach(([cx, cy, cz], cIdx) => {
    const cg = new THREE.Group();
    cg.position.set(cx, cy, cz);
    cg.rotation.z = cIdx % 2 === 0 ? 0.14 : -0.14;
    for (let s = 0; s < 3; s++) {
      const pts: THREE.Vector3[] = [];
      const off = (s * Math.PI * 2) / 3;
      for (let i = 0; i <= 32; i++) {
        const u = i / 32;
        const a = u * Math.PI * 5 + off;
        pts.push(new THREE.Vector3(Math.cos(a) * 0.35, (u - 0.5) * 14, Math.sin(a) * 0.35));
      }
      const geo = trackGeo(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.12, 8, false)
      );
      cg.add(new THREE.Mesh(geo, cableMat));
    }
    s1.add(cg);
    matrixCables.push(cg);
  });

  // Mineralized Bone Scaffolding Hexagonal Plates
  const hexGeo = trackGeo(new THREE.CylinderGeometry(1.1, 1.1, 0.14, 6));
  const bonePlates = new THREE.InstancedMesh(hexGeo, matrixPlateMat, 14);
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const r = 5.2 + (i % 3) * 1.4;
    _v1.set(Math.cos(a) * r, ((i % 5) - 2) * 2.2, Math.sin(a) * r - 3.5);
    _euler.set(0.2 * (i % 3), a, 0.15);
    _quat.setFromEuler(_euler);
    _mat4.compose(_v1, _quat, _scale.setScalar(0.85 + (i % 3) * 0.25));
    bonePlates.setMatrixAt(i, _mat4);
  }
  bonePlates.instanceMatrix.needsUpdate = true;
  bonePlates.computeBoundingSphere();
  s1.add(bonePlates);

  // Hero Collagen Model (matches image_0ed1b1bc.png)
  const collagenRoot = new THREE.Group();
  s1.add(collagenRoot);

  const colStickGroup = new THREE.Group();
  colStickGroup.position.set(-1.35, 0, 0);
  collagenRoot.add(colStickGroup);

  const stickStrandMats = [mats.colMint, mats.colPeach, mats.carbonAtom];
  const stickResCount = 16;
  const motifHighlightNodes: THREE.Mesh[] = [];

  for (let s = 0; s < 3; s++) {
    const phase = (s * Math.PI * 2) / 3;
    let prevPt: THREE.Vector3 | null = null;
    for (let i = 0; i < stickResCount; i++) {
      const u = i / (stickResCount - 1);
      const y = (u - 0.5) * 6.4;
      const a = u * Math.PI * 4.2 + phase;
      const r = 0.58;
      const pt = new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r);

      const alphaC = new THREE.Mesh(smallSphereUnit, stickStrandMats[s]);
      alphaC.position.copy(pt);
      alphaC.scale.setScalar(0.14);
      colStickGroup.add(alphaC);

      if (prevPt) {
        const bond = new THREE.Mesh(cylUnit, stickStrandMats[s]);
        orientCylinderBetween(bond, prevPt, pt, 0.075);
        colStickGroup.add(bond);
      }

      if (s === 2 && i % 2 === 0) {
        const out = new THREE.Vector3(Math.cos(a), 0, Math.sin(a)).normalize();
        const oPos = pt.clone().addScaledVector(out, 0.38);
        const oxy = new THREE.Mesh(smallSphereUnit, mats.oxygenAtom);
        oxy.position.copy(oPos);
        oxy.scale.setScalar(0.14);
        colStickGroup.add(oxy);

        const oStick = new THREE.Mesh(cylUnit, mats.covalentBond);
        orientCylinderBetween(oStick, pt, oPos, 0.045);
        colStickGroup.add(oStick);

        const ringPos = pt.clone().add(new THREE.Vector3(out.x * 0.45, 0.22, out.z * 0.45));
        const ringNode = new THREE.Mesh(
          smallSphereUnit,
          i % 4 === 0 ? mats.hbHemeGold : mats.nitrogenAtom
        );
        ringNode.position.copy(ringPos);
        ringNode.scale.setScalar(0.17);
        colStickGroup.add(ringNode);
        motifHighlightNodes.push(ringNode);
      }
      prevPt = pt;
    }
  }

  const colSpacefillGroup = new THREE.Group();
  colSpacefillGroup.position.set(1.75, 0, 0);
  collagenRoot.add(colSpacefillGroup);

  const spaceMats = [mats.colMint, mats.colPeach, mats.colLavender];
  for (let s = 0; s < 3; s++) {
    const phase = (s * Math.PI * 2) / 3;
    for (let i = 0; i < 42; i++) {
      const u = i / 41;
      const y = (u - 0.5) * 6.8;
      const a = u * Math.PI * 7.5 + phase;
      const r = 0.55;
      const bead = new THREE.Mesh(smallSphereUnit, spaceMats[s]);
      bead.position.set(Math.cos(a) * r, y, Math.sin(a) * r);
      bead.scale.setScalar(0.32 + (i % 3) * 0.05);
      bead.castShadow = true;
      colSpacefillGroup.add(bead);
    }
  }

  let colHighlightScale = 1;

  // =========================================================================
  // WORLD 2: ENZYMES -> THE CYTOPLASM / METABOLIC WORKSHOP WORLD
  // =========================================================================
  const s2 = new THREE.Group();
  s2.position.set(...PROTEIN_SLIDES[2].stationPos);
  root.add(s2);

  // World Environment: Mitochondrial Cristae Membrane Arches + High-Speed Metabolic Conveyor Streams
  const cristaMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0x1e1b4b,
      emissive: 0x312e81,
      emissiveIntensity: 0.25,
      roughness: 0.4,
      transparent: true,
      opacity: 0.55,
    })
  );
  const cristaGeo = trackGeo(new THREE.TorusGeometry(6.8, 0.28, 12, 48, Math.PI));
  for (let a = 0; a < 4; a++) {
    const arch = new THREE.Mesh(cristaGeo, cristaMat);
    arch.position.set(0, -3.8, -2.5 - a * 2.2);
    arch.rotation.y = (a - 1.5) * 0.28;
    s2.add(arch);
  }

  // Metabolic Conveyor Tracks (fast-moving incoming substrates & outgoing products)
  const factoryStreamCount = 36;
  const factoryStreamMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.2,
      metalness: 0.2,
    })
  );
  const factoryStreamInst = new THREE.InstancedMesh(
    smallSphereUnit,
    factoryStreamMat,
    factoryStreamCount
  );
  factoryStreamInst.frustumCulled = false;
  for (let i = 0; i < factoryStreamCount; i++) {
    factoryStreamInst.setColorAt(
      i,
      i % 2 === 0 ? new THREE.Color('#F97316') : new THREE.Color('#34D399')
    );
  }
  if (factoryStreamInst.instanceColor) factoryStreamInst.instanceColor.needsUpdate = true;
  s2.add(factoryStreamInst);

  // Hero Enzymes Toroidal Complex (matches image_9bf0ebab.png)
  const enzymeRingGroup = new THREE.Group();
  s2.add(enzymeRingGroup);

  const domainMats = [mats.enzMint, mats.enzPeriwinkle, mats.enzRose, mats.enzButter];
  const enzSubstrates: THREE.Mesh[] = [];
  const enzCofactors: THREE.Mesh[] = [];
  const activeSiteBases: THREE.Vector3[] = [];

  for (let d = 0; d < 4; d++) {
    const startAngle = (d * Math.PI) / 2;
    const domain = new THREE.Group();
    enzymeRingGroup.add(domain);

    for (let h = 0; h < 3; h++) {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 44; i++) {
        const u = i / 44;
        const arc = startAngle + u * (Math.PI * 0.46) + 0.04;
        const helixSpin = u * Math.PI * 7 + h * 2.1;
        const ringR = 2.45 + Math.cos(helixSpin) * (0.42 + h * 0.14);
        const yOff = Math.sin(helixSpin) * (0.48 + h * 0.12) + (h - 1) * 0.28;
        pts.push(new THREE.Vector3(Math.cos(arc) * ringR, Math.sin(arc) * ringR, yOff));
      }
      const geo = trackGeo(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 64, 0.14, 10, false)
      );
      const mesh = new THREE.Mesh(geo, domainMats[d]);
      mesh.castShadow = true;
      domain.add(mesh);
    }

    const pocketAngle = startAngle + Math.PI * 0.25;
    const pocketPos = new THREE.Vector3(
      Math.cos(pocketAngle) * 1.85,
      Math.sin(pocketAngle) * 1.85,
      0.32
    );
    activeSiteBases.push(pocketPos);

    const pocketCluster = new THREE.Group();
    pocketCluster.position.copy(pocketPos);
    domain.add(pocketCluster);

    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      const lobe = new THREE.Mesh(smallSphereUnit, mats.enzActiveCrimson);
      lobe.scale.setScalar(0.32);
      lobe.position.set(Math.cos(a) * 0.28, Math.sin(a) * 0.28, (k % 2) * 0.15);
      pocketCluster.add(lobe);
    }

    const cof = new THREE.Mesh(smallSphereUnit, mats.hbHemeGold);
    cof.scale.setScalar(0.2);
    cof.position.copy(pocketPos).add(new THREE.Vector3(0.18, -0.15, 0.25));
    enzymeRingGroup.add(cof);
    enzCofactors.push(cof);

    const subSphere = new THREE.Mesh(smallSphereUnit, mats.enzCofactorOrange);
    subSphere.scale.setScalar(0.24);
    enzymeRingGroup.add(subSphere);
    enzSubstrates.push(subSphere);
  }

  let enzCycle = 0;

  // =========================================================================
  // WORLD 3: KERATIN -> THE HAIR FIBER WORLD
  // =========================================================================
  const s3 = new THREE.Group();
  s3.position.set(...PROTEIN_SLIDES[3].stationPos);
  root.add(s3);

  // World Environment: Hair Cortex Cuticle Scale Rings & Parallel Elastic Protofibril Towers
  const cuticleMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0x4a1d42,
      roughness: 0.35,
      metalness: 0.25,
      transparent: true,
      opacity: 0.34,
      side: THREE.DoubleSide,
    })
  );
  const cuticleGeo = trackGeo(
    new THREE.CylinderGeometry(7.2, 7.6, 1.35, 32, 1, true, 0, Math.PI * 1.3)
  );
  for (let c = -3; c <= 3; c++) {
    const scaleRing = new THREE.Mesh(cuticleGeo, cuticleMat);
    scaleRing.position.set(0, c * 1.45, -1.5);
    scaleRing.rotation.y = Math.PI * 0.85 + c * 0.4;
    s3.add(scaleRing);
  }

  // Flanking Elastic Coiled Protofibril Ropes
  const hairTowers: THREE.Group[] = [];
  const towerPositions: Array<[number, number, number]> = [
    [-5.2, 0, -2.6],
    [5.2, 0, -2.6],
  ];
  towerPositions.forEach(([tx, ty, tz], tIdx) => {
    const tg = new THREE.Group();
    tg.position.set(tx, ty, tz);
    for (let strand = 0; strand < 2; strand++) {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 48; i++) {
        const u = i / 48;
        const a = u * Math.PI * 8 + strand * Math.PI + tIdx;
        pts.push(new THREE.Vector3(Math.cos(a) * 0.45, (u - 0.5) * 9.5, Math.sin(a) * 0.45));
      }
      const geo = trackGeo(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.11, 8, false)
      );
      tg.add(new THREE.Mesh(geo, strand === 0 ? mats.kerMagentaHelix : mats.kerGoldSheet));
    }
    s3.add(tg);
    hairTowers.push(tg);
  });

  // Hero Keratin Model (matches image_f4149278.png)
  const keratinGroup = new THREE.Group();
  s3.add(keratinGroup);

  const kerDomain = new THREE.Group();
  kerDomain.position.set(0, 1.35, 0);
  keratinGroup.add(kerDomain);

  for (let h = 0; h < 4; h++) {
    const pts: THREE.Vector3[] = [];
    const xBase = (h - 1.5) * 1.35;
    for (let i = 0; i <= 36; i++) {
      const u = i / 36;
      const a = u * Math.PI * 5.2 + h * 1.1;
      pts.push(
        new THREE.Vector3(
          xBase + Math.cos(a) * 0.34,
          (u - 0.5) * 2.1 + (h % 2 === 0 ? 0.2 : -0.2),
          Math.sin(a) * 0.34 + (h % 2 === 0 ? 0.35 : -0.35)
        )
      );
    }
    const tubeGeo = trackGeo(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 56, 0.14, 10, false)
    );
    const mesh = new THREE.Mesh(tubeGeo, mats.kerMagentaHelix);
    mesh.castShadow = true;
    kerDomain.add(mesh);
  }

  for (let l = 0; l < 3; l++) {
    const loopPts = [
      new THREE.Vector3((l - 1.5) * 1.35, 1.0, 0),
      new THREE.Vector3((l - 1) * 1.35, 1.55, 0.4),
      new THREE.Vector3((l - 0.5) * 1.35, 0.9, -0.2),
    ];
    const lGeo = trackGeo(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(loopPts), 24, 0.06, 8, false)
    );
    kerDomain.add(new THREE.Mesh(lGeo, mats.kerSilverLoop));
  }

  for (let c = 0; c < 3; c++) {
    const p1 = new THREE.Vector3((c - 1) * 1.35 - 0.25, 0.1, 0.2);
    const p2 = new THREE.Vector3((c - 1) * 1.35 + 0.35, -0.1, -0.2);
    const link = new THREE.Mesh(cylUnit, mats.sulfurGold);
    orientCylinderBetween(link, p1, p2, 0.065);
    kerDomain.add(link);
  }

  const kerHelixShowcase = new THREE.Group();
  kerHelixShowcase.position.set(-1.95, -1.25, 0.25);
  keratinGroup.add(kerHelixShowcase);

  const kHelixPts: THREE.Vector3[] = [];
  for (let i = 0; i <= 54; i++) {
    const u = i / 54;
    const a = u * Math.PI * 6.5;
    kHelixPts.push(new THREE.Vector3(Math.cos(a) * 0.55, (u - 0.5) * 2.8, Math.sin(a) * 0.55));
  }
  const kHelixGeo = trackGeo(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(kHelixPts), 80, 0.18, 12, false)
  );
  const kHelixMesh = new THREE.Mesh(kHelixGeo, mats.kerMagentaHelix);
  kHelixMesh.castShadow = true;
  kerHelixShowcase.add(kHelixMesh);

  const kerSheetShowcase = new THREE.Group();
  kerSheetShowcase.position.set(1.25, -1.25, 0.15);
  keratinGroup.add(kerSheetShowcase);

  const sheetMeshes: THREE.Mesh[] = [];
  for (let row = 0; row < 4; row++) {
    const yBase = (row - 1.5) * 0.62;
    const zigPts: THREE.Vector3[] = [];
    for (let z = 0; z <= 8; z++) {
      const x = (z - 4) * 0.42;
      const y = yBase + (z % 2 === 0 ? 0.12 : -0.12);
      const zDepth = z % 2 === 0 ? 0.14 : -0.14;
      zigPts.push(new THREE.Vector3(x, y, zDepth));
    }
    const zCurve = new THREE.CatmullRomCurve3(zigPts, false, 'catmullrom', 0.12);
    const zGeo = trackGeo(new THREE.TubeGeometry(zCurve, 48, 0.11, 6, false));
    const zMesh = new THREE.Mesh(zGeo, mats.kerGoldSheet);
    zMesh.scale.set(1, 1.55, 0.6);
    zMesh.castShadow = true;
    kerSheetShowcase.add(zMesh);
    sheetMeshes.push(zMesh);
  }

  let kerSheetEmphasis = 1;

  // =========================================================================
  // WORLD 4: CHAPERONE PROTEIN -> THE RIBOSOME / PROTEIN REPAIR CHAMBER
  // =========================================================================
  const s4 = new THREE.Group();
  s4.position.set(...PROTEIN_SLIDES[4].stationPos);
  root.add(s4);

  // World Environment: Protective Sanctuary Rings
  const podRingMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x14b8a6,
      emissive: 0x0f766e,
      emissiveIntensity: 0.45,
      roughness: 0.25,
      transparent: true,
      opacity: 0.4,
    })
  );
  const podRingGeo = trackGeo(new THREE.TorusGeometry(4.8, 0.06, 12, 64));
  const sanctuaryRings: THREE.Mesh[] = [];
  for (let r = 0; r < 3; r++) {
    const ring = new THREE.Mesh(podRingGeo, podRingMat);
    ring.position.set(0.3, (r - 1) * 2.2, -1.2);
    ring.rotation.x = Math.PI / 2 + (r - 1) * 0.12;
    s4.add(ring);
    sanctuaryRings.push(ring);
  }

  // Hero Chaperone Crystal Ribbon Structure (matches image_c9e289ce.png)
  // Burnt copper-orange α-helices + Sky-blue β-sheet directional arrows + Violet loops + Central ATP/Ions
  const chapGroup = new THREE.Group();
  s4.add(chapGroup);

  const buildCrystalHelix = (
    pStart: [number, number, number],
    pEnd: [number, number, number],
    turns: number,
    helixRadius: number
  ) => {
    const start = new THREE.Vector3(...pStart);
    const end = new THREE.Vector3(...pEnd);
    const axis = new THREE.Vector3().subVectors(end, start);
    const len = axis.length();
    const dir = axis.clone().normalize();
    const ref = Math.abs(dir.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
    const uVec = new THREE.Vector3().crossVectors(dir, ref).normalize();
    const vVec = new THREE.Vector3().crossVectors(dir, uVec).normalize();

    const pts: THREE.Vector3[] = [];
    const steps = Math.max(36, Math.round(turns * 16));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const angle = t * Math.PI * 2 * turns;
      const along = t * len;
      const p = start
        .clone()
        .addScaledVector(dir, along)
        .addScaledVector(uVec, Math.cos(angle) * helixRadius)
        .addScaledVector(vVec, Math.sin(angle) * helixRadius);
      pts.push(p);
    }
    const geo = trackGeo(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), steps * 2, 0.145, 10, false)
    );
    const mesh = new THREE.Mesh(geo, mats.chapCopperHelix);
    mesh.castShadow = true;
    chapGroup.add(mesh);
  };

  // Burnt Copper-Orange α-Helices placed across upper and lower lobes like image_c9e289ce.png
  buildCrystalHelix([-3.1, 1.55, 0.3], [-1.35, 0.8, 0.55], 3.5, 0.34);
  buildCrystalHelix([-2.6, 0.3, 0.75], [-1.1, 1.85, 0.15], 3.8, 0.34);
  buildCrystalHelix([-0.75, 2.35, -0.25], [1.45, 1.55, 0.25], 4.2, 0.34);
  buildCrystalHelix([0.25, 0.75, 0.45], [1.95, 2.2, -0.2], 3.2, 0.32);
  buildCrystalHelix([1.1, 0.35, -0.25], [2.4, -0.95, 0.35], 3.4, 0.33);
  buildCrystalHelix([-1.8, -0.85, 0.45], [-0.4, -0.5, -0.2], 2.8, 0.3);
  buildCrystalHelix([0.1, -1.35, 0.35], [1.3, -2.6, -0.15], 3.8, 0.34);
  buildCrystalHelix([-0.65, -2.55, 0.5], [0.85, -1.75, -0.35], 3.0, 0.31);

  // Sky-Blue β-Sheet Flat Directional Arrows (Upper-right, Upper-left, Lower-left, Lower-right)
  const betaShaftGeo = trackGeo(new THREE.BoxGeometry(1, 0.28, 0.08));
  const betaArrowGeo = trackGeo(new THREE.ConeGeometry(0.24, 0.42, 4));
  const buildBetaArrow = (
    pStart: [number, number, number],
    pEnd: [number, number, number]
  ) => {
    const start = new THREE.Vector3(...pStart);
    const end = new THREE.Vector3(...pEnd);
    const diff = new THREE.Vector3().subVectors(end, start);
    const len = diff.length();
    const dir = diff.clone().normalize();
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);

    const arrowGroup = new THREE.Group();
    const shaftLen = Math.max(0.4, len - 0.38);
    const shaft = new THREE.Mesh(betaShaftGeo, mats.chapSkyBetaSheet);
    shaft.scale.x = shaftLen;
    shaft.position.x = -0.18;

    const head = new THREE.Mesh(betaArrowGeo, mats.chapSkyBetaSheet);
    head.rotation.z = -Math.PI / 2;
    head.scale.z = 0.28;
    head.position.x = shaftLen * 0.5;

    arrowGroup.add(shaft, head);
    arrowGroup.position.copy(mid);
    arrowGroup.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), dir);
    arrowGroup.castShadow = true;
    chapGroup.add(arrowGroup);
  };

  // Upper-right 4-strand β-sheet fan (characteristic of image_c9e289ce.png)
  buildBetaArrow([0.45, 0.85, -0.1], [2.95, 1.35, 0.25]);
  buildBetaArrow([3.1, 0.92, 0.15], [0.55, 0.45, -0.15]);
  buildBetaArrow([0.6, 0.12, 0.2], [2.65, 0.55, -0.25]);
  buildBetaArrow([-2.7, 1.45, -0.35], [-1.75, 0.2, 0.25]);
  // Lower-left & lower-right β-sheet strands
  buildBetaArrow([-2.0, -2.85, 0.2], [-0.45, -1.65, -0.25]);
  buildBetaArrow([-0.3, -2.05, 0.25], [-1.85, -3.1, -0.15]);
  buildBetaArrow([-1.45, -1.25, -0.35], [-2.15, -2.4, 0.35]);
  buildBetaArrow([0.75, -0.35, 0.2], [1.95, -2.1, -0.2]);

  // Violet-Purple Connecting Polypeptide Loops threading between motifs
  const violetLoopPaths: Array<[number, number, number][]> = [
    [
      [-3.15, 1.5, 0.3],
      [-3.55, 0.9, 0.6],
      [-2.9, 0.3, 0.7],
    ],
    [
      [-1.1, 1.9, 0.15],
      [-0.85, 2.55, 0.05],
      [-0.5, 2.35, -0.2],
    ],
    [
      [1.45, 1.55, 0.25],
      [2.35, 2.3, -0.1],
      [3.35, 1.4, 0.4],
      [3.15, 0.9, 0.15],
    ],
    [
      [2.6, 0.55, -0.25],
      [2.8, -0.5, 0.45],
      [2.35, -1.1, 0.35],
    ],
    [
      [-1.85, -0.85, 0.45],
      [-2.6, -1.5, 0.2],
      [-2.15, -2.4, 0.35],
    ],
    [
      [-0.45, -1.65, -0.25],
      [0.15, -1.35, 0.35],
      [1.25, -2.6, -0.15],
      [1.95, -2.1, -0.2],
    ],
  ];
  violetLoopPaths.forEach((ptsArr) => {
    const curve = new THREE.CatmullRomCurve3(
      ptsArr.map((p) => new THREE.Vector3(...p))
    );
    const lGeo = trackGeo(new THREE.TubeGeometry(curve, 36, 0.055, 8, false));
    chapGroup.add(new THREE.Mesh(lGeo, mats.chapVioletLoop));
  });

  // Central Nucleotide Cofactor + Mg²⁺ (Lime) & K⁺ (Purple) Ions in the Cleft
  const cleftGroup = new THREE.Group();
  cleftGroup.position.set(0.05, 0.15, 0.35);
  chapGroup.add(cleftGroup);

  const nucleotideMesh = new THREE.Mesh(sphereUnit, mats.chapAtpLavender);
  nucleotideMesh.scale.set(0.32, 0.22, 0.22);
  nucleotideMesh.position.set(-0.22, 0.1, 0);
  cleftGroup.add(nucleotideMesh);

  const ionMg = new THREE.Mesh(smallSphereUnit, mats.chapIonLime);
  ionMg.scale.setScalar(0.14);
  ionMg.position.set(0.28, -0.12, 0.12);
  const ionK1 = new THREE.Mesh(smallSphereUnit, mats.chapIonPurple);
  ionK1.scale.setScalar(0.13);
  ionK1.position.set(0.14, 0.14, 0.18);
  const ionK2 = new THREE.Mesh(smallSphereUnit, mats.chapIonPurple);
  ionK2.scale.setScalar(0.11);
  ionK2.position.set(0.12, -0.28, -0.05);
  cleftGroup.add(ionMg, ionK1, ionK2);

  let chapAdpBlend = 0;

  // =========================================================================
  // PER-FRAME WORLD & SLIDE STAGE ANIMATION LOOP
  // =========================================================================
  const worldGroups = [s0, s1, s2, s3, s4];
  worldGroups.forEach((wg) => {
    wg.visible = false;
  });
  let displayedSlide = -1;
  let stageBlend = 0;
  let slideDir = 1;
  let introBlend = 1;

  const update = (
    elapsed: number,
    delta: number,
    sim: PresentationSimState,
    microscopeMode: boolean,
    activeSlideIndex: number,
    showVoid: boolean
  ) => {
    const dt = Math.min(delta, 0.05);
    const desiredSlide = showVoid ? -1 : activeSlideIndex;

    // 1. Sequential One-at-a-Time Slide Stage Transition (Zero Overlapping!)
    if (displayedSlide !== desiredSlide) {
      if (displayedSlide === -1) {
        if (introBlend <= 0.12) {
          displayedSlide = desiredSlide;
          stageBlend = 0.02;
          slideDir = 1;
        }
      } else {
        slideDir =
          desiredSlide === -1 || desiredSlide >= displayedSlide ? 1 : -1;
        stageBlend = THREE.MathUtils.damp(stageBlend, 0, 14, dt);
        if (stageBlend <= 0.03) {
          worldGroups[displayedSlide].visible = false;
          displayedSlide = desiredSlide;
          stageBlend = 0.02;
        }
      }
    } else if (displayedSlide >= 0) {
      stageBlend = THREE.MathUtils.damp(stageBlend, 1, 9.5, dt);
    } else {
      stageBlend = 0;
    }

    for (let i = 0; i < worldGroups.length; i++) {
      const wg = worldGroups[i];
      if (i === displayedSlide && stageBlend > 0.02) {
        wg.visible = true;
        const scale = 0.35 + 0.65 * stageBlend;
        wg.scale.setScalar(scale);
        const isEntering = displayedSlide === desiredSlide;
        const xShift = isEntering
          ? (1 - stageBlend) * 12 * slideDir
          : -(1 - stageBlend) * 12 * slideDir;
        wg.position.set(xShift, 0, (1 - stageBlend) * -6.0);
      } else {
        wg.visible = false;
      }
    }

    // 2. Intro / Closing Void Biology Background (Floating DNAs, Bacteria & Cells)
    const wantVoid = showVoid && displayedSlide === -1;
    introBlend = THREE.MathUtils.damp(introBlend, wantVoid ? 1 : 0, 10, dt);
    introGroup.visible = introBlend > 0.015;
    introGroup.scale.setScalar(Math.max(0.001, 0.72 + 0.28 * introBlend));
    introGroup.position.z = (1 - introBlend) * -14;

    if (introGroup.visible) {
      for (let i = 0; i < dnaStrands.length; i++) {
        const d = dnaStrands[i];
        d.group.rotation.y += dt * d.rotSpeed;
        d.group.position.y = d.base.y + Math.sin(elapsed * 0.7 + d.phase) * 0.55;
      }
      for (let i = 0; i < bacteriaList.length; i++) {
        const b = bacteriaList[i];
        b.group.position.x =
          b.base.x + Math.sin(elapsed * b.driftSpeed + b.phase) * 1.1;
        b.group.position.y =
          b.base.y + Math.cos(elapsed * (b.driftSpeed * 0.8) + b.phase) * 0.65;
        b.group.rotation.z =
          1.15 - i * 0.4 + Math.sin(elapsed * 1.4 + b.phase) * 0.14;
      }
      for (let i = 0; i < introCells.length; i++) {
        const c = introCells[i];
        c.group.position.y = c.base.y + Math.sin(elapsed * 0.55 + c.phase) * 0.5;
        c.group.rotation.y = elapsed * 0.18 + c.phase;
      }
    }

    // Hero Red Blood Cell: solid in normal view, opens smoothly to reveal 3D Hemoglobin on Microscope (E)
    heroRbcOpenBlend = THREE.MathUtils.damp(
      heroRbcOpenBlend,
      !showVoid && displayedSlide === 0 && microscopeMode ? 1 : 0,
      5.5,
      dt
    );
    heroRbcMat.opacity = THREE.MathUtils.lerp(1.0, 0.07, heroRbcOpenBlend);
    heroRbcMat.depthWrite = heroRbcOpenBlend < 0.08;
    const rbcScale = THREE.MathUtils.lerp(1.0, 1.38, heroRbcOpenBlend);
    heroRbcMesh.scale.set(3.85 * rbcScale, 4.4 * rbcScale, 3.85 * rbcScale);
    heroRbcMesh.rotation.y = 0.22 + Math.sin(elapsed * 0.28) * 0.14;

    hbGroup.visible = heroRbcOpenBlend > 0.04;
    hbGroup.scale.setScalar(Math.max(0.001, heroRbcOpenBlend));

    // Inter-world drift
    for (let i = 0; i < particleCount; i++) {
      const base = pBasePos[i];
      const ph = pPhase[i] + elapsed * pSpeed[i];
      _v1.set(
        base.x + Math.sin(ph) * 0.4,
        base.y + Math.cos(ph * 0.85) * 0.32,
        base.z + Math.sin(ph * 0.5) * 0.38
      );
      _mat4.compose(_v1, _quat.identity(), _scale.setScalar(pScale[i]));
      particles.setMatrixAt(i, _mat4);
    }
    particles.instanceMatrix.needsUpdate = true;

    // WORLD 0: Bloodstream Red Blood Cells & Oxygen Cargo Stream
    for (let i = 0; i < rbcCount; i++) {
      const loopT = ((elapsed * 0.16 + i / rbcCount) % 1);
      const x = THREE.MathUtils.lerp(-14, 14, loopT);
      const angle = i * 1.9;
      const rad = 4.8 + (i % 4) * 1.1;
      _v1.set(
        x,
        Math.sin(angle + elapsed * 0.4) * rad * 0.48,
        -4.5 - Math.abs(Math.cos(angle)) * 4.5
      );
      _euler.set(elapsed * 0.6 + i, elapsed * 0.4 + i * 0.5, 0.3);
      _quat.setFromEuler(_euler);
      _mat4.compose(_v1, _quat, _scale.setScalar(0.65 + (i % 3) * 0.18));
      rbcInst.setMatrixAt(i, _mat4);
    }
    rbcInst.instanceMatrix.needsUpdate = true;

    for (let i = 0; i < riverO2Count; i++) {
      const loopT = ((elapsed * 0.28 + i / riverO2Count) % 1);
      const x = THREE.MathUtils.lerp(-12, 12, loopT);
      _v1.set(
        x,
        Math.sin(i * 1.3 + elapsed * 1.5) * 3.8,
        -2.5 - (i % 5) * 1.3
      );
      _mat4.compose(_v1, _quat.identity(), _scale.setScalar(0.14));
      riverO2Inst.setMatrixAt(i, _mat4);
    }
    riverO2Inst.instanceMatrix.needsUpdate = true;

    hbOxyBlend = THREE.MathUtils.damp(hbOxyBlend, sim.hemoglobinOxy ? 1 : 0, 4.5, dt);
    hbGroup.rotation.y = Math.sin(elapsed * 0.3) * 0.25;
    const shiftAngle = THREE.MathUtils.lerp(0.24, 0.0, hbOxyBlend);
    dimerA.rotation.y = shiftAngle;
    dimerB.rotation.y = -shiftAngle;

    for (let i = 0; i < o2Groups.length; i++) {
      const rest = o2RestOffsets[i];
      const dock = o2DockedTargets[i];
      _v1.set(
        rest.x + Math.sin(elapsed * 1.6 + i) * 0.22,
        rest.y + Math.cos(elapsed * 1.4 + i) * 0.22,
        rest.z
      );
      o2Groups[i].position.lerpVectors(_v1, dock, hbOxyBlend);
      o2Groups[i].rotation.z = THREE.MathUtils.lerp(elapsed + i, 0.35, hbOxyBlend);
    }

    // WORLD 1: Tendon / Bone Matrix Cable Tension & Triple-Helix Lock
    const tensionPulse = sim.collagenHighlightMotif
      ? 1 + Math.sin(elapsed * 2.2) * 0.025
      : 1;
    for (let c = 0; c < matrixCables.length; c++) {
      matrixCables[c].scale.set(1, tensionPulse, 1);
    }
    colStickGroup.rotation.y = elapsed * 0.32;
    colSpacefillGroup.rotation.y = -elapsed * 0.38;
    colHighlightScale = THREE.MathUtils.damp(
      colHighlightScale,
      sim.collagenHighlightMotif ? 1.35 : 0.75,
      5,
      dt
    );
    for (let i = 0; i < motifHighlightNodes.length; i++) {
      motifHighlightNodes[i].scale.setScalar(0.15 * colHighlightScale);
    }

    // WORLD 2: Cytoplasm Workshop High-Speed Metabolic Conveyor Streams
    const streamSpeed = sim.catalysisActive ? 0.55 : 0.08;
    for (let i = 0; i < factoryStreamCount; i++) {
      const loopT = ((elapsed * streamSpeed + i / factoryStreamCount) % 1);
      const isUpper = i % 2 === 0;
      const x = THREE.MathUtils.lerp(-10, 10, loopT);
      const y = (isUpper ? 3.8 : -3.8) + Math.sin(loopT * Math.PI * 3 + i) * 0.45;
      const z = -4.2 + Math.cos(loopT * Math.PI * 2) * 1.4;
      _v1.set(x, y, z);
      _mat4.compose(_v1, _quat.identity(), _scale.setScalar(0.19));
      factoryStreamInst.setMatrixAt(i, _mat4);
    }
    factoryStreamInst.instanceMatrix.needsUpdate = true;

    enzymeRingGroup.rotation.z = elapsed * 0.1;
    enzymeRingGroup.rotation.y = Math.sin(elapsed * 0.28) * 0.22;
    if (sim.catalysisActive) {
      enzCycle = (enzCycle + dt * 0.55) % 1;
    }
    for (let d = 0; d < 4; d++) {
      const base = activeSiteBases[d];
      const phase = (enzCycle + d * 0.25) % 1;
      const approach = Math.sin(phase * Math.PI);
      const offsetDist = (1 - approach) * 1.45;
      const radial = _v1.copy(base).normalize();
      enzSubstrates[d].position.set(
        base.x + radial.x * offsetDist * 0.45,
        base.y + radial.y * offsetDist * 0.45,
        base.z + 0.35 + offsetDist * 0.65
      );
      enzCofactors[d].rotation.y = elapsed * 1.5;
    }

    // WORLD 3: Hair Fiber Elastic Stretch & Rebound Action
    const stretchWave = Math.sin(elapsed * 2.1);
    const elasticY = sim.keratinHighlightSheets ? 1 + stretchWave * 0.12 : 1.0;
    const elasticXZ = 1 / Math.sqrt(elasticY); // Volume-preserving elastic Poisson rebound
    keratinGroup.scale.set(elasticXZ, elasticY, elasticXZ);
    keratinGroup.rotation.y = Math.sin(elapsed * 0.3) * 0.24;
    for (let t = 0; t < hairTowers.length; t++) {
      hairTowers[t].scale.set(elasticXZ, elasticY, elasticXZ);
    }
    kerHelixShowcase.rotation.y = elapsed * 0.5;
    kerSheetEmphasis = THREE.MathUtils.damp(
      kerSheetEmphasis,
      sim.keratinHighlightSheets ? 1.08 : 0.92,
      5,
      dt
    );
    for (let i = 0; i < sheetMeshes.length; i++) {
      sheetMeshes[i].scale.set(
        kerSheetEmphasis,
        1.55 * kerSheetEmphasis,
        0.6 + Math.sin(elapsed * 1.8 + i) * 0.08
      );
    }

    // WORLD 4: Protein Repair Chamber Sanctuary & Crystal Chaperone
    for (let r = 0; r < sanctuaryRings.length; r++) {
      sanctuaryRings[r].rotation.z = elapsed * (0.2 + r * 0.12);
    }

    chapAdpBlend = THREE.MathUtils.damp(chapAdpBlend, sim.chaperoneAdpBound ? 1 : 0, 4.5, dt);
    chapGroup.rotation.y = Math.sin(elapsed * 0.35) * 0.32;
    chapGroup.rotation.x = Math.cos(elapsed * 0.24) * 0.12;
    nucleotideMesh.material = sim.chaperoneAdpBound
      ? mats.chapAdpCyan
      : mats.chapAtpLavender;
    const ionPulse = 1 + Math.sin(elapsed * 2.6) * 0.12;
    ionMg.scale.setScalar(0.14 * ionPulse);
    ionK1.scale.setScalar(0.13 * (2 - ionPulse));
    cleftGroup.rotation.z = Math.sin(elapsed * 1.1) * 0.08;
  };

  const dispose = () => {
    geometries.forEach((g) => g.dispose());
    extraMaterials.forEach((m) => m.dispose());
  };

  return { root, update, dispose };
}
