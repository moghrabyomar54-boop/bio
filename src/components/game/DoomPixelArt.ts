import * as THREE from 'three';

// Exclusively for the 3D DOOM bottom HUD interface portrait (classic 6x6 sheet: 397x503)
export const DOOM_FACE_SHEET_URL = '/assets/aistudio/image_9139454d.png';

// Audio tracks mapped strictly to gameplay phases
export const D45K13_GAME_MUSIC_URL =
  '/assets/aistudio/11_-_D45K13_-_fruit___FrutigerAero_1eab5dd3.mp3';
export const ADHD_QUEEN_MUSIC_URL =
  '/assets/aistudio/adhd__0xpcMXpkKzw__3019168c.mp3';
export const CELL_CAR_SOUNDTRACK_URL =
  '/assets/aistudio/30_-_Tokyo_Drift_-_Six_Days__4K__ed8ca362.mp3';

export type DoomFaceMood = 'normal' | 'grin' | 'pain' | 'shock' | 'dead';

let cachedKeyedSheet: HTMLCanvasElement | null = null;
let loadingSheetPromise: Promise<HTMLCanvasElement | null> | null = null;

/**
 * Loads the uploaded 6x6 Doomguy sprite sheet (/assets/aistudio/image_9139454d.png)
 * and chroma-keys near-black background pixels for clean DOOM HUD rendering.
 */
export function getKeyedDoomFaceSheet(): Promise<HTMLCanvasElement | null> {
  if (cachedKeyedSheet) return Promise.resolve(cachedKeyedSheet);
  if (loadingSheetPromise) return loadingSheetPromise;

  loadingSheetPromise = new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = img.naturalWidth || 397;
      c.height = img.naturalHeight || 503;
      const ctx = c.getContext('2d');
      if (!ctx) {
        resolve(null);
        return;
      }
      ctx.drawImage(img, 0, 0);
      try {
        const imgData = ctx.getImageData(0, 0, c.width, c.height);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
          const r = d[i];
          const g = d[i + 1];
          const b = d[i + 2];
          if (r < 18 && g < 18 && b < 18) {
            d[i + 3] = 0;
          }
        }
        ctx.putImageData(imgData, 0, 0);
      } catch {
        // Fallback to raw image if tainted
      }
      cachedKeyedSheet = c;
      resolve(c);
    };
    img.onerror = () => resolve(null);
    img.src = DOOM_FACE_SHEET_URL;
  });

  return loadingSheetPromise;
}

export function getDoomFaceCropRect(
  mood: DoomFaceMood,
  health: number,
  lookDir: number,
  sheetW = 397,
  sheetH = 503
): { sx: number; sy: number; sw: number; sh: number } {
  const cw = sheetW / 6;
  const ch = sheetH / 6;
  const lookIdx = lookDir < 0 ? 2 : lookDir > 0 ? 0 : 1;

  if (mood === 'dead') {
    return {
      sx: cw * 2.5,
      sy: ch * 5,
      sw: cw,
      sh: ch,
    };
  }

  let col = 1;
  let row = 0;

  if (mood === 'shock') {
    row = 4;
    col = health >= 80 ? 1 : health >= 60 ? 2 : health >= 40 ? 3 : health >= 20 ? 4 : 5;
  } else if (mood === 'pain') {
    row = 3;
    col = health >= 75 ? 2 : health >= 50 ? 3 : health >= 25 ? 4 : 5;
  } else if (mood === 'grin') {
    if (health >= 50) {
      row = 2;
      col = 3 + lookIdx;
    } else {
      row = 3;
      col = health >= 25 ? 0 : 1;
    }
  } else {
    if (health >= 85) {
      row = 0;
      col = lookIdx;
    } else if (health >= 65) {
      row = 0;
      col = 3 + lookIdx;
    } else if (health >= 45) {
      row = 1;
      col = lookIdx;
    } else if (health >= 25) {
      row = 1;
      col = 3 + lookIdx;
    } else {
      row = 2;
      col = lookIdx;
    }
  }

  return {
    sx: col * cw + 2,
    sy: row * ch + 2,
    sw: cw - 4,
    sh: ch - 4,
  };
}

export function drawDoomSheetFace(
  ctx: CanvasRenderingContext2D,
  sheet: HTMLCanvasElement,
  mood: DoomFaceMood,
  health: number,
  lookDir: number,
  dx: number,
  dy: number,
  dw: number,
  dh: number
) {
  const { sx, sy, sw, sh } = getDoomFaceCropRect(
    mood,
    health,
    lookDir,
    sheet.width,
    sheet.height
  );
  ctx.drawImage(sheet, sx, sy, sw, sh, dx, dy, dw, dh);
}

function makePixelCanvas(
  w: number,
  h: number
): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  return [c, ctx];
}

function toNearestTexture(
  canvas: HTMLCanvasElement,
  repeatX = 1,
  repeatY = 1
): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  if (repeatX !== 1 || repeatY !== 1) {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeatX, repeatY);
  }
  tex.needsUpdate = true;
  return tex;
}

export function createDungeonWallTextures(): {
  stoneWall: THREE.CanvasTexture;
  techWall: THREE.CanvasTexture;
  pillarWall: THREE.CanvasTexture;
  queenWall: THREE.CanvasTexture;
  floorTex: THREE.CanvasTexture;
  ceilTex: THREE.CanvasTexture;
} {
  // 1. Detailed Doom Fortress Stone Masonry Wall (64x64)
  const [sw, sctx] = makePixelCanvas(64, 64);
  sctx.fillStyle = '#2d2824';
  sctx.fillRect(0, 0, 64, 64);
  const brickColors = ['#4f4841', '#5c544c', '#453e38', '#675e55', '#534c45'];
  for (let row = 0; row < 8; row++) {
    const y = row * 8;
    const offset = row % 2 === 0 ? 0 : 10;
    for (let col = -1; col < 5; col++) {
      const x = col * 20 + offset;
      sctx.fillStyle = brickColors[(row * 3 + col + 8) % brickColors.length];
      sctx.fillRect(x + 1, y + 1, 18, 6);
      sctx.fillStyle = '#7b7166';
      sctx.fillRect(x + 1, y + 1, 18, 1);
      sctx.fillStyle = '#211d1a';
      sctx.fillRect(x, y + 7, 20, 1);
    }
  }
  sctx.fillStyle = '#1e293b';
  sctx.fillRect(0, 0, 64, 4);
  sctx.fillRect(0, 58, 64, 6);
  sctx.fillStyle = '#64748b';
  sctx.fillRect(0, 1, 64, 1);
  sctx.fillRect(0, 59, 64, 1);
  sctx.fillStyle = '#15803d';
  sctx.fillRect(10, 12, 3, 18);
  sctx.fillRect(46, 26, 4, 22);
  sctx.fillStyle = '#4ade80';
  sctx.fillRect(11, 16, 1, 9);
  sctx.fillRect(47, 30, 2, 10);

  // 2. Bio-Tech Industrial Panel Wall with Emerald Conduits & Hazard Stripes (64x64)
  const [tw, tctx] = makePixelCanvas(64, 64);
  tctx.fillStyle = '#333842';
  tctx.fillRect(0, 0, 64, 64);
  tctx.fillStyle = '#4d5360';
  tctx.fillRect(3, 3, 58, 50);
  tctx.fillStyle = '#22262d';
  tctx.fillRect(31, 3, 2, 50);
  tctx.fillRect(3, 27, 58, 2);
  tctx.fillStyle = '#94a3b8';
  [6, 27, 36, 56].forEach((rx) => {
    tctx.fillRect(rx, 6, 2, 2);
    tctx.fillRect(rx, 48, 2, 2);
  });
  tctx.fillStyle = '#064e3b';
  tctx.fillRect(12, 10, 12, 36);
  tctx.fillRect(40, 10, 12, 36);
  tctx.fillStyle = '#22c55e';
  tctx.fillRect(14, 12, 8, 32);
  tctx.fillRect(42, 12, 8, 32);
  tctx.fillStyle = '#bbf7d0';
  tctx.fillRect(17, 14, 2, 28);
  tctx.fillRect(45, 14, 2, 28);
  for (let hx = 0; hx < 64; hx += 8) {
    tctx.fillStyle = (hx / 8) % 2 === 0 ? '#eab308' : '#111827';
    tctx.fillRect(hx, 55, 8, 9);
  }

  // 3. Carved Bio-Pillar Wall (64x64)
  const [pw, pctx] = makePixelCanvas(64, 64);
  pctx.fillStyle = '#2a2420';
  pctx.fillRect(0, 0, 64, 64);
  pctx.fillStyle = '#443b35';
  pctx.fillRect(6, 4, 52, 56);
  pctx.fillStyle = '#1f2937';
  pctx.fillRect(14, 12, 36, 40);
  pctx.fillStyle = '#4ade80';
  for (let i = 0; i < 6; i++) {
    pctx.fillRect(22 + (i % 2) * 14, 15 + i * 6, 6, 4);
  }

  // 4. Queen of the Cells Throne Hall Wall (64x64)
  const [qw, qctx] = makePixelCanvas(64, 64);
  qctx.fillStyle = '#240714';
  qctx.fillRect(0, 0, 64, 64);
  qctx.fillStyle = '#4f0f2b';
  qctx.fillRect(3, 3, 58, 25);
  qctx.fillRect(3, 34, 58, 25);
  qctx.fillStyle = '#be185d';
  qctx.fillRect(8, 8, 48, 6);
  qctx.fillRect(8, 40, 48, 6);
  qctx.fillStyle = '#facc15';
  qctx.fillRect(26, 20, 12, 6);
  qctx.fillRect(26, 16, 3, 4);
  qctx.fillRect(31, 14, 3, 6);
  qctx.fillRect(35, 16, 3, 4);
  qctx.fillRect(0, 60, 64, 4);

  // 5. Cellular Dungeon Floor (64x64)
  const [fl, fctx] = makePixelCanvas(64, 64);
  fctx.fillStyle = '#231b16';
  fctx.fillRect(0, 0, 64, 64);
  for (let y = 0; y < 64; y += 8) {
    for (let x = 0; x < 64; x += 8) {
      fctx.fillStyle = (x + y) % 16 === 0 ? '#31261f' : '#2a201a';
      fctx.fillRect(x + 1, y + 1, 6, 6);
      if ((x * y) % 24 === 0) {
        fctx.fillStyle = '#14532d';
        fctx.fillRect(x + 2, y + 2, 3, 3);
      }
    }
  }

  // 6. Ceiling Tech Grate (64x64)
  const [cl, cctx] = makePixelCanvas(64, 64);
  cctx.fillStyle = '#14171f';
  cctx.fillRect(0, 0, 64, 64);
  cctx.fillStyle = '#232836';
  cctx.fillRect(2, 2, 28, 28);
  cctx.fillRect(34, 34, 28, 28);
  cctx.fillStyle = '#090d14';
  cctx.fillRect(8, 8, 16, 16);
  cctx.fillRect(40, 40, 16, 16);
  cctx.fillStyle = '#15803d';
  cctx.fillRect(30, 0, 4, 64);

  return {
    stoneWall: toNearestTexture(sw),
    techWall: toNearestTexture(tw),
    pillarWall: toNearestTexture(pw),
    queenWall: toNearestTexture(qw),
    floorTex: toNearestTexture(fl, 30, 30),
    ceilTex: toNearestTexture(cl, 30, 30),
  };
}

export function createEntitySpriteTextures(): {
  bacteriaGreen: THREE.CanvasTexture;
  bacteriaRed: THREE.CanvasTexture;
  bacteriaPurple: THREE.CanvasTexture;
  bacteriaAmber: THREE.CanvasTexture;
  protein: THREE.CanvasTexture;
  cell: THREE.CanvasTexture;
  queen: THREE.CanvasTexture;
  energyOrb: THREE.CanvasTexture;
  shellBox: THREE.CanvasTexture;
} {
  // 1A. BACTERIA TYPE 1: Emerald Toxic Bacillus
  const [b1, ctx1] = makePixelCanvas(48, 48);
  ctx1.fillStyle = '#166534';
  ctx1.fillRect(2, 26, 8, 3);
  ctx1.fillRect(0, 30, 6, 3);
  ctx1.fillRect(38, 26, 8, 3);
  ctx1.fillRect(42, 30, 6, 3);
  ctx1.fillRect(18, 40, 3, 6);
  ctx1.fillRect(27, 40, 3, 6);
  ctx1.fillStyle = '#14532d';
  ctx1.fillRect(10, 6, 28, 34);
  ctx1.fillRect(7, 10, 34, 26);
  ctx1.fillStyle = '#16a34a';
  ctx1.fillRect(12, 8, 24, 30);
  ctx1.fillStyle = '#4ade80';
  ctx1.fillRect(14, 10, 8, 24);
  ctx1.fillStyle = '#bbf7d0';
  ctx1.fillRect(15, 29, 4, 4);
  ctx1.fillRect(29, 28, 4, 4);
  ctx1.fillStyle = '#dc2626';
  ctx1.fillRect(14, 15, 7, 5);
  ctx1.fillRect(27, 15, 7, 5);
  ctx1.fillStyle = '#fef08a';
  ctx1.fillRect(16, 16, 3, 3);
  ctx1.fillRect(29, 16, 3, 3);
  ctx1.fillStyle = '#052e16';
  ctx1.fillRect(14, 24, 20, 6);
  ctx1.fillStyle = '#ffffff';
  [15, 20, 26, 31].forEach((fx) => ctx1.fillRect(fx, 24, 2, 3));

  // 1B. BACTERIA TYPE 2: Crimson Streptococcus Chain
  const [b2, ctx2] = makePixelCanvas(48, 48);
  const drawCoccus = (cx: number, cy: number, r: number) => {
    ctx2.fillStyle = '#7f1d1d';
    ctx2.fillRect(cx - r, cy - r + 2, r * 2, r * 2 - 4);
    ctx2.fillRect(cx - r + 2, cy - r, r * 2 - 4, r * 2);
    ctx2.fillStyle = '#dc2626';
    ctx2.fillRect(cx - r + 2, cy - r + 2, r * 2 - 4, r * 2 - 4);
    ctx2.fillStyle = '#f87171';
    ctx2.fillRect(cx - r + 4, cy - r + 3, 5, 5);
  };
  drawCoccus(13, 28, 9);
  drawCoccus(35, 28, 9);
  drawCoccus(24, 18, 12);
  ctx2.fillStyle = '#fca5a5';
  ctx2.fillRect(23, 2, 2, 5);
  ctx2.fillRect(8, 14, 4, 2);
  ctx2.fillRect(36, 14, 4, 2);
  ctx2.fillStyle = '#fef08a';
  ctx2.fillRect(18, 15, 4, 4);
  ctx2.fillRect(26, 15, 4, 4);
  ctx2.fillStyle = '#09090b';
  ctx2.fillRect(19, 16, 2, 2);
  ctx2.fillRect(27, 16, 2, 2);
  ctx2.fillStyle = '#450a0a';
  ctx2.fillRect(18, 22, 12, 4);
  ctx2.fillStyle = '#ffffff';
  ctx2.fillRect(19, 22, 2, 2);
  ctx2.fillRect(23, 22, 2, 2);
  ctx2.fillRect(27, 22, 2, 2);

  // 1C. BACTERIA TYPE 3: Violet Spirillum Corkscrew
  const [b3, ctx3] = makePixelCanvas(48, 48);
  for (let i = 0; i < 6; i++) {
    const sx = 12 + Math.round(Math.sin(i * 1.15) * 9);
    const sy = 6 + i * 6;
    ctx3.fillStyle = '#581c87';
    ctx3.fillRect(sx, sy, 22, 8);
    ctx3.fillStyle = '#9333ea';
    ctx3.fillRect(sx + 2, sy + 1, 18, 6);
    ctx3.fillStyle = '#d8b4fe';
    ctx3.fillRect(sx + 4, sy + 2, 5, 3);
  }
  ctx3.fillStyle = '#f0abfc';
  ctx3.fillRect(4, 12, 7, 2);
  ctx3.fillRect(37, 24, 7, 2);
  ctx3.fillRect(6, 36, 7, 2);
  ctx3.fillStyle = '#facc15';
  ctx3.fillRect(17, 12, 5, 4);
  ctx3.fillRect(27, 12, 5, 4);
  ctx3.fillStyle = '#dc2626';
  ctx3.fillRect(19, 13, 2, 2);
  ctx3.fillRect(28, 13, 2, 2);

  // 1D. BACTERIA TYPE 4: Amber Armored Staph Cluster
  const [b4, ctx4] = makePixelCanvas(48, 48);
  ctx4.fillStyle = '#78350f';
  ctx4.fillRect(8, 8, 32, 32);
  ctx4.fillStyle = '#d97706';
  ctx4.fillRect(6, 12, 36, 24);
  ctx4.fillRect(12, 6, 24, 36);
  ctx4.fillStyle = '#f59e0b';
  ctx4.fillRect(10, 10, 28, 28);
  ctx4.fillStyle = '#fde047';
  ctx4.fillRect(12, 11, 10, 8);
  ctx4.fillRect(26, 11, 10, 8);
  ctx4.fillRect(12, 29, 24, 6);
  ctx4.fillStyle = '#06b6d4';
  ctx4.fillRect(15, 20, 6, 4);
  ctx4.fillRect(27, 20, 6, 4);
  ctx4.fillStyle = '#ffffff';
  ctx4.fillRect(17, 21, 2, 2);
  ctx4.fillRect(29, 21, 2, 2);

  // 2. Rogue Misfolded Protein Beast
  const [pc, pctx] = makePixelCanvas(48, 48);
  pctx.fillStyle = '#7f1d1d';
  pctx.fillRect(10, 8, 28, 31);
  pctx.fillStyle = '#ea580c';
  pctx.fillRect(6, 14, 36, 18);
  pctx.fillRect(14, 6, 20, 35);
  pctx.fillStyle = '#a855f7';
  pctx.fillRect(4, 10, 8, 6);
  pctx.fillRect(36, 10, 8, 6);
  pctx.fillRect(12, 34, 7, 10);
  pctx.fillRect(29, 34, 7, 10);
  pctx.fillStyle = '#fef08a';
  pctx.fillRect(15, 16, 6, 6);
  pctx.fillRect(27, 16, 6, 6);
  pctx.fillStyle = '#dc2626';
  pctx.fillRect(17, 18, 3, 3);
  pctx.fillRect(28, 18, 3, 3);
  pctx.fillStyle = '#1e1b4b';
  pctx.fillRect(16, 27, 16, 4);

  // 3. Guard Hostile Cell Sentinel
  const [cc, cctx] = makePixelCanvas(48, 48);
  cctx.fillStyle = '#0c4a6e';
  cctx.fillRect(8, 8, 32, 32);
  cctx.fillStyle = '#0284c7';
  cctx.fillRect(5, 13, 38, 22);
  cctx.fillRect(13, 5, 22, 38);
  cctx.fillStyle = '#38bdf8';
  cctx.fillRect(10, 10, 28, 28);
  cctx.fillStyle = '#f59e0b';
  cctx.fillRect(16, 16, 16, 16);
  cctx.fillStyle = '#dc2626';
  cctx.fillRect(21, 21, 6, 6);
  cctx.fillStyle = '#bae6fd';
  cctx.fillRect(22, 1, 4, 5);
  cctx.fillRect(22, 42, 4, 5);
  cctx.fillRect(1, 22, 5, 4);
  cctx.fillRect(42, 22, 5, 4);

  // 4. BOSS: QUEEN OF THE CELLS (with towering clutching claws & crown!)
  const [qc, qctx] = makePixelCanvas(64, 64);
  qctx.fillStyle = '#facc15';
  qctx.fillRect(18, 2, 5, 9);
  qctx.fillRect(29, 0, 6, 11);
  qctx.fillRect(41, 2, 5, 9);
  qctx.fillRect(16, 9, 32, 5);
  qctx.fillStyle = '#fb7185';
  qctx.fillRect(19, 10, 4, 3);
  qctx.fillStyle = '#6ee7b7';
  qctx.fillRect(25, 10, 4, 3);
  qctx.fillStyle = '#f97316';
  qctx.fillRect(30, 3, 4, 4);
  qctx.fillStyle = '#ec4899';
  qctx.fillRect(35, 10, 4, 3);
  qctx.fillStyle = '#2dd4bf';
  qctx.fillRect(41, 10, 4, 3);
  qctx.fillStyle = '#500724';
  qctx.fillRect(11, 14, 42, 42);
  qctx.fillRect(7, 21, 50, 28);
  qctx.fillStyle = '#9d174d';
  qctx.fillRect(14, 17, 36, 36);
  qctx.fillStyle = '#ec4899';
  qctx.fillRect(17, 20, 30, 28);
  // Clutching Queen Hands/Claws extending forward
  qctx.fillStyle = '#f43f5e';
  qctx.fillRect(0, 23, 8, 18);
  qctx.fillRect(56, 23, 8, 18);
  qctx.fillStyle = '#fef08a';
  qctx.fillRect(0, 39, 3, 6);
  qctx.fillRect(5, 39, 3, 6);
  qctx.fillRect(56, 39, 3, 6);
  qctx.fillRect(61, 39, 3, 6);
  // Fierce Glowing Eyes & Fangs
  qctx.fillStyle = '#fef08a';
  qctx.fillRect(20, 25, 8, 6);
  qctx.fillRect(36, 25, 8, 6);
  qctx.fillStyle = '#dc2626';
  qctx.fillRect(23, 27, 4, 4);
  qctx.fillRect(37, 27, 4, 4);
  qctx.fillStyle = '#1f0714';
  qctx.fillRect(22, 37, 20, 8);
  qctx.fillStyle = '#ffffff';
  qctx.fillRect(24, 37, 3, 4);
  qctx.fillRect(31, 37, 3, 4);
  qctx.fillRect(38, 37, 3, 4);
  qctx.fillStyle = '#be185d';
  qctx.fillRect(14, 55, 5, 8);
  qctx.fillRect(25, 55, 5, 9);
  qctx.fillRect(35, 55, 5, 9);
  qctx.fillRect(45, 55, 5, 8);

  // 5. ATP Energy Pickup
  const [ec, ectx] = makePixelCanvas(24, 24);
  ectx.fillStyle = '#065f46';
  ectx.fillRect(6, 4, 12, 16);
  ectx.fillStyle = '#4ade80';
  ectx.fillRect(8, 6, 8, 12);
  ectx.fillStyle = '#ecfdf5';
  ectx.fillRect(11, 7, 3, 4);
  ectx.fillRect(9, 11, 6, 2);
  ectx.fillRect(10, 13, 3, 4);

  // 6. DOOM Shotgun Shells Box Pickup (24x24 — red/brass shells ammo!)
  const [sc, sctx] = makePixelCanvas(24, 24);
  sctx.fillStyle = '#450a0a';
  sctx.fillRect(3, 7, 18, 13);
  sctx.fillStyle = '#991b1b';
  sctx.fillRect(4, 8, 16, 11);
  // 4 Upright Red & Gold Brass Shotgun Shells
  [5, 9, 13, 17].forEach((sx) => {
    sctx.fillStyle = '#dc2626';
    sctx.fillRect(sx, 5, 3, 9);
    sctx.fillStyle = '#facc15';
    sctx.fillRect(sx, 12, 3, 4);
  });
  sctx.fillStyle = '#fde047';
  sctx.fillRect(6, 17, 12, 2);

  return {
    bacteriaGreen: toNearestTexture(b1),
    bacteriaRed: toNearestTexture(b2),
    bacteriaPurple: toNearestTexture(b3),
    bacteriaAmber: toNearestTexture(b4),
    protein: toNearestTexture(pc),
    cell: toNearestTexture(cc),
    queen: toNearestTexture(qc),
    energyOrb: toNearestTexture(ec),
    shellBox: toNearestTexture(sc),
  };
}

/**
 * Renders the detailed DOOM combat shotgun (220x140 virtual pixel grid)
 * including full animated reload cycle (`reloadPhase`: 0..1).
 */
export function drawFirstPersonShotgun(
  canvas: HTMLCanvasElement,
  bobX: number,
  bobY: number,
  recoil: number,
  locked = false,
  reloadPhase = 0
) {
  const w = canvas.width;
  const h = canvas.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, w, h);

  const sx = w / 220;
  const sy = h / 140;
  const isReloading = reloadPhase > 0;
  const reloadDrop = isReloading ? Math.sin(reloadPhase * Math.PI) * 28 : 0;
  const reloadSide = isReloading ? Math.sin(reloadPhase * Math.PI) * -14 : 0;
  const dropOffset = (locked ? 14 : 0) + reloadDrop;

  const px = (x: number, y: number, pw: number, ph: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(
      Math.round((x + bobX + reloadSide) * sx),
      Math.round((y + bobY + recoil * 18 + dropOffset) * sy),
      Math.max(1, Math.round(pw * sx)),
      Math.max(1, Math.round(ph * sy))
    );
  };

  if (recoil > 0.5 && !locked && !isReloading) {
    px(86, 16, 48, 36, '#f97316');
    px(94, 22, 32, 26, '#fef08a');
    px(101, 10, 18, 42, '#ffffff');
    px(78, 26, 12, 10, '#4ade80');
    px(130, 26, 12, 10, '#4ade80');

    const shellX = 128 + (1 - recoil) * 60;
    const shellY = 74 - Math.sin((1 - recoil) * Math.PI) * 28;
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(Math.round(shellX * sx), Math.round(shellY * sy), Math.round(9 * sx), Math.round(5 * sy));
    ctx.fillStyle = '#facc15';
    ctx.fillRect(Math.round((shellX + 7) * sx), Math.round(shellY * sy), Math.round(3 * sx), Math.round(5 * sy));
  }

  px(97, 46, 26, 48, '#0f172a');
  px(98, 47, 10, 46, '#334155');
  px(100, 47, 3, 45, '#94a3b8');
  px(104, 47, 2, 45, '#cbd5e1');
  px(112, 47, 10, 46, '#334155');
  px(114, 47, 3, 45, '#94a3b8');
  px(118, 47, 2, 45, '#64748b');

  px(107, 44, 6, 48, '#1e293b');
  px(109, 43, 2, 3, locked ? '#ef4444' : '#facc15');
  for (let vent = 52; vent < 84; vent += 6) {
    px(108, vent, 4, 3, locked ? '#7f1d1d' : '#22c55e');
    px(109, vent + 1, 2, 1, locked ? '#fca5a5' : '#bbf7d0');
  }

  px(96, 62, 28, 7, '#475569');
  px(97, 63, 26, 2, '#94a3b8');
  px(99, 66, 3, 2, '#090d14');
  px(105, 66, 3, 2, '#090d14');
  px(112, 66, 3, 2, '#090d14');
  px(118, 66, 3, 2, '#090d14');

  px(92, 86, 36, 32, '#0f172a');
  px(94, 88, 32, 28, '#1e293b');
  px(95, 89, 30, 3, '#64748b');
  px(119, 94, 6, 9, '#92400e');
  px(120, 95, 4, 7, isReloading ? '#dc2626' : '#facc15');

  px(89, 98, 42, 22, '#451a03');
  px(91, 100, 38, 18, '#78350f');
  for (let r = 102; r < 116; r += 4) {
    px(91, r, 38, 2, '#92400e');
    px(92, r + 2, 36, 1, '#451a03');
  }

  px(82, 114, 56, 26, '#9a5f3b');
  px(86, 115, 22, 25, '#c68860');
  px(112, 115, 22, 25, '#b4744c');
  px(89, 117, 4, 4, '#d6976c');
  px(95, 117, 4, 4, '#d6976c');
  px(101, 117, 4, 4, '#d6976c');
  px(80, 128, 60, 12, '#0f172a');
  px(82, 129, 56, 3, '#334155');

  // Animated Left Hand Feeding Red & Brass Shotgun Shell During 'R' Reload!
  if (isReloading) {
    const shellSlide = Math.sin(reloadPhase * Math.PI * 2);
    const sxPos = Math.round(134 - Math.max(0, shellSlide) * 26);
    const syPos = Math.round(112 - Math.abs(shellSlide) * 22);
    ctx.fillStyle = '#c68860';
    ctx.fillRect(Math.round((sxPos + 4) * sx), Math.round((syPos + 4) * sy), Math.round(24 * sx), Math.round(22 * sy));
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(Math.round(sxPos * sx), Math.round(syPos * sy), Math.round(7 * sx), Math.round(13 * sy));
    ctx.fillStyle = '#facc15';
    ctx.fillRect(Math.round(sxPos * sx), Math.round((syPos + 10) * sy), Math.round(7 * sx), Math.round(5 * sy));
  }
}

/**
 * Renders a high-detail pixelated DOOM Bio-Combat Tactical Knife viewmodel (220x140 grid)
 * with clip-point bevel, etched bio-plasma circuits, serrated dorsal teeth,
 * engraved crossguard, paracord grip wrap, digital wrist cuff, and throw/recall pose.
 */
export function drawFirstPersonKnife(
  canvas: HTMLCanvasElement,
  bobX: number,
  bobY: number,
  swing: number,
  isThrown = false
) {
  const w = canvas.width;
  const h = canvas.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, w, h);

  const sx = w / 220;
  const sy = h / 140;

  // Smooth windup -> fast diagonal cleave -> eased return curve (swing decays 1 -> 0)
  const isSwinging = !isThrown && swing > 0.01;
  const p = isSwinging ? Math.max(0, Math.min(1, 1 - swing)) : 0;
  const smooth = (t: number) => t * t * (3 - 2 * t);

  let lungeX = 0;
  let lungeY = 0;
  let tiltRad = -0.2;

  if (isThrown) {
    lungeX = -28;
    lungeY = 26;
    tiltRad = -0.68;
  } else if (isSwinging) {
    if (p < 0.18) {
      const k = smooth(p / 0.18);
      lungeX = k * 22;
      lungeY = -k * 10;
      tiltRad = -0.2 + k * 0.44;
    } else if (p < 0.56) {
      const k = smooth((p - 0.18) / 0.38);
      lungeX = 22 - k * 112;
      lungeY = -10 - Math.sin(k * Math.PI) * 20 + k * 26;
      tiltRad = 0.24 - k * 1.48;
    } else {
      const k = smooth((p - 0.56) / 0.44);
      lungeX = -90 + k * 90;
      lungeY = 16 - k * 16;
      tiltRad = -1.24 + k * 1.04;
    }
  }

  // Smooth glowing emerald-steel slash ribbon across the canvas during cleave
  if (isSwinging && p >= 0.14 && p <= 0.68) {
    const slashAlpha = Math.sin(((p - 0.14) / 0.54) * Math.PI);
    ctx.save();
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = Math.max(3, Math.round(6 * sx));
    ctx.globalAlpha = Math.min(0.95, slashAlpha * 0.9);
    ctx.beginPath();
    ctx.moveTo(Math.round(176 * sx), Math.round(24 * sy));
    ctx.quadraticCurveTo(
      Math.round(108 * sx),
      Math.round(46 * sy),
      Math.round(42 * sx),
      Math.round(94 * sy)
    );
    ctx.stroke();

    ctx.strokeStyle = '#ecfdf5';
    ctx.lineWidth = Math.max(1.5, Math.round(2.5 * sx));
    ctx.globalAlpha = Math.min(1, slashAlpha);
    ctx.beginPath();
    ctx.moveTo(Math.round(170 * sx), Math.round(28 * sy));
    ctx.quadraticCurveTo(
      Math.round(108 * sx),
      Math.round(48 * sy),
      Math.round(48 * sx),
      Math.round(90 * sy)
    );
    ctx.stroke();
    ctx.restore();
  }

  ctx.save();
  const pivotX = (148 + bobX + lungeX) * sx;
  const pivotY = (118 + bobY + lungeY) * sy;
  ctx.translate(pivotX, pivotY);
  ctx.rotate(tiltRad);

  const px = (x: number, y: number, pw: number, ph: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(
      Math.round(x * sx),
      Math.round(y * sy),
      Math.max(1, Math.round(pw * sx)),
      Math.max(1, Math.round(ph * sy))
    );
  };

  if (!isThrown) {
    // Crisp Dark Tactical Outline around Bowie Blade
    px(-9, -86, 19, 63, '#05080d');
    px(-6, -93, 9, 9, '#05080d');
    px(-4, -99, 5, 8, '#05080d');

    // Heavy Hollow-Grind Steel Body & Satin Spine
    px(-7, -84, 15, 60, '#1e293b');
    px(-6, -83, 12, 59, '#475569');
    px(-5, -82, 8, 57, '#94a3b8');

    // Clip-Point False Edge & Needle Tip
    px(-6, -91, 7, 10, '#cbd5e1');
    px(-5, -94, 4, 7, '#e2e8f0');
    px(-3, -98, 2, 6, '#ffffff');
    px(1, -88, 3, 10, '#64748b');

    // Razor Keen Cutting Edge Bevel (left edge gleam + stepped glint)
    px(-7, -82, 3, 56, '#cbd5e1');
    px(-7, -80, 2, 52, '#f8fafc');
    px(-7, -75, 1, 20, '#ffffff');

    // Etched Bio-Plasma Energy Conduit + Glowing Micro-Nodes along Ricasso
    px(-5, -76, 2, 48, '#15803d');
    px(-4, -74, 1, 44, '#4ade80');
    px(-3, -64, 1, 18, '#bbf7d0');
    px(-4, -36, 3, 3, '#22d3ee');
    px(-3, -35, 1, 1, '#ecfeff');
    px(-2, -46, 2, 2, '#4ade80');
    px(-2, -58, 2, 2, '#4ade80');

    // Machined Deep Fuller (Blood Groove) + Damascus Step Pattern
    px(0, -76, 3, 44, '#0f172a');
    px(1, -74, 1, 40, '#334155');
    for (let dy = -72; dy <= -32; dy += 8) {
      px(-2, dy, 2, 1, '#64748b');
      px(3, dy + 3, 2, 1, '#64748b');
    }

    // Serrated Dorsal Saw-Back Teeth
    for (let t = -74; t <= -34; t += 5) {
      px(7, t, 3, 3, '#475569');
      px(8, t, 2, 2, '#94a3b8');
      px(9, t, 1, 1, '#f8fafc');
    }

    // Hexagonal Titanium Bolster & Engraved Brass Double-Lug Crossguard
    px(-15, -26, 30, 7, '#090d14');
    px(-14, -25, 28, 5, '#b45309');
    px(-13, -24, 26, 3, '#eab308');
    px(-10, -24, 20, 1, '#fef08a');
    // Guard indicator gem
    px(-2, -25, 4, 4, '#052e16');
    px(-1, -24, 2, 2, '#4ade80');

    // Ergonomic Knurled Paracord Grip Wrap + Brass Rivets
    px(-6, -19, 12, 23, '#05080d');
    for (let g = -18; g < 3; g += 4) {
      px(-5, g, 10, 3, '#1e293b');
      px(-4, g, 8, 2, '#334155');
      px(-3, g + 1, 6, 1, '#64748b');
      // Paracord diagonal weave highlight
      px(g % 8 === 0 ? -3 : 1, g, 2, 2, '#15803d');
    }
    // Brass Handle Pin Rivets
    px(-1, -13, 2, 2, '#facc15');
    px(-1, -5, 2, 2, '#facc15');

    // Weighted Spiked Skull-Crusher Pommel
    px(-7, 4, 14, 6, '#090d14');
    px(-6, 5, 12, 4, '#64748b');
    px(-4, 5, 8, 2, '#cbd5e1');
    px(-2, 9, 4, 3, '#94a3b8');
    px(-1, 11, 2, 2, '#f8fafc');
  } else {
    // While knife is mid-flight, render pulsing cyan-green bio-tether recall beam on open palm!
    const pulse = 0.55 + 0.45 * Math.sin(performance.now() * 0.02);
    ctx.save();
    ctx.globalAlpha = pulse;
    px(-4, -54, 8, 42, '#065f46');
    px(-2, -52, 4, 38, '#22d3ee');
    px(-1, -48, 2, 30, '#ecfeff');
    px(-8, -22, 16, 4, '#4ade80');
    ctx.restore();
  }

  // Detailed Armored Player Fist, Knuckle Plates & Digital Bio-Wrist Cuff
  px(-11, -17, 24, 22, '#090d14');
  px(-10, -16, 22, 20, '#9a5f3b');
  px(-9, -15, 18, 16, '#c68860');
  // Wrapped Armored Finger Knuckles
  for (let k = 0; k < 4; k++) {
    const ky = -15 + k * 5;
    px(-11, ky, 7, 4, '#334155');
    px(-10, ky + 1, 5, 2, '#d6976c');
  }
  // Thumb bracing crossguard / open palm
  px(4, -20, 8, 8, '#c68860');
  px(6, -19, 4, 4, '#e2a882');

  // Tactical Bio-Suit Forearm & Glowing LED Wrist Gauge
  px(-12, 2, 26, 20, '#090d14');
  px(-11, 3, 24, 18, '#1e293b');
  px(-9, 4, 20, 4, '#334155');
  px(-8, 8, 16, 7, '#064e3b');
  px(-6, 10, 12, 3, isThrown ? '#22d3ee' : '#4ade80');
  px(-4, 11, 4, 1, '#ecfdf5');
  px(3, 11, 2, 1, isThrown ? '#facc15' : '#bbf7d0');

  ctx.restore();
}

