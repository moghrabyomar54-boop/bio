// Shared Harsh 2D Pixel-Art Sprites & Detailed Facial Portrait Renderer
// Tall realistic RPG proportions, dark ink outlines, multi-tone skin & leather shading,
// and chiseled facial anatomy (zero cute/chibi proportions).

export type HeroMood = 'stern' | 'shock' | 'pain' | 'grit';

// String-grid painter helper for crisp nearest-neighbor pixel art
function paintPixelGrid(
  ctx: CanvasRenderingContext2D,
  grid: string[],
  palette: Record<string, string>,
  originX: number,
  originY: number,
  scale: number,
  flipX = false
) {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  for (let r = 0; r < rows; r++) {
    const rowStr = grid[r];
    for (let c = 0; c < cols; c++) {
      const ch = rowStr[c];
      if (ch === '.' || ch === ' ') continue;
      const color = palette[ch];
      if (!color) continue;
      const pxCol = flipX ? cols - 1 - c : c;
      ctx.fillStyle = color;
      ctx.fillRect(
        Math.round(originX + pxCol * scale),
        Math.round(originY + r * scale),
        Math.ceil(scale),
        Math.ceil(scale)
      );
    }
  }
}

// 32x32 Detailed Pixel Face & Shoulder Portrait (shows intense facial structure!)
const PORTRAIT_BASE_GRID: string[] = [
  '................................',
  '...........oooooooooo...........',
  '.........oohhhhhbbhhhoo.........',
  '........ohhbbbbbbbbbhhho........',
  '.......ohhhbbbbddddbbbbho.......',
  '......ohhhbbddddddddddbbho......',
  '......ohhbbdddsssssddddbbo......',
  '.....oohbbddssMMMMMssddbbbo.....',
  '.....oobbbdsMMLLLLLMMsdbddo.....',
  '.....oobbbdsMLLLLLLMMsdbddo.....',
  '.....oobddsMLKKKKKKMLssbddo.....',
  '.....oobdsMMKLLSSLLKMssddoo.....',
  '......oodsMKKLEWWELKMmsdo.......',
  '......omdsMMLLEGGELSMmsdo.......',
  '......omdsMMUUUSSSUUMmsdo.......',
  '......o.dsMMLLSSSLLMMmsdo.......',
  '........osMMLSmmmsSLMmsdo.......',
  '........osMMLsmmmssLMmsdo.......',
  '.........omMLsmQQmsLmmso........',
  '.........ommMssmmssMmmo.........',
  '..........ommmssssmmmo..........',
  '..........oommmmmmmmoo..........',
  '.........oooorrrrrroooo.........',
  '.......ooottttrrrrmmmoooo.......',
  '.....ooottttttrrrgggggtttoo.....',
  '....ooottttrrrrggggggggggtoo....',
  '...ooottttrrrggggGGGGgggggtoo...',
  '...oottttrrrgggGGGGGGGGgggtoo...',
  '..oottttrrrgggggGGGGGGgggggtoo..',
  '..oottttrrrggggggggggggggggtoo..',
  '..ootttrrrrgggggddgggggggggtoo..',
  '..oooooooooooooooooooooooooooo..',
];

export function drawHarshFacePortrait(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  mood: HeroMood = 'stern',
  suitRed = false
) {
  const palette: Record<string, string> = {
    o: '#110b09', // Harsh dark ink outline
    h: '#5d3b23', // Hair highlight
    b: '#3d2515', // Hair mid
    d: '#24150c', // Hair deep shadow
    L: '#f2c3a4', // Skin bright highlight (forehead / nose ridge / cheekbone)
    M: '#df9f7d', // Skin base midtone
    s: '#c37f5e', // Cheek / brow / nostril shadow
    m: '#96583e', // Deep jaw / chin / neck crease shadow
    K: '#2a180d', // Heavy furrowed eyebrow
    E: '#150d09', // Dark lash / eye socket line
    W: '#eef2f6', // Eye sclera catchlight
    G: suitRed ? '#dc2626' : '#4f7328', // Tunic mid (reused in cloth)
    g: suitRed ? '#991b1b' : '#354f1a', // Tunic shadow
    U: '#83676b', // Weathered under-eye / scar shadow
    S: '#e9b08e', // Nose bridge highlight
    Q: '#6d3626', // Grim mouth line
    r: '#75391e', // Leather baldric highlight
    t: '#4d2210', // Leather baldric shadow
  };

  // Copy grid & apply facial expression tweaks cleanly
  const grid = [...PORTRAIT_BASE_GRID];
  if (mood === 'pain') {
    palette.E = '#120908';
    palette.G = suitRed ? '#ef4444' : '#4b8236';
    grid[12] = '......oodsMKKLEWWELKMmsdo.......';
    grid[18] = '.........omMLsQWWQmsLmmso.......';
    grid[19] = '.........ommMsQQQQsMmmo.........';
  } else if (mood === 'shock') {
    grid[12] = '......oodsMKKWEWWELKMmsdo.......';
    grid[13] = '......omdsMMWWEGGELSMmsdo.......';
    grid[18] = '.........omMLsmQQmsLmmso........';
    grid[19] = '.........ommMsQmmQsMmmo.........';
  } else if (mood === 'grit') {
    // Clenched jaw + determined brow furrow + scar glint
    grid[16] = '........osMMLSmmmsSLMmsdo.......';
    grid[18] = '.........omMLsQWWQmsLmmso.......';
  }

  // Distinct intense emerald eyes inside face (index row 12-13 cols 14,17)
  // Paint base portrait first, then sharpen eye iris pixels explicitly
  paintPixelGrid(ctx, grid, palette, x, y, scale);

  const px = (gx: number, gy: number, w: number, h: number, col: string) => {
    ctx.fillStyle = col;
    ctx.fillRect(
      Math.round(x + gx * scale),
      Math.round(y + gy * scale),
      Math.ceil(w * scale),
      Math.ceil(h * scale)
    );
  };

  // Sharp green iris pixels + brow ridge intensity (matching example sprite eye detail!)
  px(15, 13, 1, 1, '#4c9a3d');
  px(18, 13, 1, 1, '#4c9a3d');
  px(14, 13, 1, 1, '#f8fafc');
  px(17, 13, 1, 1, '#f8fafc');
  // Subtle weathered scar scratch across left cheek
  px(19, 15, 1, 2, '#96583e');
  px(20, 16, 1, 1, '#f2c3a4');
  // Iron buckle glint on leather shoulder strap
  px(8, 26, 2, 2, '#94a3b8');
  px(8, 26, 1, 1, '#e2e8f0');
}

// Tall 22x42 Hero Sprite directly modeled on the user's gritty reference sprite!
// Note: 42px tall anatomical build (small detailed head + wide shoulders + leather strap/belt/bracers + tall boots)
const HERO_UPPER_GRID: string[] = [
  '.......ooooooo........', // 0: Hair top
  '......ohhhbbbbbo......', // 1
  '.....ohbbbbddddbo.....', // 2
  '.....obbbddssssbdo....', // 3: Bangs over brow
  '.....obddsKKLLKdbo....', // 4: Heavy brows
  '.....ooMdsEWGEsMmo....', // 5: Detailed eyes + cheek shadow
  '......oMssLMMmsmo.....', // 6: Nose bridge + cheek
  '......oMMsQmmmsmo.....', // 7: Stern mouth + jaw shadow
  '.......omMMMMmmo......', // 8: Chin + neck
  '......ooorLLmmoo......', // 9: Neck + leather strap start
  '....oooorrgggggooo....', // 10: Broad shoulders + tunic
  '...ooggggrrGGGGGggo...', // 11: Olive tunic + leather baldric
  '..oogggggggrrGGGGggo..', // 12
  '..ooMgggggggrrGGGgMo..', // 13: Muscular arms emerge
  '..oLMgggggggrrGGggMLo.', // 14
  '..oLMggoorrgggggggMLo.', // 15
  '..oMMggottttrrrgggMMo.', // 16: Leather waist belt + pouch
  '..ottgoorrrrtttrrrtto.', // 17: Wrist bracers + belt buckle
  '..ottooltttrrrrrrltto.', // 18
  '..oMMo.ooopppppppoooo.', // 19: Hands + trouser waist
  '..oLmo..opppppppppo...', // 20
];

export function drawHarshHeroSprite(
  ctx: CanvasRenderingContext2D,
  cx: number,
  footY: number,
  scale: number,
  opts: {
    mood?: HeroMood;
    holdingStomach?: boolean;
    hasKnife?: boolean;
    hasGun?: boolean;
    suitRed?: boolean;
    stride?: number;
    bob?: number;
    skipShadow?: boolean;
  }
) {
  const s = scale;
  const stride = opts.stride ?? 0;
  const bob = opts.bob ?? 0;
  const originX = Math.round(cx - 11 * s);
  const originY = Math.round(footY - 40 * s + bob * s);

  const px = (gx: number, gy: number, w: number, h: number, col: string) => {
    ctx.fillStyle = col;
    ctx.fillRect(
      Math.round(originX + gx * s),
      Math.round(originY + gy * s),
      Math.max(1, Math.round(w * s)),
      Math.max(1, Math.round(h * s))
    );
  };

  // Sharp grounded shadow beneath boots
  if (!opts.skipShadow) {
    px(2, 39, 18, 2, '#090b10');
    px(4, 38, 14, 3, '#131720');
  }

  // Trousers & Heavy Cuffed Boots (rows 20..39)
  const stepL = stride > 0.25 ? -1 : stride < -0.25 ? 1 : 0;
  const stepR = -stepL;

  // Left Leg (Mud-brown rugged trousers + thick cuffed russet boot)
  px(7, 20 + stepL, 5, 11, '#110b09'); // outline
  px(8, 20 + stepL, 3, 10, '#543f26'); // brown trouser
  px(8, 20 + stepL, 1, 9, '#6b5233'); // highlight fold
  px(10, 21 + stepL, 1, 8, '#382917'); // inner shadow
  // Left Boot
  px(6, 30 + stepL, 7, 10, '#110b09');
  px(7, 31 + stepL, 5, 2, '#7c391e'); // boot cuff
  px(7, 33 + stepL, 4, 5, '#592410'); // boot shaft
  px(6, 37 + stepL, 6, 2, '#6e321a'); // toe
  px(7, 38 + stepL, 2, 1, '#361408'); // heel notch

  // Right Leg
  px(11, 20 + stepR, 6, 11, '#110b09');
  px(12, 20 + stepR, 4, 10, '#4a3620');
  px(12, 20 + stepR, 2, 9, '#664e30');
  // Right Boot (stepped forward profile with crisp heel!)
  px(11, 30 + stepR, 7, 10, '#110b09');
  px(11, 31 + stepR, 6, 2, '#7c391e'); // cuff
  px(12, 33 + stepR, 4, 5, '#592410');
  px(12, 36 + stepR, 6, 3, '#6e321a'); // extended boot foot
  px(12, 39 + stepR, 2, 1, '#110b09'); // heel gap
  px(15, 39 + stepR, 3, 1, '#110b09');

  // Upper Body + Detailed Face via Sprite Matrix
  const palette: Record<string, string> = {
    o: '#110b09',
    h: '#5c3b23',
    b: '#3e2817',
    d: '#24160c',
    L: '#f2c3a4',
    M: '#df9f7d',
    s: '#c37f5e',
    m: '#96583e',
    K: '#2a180d',
    E: '#eef2f6',
    W: '#3f7a38', // green iris
    G: opts.suitRed ? '#b91c1c' : '#4a6b28', // olive moss tunic highlight
    g: opts.suitRed ? '#7f1d1d' : '#324a19', // tunic shadow
    Q: opts.mood === 'pain' ? '#f8fafc' : '#703828', // clenched teeth / grim mouth
    r: '#75391e', // leather strap highlight
    t: '#4a210f', // leather bracer / belt dark
    l: '#94a3b8', // iron belt buckle
    p: '#543f26', // trouser top
  };

  paintPixelGrid(ctx, HERO_UPPER_GRID, palette, originX, originY, s);

  // Sharpen face pixels (eye brow furrow, pupil/iris, cheek contour)
  px(7, 5, 1, 1, '#eef2f6');
  px(8, 5, 1, 1, '#3f7a38');
  px(10, 5, 1, 1, '#eef2f6');
  px(11, 5, 1, 1, '#3f7a38');
  px(8, 6, 1, 1, '#7e6468'); // subtle weathered under-eye shadow!

  // Override arm pose for hunger/combat weapon
  if (opts.holdingStomach) {
    // Hunched forearms clutching starving stomach
    px(4, 15, 13, 4, '#110b09');
    px(5, 16, 4, 2, '#592410');
    px(9, 16, 4, 2, '#df9f7d');
    px(13, 16, 3, 2, '#592410');
  } else if (opts.hasKnife) {
    // Extended combat knife with glowing green fuller line!
    px(17, 17, 3, 3, '#df9f7d');
    px(19, 16, 2, 4, '#4a210f'); // handle
    px(21, 15, 8, 3, '#110b09'); // blade outline
    px(21, 16, 7, 1, '#e2e8f0'); // steel edge
    px(22, 16, 4, 1, '#4ade80'); // bio-edge conduit
  } else if (opts.hasGun) {
    // Heavy industrial bio-shotgun held two-handed
    px(10, 14, 19, 5, '#110b09');
    px(11, 15, 5, 3, '#6e321a'); // wooden stock
    px(16, 15, 12, 2, '#64748b'); // heavy barrel
    px(17, 15, 11, 1, '#cbd5e1'); // top steel highlight
    px(19, 17, 6, 1, '#4ade80'); // bio-plasma rail
  }
}

// Harsh Jagged Mutant Bacteria (replacing cute jelly squares)
export function drawHarshBacteriaSprite(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  colors: { dark: string; mid: string; hi: string; eye: string },
  phase: number
) {
  const s = scale;
  const bob = Math.round(Math.sin(phase) * 2);
  const ox = Math.round(cx - 8 * s);
  const oy = Math.round(cy - 10 * s + bob);
  const grid = [
    '....oo....oo....',
    '...ohmo..omho...',
    '..ommmooommmmo..',
    '.oommhhhhhhmmoo.',
    'oomdmmmmmmmmmdoo',
    'omddKKmmmmKKddmo',
    'omdKEEKmmKEEKdmo',
    'ommmmmmmmmmmmmmo',
    'oomddoWWWWooddmo',
    '.oomdooooooodmo.',
    '..oommmmmmmmdo..',
    '..oomo.oomo.oo..',
    '..ooo..ooo......',
  ];
  paintPixelGrid(
    ctx,
    grid,
    {
      o: '#090b0e',
      d: colors.dark,
      m: colors.mid,
      h: colors.hi,
      K: '#140808',
      E: colors.eye,
      W: '#f8fafc', // jagged fangs!
    },
    ox,
    oy,
    s
  );
}

// Towering Harsh Pixel Queen of the Cells (biomechanical armored horror with crown & scowl)
export function drawHarshQueenSprite(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  t: number
) {
  const s = scale;
  const floatY = Math.round(Math.sin(t * 2.5) * 3);
  const ox = Math.round(cx - 16 * s);
  const oy = Math.round(cy - 20 * s + floatY);

  const grid = [
    '......oo......oooo......oo......',
    '.....oYYo....oYYYYo....oYYo.....',
    '.....oYyo....oYyyYo....oYyo.....',
    '.....oYYooooooYYYYooooooYYo.....',
    '.....oYYYYYYYYYYYYYYYYYYYYo.....',
    '....oooddddddddddddddddddooo....',
    '...ooddmmmmmmmmmmmmmmmmmmddoo...',
    '..oodmmhhhhhhhhhhhhhhhhhhmmdoo..',
    '..odmhhmmmmmmmmmmmmmmmmmmhhmdo..',
    '.oodmhmmKKKmmmmmmmmmmKKKmmhmdoo.',
    '.odmhmmKEEEKmmmmmmmmKEEEKmmhmdo.',
    '.odmhmmKEEEKmmmmmmmmKEEEKmmhmdo.',
    '.odmhhmmddddmmmmmmmmddddmmhhmdo.',
    '..odmhhmmmmmmddmmddmmmmmmhhmdo..',
    '..oodmmddoooooooooooooooddmmdo..',
    '...oodmdoWWooWWooWWooWWodmdoo...',
    '....oodmoWWWWWWWWWWWWWWomdoo....',
    '.....ooddoooooooooooooooddo.....',
    '....oodmmmmddddddddddmmmmmdo....',
    '...oodmmhhmmmmmmmmmmmmhhmmdoo...',
    '..oodmmddmmmmddddddmmmmddmmdoo..',
    '..oooo..ooddoo....ooddoo..oooo..',
  ];

  paintPixelGrid(
    ctx,
    grid,
    {
      o: '#09050a',
      Y: '#facc15',
      y: '#a16207',
      d: '#4c0519',
      m: '#9d174d',
      h: '#f43f5e',
      K: '#1a0308',
      E: '#fef08a',
      W: '#f8fafc',
    },
    ox,
    oy,
    s
  );
}
