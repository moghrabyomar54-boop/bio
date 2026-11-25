import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { BIO_QUIZ_QUESTIONS, BioQuizQuestion } from '../../data/gameQuiz';
import {
  playBacteriaEatDeathSound,
  playCutsceneBlipSound,
  playEntityKillSound,
  playGrowBiggerSound,
  playHeartbeatSound,
  playKnifeCatchSound,
  playKnifeSlashSound,
  playKnifeThrowSound,
  playKnifeWallHitSound,
  playPickupSound,
  playQueenSpawnSound,
  playQuizAmbushSound,
  playReloadShellSound,
  playShotgunBlastSound,
  playVictoryFanfareSound,
  playWallCrashSound,
} from '../../utils/soundEffects';
import {
  playMusicTrack,
  preloadAllMusicTracks,
  stopAllMusic,
  unlockAudioFromGesture,
} from '../../utils/musicPlayer';
import {
  createDungeonWallTextures,
  createEntitySpriteTextures,
  DOOM_FACE_SHEET_URL,
  DoomFaceMood,
  drawDoomSheetFace,
  drawFirstPersonKnife,
  drawFirstPersonShotgun,
  getKeyedDoomFaceSheet,
} from './DoomPixelArt';
import type { EnemyDefeatedEvent, ShotgunAmmoHudState } from './GameStage';
import { TheEndScene } from './TheEndScene';
import { VictorySequence } from './VictorySequence';

interface BioDoomGameProps {
  onCompleteToOutro: () => void;
  onReplayStory: () => void;
  onAmmoHudChange?: (state: ShotgunAmmoHudState) => void;
  onEnemyDefeated?: (event: EnemyDefeatedEvent) => void;
  onKnifeSwing?: (didHit: boolean, isThrow?: boolean) => void;
}

type EntityKind =
  | 'bacteriaGreen'
  | 'bacteriaRed'
  | 'bacteriaPurple'
  | 'bacteriaAmber'
  | 'protein'
  | 'cell'
  | 'queen';

function isBacteriaKind(kind: EntityKind): boolean {
  return (
    kind === 'bacteriaGreen' ||
    kind === 'bacteriaRed' ||
    kind === 'bacteriaPurple' ||
    kind === 'bacteriaAmber'
  );
}

interface GameEntity {
  id: string;
  kind: EntityKind;
  label: string;
  x: number;
  z: number;
  hp: number;
  maxHp: number;
  speed: number;
  alive: boolean;
  hitFlash: number;
  mesh: THREE.Sprite;
  bobOffset: number;
}

interface GamePickup {
  id: string;
  kind: 'energy' | 'shells';
  x: number;
  z: number;
  collected: boolean;
  mesh: THREE.Sprite;
}

interface HudSnapshot {
  health: number;
  energy: number;
  activeWeapon: 'shotgun' | 'knife';
  ammoActive: boolean;
  magAmmo: number;
  reserveShells: number;
  reloading: boolean;
  reloadCount: number;
  bacteriaLeft: number;
  proteinsLeft: number;
  cellsLeft: number;
  minionsRemaining: number;
  queenSpawned: boolean;
  queenAlive: boolean;
  queenHp: number;
  weaponUnlocked: boolean;
  hasMasterDna: boolean;
  carActive: boolean;
  heartbeatIntensity: number;
  heartbeatPulse: number;
  heartBpm: number;
  nearestEnemyDist: number;
  statusLine: string;
  elapsedSec: number;
  faceMood: DoomFaceMood;
  lookDir: number;
  knifeThrown: boolean;
}

interface ActiveAmbush {
  entityId: string;
  kind: EntityKind;
  label: string;
  question: BioQuizQuestion;
}

interface DormHoverInfo {
  id: string;
  title: string;
  subtitle: string;
  actionLabel: string;
  accentHex: string;
  inRange: boolean;
}

interface KillFlashBanner {
  id: number;
  label: string;
  colorHex: string;
  isBacteria: boolean;
}

const ENTITY_KILL_COLORS: Record<EntityKind, number> = {
  bacteriaGreen: 0x4ade80,
  bacteriaRed: 0xf43f5e,
  bacteriaPurple: 0xc084fc,
  bacteriaAmber: 0xf59e0b,
  protein: 0xfb923c,
  cell: 0x38bdf8,
  queen: 0xec4899,
};

const ENTITY_KILL_HEX: Record<EntityKind, string> = {
  bacteriaGreen: '#4ADE80',
  bacteriaRed: '#F43F5E',
  bacteriaPurple: '#C084FC',
  bacteriaAmber: '#F59E0B',
  protein: '#FB923C',
  cell: '#38BDF8',
  queen: '#EC4899',
};

const QUEEN_ORB_COLORS = ['#FB7185', '#34D399', '#FB923C', '#F472B6', '#2DD4BF'];

// Protein names cycled ONE AT A TIME each time Queen grabs you with her hands
const FAST_PROTEIN_TARGETS = [
  'hemoglobin',
  'collagen',
  'enzymes',
  'keratin',
  'chaperone',
] as const;

const MAG_CAPACITY = 8;
const QUEEN_SHELL_HP = 60;
const QUIZ_TIME_LIMIT = 35;
const QUEEN_GRAB_TIME_LIMIT = 8;
const TILE_SIZE = 3.0;
const WALL_HEIGHT = 3.6;

// Bio-Machine & Courtyard lane
const LANE_Z = 21.5 * TILE_SIZE;
const MACHINE_X = 16.5 * TILE_SIZE;
const MACHINE_Z = LANE_Z;

// Full 3D Modeled College Dorm Room coordinates (isolated clean space)
const DORM_OX = -200;
const DORM_OZ = -200;
const DORM_DESK_MEAL_X = DORM_OX + 4.3;
const DORM_DESK_MEAL_Z = DORM_OZ + 0.4;

interface DormPhotoPosterConfig {
  id: string;
  title: string;
  subtitle: string;
  url: string;
  wall: 'north' | 'west' | 'east';
  pos: [number, number, number];
  size: [number, number];
  accentColor: number;
  accentHex: string;
}

const DORM_PHOTO_POSTERS: DormPhotoPosterConfig[] = [
  {
    id: 'photo-hero',
    title: 'Hero Study Selfie Poster',
    subtitle: 'Pinned above your headboard — biology membrane notes right behind you.',
    url: '/assets/aistudio/WhatsApp_Image_2026-11-23_at_9.25.38_AM_44e78418.jpeg',
    wall: 'north',
    pos: [-4.3, 2.62, -5.6],
    size: [1.45, 1.75],
    accentColor: 0x38bdf8,
    accentHex: '#38BDF8',
  },
  {
    id: 'photo-squad',
    title: 'Classroom Five-Squad Poster',
    subtitle: 'Your STEM biology crew posing in blue polos by the smartboard.',
    url: '/assets/aistudio/WhatsApp_Image_2026-11-24_at_2.09.36_PM_0c795d33.jpeg',
    wall: 'north',
    pos: [3.35, 2.65, -5.6],
    size: [2.05, 1.45],
    accentColor: 0x60a5fa,
    accentHex: '#60A5FA',
  },
  {
    id: 'photo-class',
    title: 'Full Class Campus Poster',
    subtitle: 'Framed full-class outdoor memory hanging above your bed.',
    url: '/assets/aistudio/WhatsApp_Image_2026-11-25_at_12.07.10_AM_cb1de7f8.jpeg',
    wall: 'west',
    pos: [-6.6, 2.55, -2.85],
    size: [2.2, 1.45],
    accentColor: 0x34d399,
    accentHex: '#34D399',
  },
  {
    id: 'photo-hug',
    title: 'Classroom Friends Snapshot',
    subtitle: 'Mounted above your mini-fridge — celebrating together between lectures.',
    url: '/assets/aistudio/WhatsApp_Image_2026-11-25_at_12.08.22_AM_58660b7d.jpeg',
    wall: 'west',
    pos: [-6.6, 2.68, 3.6],
    size: [1.55, 1.45],
    accentColor: 0xf472b6,
    accentHex: '#F472B6',
  },
  {
    id: 'photo-hoodie',
    title: 'White Hoodie Crew Poster',
    subtitle: 'Hanging right above your Proteome Atlas study desk.',
    url: '/assets/aistudio/WhatsApp_Image_2026-11-25_at_12.07.07_AM__1__24a4192b.jpeg',
    wall: 'east',
    pos: [6.6, 2.86, 0.4],
    size: [2.15, 1.38],
    accentColor: 0xfacc15,
    accentHex: '#FACC15',
  },
  {
    id: 'photo-hangout',
    title: 'Late-Night Hangout Poster',
    subtitle: 'Mounted beside your desk — laughing with the squad after lab.',
    url: '/assets/aistudio/WhatsApp_Image_2026-11-25_at_12.07.07_AM_144dabe6.jpeg',
    wall: 'east',
    pos: [6.6, 2.5, 3.7],
    size: [1.85, 1.42],
    accentColor: 0xfb923c,
    accentHex: '#FB923C',
  },
];

// Expanded 23x23 Multi-Wing DOOM Cellular Fortress (E = Energy, S = Shells, X = Queen Spawn)
const LEVEL_GRID: string[] = [
  '#######################',
  '#QQQQQQQQ.....QQQQQQQQ#',
  '#Q..O......X......O..Q#',
  '#Q.......O...O.......Q#',
  '#Q..E..V.......R..S..Q#',
  '#QQQQQ===.....===QQQQQ#',
  '#..O...=..C.C..=...O..#',
  '#.G..=.=..S....=.=..A.#',
  '#..E.=.=.O...O.=.=.S..#',
  '#.M..=...........=..M.#',
  '#====..O...V...O..====#',
  '#...R......S......G...#',
  '#..O...===...===...O..#',
  '#.A..=.=.......=.=..R.#',
  '#..S.=.=.M...C.=.=.E..#',
  '#====..=.......=..====#',
  '#..E.....O...O.....S..#',
  '#.V...==.......==...A.#',
  '#..O..=..G...R..=..O..#',
  '#..S..=....M....=..E..#',
  '#..E..====...====..S..#',
  '#..........P..........#',
  '#######################',
];

const GRID_ROWS = LEVEL_GRID.length;
const GRID_COLS = LEVEL_GRID[0].length;

// Collect all open walkable floor tiles for random shell drops
const OPEN_FLOOR_TILES: Array<[number, number]> = [];
for (let r = 1; r < GRID_ROWS - 1; r++) {
  for (let c = 1; c < GRID_COLS - 1; c++) {
    const ch = LEVEL_GRID[r][c];
    if (ch !== '#' && ch !== '=' && ch !== 'O' && ch !== 'Q') {
      OPEN_FLOOR_TILES.push([c, r]);
    }
  }
}

function isWallTile(col: number, row: number): boolean {
  if (row < 0 || row >= GRID_ROWS || col < 0 || col >= GRID_COLS) return true;
  const ch = LEVEL_GRID[row][col];
  return ch === '#' || ch === '=' || ch === 'O' || ch === 'Q';
}

function tileCenter(col: number, row: number): [number, number] {
  return [(col + 0.5) * TILE_SIZE, (row + 0.5) * TILE_SIZE];
}

function worldToTile(x: number, z: number): [number, number] {
  return [Math.floor(x / TILE_SIZE), Math.floor(z / TILE_SIZE)];
}

function hasLineOfSight(x1: number, z1: number, x2: number, z2: number): boolean {
  const dx = x2 - x1;
  const dz = z2 - z1;
  const dist = Math.hypot(dx, dz);
  const steps = Math.max(2, Math.ceil(dist / 0.45));
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const [tc, tr] = worldToTile(x1 + dx * t, z1 + dz * t);
    if (isWallTile(tc, tr)) return false;
  }
  return true;
}

function normalizeGameKey(e: KeyboardEvent): string {
  switch (e.code) {
    case 'KeyW':
      return 'w';
    case 'KeyA':
      return 'a';
    case 'KeyS':
      return 's';
    case 'KeyD':
      return 'd';
    case 'KeyQ':
      return 'q';
    case 'KeyE':
      return 'e';
    case 'KeyR':
      return 'r';
    case 'KeyM':
      return 'm';
    case 'KeyK':
      return 'k';
    case 'KeyV':
      return 'v';
    case 'KeyX':
      return 'x';
    case 'KeyF':
      return 'f';
    case 'KeyG':
      return 'g';
    case 'KeyT':
      return 't';
    case 'Digit1':
    case 'Numpad1':
      return '1';
    case 'Digit2':
    case 'Numpad2':
      return '2';
    case 'ShiftLeft':
    case 'ShiftRight':
      return 'shift';
    case 'ArrowUp':
      return 'arrowup';
    case 'ArrowDown':
      return 'arrowdown';
    case 'ArrowLeft':
      return 'arrowleft';
    case 'ArrowRight':
      return 'arrowright';
    case 'Space':
      return ' ';
    case 'Tab':
      return 'tab';
    case 'Enter':
    case 'NumpadEnter':
      return 'enter';
    case 'Escape':
      return 'escape';
    default:
      return e.key.toLowerCase();
  }
}

const GREEN_AURA_LG =
  '0 0 12px rgba(74, 222, 128, 0.95), 0 0 28px rgba(34, 197, 94, 0.65)';
const GREEN_AURA_SM =
  '0 0 8px rgba(74, 222, 128, 0.85), 0 0 18px rgba(34, 197, 94, 0.48)';
const RED_AURA_LG =
  '0 0 18px rgba(239, 68, 68, 0.95), 0 0 42px rgba(220, 38, 38, 0.8)';

export function BioDoomGame({
  onCompleteToOutro,
  onReplayStory,
  onAmmoHudChange,
  onEnemyDefeated,
  onKnifeSwing,
}: BioDoomGameProps) {
  const viewportSectionRef = useRef<HTMLElement | null>(null);
  const viewportMountRef = useRef<HTMLDivElement | null>(null);
  const gunCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const faceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const minimapCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const bigMapCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const grabInputRef = useRef<HTMLInputElement | null>(null);
  const spawnPickupRef = useRef<((kind: 'energy' | 'shells', x: number, z: number) => void) | null>(null);
  const spawnKillFxRef = useRef<
    ((x: number, z: number, kind: EntityKind, viaKnife?: boolean) => void) | null
  >(null);
  const dormInteractTriggerRef = useRef<((id: string) => void) | null>(null);
  const onAmmoHudChangeRef = useRef(onAmmoHudChange);
  onAmmoHudChangeRef.current = onAmmoHudChange;
  const onEnemyDefeatedRef = useRef(onEnemyDefeated);
  onEnemyDefeatedRef.current = onEnemyDefeated;
  const onKnifeSwingRef = useRef(onKnifeSwing);
  onKnifeSwingRef.current = onKnifeSwing;

  const focusGameViewport = useCallback(() => {
    viewportSectionRef.current?.focus({ preventScroll: true });
  }, []);

  const doomSheetRef = useRef<HTMLCanvasElement | null>(null);
  const [doomSheetLoaded, setDoomSheetLoaded] = useState(false);

  const [runId, setRunId] = useState(0);
  const [bigMapOpen, setBigMapOpen] = useState(false);
  const [pointerLocked, setPointerLocked] = useState(false);
  const [activeAmbush, setActiveAmbush] = useState<ActiveAmbush | null>(null);
  const [quizSecondsLeft, setQuizSecondsLeft] = useState(QUIZ_TIME_LIMIT);

  // Queen Hand-Hold Fast Single Protein Typing State (1 word per grab in seconds!)
  const [queenGrabActive, setQueenGrabActive] = useState(false);
  const [proteinStepIdx, setProteinStepIdx] = useState(0);
  const [proteinTyped, setProteinTyped] = useState('');
  const [grabSecondsLeft, setGrabSecondsLeft] = useState(QUEEN_GRAB_TIME_LIMIT);

  const [gameOutcome, setGameOutcome] = useState<
    'playing' | 'dead' | 'victory' | 'cure-grow' | 'dorm-room' | 'the-end'
  >('playing');
  const [nearDormMeal, setNearDormMeal] = useState(false);
  const [hoveredDormItem, setHoveredDormItem] = useState<DormHoverInfo | null>(null);
  const [inspectedDormPhoto, setInspectedDormPhoto] =
    useState<DormPhotoPosterConfig | null>(null);
  const [dormToast, setDormToast] = useState<{ text: string; accent: string } | null>(null);
  const [killFlash, setKillFlash] = useState<KillFlashBanner | null>(null);
  const [killerSpecies, setKillerSpecies] = useState('Mutant Bacteria');

  const [hud, setHud] = useState<HudSnapshot>({
    health: 100,
    energy: 100,
    activeWeapon: 'shotgun',
    ammoActive: false,
    magAmmo: 0,
    reserveShells: 0,
    reloading: false,
    reloadCount: 0,
    bacteriaLeft: 8,
    proteinsLeft: 3,
    cellsLeft: 3,
    minionsRemaining: 14,
    queenSpawned: false,
    queenAlive: false,
    queenHp: QUEEN_SHELL_HP,
    weaponUnlocked: false,
    hasMasterDna: false,
    carActive: false,
    heartbeatIntensity: 0,
    heartbeatPulse: 0,
    heartBpm: 68,
    nearestEnemyDist: 99,
    statusLine:
      'SHOTGUN LOCKED — PRESS [1] FOR BIO-KNIFE OR FACE A PROTEIN QUIZ TO UNLOCK SHOTGUN!',
    elapsedSec: 0,
    faceMood: 'normal',
    lookDir: 0,
    knifeThrown: false,
  });

  // Load classic 6x6 Doomguy face sprite sheet for HUD portrait ONLY
  useEffect(() => {
    let active = true;
    getKeyedDoomFaceSheet().then((sheet) => {
      if (active && sheet) {
        doomSheetRef.current = sheet;
        setDoomSheetLoaded(true);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  // Instant preloaded audio initialization for 0ms latency cues
  useEffect(() => {
    preloadAllMusicTracks();
    playMusicTrack('d45k13', { volume: 0.65, loop: true, startTime: 0 });

    const unlock = () => unlockAudioFromGesture();
    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('keydown', unlock, { passive: true });

    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      stopAllMusic();
    };
  }, [runId]);

  // Mutable simulation state synced between React UI & 3D render loop
  const gameRef = useRef<{
    playerX: number;
    playerZ: number;
    playerYaw: number;
    health: number;
    energy: number;
    activeWeapon: 'shotgun' | 'knife';
    knifeSwing: number;
    knifeCooldown: number;
    knifeThrown: boolean;
    knifeThrowPhase: 'none' | 'outbound' | 'stuck' | 'returning';
    knifeX: number;
    knifeY: number;
    knifeZ: number;
    knifeVx: number;
    knifeVz: number;
    knifeTimer: number;
    knifeHitIds: Set<string>;
    ammoActive: boolean;
    magAmmo: number;
    reserveShells: number;
    reloadTimer: number;
    reloadCount: number;
    recoil: number;
    walkBobPhase: number;
    hurtFlash: number;
    grinTimer: number;
    heartbeatTimer: number;
    heartbeatIntensity: number;
    heartbeatPulse: number;
    heartBpm: number;
    nearestEnemyDist: number;
    paused: boolean;
    weaponUnlocked: boolean;
    queenSpawned: boolean;
    queenGrabCooldown: number;
    queenGrabCount: number;
    hasMasterDna: boolean;
    carPhase: 'idle' | 'approach' | 'deliver' | 'depart';
    carX: number;
    carZ: number;
    carTargetX: number;
    carTargetZ: number;
    carAngle: number;
    carTimer: number;
    carBreachedDebris: boolean;
    randomShellTimer: number;
    entities: GameEntity[];
    pickups: GamePickup[];
    keys: Set<string>;
    questionCursor: number;
    elapsedSec: number;
    cureTimer: number;
    dormInitialized: boolean;
    statusLine: string;
    outcome: 'playing' | 'dead' | 'victory' | 'cure-grow' | 'dorm-room' | 'the-end';
  }>({
    playerX: 11.5 * TILE_SIZE,
    playerZ: 21.5 * TILE_SIZE,
    playerYaw: 0,
    health: 100,
    energy: 100,
    activeWeapon: 'shotgun',
    knifeSwing: 0,
    knifeCooldown: 0,
    knifeThrown: false,
    knifeThrowPhase: 'none',
    knifeX: 0,
    knifeY: 1.4,
    knifeZ: 0,
    knifeVx: 0,
    knifeVz: 0,
    knifeTimer: 0,
    knifeHitIds: new Set(),
    ammoActive: false,
    magAmmo: 0,
    reserveShells: 0,
    reloadTimer: 0,
    reloadCount: 0,
    recoil: 0,
    walkBobPhase: 0,
    hurtFlash: 0,
    grinTimer: 0,
    heartbeatTimer: 0.4,
    heartbeatIntensity: 0,
    heartbeatPulse: 0,
    heartBpm: 68,
    nearestEnemyDist: 99,
    paused: false,
    weaponUnlocked: false,
    queenSpawned: false,
    queenGrabCooldown: 0,
    queenGrabCount: 0,
    hasMasterDna: false,
    carPhase: 'idle',
    carX: -12,
    carZ: LANE_Z,
    carTargetX: 11.5 * TILE_SIZE,
    carTargetZ: 21.5 * TILE_SIZE - 4.4,
    carAngle: 0,
    carTimer: 0,
    carBreachedDebris: false,
    randomShellTimer: 0,
    entities: [],
    pickups: [],
    keys: new Set(),
    questionCursor: 0,
    elapsedSec: 0,
    cureTimer: 0,
    dormInitialized: false,
    statusLine:
      'SHOTGUN LOCKED — PRESS [1] FOR BIO-KNIFE OR FACE A PROTEIN QUIZ TO UNLOCK SHOTGUN!',
    outcome: 'playing',
  });

  const bigMapOpenRef = useRef(bigMapOpen);
  bigMapOpenRef.current = bigMapOpen;

  const syncHudFromRef = useCallback(() => {
    const g = gameRef.current;
    const bacteriaLeft = g.entities.filter(
      (e) => e.alive && isBacteriaKind(e.kind)
    ).length;
    const proteinsLeft = g.entities.filter(
      (e) => e.alive && e.kind === 'protein'
    ).length;
    const cellsLeft = g.entities.filter(
      (e) => e.alive && e.kind === 'cell'
    ).length;
    const minionsRemaining = bacteriaLeft + proteinsLeft + cellsLeft;
    const queen = g.entities.find((e) => e.kind === 'queen');
    const queenAlive = Boolean(queen?.alive);
    const queenHp = queen ? Math.max(0, Math.round(queen.hp)) : 0;

    let mood: DoomFaceMood = 'normal';
    if (g.outcome === 'dead' || g.health <= 0) {
      mood = 'dead';
    } else if (g.paused) {
      mood = 'shock';
    } else if (g.hurtFlash > 0.15) {
      mood = 'pain';
    } else if (g.grinTimer > 0) {
      mood = 'grin';
    }

    const lookDir = Math.round(Math.sin(g.elapsedSec * 1.6));

    setHud({
      health: Math.max(0, Math.round(g.health)),
      energy: Math.max(0, Math.round(g.energy)),
      activeWeapon: g.activeWeapon,
      ammoActive: g.ammoActive,
      magAmmo: g.magAmmo,
      reserveShells: g.reserveShells,
      reloading: g.reloadTimer > 0,
      reloadCount: g.reloadCount,
      bacteriaLeft,
      proteinsLeft,
      cellsLeft,
      minionsRemaining,
      queenSpawned: g.queenSpawned,
      queenAlive,
      queenHp,
      weaponUnlocked: g.weaponUnlocked,
      hasMasterDna: g.hasMasterDna,
      carActive: g.carPhase !== 'idle',
      heartbeatIntensity: g.heartbeatIntensity,
      heartbeatPulse: g.heartbeatPulse,
      heartBpm: g.heartBpm,
      nearestEnemyDist: g.nearestEnemyDist,
      statusLine: g.statusLine,
      elapsedSec: Math.floor(g.elapsedSec),
      faceMood: mood,
      lookDir,
      knifeThrown: g.knifeThrown,
    });

    onAmmoHudChangeRef.current?.({
      showAmmoHud: g.outcome === 'playing',
      activeWeapon: g.activeWeapon,
      ammoActive: g.ammoActive,
      magAmmo: g.magAmmo,
      reserveShells: g.reserveShells,
      maxMag: MAG_CAPACITY,
      reloading: g.reloadTimer > 0,
      weaponUnlocked: g.weaponUnlocked,
      reloadCount: g.reloadCount,
      knifeThrown: g.knifeThrown,
    });
  }, []);

  // Render classic Doomguy face sheet into HUD box
  useEffect(() => {
    const canvas = faceCanvasRef.current;
    const sheet = doomSheetRef.current;
    if (!canvas || !doomSheetLoaded || !sheet) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#070b0f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawDoomSheetFace(
      ctx,
      sheet,
      hud.faceMood,
      hud.health,
      hud.lookDir,
      2,
      2,
      canvas.width - 4,
      canvas.height - 4
    );
  }, [doomSheetLoaded, hud.faceMood, hud.health, hud.lookDir]);

  // Spawn Queen of the Cells once all other entities are cleared + activate shotgun shell ammo & ADHD track immediately!
  const spawnQueenBoss = useCallback(() => {
    const g = gameRef.current;
    if (g.queenSpawned) return;
    const queen = g.entities.find((e) => e.kind === 'queen');
    if (!queen) return;

    g.queenSpawned = true;
    g.ammoActive = true;
    g.magAmmo = MAG_CAPACITY;
    g.reserveShells = 44;
    g.reloadCount = 0;

    queen.alive = true;
    queen.hp = QUEEN_SHELL_HP;
    queen.maxHp = QUEEN_SHELL_HP;
    queen.speed = 6.5; // VERY FAST boss pursuit!
    queen.mesh.visible = true;
    g.queenGrabCooldown = 2.0;

    // Immediately spawn 10 random Protein Shell Boxes across open floor tiles!
    for (let i = 0; i < 10 && OPEN_FLOOR_TILES.length > 0; i++) {
      const [rc, rr] =
        OPEN_FLOOR_TILES[Math.floor(Math.random() * OPEN_FLOOR_TILES.length)];
      const [sx, sz] = tileCenter(rc, rr);
      spawnPickupRef.current?.('shells', sx, sz);
    }

    g.statusLine =
      'QUEEN OF THE CELLS SPAWNED (60 SHELL HP)! GRAB SHELLS, RELOAD WITH [R] & RAPID CLICK!';
    playMusicTrack('adhd', { volume: 0.85, loop: true, startTime: 0 });
    playQueenSpawnSound();
    syncHudFromRef();
  }, [syncHudFromRef]);

  // Trigger Live In-Game 3D Cell-Driven Car driving directly in front of player's eyes with 3D DNA!
  const triggerLiveCellCarDelivery = useCallback(() => {
    const g = gameRef.current;
    if (g.carPhase !== 'idle' || g.hasMasterDna) return;

    const lookX = -Math.sin(g.playerYaw);
    const lookZ = -Math.cos(g.playerYaw);
    const rightX = Math.cos(g.playerYaw);
    const rightZ = -Math.sin(g.playerYaw);

    // Spawn ahead in player's forward sightline & drive moderately straight in front of player!
    const targetX = g.playerX + lookX * 4.4;
    const targetZ = g.playerZ + lookZ * 4.4;
    const startX = g.playerX + lookX * 19.5 + rightX * 3.0;
    const startZ = g.playerZ + lookZ * 19.5 + rightZ * 3.0;

    g.carPhase = 'approach';
    g.carX = startX;
    g.carZ = startZ;
    g.carTargetX = targetX;
    g.carTargetZ = targetZ;
    g.carAngle = Math.atan2(-(targetZ - startZ), targetX - startX);
    g.carTimer = 0;
    g.carBreachedDebris = false;
    g.statusLine =
      'GIANT 3D CELL CAR DRIVING IN FRONT OF YOU TO DELIVER THE MASTER PROTEIN DNA!';
    // Loop continuously through Bio-Machine, 3D Grow-Back, 3D Dorm Room & THE END!
    playMusicTrack('sixdays', { volume: 0.85, loop: true, startTime: 0 });
    playVictoryFanfareSound();
    syncHudFromRef();
  }, [syncHudFromRef]);

  // Instant Death ("YOU DEAD")
  const triggerInstantDeath = useCallback(
    (speciesName: string) => {
      const g = gameRef.current;
      g.health = 0;
      g.paused = true;
      g.keys.clear();
      g.outcome = 'dead';
      stopAllMusic();
      setActiveAmbush(null);
      setQueenGrabActive(false);
      setKillerSpecies(speciesName);
      setGameOutcome('dead');
      playBacteriaEatDeathSound();
      if (document.pointerLockElement) {
        document.exitPointerLock();
      }
      syncHudFromRef();
    },
    [syncHudFromRef]
  );

  // Trigger Shotgun Reload ('R' key) with reload animation & HUD update
  const triggerReload = useCallback(() => {
    const g = gameRef.current;
    if (g.paused || g.outcome !== 'playing') return;
    if (!g.ammoActive) {
      g.statusLine = 'SHELL AMMO INACTIVE UNTIL THE QUEEN OF THE CELLS SPAWNS!';
      syncHudFromRef();
      return;
    }
    if (g.reloadTimer > 0) return;
    if (g.magAmmo >= MAG_CAPACITY) {
      g.statusLine = 'SHOTGUN MAGAZINE ALREADY FULL (8/8 SHELLS)!';
      syncHudFromRef();
      return;
    }
    if (g.reserveShells <= 0) {
      g.statusLine = 'NO RESERVE SHELLS — GRAB RED SHELL BOXES SPAWNING ON THE FLOOR!';
      syncHudFromRef();
      return;
    }
    g.reloadTimer = 0.72;
    g.reloadCount += 1;
    playReloadShellSound();
    g.statusLine = 'RELOADING PROTEIN SHOTGUN SHELLS...';
    syncHudFromRef();
  }, [syncHudFromRef]);

  const killEntityAndCheckStage = useCallback(
    (entityId: string, viaQuiz: boolean, viaKnife = false) => {
      const g = gameRef.current;
      const target = g.entities.find((e) => e.id === entityId);
      if (!target || !target.alive) return;

      target.alive = false;
      target.hp = 0;
      target.mesh.visible = false;

      g.recoil = 0.85;
      g.grinTimer = 1.1;
      g.energy = Math.min(100, g.energy + 12);

      // Spawn 3D blood-like droplets + species bio-splatter + shockwave burst + HUD kill flash
      spawnKillFxRef.current?.(target.x, target.z, target.kind, viaKnife);
      onEnemyDefeatedRef.current?.({
        viaKnife,
        kind: target.kind,
        label: target.label,
        colorHex: ENTITY_KILL_HEX[target.kind],
        isBoss: target.kind === 'queen',
      });
      setKillFlash({
        id: Date.now() + Math.random(),
        label: target.label,
        colorHex: ENTITY_KILL_HEX[target.kind],
        isBacteria: isBacteriaKind(target.kind),
      });

      if (viaQuiz) {
        playShotgunBlastSound();
      }
      playEntityKillSound();

      if (target.kind === 'queen') {
        g.statusLine =
          'QUEEN DEFEATED! A GIANT 3D CELL IS DRIVING RIGHT TO YOU WITH THE MASTER DNA!';
        triggerLiveCellCarDelivery();
        return;
      }

      const minionsLeft = g.entities.some(
        (e) => e.alive && e.kind !== 'queen'
      );
      if (!minionsLeft && !g.queenSpawned) {
        spawnQueenBoss();
      } else {
        g.statusLine = `${
          viaKnife ? 'SLICED' : 'BLASTED'
        } ${target.label.toUpperCase()}! CLEAR ALL ENTITIES TO SUMMON THE QUEEN!`;
        syncHudFromRef();
      }
    },
    [spawnQueenBoss, syncHudFromRef, triggerLiveCellCarDelivery]
  );

  const switchWeapon = useCallback(
    (weapon: 'shotgun' | 'knife') => {
      const g = gameRef.current;
      if (g.paused || g.outcome !== 'playing') return;
      if (g.activeWeapon === weapon) return;
      g.activeWeapon = weapon;
      g.reloadTimer = 0;
      playCutsceneBlipSound();
      g.statusLine =
        weapon === 'knife'
          ? 'EQUIPPED BIO-COMBAT KNIFE [1] — LEFT-CLICK SLASH · RIGHT-CLICK / [G] THROW!'
          : g.weaponUnlocked
          ? 'EQUIPPED PROTEIN SHOTGUN [2] — RAPID CLICK TO FIRE!'
          : 'EQUIPPED SHOTGUN [2] — SOLVE A PROTEIN QUIZ TO UNLOCK OR PRESS [1] FOR KNIFE!';
      syncHudFromRef();
    },
    [syncHudFromRef]
  );

  // Throw Spinning 3D Bio-Combat Knife (Right-Click / G / T) -> Pierces & Boomerangs Back!
  const throwKnife = useCallback(() => {
    const g = gameRef.current;
    if (g.paused || g.outcome !== 'playing') return;

    if (g.activeWeapon !== 'knife') {
      g.activeWeapon = 'knife';
      g.reloadTimer = 0;
    }

    if (g.knifeThrown) {
      if (g.knifeThrowPhase !== 'returning') {
        g.knifeThrowPhase = 'returning';
        g.knifeTimer = 0;
        g.statusLine = 'RECALLING SPINNING BIO-KNIFE BACK TO HAND...';
        syncHudFromRef();
      }
      return;
    }

    if (g.knifeCooldown > 0) return;

    const dirX = -Math.sin(g.playerYaw);
    const dirZ = -Math.cos(g.playerYaw);

    g.knifeThrown = true;
    g.knifeThrowPhase = 'outbound';
    g.knifeCooldown = 0.25;
    g.knifeSwing = 0;
    g.knifeTimer = 0;
    g.knifeHitIds.clear();
    g.knifeX = g.playerX + dirX * 0.72;
    g.knifeY = 1.44;
    g.knifeZ = g.playerZ + dirZ * 0.72;
    g.knifeVx = dirX * 26.5;
    g.knifeVz = dirZ * 26.5;
    g.grinTimer = 0.5;

    onKnifeSwingRef.current?.(false, true);
    playKnifeThrowSound();
    g.statusLine = 'BIO-KNIFE THROWN! SPINNING BLADE FLYING & RETURNING...';
    syncHudFromRef();
  }, [syncHudFromRef]);

  // Rapid-Click Weapon Attack: Bio-Combat Knife Slash OR Unlocked DOOM Shotgun Fire
  const fireShotgun = useCallback(() => {
    const g = gameRef.current;
    if (g.paused || g.outcome !== 'playing') return;

    const dirX = -Math.sin(g.playerYaw);
    const dirZ = -Math.cos(g.playerYaw);

    // === BIO-COMBAT KNIFE MELEE SLASH ===
    if (g.activeWeapon === 'knife') {
      if (g.knifeThrown) {
        g.knifeThrowPhase = 'returning';
        g.knifeTimer = 0;
        g.statusLine = 'RECALLING SPINNING BIO-KNIFE BACK TO HAND...';
        syncHudFromRef();
        return;
      }
      if (g.knifeCooldown > 0) return;
      g.knifeCooldown = 0.28;
      g.knifeSwing = 1.0;
      g.grinTimer = 0.45;

      let bestTarget: GameEntity | null = null;
      let bestDist = Infinity;

      for (const ent of g.entities) {
        if (!ent.alive) continue;
        const dx = ent.x - g.playerX;
        const dz = ent.z - g.playerZ;
        const dist = Math.hypot(dx, dz);
        if (dist > 4.4 || dist < 0.05) continue;

        const dot = (dx * dirX + dz * dirZ) / dist;
        if (dot >= 0.72 && dist < bestDist && hasLineOfSight(g.playerX, g.playerZ, ent.x, ent.z)) {
          bestDist = dist;
          bestTarget = ent;
        }
      }

      onKnifeSwingRef.current?.(Boolean(bestTarget));

      if (bestTarget) {
        playKnifeSlashSound(true);
        const dmg = bestTarget.kind === 'queen' ? 2 : 45;
        bestTarget.hp -= dmg;
        bestTarget.hitFlash = 1.0;

        const nx = bestTarget.x + dirX * (bestTarget.kind === 'queen' ? 0.5 : 0.7);
        const nz = bestTarget.z + dirZ * (bestTarget.kind === 'queen' ? 0.5 : 0.7);
        const [tc, tr] = worldToTile(nx, nz);
        if (!isWallTile(tc, tr)) {
          bestTarget.x = nx;
          bestTarget.z = nz;
        }

        if (bestTarget.hp <= 0) {
          killEntityAndCheckStage(bestTarget.id, false, true);
        } else if (bestTarget.kind === 'queen') {
          g.statusLine = `KNIFE SLASHED QUEEN! (${Math.ceil(bestTarget.hp)} / ${QUEEN_SHELL_HP} HP LEFT)`;
          syncHudFromRef();
        } else {
          g.statusLine = `KNIFE SLICED ${bestTarget.label.toUpperCase()} (${Math.max(
            0,
            Math.round(bestTarget.hp)
          )} HP LEFT)`;
          syncHudFromRef();
        }
      } else {
        playKnifeSlashSound(false);
        syncHudFromRef();
      }
      return;
    }

    // === PROTEIN SHOTGUN FIRE ===
    if (!g.weaponUnlocked) {
      playCutsceneBlipSound();
      g.statusLine =
        'SHOTGUN LOCKED — PRESS [1] TO SLASH WITH KNIFE OR SOLVE A BIO-QUIZ FIRST!';
      syncHudFromRef();
      return;
    }

    if (g.reloadTimer > 0) {
      return;
    }

    // Fast recoil gate so rapid clicking works super snappily!
    if (g.recoil > 0.52) return;

    if (g.ammoActive) {
      if (g.magAmmo <= 0) {
        if (g.reserveShells > 0) {
          triggerReload();
        } else {
          playCutsceneBlipSound();
          g.statusLine = 'EMPTY! PICK UP SHELL BOXES, PRESS [R] TO RELOAD, OR [1] FOR KNIFE!';
          syncHudFromRef();
        }
        return;
      }
      g.magAmmo -= 1;
    }

    g.energy = Math.max(5, g.energy - 1);
    g.recoil = 1.0;
    g.grinTimer = 0.55;
    playShotgunBlastSound();

    let bestTarget: GameEntity | null = null;
    let bestDist = Infinity;

    for (const ent of g.entities) {
      if (!ent.alive) continue;
      const dx = ent.x - g.playerX;
      const dz = ent.z - g.playerZ;
      const dist = Math.hypot(dx, dz);
      if (dist > 22 || dist < 0.1) continue;

      const dot = (dx * dirX + dz * dirZ) / dist;
      const aimCone = ent.kind === 'queen' ? 0.89 : 0.92;
      if (dot >= aimCone && dist < bestDist && hasLineOfSight(g.playerX, g.playerZ, ent.x, ent.z)) {
        bestDist = dist;
        bestTarget = ent;
      }
    }

    if (bestTarget) {
      const dmg = bestTarget.kind === 'queen' ? 1 : 50;
      bestTarget.hp -= dmg;
      bestTarget.hitFlash = 1.0;

      const nx = bestTarget.x + dirX * (bestTarget.kind === 'queen' ? 0.25 : 0.5);
      const nz = bestTarget.z + dirZ * (bestTarget.kind === 'queen' ? 0.25 : 0.5);
      const [tc, tr] = worldToTile(nx, nz);
      if (!isWallTile(tc, tr)) {
        bestTarget.x = nx;
        bestTarget.z = nz;
      }

      if (bestTarget.hp <= 0) {
        killEntityAndCheckStage(bestTarget.id, false);
      } else if (bestTarget.kind === 'queen') {
        g.statusLine = `HIT QUEEN OF THE CELLS! (${Math.ceil(bestTarget.hp)} / ${QUEEN_SHELL_HP} SHELLS LEFT)`;
        syncHudFromRef();
      } else {
        g.statusLine = `SHOTGUN HIT ${bestTarget.label.toUpperCase()} (${Math.max(
          0,
          Math.round(bestTarget.hp)
        )} HP LEFT)`;
        syncHudFromRef();
      }
    } else {
      syncHudFromRef();
    }

    if (g.ammoActive && g.magAmmo === 0 && g.reserveShells > 0) {
      g.statusLine = '0 SHELLS IN TUBE — PRESS [R] TO RELOAD!';
      syncHudFromRef();
    }
  }, [killEntityAndCheckStage, syncHudFromRef, triggerReload]);

  // Quiz Ambush Timer (Minions)
  useEffect(() => {
    if (!activeAmbush || gameOutcome !== 'playing') return;
    const interval = window.setInterval(() => {
      setQuizSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(interval);
          triggerInstantDeath(activeAmbush.label);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [activeAmbush, gameOutcome, triggerInstantDeath]);

  // Queen Hand-Hold Fast Protein Typing Timer
  useEffect(() => {
    if (!queenGrabActive || gameOutcome !== 'playing') return;
    grabInputRef.current?.focus();
    const interval = window.setInterval(() => {
      setGrabSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(interval);
          triggerInstantDeath('Queen of the Cells (Crushed in Her Hands)');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [queenGrabActive, gameOutcome, triggerInstantDeath]);

  const handleAnswerQuiz = (optionIdx: number) => {
    if (!activeAmbush) return;
    const isCorrect = optionIdx === activeAmbush.question.correctIndex;
    const g = gameRef.current;

    if (isCorrect) {
      const entityId = activeAmbush.entityId;
      g.weaponUnlocked = true;
      setActiveAmbush(null);
      g.paused = false;
      focusGameViewport();
      killEntityAndCheckStage(entityId, true);
    } else {
      triggerInstantDeath(activeAmbush.label);
    }
  };

  // Handle fast SINGLE protein word typing each time Queen holds you in her hands
  const handleProteinTypingChange = (rawVal: string) => {
    const clean = rawVal.trim().toLowerCase();
    const targetWord = FAST_PROTEIN_TARGETS[proteinStepIdx];
    setProteinTyped(rawVal);

    if (clean === targetWord) {
      playPickupSound();
      const g = gameRef.current;
      setQueenGrabActive(false);
      setProteinTyped('');
      g.paused = false;
      focusGameViewport();
      g.queenGrabCooldown = 4.2;
      g.reserveShells += 8;
      g.energy = Math.min(100, g.energy + 20);

      const queen = g.entities.find((e) => e.kind === 'queen');
      if (queen && queen.alive) {
        const dx = queen.x - g.playerX;
        const dz = queen.z - g.playerZ;
        const d = Math.max(0.1, Math.hypot(dx, dz));
        const pushX = queen.x + (dx / d) * 8.5;
        const pushZ = queen.z + (dz / d) * 8.5;
        const [tc, tr] = worldToTile(pushX, pushZ);
        if (!isWallTile(tc, tr)) {
          queen.x = pushX;
          queen.z = pushZ;
          queen.mesh.position.x = pushX;
          queen.mesh.position.z = pushZ;
        }
        queen.hp -= 4;
        queen.hitFlash = 1.0;
        playShotgunBlastSound();
        if (queen.hp <= 0) {
          killEntityAndCheckStage(queen.id, true);
        } else {
          g.statusLine = `TYPED "${targetWord.toUpperCase()}"! BROKE QUEEN GRIP (-4 SHELLS)! (${Math.ceil(
            queen.hp
          )} / ${QUEEN_SHELL_HP} SHELLS LEFT)`;
          syncHudFromRef();
        }
      }
    }
  };

  // Auto-clear brief combat kill flash & dorm interaction toast
  useEffect(() => {
    if (!killFlash) return;
    const t = window.setTimeout(() => setKillFlash(null), 950);
    return () => window.clearTimeout(t);
  }, [killFlash]);

  useEffect(() => {
    if (!dormToast) return;
    const t = window.setTimeout(() => setDormToast(null), 4200);
    return () => window.clearTimeout(t);
  }, [dormToast]);

  const handleRestartGame = () => {
    setActiveAmbush(null);
    setQueenGrabActive(false);
    setProteinStepIdx(0);
    setProteinTyped('');
    setNearDormMeal(false);
    setHoveredDormItem(null);
    setInspectedDormPhoto(null);
    setDormToast(null);
    setKillFlash(null);
    setQuizSecondsLeft(QUIZ_TIME_LIMIT);
    setGameOutcome('playing');
    setBigMapOpen(false);
    setRunId((id) => id + 1);
  };

  // Start 3D Cure Grow-Back right inside the 3D engine (no 2D cutscene!), keeping Six Days playing!
  const handleStartCureIn3DRoom = useCallback(() => {
    const g = gameRef.current;
    g.paused = false;
    g.keys.clear();
    g.cureTimer = 0;
    g.dormInitialized = false;
    g.outcome = 'cure-grow';
    setNearDormMeal(false);
    setHoveredDormItem(null);
    setInspectedDormPhoto(null);
    setDormToast(null);
    setGameOutcome('cure-grow');
    playGrowBiggerSound();
    syncHudFromRef();
  }, [syncHudFromRef]);

  const handleEnterTheEnd = useCallback(() => {
    const g = gameRef.current;
    g.paused = true;
    g.keys.clear();
    g.outcome = 'the-end';
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
    setHoveredDormItem(null);
    setInspectedDormPhoto(null);
    setGameOutcome('the-end');
    syncHudFromRef();
  }, [syncHudFromRef]);

  // Main Three.js Pixelated 3D DOOM Engine
  useEffect(() => {
    const mount = viewportMountRef.current;
    if (!mount) return;

    const isSoftwareGl = (() => {
      try {
        const probe = document.createElement('canvas').getContext('webgl2');
        if (!probe) return true;
        const ext = probe.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : probe.RENDERER;
        const gpu = String(probe.getParameter(param));
        probe.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    const INTERNAL_W = 420;
    const INTERNAL_H = 240;

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setPixelRatio(1);
    renderer.setSize(INTERNAL_W, INTERNAL_H, false);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.imageRendering = 'pixelated';
    mount.innerHTML = '';
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070a09);
    scene.fog = new THREE.Fog(0x070a09, 6.0, 34);

    const camera = new THREE.PerspectiveCamera(
      68,
      INTERNAL_W / INTERNAL_H,
      0.1,
      65
    );

    const hemi = new THREE.HemisphereLight(0xa7f3d0, 0x1c120d, 1.45);
    scene.add(hemi);
    const playerLight = new THREE.PointLight(0xfff1d6, 2.35, 19, 1.15);
    scene.add(playerLight);

    const [qx, qz] = tileCenter(11, 2);
    const queenGlowLight = new THREE.PointLight(0xf43f5e, 3.4, 20, 1.05);
    queenGlowLight.position.set(qx, 2.2, qz);
    scene.add(queenGlowLight);

    const textures = createDungeonWallTextures();
    const spriteTex = createEntitySpriteTextures();

    const disposables: Array<{ dispose: () => void }> = [
      textures.stoneWall,
      textures.techWall,
      textures.pillarWall,
      textures.queenWall,
      textures.floorTex,
      textures.ceilTex,
      spriteTex.bacteriaGreen,
      spriteTex.bacteriaRed,
      spriteTex.bacteriaPurple,
      spriteTex.bacteriaAmber,
      spriteTex.protein,
      spriteTex.cell,
      spriteTex.queen,
      spriteTex.energyOrb,
      spriteTex.shellBox,
    ];

    // Floor & Ceiling
    const worldW = GRID_COLS * TILE_SIZE;
    const worldH = GRID_ROWS * TILE_SIZE;
    const floorGeo = new THREE.PlaneGeometry(worldW, worldH);
    const floorMat = new THREE.MeshStandardMaterial({
      map: textures.floorTex,
      roughness: 0.9,
      metalness: 0.05,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.set(worldW / 2, 0, worldH / 2);
    scene.add(floorMesh);

    const ceilMat = new THREE.MeshStandardMaterial({
      map: textures.ceilTex,
      roughness: 0.9,
      metalness: 0.1,
    });
    const ceilMesh = new THREE.Mesh(floorGeo, ceilMat);
    ceilMesh.rotation.x = Math.PI / 2;
    ceilMesh.position.set(worldW / 2, WALL_HEIGHT, worldH / 2);
    scene.add(ceilMesh);

    const wallGeo = new THREE.BoxGeometry(TILE_SIZE, WALL_HEIGHT, TILE_SIZE);
    const pillarGeo = new THREE.BoxGeometry(TILE_SIZE * 0.74, WALL_HEIGHT, TILE_SIZE * 0.74);
    const stoneMat = new THREE.MeshStandardMaterial({
      map: textures.stoneWall,
      roughness: 0.88,
    });
    const techMat = new THREE.MeshStandardMaterial({
      map: textures.techWall,
      roughness: 0.6,
      metalness: 0.25,
    });
    const pillarMat = new THREE.MeshStandardMaterial({
      map: textures.pillarWall,
      roughness: 0.72,
    });
    const queenMat = new THREE.MeshStandardMaterial({
      map: textures.queenWall,
      roughness: 0.5,
      metalness: 0.22,
    });
    disposables.push(
      floorGeo,
      floorMat,
      ceilMat,
      wallGeo,
      pillarGeo,
      stoneMat,
      techMat,
      pillarMat,
      queenMat
    );

    // 5 Orbiting Protein Key Crystals above Queen of the Cells (hidden until she spawns)
    const keyOrbGeo = new THREE.OctahedronGeometry(0.28, 0);
    const keyOrbMeshes: THREE.Mesh[] = [];
    QUEEN_ORB_COLORS.forEach((orbColor, idx) => {
      const mat = new THREE.MeshStandardMaterial({
        color: orbColor,
        emissive: orbColor,
        emissiveIntensity: 0.85,
        roughness: 0.25,
      });
      disposables.push(mat);
      const orb = new THREE.Mesh(keyOrbGeo, mat);
      orb.visible = false;
      scene.add(orb);
      keyOrbMeshes.push(orb);
    });
    disposables.push(keyOrbGeo);

    // Parse 23x23 Grid (Faster Entities!)
    const entities: GameEntity[] = [];
    const pickups: GamePickup[] = [];
    let startX = 11.5 * TILE_SIZE;
    let startZ = 21.5 * TILE_SIZE;
    let entitySeq = 0;
    let pickupSeq = 0;

    const entityConfig = (
      ch: string
    ): {
      kind: EntityKind;
      tex: THREE.CanvasTexture;
      label: string;
      hp: number;
      speed: number;
      size: number;
    } | null => {
      switch (ch) {
        case 'G':
          return {
            kind: 'bacteriaGreen',
            tex: spriteTex.bacteriaGreen,
            label: 'Emerald Bacillus Bacterium',
            hp: 85,
            speed: 3.7,
            size: 1.85,
          };
        case 'R':
          return {
            kind: 'bacteriaRed',
            tex: spriteTex.bacteriaRed,
            label: 'Crimson Streptococcus',
            hp: 90,
            speed: 3.9,
            size: 1.85,
          };
        case 'V':
          return {
            kind: 'bacteriaPurple',
            tex: spriteTex.bacteriaPurple,
            label: 'Violet Spirillum Bacterium',
            hp: 95,
            speed: 4.1,
            size: 1.9,
          };
        case 'A':
          return {
            kind: 'bacteriaAmber',
            tex: spriteTex.bacteriaAmber,
            label: 'Amber Armored Staph',
            hp: 105,
            speed: 3.55,
            size: 1.9,
          };
        case 'M':
          return {
            kind: 'protein',
            tex: spriteTex.protein,
            label: 'Rogue Misfolded Protein',
            hp: 95,
            speed: 3.5,
            size: 1.85,
          };
        case 'C':
          return {
            kind: 'cell',
            tex: spriteTex.cell,
            label: 'Hostile Guard Cell',
            hp: 110,
            speed: 3.4,
            size: 1.95,
          };
        case 'X':
          return {
            kind: 'queen',
            tex: spriteTex.queen,
            label: 'Queen of the Cells',
            hp: QUEEN_SHELL_HP,
            speed: 6.5,
            size: 3.25,
          };
        default:
          return null;
      }
    };

    const wallMeshMap = new Map<string, THREE.Mesh>();

    const spawnPickupSprite = (kind: 'energy' | 'shells', x: number, z: number) => {
      const pmat = new THREE.SpriteMaterial({
        map: kind === 'shells' ? spriteTex.shellBox : spriteTex.energyOrb,
        transparent: true,
      });
      disposables.push(pmat);
      const sprite = new THREE.Sprite(pmat);
      sprite.scale.set(0.95, 0.95, 1);
      sprite.position.set(x, 0.55, z);
      scene.add(sprite);
      pickups.push({
        id: `pk-${pickupSeq++}`,
        kind,
        x,
        z,
        collected: false,
        mesh: sprite,
      });
    };
    spawnPickupRef.current = spawnPickupSprite;

    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        const ch = LEVEL_GRID[r][c];
        const [cx, cz] = tileCenter(c, r);

        if (ch === '#' || ch === '=' || ch === 'Q') {
          const mat = ch === '=' ? techMat : ch === 'Q' ? queenMat : stoneMat;
          const wall = new THREE.Mesh(wallGeo, mat);
          wall.position.set(cx, WALL_HEIGHT / 2, cz);
          scene.add(wall);
          wallMeshMap.set(`${c},${r}`, wall);
        } else if (ch === 'O') {
          const pillar = new THREE.Mesh(pillarGeo, pillarMat);
          pillar.position.set(cx, WALL_HEIGHT / 2, cz);
          scene.add(pillar);
        } else if (ch === 'P') {
          startX = cx;
          startZ = cz;
        } else if (ch === 'E') {
          spawnPickupSprite('energy', cx, cz);
        } else if (ch === 'S') {
          // Shell boxes do NOT spawn until the Queen of the Cells spawns!
        } else {
          const cfg = entityConfig(ch);
          if (cfg) {
            const smat = new THREE.SpriteMaterial({
              map: cfg.tex,
              transparent: true,
            });
            disposables.push(smat);
            const sprite = new THREE.Sprite(smat);
            sprite.scale.set(cfg.size, cfg.size, 1);
            sprite.position.set(cx, cfg.size * 0.52, cz);
            // Queen stays hidden & unspawned until ALL other entities are defeated!
            const isQueen = cfg.kind === 'queen';
            sprite.visible = !isQueen;
            scene.add(sprite);

            entities.push({
              id: `ent-${entitySeq++}`,
              kind: cfg.kind,
              label: cfg.label,
              x: cx,
              z: cz,
              hp: cfg.hp,
              maxHp: cfg.hp,
              speed: cfg.speed,
              alive: !isQueen,
              hitFlash: 0,
              mesh: sprite,
              bobOffset: entitySeq * 1.15,
            });
          }
        }
      }
    }

    // === PERMANENT 3D BIO-SYNTHESIS KEY MACHINE IN COURTYARD ===
    const machineGroup = new THREE.Group();
    const machBodyGeo = new THREE.BoxGeometry(1.8, 2.8, 1.4);
    const machBodyMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.4,
      metalness: 0.5,
    });
    const machScreenGeo = new THREE.BoxGeometry(0.14, 0.95, 1.0);
    const machScreenMat = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      emissive: 0x16a34a,
      emissiveIntensity: 0.9,
    });
    const machSlotGeo = new THREE.BoxGeometry(0.18, 0.25, 0.55);
    const machSlotMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0xeab308,
      emissiveIntensity: 1.1,
    });
    const machBeaconGeo = new THREE.OctahedronGeometry(0.35, 0);
    const machBeaconMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0xfacc15,
      emissiveIntensity: 1.2,
    });
    const machBody = new THREE.Mesh(machBodyGeo, machBodyMat);
    machBody.position.y = 1.4;
    const machScreen = new THREE.Mesh(machScreenGeo, machScreenMat);
    machScreen.position.set(-0.92, 1.9, 0);
    const machSlot = new THREE.Mesh(machSlotGeo, machSlotMat);
    machSlot.position.set(-0.94, 1.15, 0);
    const machBeacon = new THREE.Mesh(machBeaconGeo, machBeaconMat);
    machBeacon.position.set(0, 3.3, 0);
    const machLight = new THREE.PointLight(0x4ade80, 2.8, 12, 1.2);
    machLight.position.set(-1.4, 2.0, 0);
    machineGroup.add(machBody, machScreen, machSlot, machBeacon, machLight);
    machineGroup.position.set(MACHINE_X, 0, MACHINE_Z);
    scene.add(machineGroup);
    disposables.push(
      machBodyGeo,
      machBodyMat,
      machScreenGeo,
      machScreenMat,
      machSlotGeo,
      machSlotMat,
      machBeaconGeo,
      machBeaconMat
    );

    // === LIVE IN-WORLD 3D ARMORED CELL-CAR & GIANT EUKARYOTIC CELL ===
    const cellCarGroup = new THREE.Group();
    cellCarGroup.visible = false;
    scene.add(cellCarGroup);

    const chassisGeo = new THREE.BoxGeometry(4.4, 0.95, 2.2);
    const chassisMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.4,
      metalness: 0.6,
    });
    const chassis = new THREE.Mesh(chassisGeo, chassisMat);
    chassis.position.y = 0.82;
    cellCarGroup.add(chassis);

    const stripeGeo = new THREE.BoxGeometry(4.5, 0.22, 2.26);
    const stripeMat = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      emissive: 0x16a34a,
      emissiveIntensity: 0.7,
    });
    const stripe = new THREE.Mesh(stripeGeo, stripeMat);
    stripe.position.y = 0.88;
    cellCarGroup.add(stripe);

    const bumperGeo = new THREE.BoxGeometry(0.35, 0.72, 2.35);
    const bumperMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.85,
      roughness: 0.2,
    });
    const frontBumper = new THREE.Mesh(bumperGeo, bumperMat);
    frontBumper.position.set(2.3, 0.72, 0);
    cellCarGroup.add(frontBumper);

    const windGeo = new THREE.BoxGeometry(0.14, 0.75, 1.9);
    const windMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.55,
    });
    const wind = new THREE.Mesh(windGeo, windMat);
    wind.position.set(1.25, 1.55, 0);
    wind.rotation.z = 0.35;
    cellCarGroup.add(wind);

    const wheelGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.34, 12);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x090d14, roughness: 0.8 });
    const hubGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.38, 8);
    const hubMat = new THREE.MeshStandardMaterial({
      color: 0x4ade80,
      emissive: 0x15803d,
      emissiveIntensity: 0.6,
    });
    const wheelMeshes: THREE.Group[] = [];
    [
      [-1.4, -1.12],
      [-1.4, 1.12],
      [1.4, -1.12],
      [1.4, 1.12],
    ].forEach(([wx, wz]) => {
      const wg = new THREE.Group();
      const tire = new THREE.Mesh(wheelGeo, wheelMat);
      tire.rotation.x = Math.PI / 2;
      const hub = new THREE.Mesh(hubGeo, hubMat);
      hub.rotation.x = Math.PI / 2;
      wg.add(tire, hub);
      wg.position.set(wx, 0.48, wz);
      cellCarGroup.add(wg);
      wheelMeshes.push(wg);
    });

    const hlGeo = new THREE.BoxGeometry(0.14, 0.25, 0.35);
    const hlMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xfacc15,
      emissiveIntensity: 1.5,
    });
    const hl1 = new THREE.Mesh(hlGeo, hlMat);
    hl1.position.set(2.26, 0.95, -0.68);
    const hl2 = new THREE.Mesh(hlGeo, hlMat);
    hl2.position.set(2.26, 0.95, 0.68);
    const carHeadLight = new THREE.PointLight(0xfef08a, 4.5, 22, 1.1);
    carHeadLight.position.set(3.2, 1.2, 0);
    cellCarGroup.add(hl1, hl2, carHeadLight);

    const flameGeo = new THREE.ConeGeometry(0.4, 1.5, 8);
    const flameMat = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      emissive: 0xf97316,
      emissiveIntensity: 1.4,
    });
    const flameMesh = new THREE.Mesh(flameGeo, flameMat);
    flameMesh.rotation.z = Math.PI / 2;
    flameMesh.position.set(-2.95, 0.65, 0);
    cellCarGroup.add(flameMesh);

    const giantCellGroup = new THREE.Group();
    const membraneGeo = new THREE.SphereGeometry(1.18, 20, 16);
    const membraneMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 0.45,
      transparent: true,
      opacity: 0.72,
      roughness: 0.2,
    });
    const membrane = new THREE.Mesh(membraneGeo, membraneMat);
    const nucleusGeo = new THREE.SphereGeometry(0.46, 14, 12);
    const nucleusMat = new THREE.MeshStandardMaterial({
      color: 0x7c3aed,
      emissive: 0x6d28d9,
      emissiveIntensity: 0.7,
    });
    const nucleus = new THREE.Mesh(nucleusGeo, nucleusMat);
    nucleus.position.set(-0.15, 0.1, 0);
    const mitoGeo = new THREE.BoxGeometry(0.38, 0.2, 0.2);
    const mitoMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.6,
    });
    const mito1 = new THREE.Mesh(mitoGeo, mitoMat);
    mito1.position.set(0.48, 0.25, 0.32);
    const mito2 = new THREE.Mesh(mitoGeo, mitoMat);
    mito2.position.set(-0.4, -0.25, -0.35);
    giantCellGroup.add(membrane, nucleus, mito1, mito2);
    giantCellGroup.position.set(-0.1, 1.95, 0);
    cellCarGroup.add(giantCellGroup);

    // Floating Master 3D Double-Helix DNA dropped in front of player by rescue Cell!
    const dna3DGroup = new THREE.Group();
    const dnaStrandAGeo = new THREE.SphereGeometry(0.11, 10, 8);
    const dnaStrandAMat = new THREE.MeshStandardMaterial({
      color: 0x22d3ee,
      emissive: 0x06b6d4,
      emissiveIntensity: 1.25,
    });
    const dnaStrandBMat = new THREE.MeshStandardMaterial({
      color: 0x4ade80,
      emissive: 0x16a34a,
      emissiveIntensity: 1.25,
    });
    const dnaRungGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.68, 8);
    const dnaRungMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0xeab308,
      emissiveIntensity: 1.0,
    });
    for (let s = 0; s < 10; s++) {
      const yOff = (s - 4.5) * 0.16;
      const theta = s * 0.65;
      const rad = 0.34;
      const beadA = new THREE.Mesh(dnaStrandAGeo, dnaStrandAMat);
      beadA.position.set(Math.cos(theta) * rad, yOff, Math.sin(theta) * rad);
      const beadB = new THREE.Mesh(dnaStrandAGeo, dnaStrandBMat);
      beadB.position.set(-Math.cos(theta) * rad, yOff, -Math.sin(theta) * rad);
      dna3DGroup.add(beadA, beadB);
      if (s % 2 === 0) {
        const rung = new THREE.Mesh(dnaRungGeo, dnaRungMat);
        rung.position.y = yOff;
        rung.rotation.z = Math.PI / 2;
        rung.rotation.y = -theta;
        dna3DGroup.add(rung);
      }
    }
    const dnaDropLight = new THREE.PointLight(0x22d3ee, 3.8, 12, 1.1);
    dna3DGroup.add(dnaDropLight);
    dna3DGroup.visible = false;
    scene.add(dna3DGroup);

    // Ensure Cell Car parts never vanish due to frustum culling
    cellCarGroup.traverse((obj) => {
      obj.frustumCulled = false;
    });

    // === 3D SPINNING THROWABLE BIO-COMBAT KNIFE PROJECTILE ===
    const thrownKnifeGroup = new THREE.Group();
    const tBladeGeo = new THREE.BoxGeometry(0.11, 0.032, 0.56);
    const tBladeMat = new THREE.MeshStandardMaterial({
      color: 0xcbd5e1,
      metalness: 0.85,
      roughness: 0.2,
    });
    const tTipGeo = new THREE.ConeGeometry(0.06, 0.16, 4);
    const tTipMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      metalness: 0.9,
      roughness: 0.15,
    });
    const tPlasmaGeo = new THREE.BoxGeometry(0.125, 0.015, 0.44);
    const tPlasmaMat = new THREE.MeshStandardMaterial({
      color: 0x4ade80,
      emissive: 0x22c55e,
      emissiveIntensity: 1.5,
    });
    const tGuardGeo = new THREE.BoxGeometry(0.24, 0.05, 0.055);
    const tGuardMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      metalness: 0.7,
      roughness: 0.25,
    });
    const tGripGeo = new THREE.BoxGeometry(0.08, 0.042, 0.22);
    const tGripMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
    const tAuraGeo = new THREE.TorusGeometry(0.34, 0.018, 6, 18);
    const tAuraMat = new THREE.MeshBasicMaterial({
      color: 0x4ade80,
      transparent: true,
      opacity: 0.65,
    });

    const tBladeMesh = new THREE.Mesh(tBladeGeo, tBladeMat);
    tBladeMesh.position.z = -0.18;
    const tTipMesh = new THREE.Mesh(tTipGeo, tTipMat);
    tTipMesh.rotation.x = -Math.PI / 2;
    tTipMesh.position.z = -0.54;
    const tPlasmaMesh = new THREE.Mesh(tPlasmaGeo, tPlasmaMat);
    tPlasmaMesh.position.z = -0.18;
    const tGuardMesh = new THREE.Mesh(tGuardGeo, tGuardMat);
    tGuardMesh.position.z = 0.1;
    const tGripMesh = new THREE.Mesh(tGripGeo, tGripMat);
    tGripMesh.position.z = 0.22;
    const tAuraMesh = new THREE.Mesh(tAuraGeo, tAuraMat);
    tAuraMesh.rotation.x = Math.PI / 2;
    const tLight = new THREE.PointLight(0x4ade80, 1.9, 6.5, 1.2);

    thrownKnifeGroup.add(
      tBladeMesh,
      tTipMesh,
      tPlasmaMesh,
      tGuardMesh,
      tGripMesh,
      tAuraMesh,
      tLight
    );
    thrownKnifeGroup.visible = false;
    scene.add(thrownKnifeGroup);
    disposables.push(
      tBladeGeo,
      tBladeMat,
      tTipGeo,
      tTipMat,
      tPlasmaGeo,
      tPlasmaMat,
      tGuardGeo,
      tGuardMat,
      tGripGeo,
      tGripMat,
      tAuraGeo,
      tAuraMat
    );

    const debrisGeo = new THREE.BoxGeometry(0.55, 0.4, 0.55);
    const debrisMat = new THREE.MeshStandardMaterial({ map: textures.stoneWall, roughness: 0.9 });
    const wallDebris: Array<{ mesh: THREE.Mesh; vx: number; vy: number; vz: number }> = [];
    for (let i = 0; i < 16; i++) {
      const dm = new THREE.Mesh(debrisGeo, debrisMat);
      dm.visible = false;
      scene.add(dm);
      wallDebris.push({
        mesh: dm,
        vx: ((i % 5) - 2) * 3.0,
        vy: 3.5 + (i % 4) * 2.0,
        vz: ((i % 7) - 3) * 2.4,
      });
    }

    disposables.push(
      chassisGeo,
      chassisMat,
      stripeGeo,
      stripeMat,
      bumperGeo,
      bumperMat,
      windGeo,
      windMat,
      wheelGeo,
      wheelMat,
      hubGeo,
      hubMat,
      hlGeo,
      hlMat,
      flameGeo,
      flameMat,
      membraneGeo,
      membraneMat,
      nucleusGeo,
      nucleusMat,
      mitoGeo,
      mitoMat,
      dnaStrandAGeo,
      dnaStrandAMat,
      dnaStrandBMat,
      dnaRungGeo,
      dnaRungMat,
      debrisGeo,
      debrisMat
    );

    // === POOLED 3D BLOOD DROPLET SPLATTER KILL PARTICLES (Zero-GC in tick) ===
    const KILL_POOL_SLOTS = 5;
    const KILL_PARTICLES_PER_SLOT = 24;
    const killDropletGeo = new THREE.SphereGeometry(0.11, 6, 5);
    disposables.push(killDropletGeo);

    interface KillBurstSlot {
      active: boolean;
      age: number;
      maxAge: number;
      particles: Array<{
        mesh: THREE.Mesh;
        mat: THREE.MeshStandardMaterial;
        vx: number;
        vy: number;
        vz: number;
        baseScale: number;
      }>;
    }

    const killBurstPool: KillBurstSlot[] = [];
    for (let s = 0; s < KILL_POOL_SLOTS; s++) {
      const particles: KillBurstSlot['particles'] = [];
      for (let p = 0; p < KILL_PARTICLES_PER_SLOT; p++) {
        const pMat = new THREE.MeshStandardMaterial({
          color: 0xb91c1c,
          emissive: 0x450a0a,
          emissiveIntensity: 0.18,
          roughness: 0.25,
          transparent: true,
          opacity: 1,
        });
        disposables.push(pMat);
        const pm = new THREE.Mesh(killDropletGeo, pMat);
        pm.visible = false;
        scene.add(pm);
        particles.push({ mesh: pm, mat: pMat, vx: 0, vy: 0, vz: 0, baseScale: 1 });
      }

      killBurstPool.push({
        active: false,
        age: 0,
        maxAge: 0.9,
        particles,
      });
    }

    let nextKillSlotIdx = 0;
    spawnKillFxRef.current = (x: number, z: number, kind: EntityKind, viaKnife = false) => {
      const slot = killBurstPool[nextKillSlotIdx];
      nextKillSlotIdx = (nextKillSlotIdx + 1) % KILL_POOL_SLOTS;

      const isBoss = kind === 'queen';
      slot.active = true;
      slot.age = 0;
      slot.maxAge = isBoss ? 1.25 : 0.85;

      const bloodReds = [0x7f1d1d, 0x991b1b, 0xb91c1c, 0xdc2626, 0x881337];
      slot.particles.forEach((pt, idx) => {
        const ang = (idx / KILL_PARTICLES_PER_SLOT) * Math.PI * 2 + (idx % 3) * 0.24;
        const speed = (isBoss ? 5.8 : viaKnife ? 4.9 : 3.8) + (idx % 4) * 1.1;
        pt.vx = Math.cos(ang) * speed;
        pt.vz = Math.sin(ang) * speed;
        pt.vy = (isBoss ? 5.2 : viaKnife ? 4.5 : 3.6) + (idx % 5) * 0.85;
        const col = bloodReds[idx % bloodReds.length];
        pt.mat.color.setHex(col);
        pt.mat.emissive.setHex(0x450a0a);
        pt.mat.opacity = 0.96;
        pt.mesh.position.set(x, isBoss ? 1.45 : 0.9, z);
        pt.baseScale = isBoss ? 1.45 : 0.72 + (idx % 4) * 0.24;
        pt.mesh.scale.set(pt.baseScale, pt.baseScale * 1.25, pt.baseScale);
        pt.mesh.visible = true;
      });
    };

    // === 3D CURE GROW-BACK ENERGY RINGS (Ant-Man Reverse Scale-Up in 3D!) ===
    const cureAuraGroup = new THREE.Group();
    cureAuraGroup.visible = false;
    scene.add(cureAuraGroup);
    const cureRings: THREE.Mesh[] = [];
    const ringColors = [0xfb7185, 0x34d399, 0xfb923c, 0x22d3ee, 0xfacc15];
    const ringGeo = new THREE.TorusGeometry(2.2, 0.08, 10, 32);
    ringColors.forEach((col, i) => {
      const rMat = new THREE.MeshStandardMaterial({
        color: col,
        emissive: col,
        emissiveIntensity: 1.5,
      });
      disposables.push(rMat);
      const rm = new THREE.Mesh(ringGeo, rMat);
      rm.rotation.x = Math.PI / 2;
      rm.position.y = 0.6 + i * 1.1;
      cureAuraGroup.add(rm);
      cureRings.push(rm);
    });
    disposables.push(ringGeo);

    // === FULL 3D MODELED COLLEGE DORM ROOM (Interactive Hover & Exploration After Cure!) ===
    const dormRoomGroup = new THREE.Group();
    dormRoomGroup.position.set(DORM_OX, 0, DORM_OZ);
    scene.add(dormRoomGroup);

    interface DormMeshRecord {
      mesh: THREE.Mesh;
      mat: THREE.MeshStandardMaterial;
      baseEmissive: number;
      baseIntensity: number;
    }

    interface DormInteractable {
      id: string;
      title: string;
      subtitle: string;
      actionLabel: string;
      accentColor: number;
      accentHex: string;
      localCenter: [number, number, number];
      ringPos: [number, number, number];
      ringScale: number;
      range: number;
      hoverLerp: number;
      meshes: DormMeshRecord[];
    }

    const dormInteractables: DormInteractable[] = [];
    const dormInteractMeshes: THREE.Object3D[] = [];
    const dormInteractById = new Map<string, DormInteractable>();

    const registerDormInteractable = (cfg: {
      id: string;
      title: string;
      subtitle: string;
      actionLabel: string;
      accentColor: number;
      accentHex: string;
      localCenter: [number, number, number];
      ringPos: [number, number, number];
      ringScale: number;
      range: number;
    }): DormInteractable => {
      const item: DormInteractable = {
        ...cfg,
        hoverLerp: 0,
        meshes: [],
      };
      dormInteractables.push(item);
      dormInteractById.set(cfg.id, item);
      return item;
    };

    const attachInteractMesh = (
      item: DormInteractable,
      mesh: THREE.Mesh,
      baseEmissive: number,
      baseIntensity: number
    ) => {
      mesh.userData.dormInteractId = item.id;
      dormInteractMeshes.push(mesh);
      item.meshes.push({
        mesh,
        mat: mesh.material as THREE.MeshStandardMaterial,
        baseEmissive,
        baseIntensity,
      });
    };

    const addDormBox = (
      w: number,
      h: number,
      d: number,
      color: number,
      x: number,
      y: number,
      z: number,
      opts?: {
        emissive?: number;
        emissiveIntensity?: number;
        roughness?: number;
        metalness?: number;
        interactItem?: DormInteractable;
      }
    ) => {
      const baseEmissive = opts?.emissive ?? 0x000000;
      const baseIntensity = opts?.emissiveIntensity ?? 0;
      const geo = new THREE.BoxGeometry(w, h, d);
      const mat = new THREE.MeshStandardMaterial({
        color,
        roughness: opts?.roughness ?? 0.72,
        metalness: opts?.metalness ?? 0.08,
        emissive: baseEmissive,
        emissiveIntensity: baseIntensity,
      });
      disposables.push(geo, mat);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      dormRoomGroup.add(mesh);
      if (opts?.interactItem) {
        attachInteractMesh(opts.interactItem, mesh, baseEmissive, baseIntensity);
      }
      return mesh;
    };

    // Floor, Ceiling & Walls (13.6m x 11.6m x 4.6m)
    addDormBox(13.6, 0.2, 11.6, 0x7c4a26, 0, -0.1, 0, { roughness: 0.62 }); // Hardwood Floor
    addDormBox(13.6, 0.2, 11.6, 0xf1f5f9, 0, 4.7, 0, { roughness: 0.9 }); // Ceiling
    addDormBox(13.6, 4.6, 0.3, 0xdbeafe, 0, 2.3, -5.8); // North Wall
    addDormBox(13.6, 4.6, 0.3, 0xcbd5e1, 0, 2.3, 5.8); // South Wall
    addDormBox(0.3, 4.6, 11.6, 0xe2e8f0, -6.8, 2.3, 0); // West Wall
    addDormBox(0.3, 4.6, 11.6, 0xe2e8f0, 6.8, 2.3, 0); // East Wall

    // Cozy Emerald Dorm Rug in center
    addDormBox(5.2, 0.04, 3.8, 0x065f46, 0, 0.02, 0.4, { roughness: 0.95 });
    addDormBox(4.8, 0.05, 3.4, 0x059669, 0, 0.025, 0.4, { roughness: 0.95 });

    // Interactive Objects Registry
    const windowInteract = registerDormInteractable({
      id: 'window',
      title: 'Sunny Campus Window',
      subtitle: 'Fresh afternoon sunlight — back at full human scale!',
      actionLabel: 'Look Outside',
      accentColor: 0x38bdf8,
      accentHex: '#38BDF8',
      localCenter: [0, 2.55, -5.55],
      ringPos: [0, 0.06, -4.65],
      ringScale: 1.5,
      range: 5.2,
    });

    const bedInteract = registerDormInteractable({
      id: 'bed',
      title: 'Dormitory Bed',
      subtitle: 'Cozy emerald blanket — rest after defeating the bacteria.',
      actionLabel: 'Check Bed',
      accentColor: 0x34d399,
      accentHex: '#34D399',
      localCenter: [-4.3, 0.75, -2.5],
      ringPos: [-3.4, 0.06, -1.6],
      ringScale: 2.1,
      range: 4.6,
    });

    const lampInteract = registerDormInteractable({
      id: 'lamp',
      title: 'Bedside Study Lamp',
      subtitle: 'Warm study light next to your bed.',
      actionLabel: 'Toggle Lamp',
      accentColor: 0xfde047,
      accentHex: '#FDE047',
      localCenter: [-2.1, 1.3, -4.8],
      ringPos: [-2.1, 0.93, -4.8],
      ringScale: 0.75,
      range: 4.2,
    });

    const laptopInteract = registerDormInteractable({
      id: 'laptop',
      title: 'Proteome Atlas Laptop',
      subtitle: 'LO5 biology slides and protein comparison catalog open.',
      actionLabel: 'Inspect Laptop',
      accentColor: 0x22d3ee,
      accentHex: '#22D3EE',
      localCenter: [4.85, 1.48, -0.5],
      ringPos: [4.75, 1.27, -0.5],
      ringScale: 0.85,
      range: 4.2,
    });

    const mealInteract = registerDormInteractable({
      id: 'meal',
      title: 'Warm Protein-Rich Lunch',
      subtitle: 'The meal you skipped earlier — eat to finish your recovery!',
      actionLabel: 'Eat Meal · THE END',
      accentColor: 0x4ade80,
      accentHex: '#4ADE80',
      localCenter: [4.3, 1.45, 0.85],
      ringPos: [4.3, 1.27, 0.85],
      ringScale: 0.95,
      range: 4.2,
    });

    const bookshelfInteract = registerDormInteractable({
      id: 'bookshelf',
      title: 'Biology Bookshelf',
      subtitle: 'Molecular cell biology & protein folding reference volumes.',
      actionLabel: 'Browse Books',
      accentColor: 0xfbbf24,
      accentHex: '#FBBF24',
      localCenter: [5.4, 1.8, -4.4],
      ringPos: [4.7, 0.06, -4.0],
      ringScale: 1.5,
      range: 4.6,
    });

    const fridgeInteract = registerDormInteractable({
      id: 'fridge',
      title: 'Dorm Mini-Fridge',
      subtitle: 'Cold water & protein snacks to keep ATP levels high.',
      actionLabel: 'Check Fridge',
      accentColor: 0x60a5fa,
      accentHex: '#60A5FA',
      localCenter: [-5.5, 0.85, 3.6],
      ringPos: [-4.6, 0.06, 3.6],
      ringScale: 1.25,
      range: 4.2,
    });

    const posterInteract = registerDormInteractable({
      id: 'poster',
      title: 'LO5 Proteome Poster',
      subtitle: 'Hemoglobin, Collagen, Enzymes, Keratin & Chaperones.',
      actionLabel: 'Read Poster',
      accentColor: 0x10b981,
      accentHex: '#10B981',
      localCenter: [-6.5, 2.45, 0.4],
      ringPos: [-5.75, 0.06, 0.4],
      ringScale: 1.35,
      range: 4.5,
    });

    // Window on North Wall with Sunlight Sky View & Mullions
    addDormBox(3.8, 2.1, 0.16, 0x38bdf8, 0, 2.55, -5.62, {
      emissive: 0x0ea5e9,
      emissiveIntensity: 0.75,
      roughness: 0.15,
      interactItem: windowInteract,
    });
    addDormBox(4.0, 0.14, 0.22, 0x475569, 0, 3.62, -5.58, { interactItem: windowInteract });
    addDormBox(4.0, 0.14, 0.22, 0x475569, 0, 1.48, -5.58, { interactItem: windowInteract });
    addDormBox(0.14, 2.2, 0.22, 0x475569, 0, 2.55, -5.58, { interactItem: windowInteract });

    // College Bed (West Side)
    addDormBox(2.8, 0.45, 4.1, 0x5c3a21, -4.3, 0.35, -2.5, { interactItem: bedInteract });
    addDormBox(2.6, 0.38, 3.9, 0xf8fafc, -4.3, 0.72, -2.5, { interactItem: bedInteract });
    addDormBox(2.65, 0.22, 2.75, 0x10b981, -4.3, 0.9, -1.9, { interactItem: bedInteract });
    addDormBox(0.95, 0.22, 0.65, 0xffffff, -4.8, 1.0, -4.0, { interactItem: bedInteract });
    addDormBox(0.95, 0.22, 0.65, 0xffffff, -3.7, 1.0, -4.0, { interactItem: bedInteract });
    addDormBox(2.9, 1.45, 0.22, 0x451a03, -4.3, 0.72, -4.6, { interactItem: bedInteract });

    // Nightstand & Glowing Bedside Lamp
    addDormBox(1.1, 0.9, 1.0, 0x6b3e1f, -2.1, 0.45, -4.8);
    addDormBox(0.16, 0.42, 0.16, 0x94a3b8, -2.1, 1.1, -4.8, { interactItem: lampInteract });
    const lampShadeMesh = addDormBox(0.5, 0.38, 0.5, 0xfef08a, -2.1, 1.45, -4.8, {
      emissive: 0xfde047,
      emissiveIntensity: 1.15,
      interactItem: lampInteract,
    });

    // Study Desk + Open LO5 Laptop + Healthy Lunch Meal Plate (East Side!)
    addDormBox(2.1, 0.14, 3.3, 0x78350f, 4.4, 1.18, 0.4); // Desktop
    addDormBox(0.14, 1.15, 0.14, 0x334155, 3.45, 0.58, -1.1);
    addDormBox(0.14, 1.15, 0.14, 0x334155, 5.3, 0.58, -1.1);
    addDormBox(0.14, 1.15, 0.14, 0x334155, 3.45, 0.58, 1.9);
    addDormBox(0.14, 1.15, 0.14, 0x334155, 5.3, 0.58, 1.9);
    // Open Laptop displaying glowing green Proteome Atlas screen
    addDormBox(0.75, 0.06, 0.95, 0x1e293b, 4.7, 1.28, -0.5, {
      metalness: 0.5,
      interactItem: laptopInteract,
    });
    addDormBox(0.06, 0.62, 0.95, 0x064e3b, 5.05, 1.58, -0.5, {
      emissive: 0x22c55e,
      emissiveIntensity: 0.9,
      interactItem: laptopInteract,
    });
    // Desk Chair
    addDormBox(0.95, 0.12, 0.95, 0x0f172a, 2.75, 0.72, 0.3);
    addDormBox(0.14, 0.95, 0.88, 0x0f172a, 2.3, 1.2, 0.3);
    addDormBox(0.16, 0.7, 0.16, 0x64748b, 2.75, 0.35, 0.3);

    // The Meal He Missed Earlier — Now on His Desk!
    const mealPlateGeo = new THREE.CylinderGeometry(0.45, 0.38, 0.08, 16);
    const mealPlateMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25 });
    const mealFoodGeo = new THREE.SphereGeometry(0.24, 12, 10);
    const mealFoodMat = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      emissive: 0xea580c,
      emissiveIntensity: 0.25,
    });
    const mealGreenGeo = new THREE.SphereGeometry(0.16, 10, 8);
    const mealGreenMat = new THREE.MeshStandardMaterial({ color: 0x22c55e });
    const mealBeaconGeo = new THREE.OctahedronGeometry(0.24, 0);
    const mealBeaconMat = new THREE.MeshStandardMaterial({
      color: 0x4ade80,
      emissive: 0x22c55e,
      emissiveIntensity: 1.4,
    });
    disposables.push(
      mealPlateGeo,
      mealPlateMat,
      mealFoodGeo,
      mealFoodMat,
      mealGreenGeo,
      mealGreenMat,
      mealBeaconGeo,
      mealBeaconMat
    );
    const mealPlate = new THREE.Mesh(mealPlateGeo, mealPlateMat);
    mealPlate.position.set(4.3, 1.29, 0.85);
    const mealFood = new THREE.Mesh(mealFoodGeo, mealFoodMat);
    mealFood.scale.set(1.2, 0.55, 1.2);
    mealFood.position.set(4.25, 1.38, 0.8);
    const mealGreen = new THREE.Mesh(mealGreenGeo, mealGreenMat);
    mealGreen.position.set(4.42, 1.38, 0.98);
    const mealBeacon = new THREE.Mesh(mealBeaconGeo, mealBeaconMat);
    mealBeacon.position.set(4.3, 2.1, 0.85);
    dormRoomGroup.add(mealPlate, mealFood, mealGreen, mealBeacon);
    attachInteractMesh(mealInteract, mealPlate, 0x000000, 0);
    attachInteractMesh(mealInteract, mealFood, 0xea580c, 0.25);
    attachInteractMesh(mealInteract, mealGreen, 0x000000, 0);
    attachInteractMesh(mealInteract, mealBeacon, 0x22c55e, 1.4);

    // Tall Bookshelf with Textbooks (North-East)
    addDormBox(1.8, 3.1, 1.0, 0x451a03, 5.5, 1.55, -4.4, { interactItem: bookshelfInteract });
    [0xf43f5e, 0x22c55e, 0x3b82f6, 0xfacc15, 0xa855f7].forEach((bcol, idx) => {
      addDormBox(0.26, 0.52, 0.65, bcol, 4.9 + idx * 0.3, 1.95, -4.4, {
        interactItem: bookshelfInteract,
      });
    });

    // Mini-Fridge + Chrome Handle (South-West)
    addDormBox(1.2, 1.55, 1.2, 0x334155, -5.5, 0.78, 3.6, {
      metalness: 0.45,
      interactItem: fridgeInteract,
    });
    addDormBox(0.08, 0.48, 0.08, 0xe2e8f0, -4.88, 1.05, 3.18, {
      metalness: 0.85,
      roughness: 0.2,
      interactItem: fridgeInteract,
    });

    // Framed LO5 Proteome Wall Poster (West Wall)
    addDormBox(0.08, 1.5, 2.4, 0x064e3b, -6.6, 2.45, 0.4, {
      emissive: 0x10b981,
      emissiveIntensity: 0.45,
      interactItem: posterInteract,
    });

    // 6 Framed Photo Wall Posters inside the Main Character's 3D Dorm Room
    const dormPhotoLoader = new THREE.TextureLoader();
    const maxPhotoAniso = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    const dormPhotoById = new Map<string, DormPhotoPosterConfig>();

    DORM_PHOTO_POSTERS.forEach((cfg) => {
      dormPhotoById.set(cfg.id, cfg);
      const [pw, ph] = cfg.size;
      const [px, py, pz] = cfg.pos;

      const rotY =
        cfg.wall === 'west' ? Math.PI / 2 : cfg.wall === 'east' ? -Math.PI / 2 : 0;
      const nx = cfg.wall === 'west' ? 1 : cfg.wall === 'east' ? -1 : 0;
      const nz = cfg.wall === 'north' ? 1 : 0;

      const ringDist = 0.85;
      const posterItem = registerDormInteractable({
        id: cfg.id,
        title: cfg.title,
        subtitle: cfg.subtitle,
        actionLabel: 'View Poster',
        accentColor: cfg.accentColor,
        accentHex: cfg.accentHex,
        localCenter: [px, py, pz],
        ringPos: [px + nx * ringDist, 0.06, pz + nz * ringDist],
        ringScale: 1.25,
        range: 5.0,
      });

      const frameGeo = new THREE.BoxGeometry(pw + 0.16, ph + 0.16, 0.07);
      const frameMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.45,
        metalness: 0.25,
        emissive: 0x000000,
        emissiveIntensity: 0,
      });
      disposables.push(frameGeo, frameMat);
      const frameMesh = new THREE.Mesh(frameGeo, frameMat);
      frameMesh.position.set(px, py, pz);
      frameMesh.rotation.y = rotY;
      dormRoomGroup.add(frameMesh);
      attachInteractMesh(posterItem, frameMesh, 0x000000, 0);

      const photoTex = dormPhotoLoader.load(cfg.url);
      photoTex.colorSpace = THREE.SRGBColorSpace;
      photoTex.anisotropy = maxPhotoAniso;
      disposables.push(photoTex);

      const photoGeo = new THREE.PlaneGeometry(pw, ph);
      const photoMat = new THREE.MeshStandardMaterial({
        map: photoTex,
        roughness: 0.45,
        metalness: 0.02,
        emissive: 0xffffff,
        emissiveMap: photoTex,
        emissiveIntensity: 0.22,
      });
      disposables.push(photoGeo, photoMat);

      const photoMesh = new THREE.Mesh(photoGeo, photoMat);
      photoMesh.position.set(px + nx * 0.045, py, pz + nz * 0.045);
      photoMesh.rotation.y = rotY;
      photoMesh.userData.dormInteractId = posterItem.id;
      dormInteractMeshes.push(photoMesh);
      dormRoomGroup.add(photoMesh);
    });

    // 3D Interactive Hover Highlight Ring for Dorm Room Objects
    const dormHoverRingGeo = new THREE.RingGeometry(0.62, 0.85, 32);
    const dormHoverRingMat = new THREE.MeshBasicMaterial({
      color: 0x4ade80,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    disposables.push(dormHoverRingGeo, dormHoverRingMat);
    const dormHoverRing = new THREE.Mesh(dormHoverRingGeo, dormHoverRingMat);
    dormHoverRing.rotation.x = -Math.PI / 2;
    dormHoverRing.visible = false;
    dormRoomGroup.add(dormHoverRing);

    // Dorm Lights (Bright Ceiling Fixture + Window Sun Fill + Toggleable Desk Lamp)
    const dormCeilingFixture = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55, 0.55, 0.14, 16),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xfef9c3,
        emissiveIntensity: 1.5,
      })
    );
    dormCeilingFixture.position.set(0, 4.52, 0);
    dormRoomGroup.add(dormCeilingFixture);
    disposables.push(dormCeilingFixture.geometry, dormCeilingFixture.material as THREE.Material);

    const dormCeilingLight = new THREE.PointLight(0xfffbeb, 5.5, 28, 1.0);
    dormCeilingLight.position.set(0, 4.1, 0);
    const dormWindowLight = new THREE.PointLight(0x7dd3fc, 4.2, 22, 1.0);
    dormWindowLight.position.set(0, 2.6, -4.4);
    const dormLampLight = new THREE.PointLight(0xfde047, 2.8, 12, 1.2);
    dormLampLight.position.set(-2.1, 1.85, -4.8);
    dormRoomGroup.add(dormCeilingLight, dormWindowLight, dormLampLight);

    let dormLampOn = true;
    let activeDormHoverId: string | null = null;

    const triggerDormInteraction = (id: string) => {
      const item = dormInteractById.get(id);
      if (!item) return;

      if (id === 'meal') {
        playPickupSound();
        handleEnterTheEnd();
        return;
      }

      if (id === 'lamp') {
        dormLampOn = !dormLampOn;
        dormLampLight.intensity = dormLampOn ? 2.8 : 0;
        const lampShadeRec = item.meshes.find((m) => m.mesh === lampShadeMesh);
        if (lampShadeRec) {
          lampShadeRec.baseIntensity = dormLampOn ? 1.15 : 0.05;
        }
        playCutsceneBlipSound();
        setDormToast({
          text: dormLampOn
            ? 'Bedside Lamp switched ON — warm study glow active.'
            : 'Bedside Lamp switched OFF.',
          accent: item.accentHex,
        });
        return;
      }

      const photoCfg = dormPhotoById.get(id);
      if (photoCfg) {
        playCutsceneBlipSound();
        setInspectedDormPhoto(photoCfg);
        setDormToast({
          text: `${photoCfg.title} — ${photoCfg.subtitle}`,
          accent: item.accentHex,
        });
        return;
      }

      playPickupSound();
      const messages: Record<string, string> = {
        laptop:
          'Proteome Atlas Laptop: All 5 LO5 protein classes verified (Hemoglobin, Collagen, Enzymes, Keratin, Chaperone)!',
        bed: 'Dormitory Bed: Safe at normal size — no more mutant bacteria chases tonight!',
        bookshelf:
          'Biology Bookshelf: Reviewed primary through quaternary protein folding structures.',
        fridge:
          'Mini-Fridge: Cold water & amino-acid fuel ready — stay energized while studying!',
        poster:
          'LO5 Poster: Structure, catalysis, transport & regulation all depend on folded proteins.',
        window:
          'Campus Window: Bright afternoon daylight confirms the protein cure worked completely!',
      };
      setDormToast({
        text: messages[id] ?? item.subtitle,
        accent: item.accentHex,
      });
    };
    dormInteractTriggerRef.current = triggerDormInteraction;

    // Pre-allocated raycaster & vectors for zero-GC Dorm Room hover detection
    const dormRaycaster = new THREE.Raycaster();
    const dormMouseNdc = new THREE.Vector2(0, 0);
    const _hoverTintColor = new THREE.Color();
    const _baseTintColor = new THREE.Color();

    // Reset state on new run (NO shell ammo or drops until Queen spawns!)
    const g = gameRef.current;
    g.playerX = startX;
    g.playerZ = startZ;
    g.playerYaw = 0;
    g.health = 100;
    g.energy = 100;
    g.activeWeapon = 'shotgun';
    g.knifeSwing = 0;
    g.knifeCooldown = 0;
    g.knifeThrown = false;
    g.knifeThrowPhase = 'none';
    g.knifeTimer = 0;
    g.knifeHitIds.clear();
    g.ammoActive = false;
    g.magAmmo = 0;
    g.reserveShells = 0;
    g.reloadTimer = 0;
    g.reloadCount = 0;
    g.recoil = 0;
    g.walkBobPhase = 0;
    g.hurtFlash = 0;
    g.grinTimer = 0;
    g.heartbeatTimer = 0.4;
    g.heartbeatIntensity = 0;
    g.heartbeatPulse = 0;
    g.heartBpm = 68;
    g.nearestEnemyDist = 99;
    g.paused = false;
    g.weaponUnlocked = false;
    g.queenSpawned = false;
    g.queenGrabCooldown = 0;
    g.queenGrabCount = 0;
    g.hasMasterDna = false;
    g.carPhase = 'idle';
    g.carX = -10;
    g.carZ = LANE_Z;
    g.carTargetX = startX;
    g.carTargetZ = startZ - 4.4;
    g.carAngle = 0;
    g.carTimer = 0;
    g.carBreachedDebris = false;
    g.randomShellTimer = 0;
    g.entities = entities;
    g.pickups = pickups;
    g.keys.clear();
    g.elapsedSec = 0;
    g.cureTimer = 0;
    g.dormInitialized = false;
    g.outcome = 'playing';
    g.statusLine =
      'SHOTGUN LOCKED — PRESS [1] FOR BIO-KNIFE OR FACE A PROTEIN QUIZ TO UNLOCK SHOTGUN!';
    syncHudFromRef();

    // Focus viewport container immediately so WASD works without requiring a canvas click first
    focusGameViewport();

    // Controls (shared between Bio-Doom Combat & 3D Dorm Room Exploration!)
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (g.paused) return;

      const kl = normalizeGameKey(e);
      if (g.outcome === 'dorm-room') {
        if (kl === 'escape') {
          setInspectedDormPhoto(null);
          focusGameViewport();
          return;
        }
        if (kl === 'enter' || kl === 'f') {
          e.preventDefault();
          if (activeDormHoverId) {
            triggerDormInteraction(activeDormHoverId);
          } else {
            handleEnterTheEnd();
          }
          return;
        }
        if (
          kl === 'w' ||
          kl === 'a' ||
          kl === 's' ||
          kl === 'd' ||
          kl === 'q' ||
          kl === 'e' ||
          kl === 'arrowup' ||
          kl === 'arrowdown' ||
          kl === 'arrowleft' ||
          kl === 'arrowright' ||
          kl === ' '
        ) {
          e.preventDefault();
        }
        g.keys.add(kl);
        return;
      }

      if (g.outcome !== 'playing') return;

      if (kl === 'escape' && bigMapOpenRef.current) {
        e.preventDefault();
        setBigMapOpen(false);
        focusGameViewport();
        return;
      }
      if (kl === '1' || kl === 'k' || kl === 'v') {
        e.preventDefault();
        switchWeapon('knife');
        return;
      }
      if (kl === '2') {
        e.preventDefault();
        switchWeapon('shotgun');
        return;
      }
      if (kl === 'x') {
        e.preventDefault();
        switchWeapon(g.activeWeapon === 'knife' ? 'shotgun' : 'knife');
        return;
      }
      if (kl === 'm' || kl === 'tab') {
        e.preventDefault();
        setBigMapOpen((prev) => !prev);
        return;
      }
      if (kl === 'r') {
        e.preventDefault();
        triggerReload();
        return;
      }
      if (kl === 'g' || kl === 't') {
        e.preventDefault();
        throwKnife();
        return;
      }
      if (kl === ' ' || kl === 'f') {
        e.preventDefault();
        fireShotgun();
        return;
      }
      if (
        kl === 'w' ||
        kl === 'a' ||
        kl === 's' ||
        kl === 'd' ||
        kl === 'q' ||
        kl === 'e' ||
        kl === 'arrowup' ||
        kl === 'arrowdown' ||
        kl === 'arrowleft' ||
        kl === 'arrowright'
      ) {
        e.preventDefault();
      }
      g.keys.add(kl);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      g.keys.delete(normalizeGameKey(e));
      g.keys.delete(e.key.toLowerCase());
    };
    const clearHeldKeys = () => {
      g.keys.clear();
    };
    const onVisibilityChange = () => {
      if (document.hidden) {
        g.keys.clear();
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (g.paused || g.outcome !== 'playing') return;
      if (Math.abs(e.deltaY) > 4) {
        switchWeapon(g.activeWeapon === 'knife' ? 'shotgun' : 'knife');
      }
    };

    let dragTurning = false;
    let lastClientX = 0;

    const onMouseDown = (e: MouseEvent) => {
      focusGameViewport();
      if (g.paused || (g.outcome !== 'playing' && g.outcome !== 'dorm-room')) return;

      // In Dorm Room: clicking a hovered 3D object triggers its interaction directly!
      if (g.outcome === 'dorm-room' && e.button === 0) {
        if (activeDormHoverId) {
          triggerDormInteraction(activeDormHoverId);
          return;
        }
        dragTurning = true;
        lastClientX = e.clientX;
        return;
      }

      if (document.pointerLockElement !== renderer.domElement) {
        try {
          renderer.domElement.requestPointerLock?.();
        } catch {
          // Iframe drag fallback
        }
      }
      if (e.button === 0) {
        if (g.outcome === 'playing') {
          fireShotgun();
        }
        dragTurning = true;
        lastClientX = e.clientX;
      } else if (e.button === 2 && g.outcome === 'playing' && g.activeWeapon === 'knife') {
        e.preventDefault();
        throwKnife();
      }
    };
    const onMouseUp = () => {
      dragTurning = false;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (g.paused || (g.outcome !== 'playing' && g.outcome !== 'dorm-room')) return;
      if (document.pointerLockElement === renderer.domElement) {
        g.playerYaw -= e.movementX * 0.0032;
        dormMouseNdc.set(0, 0);
      } else {
        if (g.outcome === 'dorm-room') {
          const rect = renderer.domElement.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            dormMouseNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            dormMouseNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
          }
        }
        if (dragTurning) {
          const dx = e.clientX - lastClientX;
          lastClientX = e.clientX;
          g.playerYaw -= dx * 0.0055;
        }
      }
    };
    const onPointerLockChange = () => {
      setPointerLocked(document.pointerLockElement === renderer.domElement);
    };

    window.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('keyup', onKeyUp, true);
    window.addEventListener('blur', clearHeldKeys);
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('mouseup', onMouseUp);
    document.addEventListener('pointerlockchange', onPointerLockChange);
    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('mousemove', onMouseMove);

    const canOccupy = (x: number, z: number, radius = 0.62) => {
      const checks: Array<[number, number]> = [
        [x - radius, z - radius],
        [x + radius, z - radius],
        [x - radius, z + radius],
        [x + radius, z + radius],
      ];
      for (const [cx, cz] of checks) {
        const [col, row] = worldToTile(cx, cz);
        if (isWallTile(col, row)) return false;
      }
      if (Math.hypot(x - MACHINE_X, z - MACHINE_Z) < 1.25) return false;
      return true;
    };

    const canOccupyDorm = (x: number, z: number) => {
      const lx = x - DORM_OX;
      const lz = z - DORM_OZ;
      // Room interior perimeter
      if (lx < -6.0 || lx > 6.0 || lz < -5.0 || lz > 5.0) return false;
      // Bed footprint
      if (lx > -5.9 && lx < -2.4 && lz > -4.9 && lz < -0.2) return false;
      // Nightstand footprint
      if (lx > -2.8 && lx < -1.3 && lz > -5.5 && lz < -4.0) return false;
      // Study desk & chair footprint
      if (lx > 2.6 && lx < 6.0 && lz > -1.5 && lz < 2.3) return false;
      // Bookshelf footprint
      if (lx > 4.2 && lx < 6.3 && lz > -5.5 && lz < -3.4) return false;
      // Mini-fridge footprint
      if (lx > -6.3 && lx < -4.4 && lz > 2.6 && lz < 4.5) return false;
      return true;
    };

    const drawMapToCanvas = (canvas: HTMLCanvasElement | null, fullSize: boolean) => {
      if (!canvas) return;
      const cellPx = fullSize ? 18 : 7;
      const w = GRID_COLS * cellPx;
      const h = GRID_ROWS * cellPx;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.fillStyle = '#030806';
      ctx.fillRect(0, 0, w, h);

      for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
          const ch = LEVEL_GRID[r][c];
          if (ch === '#' || ch === '=' || ch === 'O' || ch === 'Q') {
            ctx.fillStyle =
              ch === 'Q'
                ? '#9d174d'
                : ch === '='
                ? '#166534'
                : ch === 'O'
                ? '#78716c'
                : '#334155';
            ctx.fillRect(
              c * cellPx,
              r * cellPx,
              Math.max(1, cellPx - 1),
              Math.max(1, cellPx - 1)
            );
          } else {
            ctx.fillStyle = '#091510';
            ctx.fillRect(c * cellPx, r * cellPx, cellPx, cellPx);
          }
        }
      }

      // Draw 3D Bio-Machine position
      const mx = (MACHINE_X / TILE_SIZE) * cellPx;
      const mz = (MACHINE_Z / TILE_SIZE) * cellPx;
      ctx.fillStyle = g.hasMasterDna ? '#22d3ee' : '#4ade80';
      const ms = fullSize ? 10 : 5;
      ctx.fillRect(mx - ms / 2, mz - ms / 2, ms, ms);

      // Draw ATP Energy & Shotgun Shells pickups
      for (const pk of g.pickups) {
        if (pk.collected) continue;
        ctx.fillStyle = pk.kind === 'shells' ? '#ef4444' : '#86efac';
        const px = (pk.x / TILE_SIZE) * cellPx;
        const pz = (pk.z / TILE_SIZE) * cellPx;
        ctx.fillRect(px - 1.5, pz - 1.5, 3, 3);
      }

      // Draw Live Cell Car if driving inside arena
      if (g.carPhase !== 'idle') {
        const cx = (g.carX / TILE_SIZE) * cellPx;
        const cz = (g.carZ / TILE_SIZE) * cellPx;
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(cx - 4, cz - 3, 8, 6);
      }

      // Draw Alive Entities
      for (const ent of g.entities) {
        if (!ent.alive) continue;
        const ex = (ent.x / TILE_SIZE) * cellPx;
        const ez = (ent.z / TILE_SIZE) * cellPx;
        ctx.fillStyle =
          ent.kind === 'queen'
            ? '#facc15'
            : ent.kind === 'bacteriaGreen'
            ? '#22c55e'
            : ent.kind === 'bacteriaRed'
            ? '#ef4444'
            : ent.kind === 'bacteriaPurple'
            ? '#c084fc'
            : ent.kind === 'bacteriaAmber'
            ? '#f59e0b'
            : ent.kind === 'protein'
            ? '#fb923c'
            : '#38bdf8';
        const rad = ent.kind === 'queen' ? (fullSize ? 6 : 3.5) : fullSize ? 4 : 2.2;
        ctx.beginPath();
        ctx.arc(ex, ez, rad, 0, Math.PI * 2);
        ctx.fill();
      }

      // Player & Look Cone
      const plx = (g.playerX / TILE_SIZE) * cellPx;
      const plz = (g.playerZ / TILE_SIZE) * cellPx;
      const dirX = -Math.sin(g.playerYaw);
      const dirZ = -Math.cos(g.playerYaw);

      ctx.strokeStyle = '#ecfdef';
      ctx.lineWidth = fullSize ? 2.5 : 1.5;
      ctx.beginPath();
      ctx.moveTo(plx, plz);
      ctx.lineTo(plx + dirX * cellPx * 1.6, plz + dirZ * cellPx * 1.6);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(plx, plz, fullSize ? 4.5 : 2.6, 0, Math.PI * 2);
      ctx.fill();
    };

    const clock = new THREE.Clock();
    let frameId = 0;
    let hudSyncTimer = 0;
    let disposed = false;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || typeof gl.fenceSync !== 'function') {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const st = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (st === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    const triggerEntityAmbush = (ent: GameEntity) => {
      g.paused = true;
      g.keys.clear();
      if (document.pointerLockElement) {
        document.exitPointerLock();
      }
      const q =
        BIO_QUIZ_QUESTIONS[g.questionCursor % BIO_QUIZ_QUESTIONS.length];
      g.questionCursor += 1;
      playQuizAmbushSound();
      setQuizSecondsLeft(QUIZ_TIME_LIMIT);
      setActiveAmbush({
        entityId: ent.id,
        kind: ent.kind,
        label: ent.label,
        question: q,
      });
      syncHudFromRef();
    };

    const triggerQueenHandsGrab = () => {
      g.paused = true;
      g.keys.clear();
      if (document.pointerLockElement) {
        document.exitPointerLock();
      }
      const nextWordIdx = g.queenGrabCount % FAST_PROTEIN_TARGETS.length;
      g.queenGrabCount += 1;
      playQueenSpawnSound();
      setProteinStepIdx(nextWordIdx);
      setProteinTyped('');
      setGrabSecondsLeft(QUEEN_GRAB_TIME_LIMIT);
      setQueenGrabActive(true);
      syncHudFromRef();
    };

    function tick() {
      if (disposed) return;
      const dt = Math.min(clock.getDelta(), 0.05);

      if (!g.paused && g.outcome === 'playing') {
        g.elapsedSec += dt;
        // Super snappy recoil & knife slash recovery
        g.recoil = Math.max(0, g.recoil - dt * 9.2);
        g.knifeSwing = Math.max(0, g.knifeSwing - dt * 4.4);
        g.knifeCooldown = Math.max(0, g.knifeCooldown - dt);
        g.hurtFlash = Math.max(0, g.hurtFlash - dt * 2.5);
        g.grinTimer = Math.max(0, g.grinTimer - dt);
        g.queenGrabCooldown = Math.max(0, g.queenGrabCooldown - dt);
        g.heartbeatPulse = Math.max(0, g.heartbeatPulse - dt * 3.4);

        // Complete Shotgun Reload Animation
        if (g.reloadTimer > 0) {
          g.reloadTimer = Math.max(0, g.reloadTimer - dt);
          if (g.reloadTimer === 0) {
            const needed = MAG_CAPACITY - g.magAmmo;
            const take = Math.min(needed, g.reserveShells);
            g.magAmmo += take;
            g.reserveShells -= take;
            g.statusLine = `RELOADED! ${g.magAmmo}/${MAG_CAPACITY} SHELLS READY — SHOOT FREELY!`;
            syncHudFromRef();
          }
        }

        // Spawn Random Shotgun Shell Boxes ONLY AFTER Queen Spawns!
        if (g.queenSpawned && g.ammoActive) {
          g.randomShellTimer += dt;
          if (g.randomShellTimer >= 3.6) {
            g.randomShellTimer = 0;
            const activeShellBoxes = g.pickups.filter(
              (p) => !p.collected && p.kind === 'shells'
            ).length;
            if (activeShellBoxes < 12 && OPEN_FLOOR_TILES.length > 0) {
              const [rc, rr] =
                OPEN_FLOOR_TILES[
                  Math.floor(Math.random() * OPEN_FLOOR_TILES.length)
                ];
              const [sx, sz] = tileCenter(rc, rr);
              spawnPickupSprite('shells', sx, sz);
            }
          }
        }

        // Animate Courtyard 3D Bio-Machine Beacon
        machBeacon.rotation.y += dt * (g.hasMasterDna ? 4.2 : 1.5);
        machBeacon.position.y = 3.25 + Math.sin(g.elapsedSec * 4) * 0.16;
        machLight.color.setHex(g.hasMasterDna ? 0x22d3ee : 0x4ade80);
        machLight.intensity = g.hasMasterDna ? 4.8 : 2.2;

        // If holding Master DNA, walking up to the 3D Machine opens Bio-Synthesis UI (Six Days keeps playing!)
        if (
          g.hasMasterDna &&
          Math.hypot(g.playerX - MACHINE_X, g.playerZ - MACHINE_Z) <= 2.75
        ) {
          g.paused = true;
          g.keys.clear();
          g.outcome = 'victory';
          if (document.pointerLockElement) {
            document.exitPointerLock();
          }
          setGameOutcome('victory');
          syncHudFromRef();
        }

        // === LIVE IN-GAME 3D CELL-DRIVEN CAR: MODERATE SPEED, IN FRONT OF YOUR VISION, LONGER, DELIVERS 3D DNA ===
        if (g.carPhase !== 'idle') {
          cellCarGroup.visible = true;
          g.carTimer += dt;
          giantCellGroup.rotation.y += dt * 1.8;

          const curLookX = -Math.sin(g.playerYaw);
          const curLookZ = -Math.cos(g.playerYaw);

          // Gently turn camera angle toward the car so it always rolls clearly inside your vision!
          const toCarX = g.carX - g.playerX;
          const toCarZ = g.carZ - g.playerZ;
          const toCarDist = Math.max(0.1, Math.hypot(toCarX, toCarZ));
          if (g.carPhase === 'approach' || g.carPhase === 'deliver') {
            const desiredYaw = Math.atan2(-toCarX, -toCarZ);
            let yawDiff = desiredYaw - g.playerYaw;
            while (yawDiff > Math.PI) yawDiff -= Math.PI * 2;
            while (yawDiff < -Math.PI) yawDiff += Math.PI * 2;
            g.playerYaw += yawDiff * Math.min(1, dt * 3.2);
          }

          if (g.carPhase === 'approach') {
            // Update stop point dynamically to stay 4.3 units straight in front of player
            g.carTargetX = g.playerX + curLookX * 4.3;
            g.carTargetZ = g.playerZ + curLookZ * 4.3;
            const dxTarget = g.carTargetX - g.carX;
            const dzTarget = g.carTargetZ - g.carZ;
            const distTarget = Math.hypot(dxTarget, dzTarget);

            if (distTarget > 0.35 && toCarDist > 4.2 && g.carTimer < 4.5) {
              // Moderate watchable driving speed (~5.0 units/sec!)
              const speed = 5.0 * dt;
              g.carX += (dxTarget / distTarget) * speed;
              g.carZ += (dzTarget / distTarget) * speed;
              g.carAngle = Math.atan2(-dzTarget, dxTarget);
              wheelMeshes.forEach((wg) => {
                wg.rotation.z -= dt * 8;
              });
              flameMesh.visible = true;

              // Smash any interior walls directly along the car's path so it is always visible!
              const [carCol, carRow] = worldToTile(g.carX, g.carZ);
              for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                  const wk = `${carCol + dc},${carRow + dr}`;
                  const wm = wallMeshMap.get(wk);
                  if (wm && wm.visible) {
                    wm.visible = false;
                    playWallCrashSound();
                  }
                }
              }

              if (toCarDist < 12.0 && !g.carBreachedDebris) {
                g.carBreachedDebris = true;
                playWallCrashSound();
                wallDebris.forEach((d, idx) => {
                  d.mesh.visible = true;
                  d.mesh.position.set(
                    g.carX + ((idx % 3) - 1) * 0.6,
                    0.8 + (idx % 4) * 0.55,
                    g.carZ + ((idx % 3) - 1) * 0.6
                  );
                });
              }
            } else {
              // Arrived directly in front of player -> Deploy glowing 3D Double-Helix DNA!
              g.carPhase = 'deliver';
              g.carTimer = 0;
              flameMesh.visible = false;
              dna3DGroup.visible = true;
              dna3DGroup.position.set(
                (g.carX + g.playerX) * 0.5,
                1.48,
                (g.carZ + g.playerZ) * 0.5
              );
              playCutsceneBlipSound();
              g.statusLine =
                'THE GIANT CELL EXTENDED THE MASTER 3D DNA RIGHT IN FRONT OF YOU — GRAB IT!';
              syncHudFromRef();
            }
          } else if (g.carPhase === 'deliver') {
            dna3DGroup.rotation.y += dt * 3.8;
            dna3DGroup.rotation.z = Math.sin(g.elapsedSec * 2.5) * 0.16;
            dna3DGroup.position.set(
              (g.carX + g.playerX) * 0.5,
              1.48 + Math.sin(g.elapsedSec * 4) * 0.16,
              (g.carZ + g.playerZ) * 0.5
            );
            const dnaDist = Math.hypot(
              g.playerX - dna3DGroup.position.x,
              g.playerZ - dna3DGroup.position.z
            );
            // Collect DNA up close OR auto-deliver after 4.8s so player admires the Giant Cell + DNA!
            if ((dnaDist < 2.2 && g.carTimer >= 1.8) || g.carTimer >= 4.8) {
              dna3DGroup.visible = false;
              g.hasMasterDna = true;
              g.carPhase = 'depart';
              g.carTimer = 0;
              playPickupSound();
              g.statusLine =
                'MASTER DNA ACQUIRED! WALK INTO THE GLOWING 3D BIO-MACHINE ON THE EAST SIDE!';
              syncHudFromRef();
            }
          } else if (g.carPhase === 'depart') {
            flameMesh.visible = true;
            // Longer 5.2s smooth departure revving up slowly as the car drives off
            const depSpeed = (3.0 + Math.min(7.0, g.carTimer * 1.4)) * dt;
            g.carX += Math.cos(g.carAngle) * depSpeed;
            g.carZ -= Math.sin(g.carAngle) * depSpeed;
            wheelMeshes.forEach((wg) => {
              wg.rotation.z -= dt * 12;
            });

            if (g.carTimer >= 5.2) {
              g.carPhase = 'idle';
              cellCarGroup.visible = false;
              // Keep Six Days soundtrack continuing smoothly!
              syncHudFromRef();
            }
          }

          cellCarGroup.position.set(g.carX, 0, g.carZ);
          cellCarGroup.rotation.y = g.carAngle;
        }

        if (g.carBreachedDebris) {
          wallDebris.forEach((d) => {
            if (!d.mesh.visible) return;
            d.mesh.position.x += d.vx * dt;
            d.mesh.position.y = Math.max(0.2, d.mesh.position.y + d.vy * dt);
            d.vy -= 14 * dt;
            d.mesh.position.z += d.vz * dt;
            d.mesh.rotation.x += dt * 5;
            d.mesh.rotation.y += dt * 4;
          });
        }

        // Orbit the 5 Protein Jewels around the Queen once spawned
        const queenEnt = g.entities.find((e) => e.kind === 'queen');
        keyOrbMeshes.forEach((orb, idx) => {
          if (g.queenSpawned && queenEnt && queenEnt.alive) {
            orb.visible = true;
            const ang = (idx / 5) * Math.PI * 2 + g.elapsedSec * 1.9;
            orb.position.set(
              queenEnt.x + Math.cos(ang) * 2.1,
              2.35 + Math.sin(g.elapsedSec * 4 + idx) * 0.16,
              queenEnt.z + Math.sin(ang) * 2.1
            );
            orb.rotation.y += dt * 2.5;
          } else {
            orb.visible = false;
          }
        });

        // Turn controls
        const turnSpeed = 2.45;
        if (g.keys.has('arrowleft') || g.keys.has('q')) {
          g.playerYaw += turnSpeed * dt;
        }
        if (g.keys.has('arrowright') || g.keys.has('e')) {
          g.playerYaw -= turnSpeed * dt;
        }

        // Move controls + Shift Sprint
        let moveF = 0;
        let moveS = 0;
        if (g.keys.has('w') || g.keys.has('arrowup')) moveF += 1;
        if (g.keys.has('s') || g.keys.has('arrowdown')) moveF -= 1;
        if (g.keys.has('a')) moveS -= 1;
        if (g.keys.has('d')) moveS += 1;

        const isSprinting = g.keys.has('shift');

        if (moveF !== 0 || moveS !== 0) {
          const len = Math.hypot(moveF, moveS);
          const nf = moveF / len;
          const ns = moveS / len;
          const moveSpeed = (isSprinting ? 11.4 : 6.8) * dt;

          const fwdX = -Math.sin(g.playerYaw);
          const fwdZ = -Math.cos(g.playerYaw);
          const rightX = Math.cos(g.playerYaw);
          const rightZ = -Math.sin(g.playerYaw);

          const dx = (fwdX * nf + rightX * ns) * moveSpeed;
          const dz = (fwdZ * nf + rightZ * ns) * moveSpeed;

          if (canOccupy(g.playerX + dx, g.playerZ)) g.playerX += dx;
          if (canOccupy(g.playerX, g.playerZ + dz)) g.playerZ += dz;

          g.walkBobPhase += dt * (isSprinting ? 17 : 11);
          g.energy = Math.max(5, g.energy - dt * (isSprinting ? 0.55 : 0.25));
        }

        // === 3D SPINNING THROWN BIO-KNIFE PROJECTILE & MAGNETIC BOOMERANG RECALL ===
        if (g.knifeThrown) {
          thrownKnifeGroup.visible = true;
          g.knifeTimer += dt;
          thrownKnifeGroup.rotation.y += dt * 26;
          thrownKnifeGroup.rotation.x += dt * 10;

          if (g.knifeThrowPhase === 'outbound') {
            const nx = g.knifeX + g.knifeVx * dt;
            const nz = g.knifeZ + g.knifeVz * dt;
            const [kCol, kRow] = worldToTile(nx, nz);
            const hitWall =
              isWallTile(kCol, kRow) || Math.hypot(nx - MACHINE_X, nz - MACHINE_Z) < 1.25;

            if (hitWall) {
              playKnifeWallHitSound();
              g.knifeThrowPhase = 'stuck';
              g.knifeTimer = 0;
              tAuraMat.color.setHex(0x22d3ee);
            } else {
              g.knifeX = nx;
              g.knifeZ = nz;
              g.knifeY = 1.42 + Math.sin(g.knifeTimer * 9) * 0.08;
              tAuraMat.color.setHex(0x4ade80);

              for (const ent of g.entities) {
                if (!ent.alive || g.knifeHitIds.has(ent.id)) continue;
                const hitRadius = ent.kind === 'queen' ? 1.9 : 1.38;
                const d = Math.hypot(ent.x - g.knifeX, ent.z - g.knifeZ);
                if (d <= hitRadius) {
                  g.knifeHitIds.add(ent.id);
                  playKnifeSlashSound(true);
                  spawnKillFxRef.current?.(ent.x, ent.z, ent.kind, true);
                  const dmg = ent.kind === 'queen' ? 5 : 55;
                  ent.hp -= dmg;
                  ent.hitFlash = 1.0;

                  const kLen = Math.max(0.1, Math.hypot(g.knifeVx, g.knifeVz));
                  const kx = ent.x + (g.knifeVx / kLen) * 0.75;
                  const kz = ent.z + (g.knifeVz / kLen) * 0.75;
                  const [ec, er] = worldToTile(kx, kz);
                  if (!isWallTile(ec, er)) {
                    ent.x = kx;
                    ent.z = kz;
                  }

                  if (ent.hp <= 0) {
                    killEntityAndCheckStage(ent.id, false, true);
                  } else if (ent.kind === 'queen') {
                    g.statusLine = `THROWN KNIFE CRIT ON QUEEN (-5 HP)! (${Math.ceil(
                      ent.hp
                    )} / ${QUEEN_SHELL_HP} HP LEFT)`;
                    syncHudFromRef();
                  } else {
                    g.statusLine = `THROWN KNIFE HIT ${ent.label.toUpperCase()} (${Math.max(
                      0,
                      Math.round(ent.hp)
                    )} HP LEFT)`;
                    syncHudFromRef();
                  }

                  g.knifeThrowPhase = 'returning';
                  g.knifeTimer = 0;
                  break;
                }
              }

              if (g.knifeThrowPhase === 'outbound' && g.knifeTimer >= 0.68) {
                g.knifeThrowPhase = 'returning';
                g.knifeTimer = 0;
              }
            }
          } else if (g.knifeThrowPhase === 'stuck') {
            if (g.knifeTimer >= 0.14) {
              g.knifeThrowPhase = 'returning';
              g.knifeTimer = 0;
            }
          } else if (g.knifeThrowPhase === 'returning') {
            tAuraMat.color.setHex(0x22d3ee);
            const rdx = g.playerX - g.knifeX;
            const rdz = g.playerZ - g.knifeZ;
            const rDist = Math.hypot(rdx, rdz);
            if (rDist <= 1.25 || g.knifeTimer >= 1.3) {
              g.knifeThrown = false;
              g.knifeThrowPhase = 'none';
              thrownKnifeGroup.visible = false;
              playKnifeCatchSound();
              g.statusLine =
                'BIO-KNIFE RECALLED TO HAND — LEFT-CLICK SLASH OR RIGHT-CLICK / [G] THROW!';
              syncHudFromRef();
            } else {
              const retStep = 30.0 * dt;
              g.knifeX += (rdx / rDist) * retStep;
              g.knifeZ += (rdz / rDist) * retStep;
              g.knifeY = 1.36;
            }
          }

          thrownKnifeGroup.position.set(g.knifeX, g.knifeY, g.knifeZ);
        } else {
          thrownKnifeGroup.visible = false;
        }

        // Pickups: ATP Energy & Shotgun Shell Boxes (Shell boxes only exist once Queen spawns!)
        for (const pk of g.pickups) {
          if (pk.collected) continue;
          pk.mesh.position.y = 0.55 + Math.sin(g.elapsedSec * 3.5) * 0.08;
          const dist = Math.hypot(pk.x - g.playerX, pk.z - g.playerZ);
          if (dist < 1.45) {
            pk.collected = true;
            pk.mesh.visible = false;
            playPickupSound();
            if (pk.kind === 'shells') {
              g.reserveShells += 8;
              g.statusLine = 'PICKED UP 8 SHOTGUN SHELLS! PRESS [R] TO RELOAD!';
            } else {
              g.energy = Math.min(100, g.energy + 35);
              g.statusLine = 'PICKED UP ATP ENERGY (+35% ENERGY)';
            }
            syncHudFromRef();
          }
        }

        const lookX = -Math.sin(g.playerYaw);
        const lookZ = -Math.cos(g.playerYaw);

        // Update Entities & Track Proximity for Escalating Hearable Heartbeat
        let nearestDist = 999;
        for (const ent of g.entities) {
          if (!ent.alive) continue;
          ent.hitFlash = Math.max(0, ent.hitFlash - dt * 5);
          (ent.mesh.material as THREE.SpriteMaterial).color.setRGB(
            1,
            1 - ent.hitFlash * 0.65,
            1 - ent.hitFlash * 0.65
          );
          const baseY = ent.kind === 'queen' ? 1.65 : 0.94;
          ent.mesh.position.y =
            baseY + Math.sin(g.elapsedSec * 3.6 + ent.bobOffset) * 0.09;

          const dx = g.playerX - ent.x;
          const dz = g.playerZ - ent.z;
          const dist = Math.hypot(dx, dz);
          if (dist < nearestDist) nearestDist = dist;

          const aggroRange = ent.kind === 'queen' ? 85.0 : 18.0;
          if (dist < aggroRange && dist > 1.7) {
            const step = ent.speed * dt;
            const sx = (dx / dist) * step;
            const sz = (dz / dist) * step;
            const [ncx, ncz] = worldToTile(ent.x + sx, ent.z);
            if (!isWallTile(ncx, ncz)) ent.x += sx;
            const [ncx2, ncz2] = worldToTile(ent.x, ent.z + sz);
            if (!isWallTile(ncx2, ncz2)) ent.z += sz;
            ent.mesh.position.x = ent.x;
            ent.mesh.position.z = ent.z;
          }

          if (ent.kind === 'queen') {
            // Queen is VERY fast & when she reaches you, she holds you with her hands -> Fast Protein Typing!
            if (dist <= 2.65 && g.queenGrabCooldown <= 0) {
              triggerQueenHandsGrab();
              break;
            }
          } else {
            const toEntX = (ent.x - g.playerX) / Math.max(0.01, dist);
            const toEntZ = (ent.z - g.playerZ) / Math.max(0.01, dist);
            const facingDot = toEntX * lookX + toEntZ * lookZ;

            const closeAttack = dist <= 2.45;
            const facingBacteria =
              isBacteriaKind(ent.kind) &&
              dist <= 3.7 &&
              facingDot >= 0.87 &&
              hasLineOfSight(g.playerX, g.playerZ, ent.x, ent.z);

            if (closeAttack || facingBacteria) {
              triggerEntityAmbush(ent);
              break;
            }
          }
        }

        // Queen Boss Proximity Heartbeat (Only active once the Queen of the Cells arrives!)
        const activeQueen =
          g.queenSpawned ? g.entities.find((e) => e.kind === 'queen' && e.alive) : undefined;
        if (activeQueen) {
          const qDist = Math.hypot(g.playerX - activeQueen.x, g.playerZ - activeQueen.z);
          g.nearestEnemyDist = qDist;
          const proximity =
            qDist < 26 ? Math.min(1, Math.max(0.18, (26 - qDist) / 21)) : 0.18;
          g.heartbeatIntensity = proximity;
          g.heartBpm = Math.round(76 + proximity * 98);
          const beatInterval = 0.86 - proximity * 0.48;
          g.heartbeatTimer -= dt;
          if (g.heartbeatTimer <= 0) {
            g.heartbeatTimer = beatInterval;
            g.heartbeatPulse = 1.0;
            playHeartbeatSound(0.3 + proximity * 0.7);
          }
        } else {
          g.nearestEnemyDist = 999;
          g.heartbeatIntensity = 0;
          g.heartbeatPulse = 0;
          g.heartBpm = 68;
          g.heartbeatTimer = 0.25;
        }
      } else if (!g.paused && g.outcome === 'cure-grow') {
        // === 3D CURE GROW-BACK SEQUENCE INSIDE THE 3D GAME ===
        g.cureTimer += dt;
        g.elapsedSec += dt;
        const p = Math.min(1, g.cureTimer / 3.4);
        ceilMesh.visible = false;
        cureAuraGroup.visible = true;
        cureAuraGroup.position.set(g.playerX, 0, g.playerZ);
        cureRings.forEach((rm, idx) => {
          rm.position.y = ((g.cureTimer * 2.4 + idx * 1.1) % 7.5);
          rm.rotation.z += dt * (2.2 + idx * 0.4);
          const sc = 0.65 + p * 1.4;
          rm.scale.set(sc, sc, 1);
        });

        // Ant-Man reverse grow: camera shoots upward while looking toward Bio-Machine / arena
        const growHeight = 1.56 + Math.pow(p, 1.55) * 9.5;
        camera.fov = 68 + p * 18;
        camera.updateProjectionMatrix();
        camera.position.set(g.playerX, growHeight, g.playerZ);
        camera.rotation.set(-p * 0.35, g.playerYaw + dt * 0.25, 0, 'YXZ');
        playerLight.position.set(g.playerX, growHeight + 0.5, g.playerZ);
        playerLight.color.setHex(0x6ee7b7);
        playerLight.intensity = 4.2;

        if (g.cureTimer >= 3.4) {
          cureAuraGroup.visible = false;
          ceilMesh.visible = true;
          g.outcome = 'dorm-room';
          g.dormInitialized = false;
          setGameOutcome('dorm-room');
          syncHudFromRef();
        }
      } else if (!g.paused && g.outcome === 'dorm-room') {
        // === FULL 3D MODELED COLLEGE DORM ROOM (Interactive Exploration!) ===
        g.elapsedSec += dt;
        if (!g.dormInitialized) {
          g.dormInitialized = true;
          if (document.pointerLockElement) {
            document.exitPointerLock();
          }
          g.playerX = DORM_OX - 0.3;
          g.playerZ = DORM_OZ + 3.1;
          g.playerYaw = -0.35;
          g.heartbeatIntensity = 0;
          g.heartbeatPulse = 0;
          g.heartBpm = 68;
          renderer.setSize(680, 382, false);
          renderer.domElement.style.imageRendering = 'auto';
          camera.fov = 70;
          camera.aspect = 680 / 382;
          camera.updateProjectionMatrix();
          scene.background = new THREE.Color(0x1e293b);
          if (scene.fog) {
            scene.fog.color.setHex(0x1e293b);
            (scene.fog as THREE.Fog).near = 22;
            (scene.fog as THREE.Fog).far = 70;
          }
        }

        // Rotate meal beacon in dorm room
        mealBeacon.rotation.y += dt * 3.2;
        mealBeacon.position.y = 2.08 + Math.sin(g.elapsedSec * 4) * 0.14;

        // Turn + Walk around 3D Dorm Room
        const turnSpeed = 2.45;
        if (g.keys.has('arrowleft') || g.keys.has('q')) {
          g.playerYaw += turnSpeed * dt;
        }
        if (g.keys.has('arrowright') || g.keys.has('e')) {
          g.playerYaw -= turnSpeed * dt;
        }

        let moveF = 0;
        let moveS = 0;
        if (g.keys.has('w') || g.keys.has('arrowup')) moveF += 1;
        if (g.keys.has('s') || g.keys.has('arrowdown')) moveF -= 1;
        if (g.keys.has('a')) moveS -= 1;
        if (g.keys.has('d')) moveS += 1;

        const isSprinting = g.keys.has('shift');
        if (moveF !== 0 || moveS !== 0) {
          const len = Math.hypot(moveF, moveS);
          const nf = moveF / len;
          const ns = moveS / len;
          const moveSpeed = (isSprinting ? 7.6 : 4.8) * dt;
          const fwdX = -Math.sin(g.playerYaw);
          const fwdZ = -Math.cos(g.playerYaw);
          const rightX = Math.cos(g.playerYaw);
          const rightZ = -Math.sin(g.playerYaw);

          const dx = (fwdX * nf + rightX * ns) * moveSpeed;
          const dz = (fwdZ * nf + rightZ * ns) * moveSpeed;

          if (canOccupyDorm(g.playerX + dx, g.playerZ)) g.playerX += dx;
          if (canOccupyDorm(g.playerX, g.playerZ + dz)) g.playerZ += dz;
          g.walkBobPhase += dt * (isSprinting ? 14 : 9.5);
        }

        const nearMealNow =
          Math.hypot(g.playerX - DORM_DESK_MEAL_X, g.playerZ - DORM_DESK_MEAL_Z) <= 3.1;
        setNearDormMeal(nearMealNow);

        const bobY = Math.sin(g.walkBobPhase) * 0.045;
        camera.position.set(g.playerX, 1.75 + bobY, g.playerZ);
        camera.rotation.set(0, g.playerYaw, 0, 'YXZ');
        playerLight.position.set(g.playerX, 2.2, g.playerZ);
        playerLight.color.setHex(0xfffbeb);
        playerLight.intensity = 1.6;

        // === INTERACTIVE 3D HOVER STATE & RAYCASTER DETECTION IN DORM ROOM ===
        dormRoomGroup.updateMatrixWorld();
        dormRaycaster.setFromCamera(dormMouseNdc, camera);
        const rayHits = dormRaycaster.intersectObjects(dormInteractMeshes, false);

        let nextHoverId: string | null = null;
        if (rayHits.length > 0) {
          const hitId = rayHits[0].object.userData.dormInteractId as string | undefined;
          if (hitId) {
            const hitItem = dormInteractById.get(hitId);
            if (hitItem) {
              const wx = DORM_OX + hitItem.localCenter[0];
              const wz = DORM_OZ + hitItem.localCenter[2];
              const distToPlayer = Math.hypot(wx - g.playerX, wz - g.playerZ);
              if (distToPlayer <= hitItem.range + 1.1) {
                nextHoverId = hitId;
              }
            }
          }
        }

        // Proximity + Forward Facing Fallback when approaching items with WASD
        if (!nextHoverId) {
          const fwdX = -Math.sin(g.playerYaw);
          const fwdZ = -Math.cos(g.playerYaw);
          let bestScore = -Infinity;
          for (const item of dormInteractables) {
            const wx = DORM_OX + item.localCenter[0];
            const wz = DORM_OZ + item.localCenter[2];
            const dx = wx - g.playerX;
            const dz = wz - g.playerZ;
            const dist = Math.hypot(dx, dz);
            if (dist <= item.range) {
              const dot = (dx * fwdX + dz * fwdZ) / Math.max(0.01, dist);
              if (dot >= 0.45) {
                const score = dot * 2.0 - dist * 0.28;
                if (score > bestScore) {
                  bestScore = score;
                  nextHoverId = item.id;
                }
              }
            }
          }
        }

        if (nextHoverId !== activeDormHoverId) {
          activeDormHoverId = nextHoverId;
          const hovered = nextHoverId ? dormInteractById.get(nextHoverId) ?? null : null;
          setHoveredDormItem(
            hovered
              ? {
                  id: hovered.id,
                  title: hovered.title,
                  subtitle: hovered.subtitle,
                  actionLabel: hovered.actionLabel,
                  accentHex: hovered.accentHex,
                  inRange: true,
                }
              : null
          );
        }

        // Smooth Emissive Hover Glow + Subtle Proximity Highlight + 3D Floor/Desk Ring
        const smoothRate = 1 - Math.exp(-10 * dt);
        for (const item of dormInteractables) {
          const wx = DORM_OX + item.localCenter[0];
          const wz = DORM_OZ + item.localCenter[2];
          const dist = Math.hypot(wx - g.playerX, wz - g.playerZ);
          const isHovered = item.id === activeDormHoverId;
          const targetHover = isHovered ? 1.0 : dist <= item.range ? 0.25 : 0.0;
          item.hoverLerp += (targetHover - item.hoverLerp) * smoothRate;

          _hoverTintColor.setHex(item.accentColor);
          const pulse = isHovered ? 0.5 + 0.5 * Math.sin(g.elapsedSec * 6.5) : 0;
          for (const rec of item.meshes) {
            _baseTintColor.setHex(rec.baseEmissive);
            rec.mat.emissive.copy(_baseTintColor).lerp(_hoverTintColor, item.hoverLerp * 0.85);
            rec.mat.emissiveIntensity =
              rec.baseIntensity + item.hoverLerp * (0.72 + pulse * 0.45);
          }
        }

        if (activeDormHoverId) {
          const hovered = dormInteractById.get(activeDormHoverId);
          if (hovered) {
            dormHoverRing.visible = true;
            dormHoverRing.position.set(
              hovered.ringPos[0],
              hovered.ringPos[1],
              hovered.ringPos[2]
            );
            const ringPulse = hovered.ringScale * (1 + Math.sin(g.elapsedSec * 5.2) * 0.08);
            dormHoverRing.scale.set(ringPulse, ringPulse, 1);
            dormHoverRing.rotation.z += dt * 1.8;
            dormHoverRingMat.color.setHex(hovered.accentColor);
            dormHoverRingMat.opacity = 0.65 + 0.25 * Math.sin(g.elapsedSec * 6.5);
          }
        } else {
          dormHoverRing.visible = false;
          dormHoverRingMat.opacity = 0;
        }
      }

      // Step all active 3D Blood Droplet Splatter Particles
      for (const slot of killBurstPool) {
        if (!slot.active) continue;
        slot.age += dt;
        const p = Math.min(1, slot.age / slot.maxAge);
        const fade = 1 - p;

        for (const pt of slot.particles) {
          pt.mesh.position.x += pt.vx * dt;
          pt.mesh.position.y += pt.vy * dt;
          pt.mesh.position.z += pt.vz * dt;
          pt.vy -= 15.5 * dt;
          if (pt.mesh.position.y < 0.06) {
            pt.mesh.position.y = 0.06;
            pt.vy = Math.abs(pt.vy) * 0.18;
            pt.vx *= 0.58;
            pt.vz *= 0.58;
            // Flatten droplet on floor like a blood splatter spot
            pt.mesh.scale.set(pt.baseScale * 1.35, pt.baseScale * 0.35, pt.baseScale * 1.35);
          } else {
            const shrink = Math.max(0.25, 1 - p * 0.45);
            pt.mesh.scale.set(
              pt.baseScale * shrink,
              pt.baseScale * 1.3 * shrink,
              pt.baseScale * shrink
            );
          }
          pt.mat.opacity = Math.max(0, fade * 0.98);
        }

        if (p >= 1) {
          slot.active = false;
          for (const pt of slot.particles) {
            pt.mesh.visible = false;
          }
        }
      }

      if (g.outcome !== 'cure-grow' && g.outcome !== 'dorm-room') {
        // Always keep combat camera in 1st-person player control!
        const bobY = Math.sin(g.walkBobPhase) * 0.065;
        camera.position.set(g.playerX, 1.56 + bobY, g.playerZ);
        camera.rotation.set(0, g.playerYaw, 0, 'YXZ');
        playerLight.position.set(g.playerX, 1.85, g.playerZ);
        if (g.recoil > 0.55) {
          playerLight.color.setHex(0xffb74d);
          playerLight.intensity = 4.5;
        } else {
          playerLight.color.setHex(0xfff1d6);
          playerLight.intensity = 2.35;
        }
      }

      renderer.render(scene, camera);

      if (gunCanvasRef.current && g.outcome === 'playing') {
        if (g.activeWeapon === 'knife') {
          drawFirstPersonKnife(
            gunCanvasRef.current,
            Math.cos(g.walkBobPhase * 0.5) * 3.5,
            Math.abs(Math.sin(g.walkBobPhase)) * 3.5,
            g.knifeSwing,
            g.knifeThrown
          );
        } else {
          const reloadPhase = g.reloadTimer > 0 ? 1 - g.reloadTimer / 0.72 : 0;
          drawFirstPersonShotgun(
            gunCanvasRef.current,
            Math.cos(g.walkBobPhase * 0.5) * 3.5,
            Math.abs(Math.sin(g.walkBobPhase)) * 3.5,
            g.recoil,
            !g.weaponUnlocked,
            reloadPhase
          );
        }
      }

      if (g.outcome === 'playing') {
        drawMapToCanvas(minimapCanvasRef.current, false);
        if (bigMapOpenRef.current) {
          drawMapToCanvas(bigMapCanvasRef.current, true);
        }
      }

      hudSyncTimer += dt;
      const syncRate = g.heartbeatIntensity > 0.05 ? 0.065 : 0.14;
      if (hudSyncTimer >= syncRate) {
        hudSyncTimer = 0;
        syncHudFromRef();
      }

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('keyup', onKeyUp, true);
      window.removeEventListener('blur', clearHeldKeys);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      window.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      renderer.domElement.removeEventListener('wheel', onWheel);
      if (document.pointerLockElement === renderer.domElement) {
        document.exitPointerLock();
      }
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
    };
  }, [fireShotgun, focusGameViewport, handleEnterTheEnd, runId, switchWeapon, syncHudFromRef, throwKnife, triggerReload]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <section
      ref={viewportSectionRef}
      tabIndex={-1}
      onContextMenu={(e) => e.preventDefault()}
      aria-label="Cellular Bio-Doom 3D Game"
      className="fixed inset-0 z-30 bg-black flex flex-col select-none overflow-hidden outline-none"
    >
      {/* Main 3D Pixelated DOOM Viewport */}
      <div className="relative flex-1 min-h-0 bg-black overflow-hidden">
        <div
          ref={viewportMountRef}
          className={`w-full h-full ${
            gameOutcome === 'dorm-room'
              ? hoveredDormItem?.inRange
                ? 'cursor-pointer'
                : 'cursor-grab'
              : 'cursor-crosshair'
          }`}
        />

        {/* Combat Target Elimination Callout (No multicolored border/ray flash — pure blood droplets!) */}
        {gameOutcome === 'playing' && killFlash && (
          <div
            key={killFlash.id}
            aria-hidden="true"
            className="pointer-events-none absolute top-16 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-lg bg-[#140507]/92 border border-red-500/75 font-mono text-xs sm:text-sm font-black tracking-wider uppercase text-red-300 shadow-2xl"
          >
            {killFlash.isBacteria ? 'BACTERIUM ELIMINATED' : 'TARGET ELIMINATED'} · {killFlash.label}
          </div>
        )}

        {/* Centered High-Detail DOOM Shotgun Viewmodel + Animated Shell Reload */}
        {gameOutcome === 'playing' && (
          <canvas
            ref={gunCanvasRef}
            width={440}
            height={280}
            className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[min(78vw,600px)] h-[min(39vh,325px)]"
            style={{ imageRendering: 'pixelated' }}
          />
        )}

        {/* Crosshair */}
        {gameOutcome === 'playing' && (
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 ${
              hud.weaponUnlocked ? 'border-[#4ADE80]' : 'border-[#EF4444]'
            }`}
            style={{
              boxShadow: hud.weaponUnlocked
                ? '0 0 10px rgba(74, 222, 128, 0.95)'
                : '0 0 10px rgba(239, 68, 68, 0.95)',
            }}
          />
        )}

        {/* Queen Boss HP Bar (Appears when Queen of the Cells spawns!) */}
        {gameOutcome === 'playing' && hud.queenSpawned && hud.queenAlive && (
          <div className="pointer-events-none absolute top-20 left-1/2 -translate-x-1/2 w-[min(90vw,520px)] rounded-xl border-2 border-[#EC4899] bg-black/85 px-4 py-2.5 shadow-2xl">
            <div className="flex items-center justify-between font-mono text-xs sm:text-sm font-bold text-[#FDE047] mb-1.5">
              <span>BOSS: QUEEN OF THE CELLS (RAPID CLICK!)</span>
              <span>
                {hud.queenHp} / {QUEEN_SHELL_HP} SHELLS
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-[#3b0724] overflow-hidden border border-pink-400/50">
              <div
                className="h-full bg-gradient-to-r from-[#F43F5E] to-[#FACC15] transition-all duration-100"
                style={{ width: `${Math.max(0, (hud.queenHp / QUEEN_SHELL_HP) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Active Master DNA Prompt once Live Cell-Car delivers the Double-Helix DNA (NO top Insert DNA button — must walk physically into 3D Bio-Machine!) */}
        {gameOutcome === 'playing' && hud.hasMasterDna && (
          <div className="pointer-events-none absolute top-20 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-xl border-2 border-[#22D3EE] bg-black/88 shadow-2xl">
            <span
              className="font-mono text-xs sm:text-sm font-bold text-[#67E8F9]"
              style={{ textShadow: GREEN_AURA_SM }}
            >
              MASTER DNA RECEIVED — WALK INTO THE GLOWING 3D BIO-MACHINE ON THE EAST SIDE!
            </span>
          </div>
        )}

        {/* Queen Boss Proximity Cardiac Heartbeat Vignette (Only enabled once Queen arrives!) */}
        {gameOutcome === 'playing' && hud.queenSpawned && hud.queenAlive && hud.heartbeatIntensity > 0.04 && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 transition-opacity duration-75"
            style={{
              boxShadow: `inset 0 0 ${Math.round(
                42 + hud.heartbeatIntensity * 95 + hud.heartbeatPulse * 38
              )}px rgba(239, 68, 68, ${(
                0.14 +
                hud.heartbeatIntensity * 0.42 +
                hud.heartbeatPulse * 0.24
              ).toFixed(2)})`,
            }}
          />
        )}

        {/* Top-Left Glowing Green Status & Weapon Switcher + Queen-Only Heartbeat Monitor */}
        {gameOutcome === 'playing' && (
          <div className="pointer-events-none absolute top-3 left-4 right-4 flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1.5 max-w-2xl">
              <div
                className="font-mono text-sm sm:text-base font-bold text-[#4ADE80] flex flex-wrap items-center gap-2"
                style={{ textShadow: GREEN_AURA_LG }}
              >
                <span>BIO-DOOM · {formatTimer(hud.elapsedSec)}</span>
                {hud.activeWeapon === 'knife' ? (
                  <span
                    className={`px-2 py-0.5 rounded border text-xs ${
                      hud.knifeThrown
                        ? 'bg-cyan-950/90 border-cyan-400/80 text-cyan-300 animate-pulse'
                        : 'bg-emerald-950/90 border-emerald-400/70 text-[#4ADE80]'
                    }`}
                  >
                    {hud.knifeThrown
                      ? 'KNIFE THROWN · RETURNING'
                      : 'KNIFE READY (LMB SLASH · RMB/G THROW)'}
                  </span>
                ) : !hud.weaponUnlocked ? (
                  <span className="px-2 py-0.5 rounded bg-red-950/90 border border-red-400/60 text-xs text-red-300">
                    SHOTGUN LOCKED (PRESS [1] FOR KNIFE)
                  </span>
                ) : hud.reloading ? (
                  <span className="px-2 py-0.5 rounded bg-amber-950/90 border border-amber-400/70 text-xs text-amber-300 animate-pulse">
                    RELOADING SHELLS...
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-emerald-950/90 border border-emerald-400/60 text-xs text-[#4ADE80]">
                    RAPID FIRE UNLOCKED
                  </span>
                )}
                {hud.queenSpawned && (
                  <span className="px-2 py-0.5 rounded bg-pink-950/90 border border-pink-400/70 text-xs text-pink-300">
                    ♪ ADHD — QUEEN BOSS
                  </span>
                )}
              </div>

              {/* Clickable Weapon Switcher + Queen-Only Dynamic Heartbeat Monitor */}
              <div className="pointer-events-auto flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.currentTarget.blur();
                    switchWeapon('knife');
                    focusGameViewport();
                  }}
                  className={`px-2.5 py-1 rounded border font-mono text-xs font-bold cursor-pointer transition-colors ${
                    hud.activeWeapon === 'knife'
                      ? 'border-[#4ADE80] bg-emerald-900/85 text-white shadow-[0_0_12px_rgba(74,222,128,0.45)]'
                      : 'border-emerald-400/35 bg-black/75 text-[#86EFAC] hover:bg-emerald-950/70'
                  }`}
                >
                  [1] Knife
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.currentTarget.blur();
                    switchWeapon('shotgun');
                    focusGameViewport();
                  }}
                  className={`px-2.5 py-1 rounded border font-mono text-xs font-bold cursor-pointer transition-colors ${
                    hud.activeWeapon === 'shotgun'
                      ? 'border-[#FACC15] bg-amber-950/85 text-[#FEF08A] shadow-[0_0_12px_rgba(250,204,21,0.4)]'
                      : 'border-emerald-400/35 bg-black/75 text-[#86EFAC] hover:bg-emerald-950/70'
                  }`}
                >
                  [2] Shotgun
                </button>

                {/* Queen Arrival Heartbeat Monitor (Only shown once Queen spawns!) */}
                {hud.queenSpawned && hud.queenAlive && (
                  <div
                    className={`pointer-events-none flex items-center gap-2 px-2.5 py-1 rounded border font-mono text-xs font-bold transition-colors ${
                      hud.heartbeatIntensity > 0.55
                        ? 'border-red-500 bg-red-950/90 text-red-200'
                        : 'border-amber-400/80 bg-amber-950/85 text-amber-200'
                    }`}
                    style={{
                      boxShadow: `0 0 ${Math.round(8 + hud.heartbeatPulse * 18)}px rgba(239, 68, 68, ${(
                        0.25 +
                        hud.heartbeatPulse * 0.65
                      ).toFixed(2)})`,
                    }}
                  >
                    <span
                      className="inline-block text-red-400 transition-transform duration-75"
                      style={{
                        transform: `scale(${(1 + hud.heartbeatPulse * 0.42).toFixed(2)})`,
                      }}
                    >
                      ♥
                    </span>
                    <span className="tabular-nums">{hud.heartBpm} BPM</span>
                    <div className="w-16 h-2 rounded-full bg-black/70 overflow-hidden border border-white/15">
                      <div
                        className={`h-full transition-all duration-75 ${
                          hud.heartbeatIntensity > 0.55 ? 'bg-red-500' : 'bg-amber-400'
                        }`}
                        style={{
                          width: `${Math.round(
                            Math.max(18, hud.heartbeatIntensity * 85 + hud.heartbeatPulse * 15)
                          )}%`,
                        }}
                      />
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-red-300">
                      {hud.heartbeatIntensity > 0.55 ? 'QUEEN NEAR!' : 'QUEEN HUNTING'}
                    </span>
                  </div>
                )}
              </div>

              <div
                className="font-mono text-xs sm:text-sm font-semibold text-[#ECFDF5] bg-black/55 px-3 py-1 rounded border border-emerald-400/25 w-fit"
                style={{ textShadow: GREEN_AURA_SM }}
              >
                {hud.statusLine}
              </div>
            </div>

            <div className="pointer-events-auto flex flex-col items-end gap-1.5">
              <div className="flex flex-wrap items-center justify-end gap-2">
                {!hud.queenSpawned && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.currentTarget.blur();
                      spawnQueenBoss();
                      focusGameViewport();
                    }}
                    className="px-3 py-1 rounded border border-pink-400/70 bg-[#270917]/90 font-mono text-xs font-bold text-pink-300 hover:bg-pink-950 cursor-pointer"
                  >
                    Summon Queen
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.currentTarget.blur();
                    triggerLiveCellCarDelivery();
                    focusGameViewport();
                  }}
                  className="px-3 py-1 rounded border border-[#FACC15]/75 bg-[#1A1604]/90 font-mono text-xs font-bold text-[#FDE047] hover:bg-[#322907] shadow-[0_0_12px_rgba(250,204,21,0.35)] cursor-pointer"
                >
                  Call Cell Car
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.currentTarget.blur();
                    setBigMapOpen((p) => !p);
                    focusGameViewport();
                  }}
                  className="px-3 py-1 rounded border border-emerald-400/45 bg-black/80 font-mono text-xs font-bold text-[#86EFAC] hover:bg-emerald-950/70 cursor-pointer"
                  style={{ textShadow: GREEN_AURA_SM }}
                >
                  {bigMapOpen ? 'Close Map (M)' : '2D Map (M)'}
                </button>
                <button
                  type="button"
                  onClick={onReplayStory}
                  className="px-3 py-1 rounded border border-emerald-400/35 bg-black/80 font-mono text-xs text-[#A7F3D0] hover:text-white cursor-pointer"
                >
                  Story
                </button>
                <button
                  type="button"
                  onClick={onCompleteToOutro}
                  className="px-3 py-1 rounded border border-emerald-400/35 bg-black/80 font-mono text-xs text-[#A7F3D0] hover:text-white cursor-pointer"
                >
                  Credits →
                </button>
              </div>

              <div
                onClick={() => setBigMapOpen((p) => !p)}
                title="Click or press M to toggle enlarged 2D Map"
                className="rounded-lg border-2 border-emerald-400/55 bg-black/85 p-1 shadow-xl cursor-pointer"
              >
                <canvas
                  ref={minimapCanvasRef}
                  className="block rounded"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* 3D Grow-Back Sequence Minimal Banner */}
        {gameOutcome === 'cure-grow' && (
          <div className="pointer-events-none fixed inset-x-0 bottom-8 flex justify-center px-4">
            <div
              className="px-6 py-3 rounded-xl bg-black/75 border-2 border-emerald-400 font-display text-lg sm:text-2xl font-bold text-[#4ADE80]"
              style={{ textShadow: GREEN_AURA_LG }}
            >
              PROTEIN CURE ACTIVATED — GROWING BACK TO HUMAN SIZE IN 3D...
            </div>
          </div>
        )}

        {/* Clean 3D Dorm Room Exploration Interface (Interactive Hover Inspection + No Ammo HUD!) */}
        {gameOutcome === 'dorm-room' && (
          <>
            {/* Interactive Hovered 3D Object Card & Interaction Toast (Stacked cleanly) */}
            {(hoveredDormItem || dormToast) && (
              <div className="pointer-events-none absolute top-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2.5 w-[min(92vw,460px)]">
                {hoveredDormItem && (
                  <div
                    className="pointer-events-auto w-full rounded-2xl bg-[#07100D]/92 border-2 px-5 py-3.5 shadow-2xl transition-all duration-150"
                    style={{
                      borderColor: hoveredDormItem.accentHex,
                      boxShadow: `0 0 28px ${hoveredDormItem.accentHex}44`,
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div
                          className="font-mono text-[11px] font-bold uppercase tracking-widest"
                          style={{ color: hoveredDormItem.accentHex }}
                        >
                          NEARBY INTERACTIVE OBJECT
                        </div>
                        <div className="font-display text-lg sm:text-xl font-bold text-white leading-tight">
                          {hoveredDormItem.title}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => dormInteractTriggerRef.current?.(hoveredDormItem.id)}
                        className="shrink-0 px-3.5 py-2 rounded-xl font-mono text-xs font-black text-slate-950 cursor-pointer transition-transform hover:scale-105"
                        style={{ backgroundColor: hoveredDormItem.accentHex }}
                      >
                        {hoveredDormItem.actionLabel}
                      </button>
                    </div>
                    <p className="font-body text-xs sm:text-sm text-emerald-100/90 mt-1.5">
                      {hoveredDormItem.subtitle}
                    </p>
                    <div className="font-mono text-[11px] text-emerald-300/80 mt-2">
                      Click the glowing object or press [F] / [Enter] to interact
                    </div>
                  </div>
                )}

                {dormToast && (
                  <div
                    className="w-full rounded-xl bg-[#050B09]/92 border px-4 py-2.5 text-center font-mono text-xs sm:text-sm text-white shadow-xl"
                    style={{ borderColor: dormToast.accent }}
                  >
                    {dormToast.text}
                  </div>
                )}
              </div>
            )}

            <div className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 px-5 py-2 rounded-xl bg-black/72 border border-emerald-400/40 font-mono text-xs sm:text-sm text-[#ECFDF5] whitespace-nowrap">
              {hoveredDormItem
                ? `HOVERING: ${hoveredDormItem.title.toUpperCase()} · CLICK OR PRESS [F] TO INSPECT`
                : nearDormMeal
                ? 'YOUR WARM LUNCH IS READY! APPROACH & CLICK OR PRESS [F] →'
                : '3D DORM ROOM · WASD MOVE · DRAG / ARROWS LOOK · HOVER ITEMS & WALL POSTERS'}
            </div>
            <button
              type="button"
              onClick={handleEnterTheEnd}
              className="pointer-events-auto absolute bottom-5 right-5 px-5 py-2.5 rounded-xl bg-[#4ADE80] hover:bg-[#86EFAC] text-slate-950 font-display text-sm sm:text-base font-black shadow-[0_0_24px_rgba(74,222,128,0.65)] cursor-pointer"
            >
              {nearDormMeal ? 'Enjoy Meal · THE END →' : 'THE END →'}
            </button>

            {/* Framed Dorm Photo Poster Close-Up Modal */}
            {inspectedDormPhoto && (
              <div
                role="dialog"
                aria-modal="true"
                aria-label={inspectedDormPhoto.title}
                onClick={() => setInspectedDormPhoto(null)}
                className="fixed inset-0 z-50 bg-black/82 flex items-center justify-center p-4 sm:p-6"
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="max-w-xl w-full rounded-2xl border-2 bg-[#07100D] p-4 sm:p-5 shadow-2xl"
                  style={{
                    borderColor: inspectedDormPhoto.accentHex,
                    boxShadow: `0 0 36px ${inspectedDormPhoto.accentHex}55`,
                  }}
                >
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div>
                      <div
                        className="font-mono text-[11px] font-bold uppercase tracking-widest"
                        style={{ color: inspectedDormPhoto.accentHex }}
                      >
                        DORM WALL POSTER
                      </div>
                      <h3 className="font-display text-lg sm:text-xl font-bold text-white">
                        {inspectedDormPhoto.title}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.currentTarget.blur();
                        setInspectedDormPhoto(null);
                        focusGameViewport();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 font-mono text-xs font-bold text-white cursor-pointer"
                    >
                      Close [Esc]
                    </button>
                  </div>
                  <div className="rounded-xl overflow-hidden border border-white/15 bg-black flex items-center justify-center max-h-[62vh]">
                    <img
                      src={inspectedDormPhoto.url}
                      alt={inspectedDormPhoto.title}
                      className="w-full h-full max-h-[62vh] object-contain"
                    />
                  </div>
                  <p className="font-body text-xs sm:text-sm text-emerald-100/90 mt-3">
                    {inspectedDormPhoto.subtitle}
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {/* Bottom Controls Banner (Combat Only) */}
        {gameOutcome === 'playing' && (
          <div
            className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 rounded bg-black/75 border border-emerald-400/30 font-mono text-xs sm:text-sm text-[#A7F3D0] whitespace-nowrap"
            style={{ textShadow: GREEN_AURA_SM }}
          >
            WASD Move · Shift Sprint · 1 Knife (LMB Slash · RMB/G Throw) · 2 Shotgun · X Swap · R Reload · M Map{' '}
            {pointerLocked ? '· Pointer Locked' : ''}
          </div>
        )}
      </div>

      {/* Classic DOOM Status Bar HUD (Hidden in 3D Cure-Grow, 3D Dorm Room, and THE END!) */}
      {gameOutcome === 'playing' && (
      <footer className="h-[108px] sm:h-[118px] shrink-0 bg-[#1e2128] border-t-4 border-[#475569] px-3 sm:px-6 grid grid-cols-5 items-center gap-2 sm:gap-4 shadow-2xl">
        {/* ENERGY LEFT */}
        <div className="h-[86px] bg-[#0b1015] border-2 border-[#334155] rounded px-2 sm:px-3 flex flex-col items-center justify-center text-center">
          <span
            className="font-mono text-2xl sm:text-4xl font-bold text-[#4ADE80] tabular-nums leading-none"
            style={{ textShadow: GREEN_AURA_LG }}
          >
            {hud.energy}%
          </span>
          <span
            className="font-mono text-[11px] sm:text-xs font-bold tracking-wider text-[#86EFAC] mt-1.5"
            style={{ textShadow: GREEN_AURA_SM }}
          >
            ENERGY LEFT
          </span>
        </div>

        {/* ACTIVE WEAPON / SHELLS */}
        <div className="h-[86px] bg-[#0b1015] border-2 border-[#334155] rounded px-2 sm:px-3 flex flex-col items-center justify-center text-center">
          <span
            className={`font-mono text-2xl sm:text-4xl font-bold tabular-nums leading-none ${
              hud.activeWeapon === 'knife'
                ? 'text-[#4ADE80]'
                : !hud.ammoActive
                ? 'text-slate-500'
                : hud.magAmmo === 0
                ? 'text-[#FB7185]'
                : 'text-[#FDE047]'
            }`}
            style={{ textShadow: GREEN_AURA_LG }}
          >
            {hud.activeWeapon === 'knife'
              ? 'KNIFE'
              : hud.ammoActive
              ? `${hud.magAmmo}/${hud.reserveShells}`
              : '--/--'}
          </span>
          <span
            className="font-mono text-[11px] sm:text-xs font-bold tracking-wider text-[#86EFAC] mt-1.5"
            style={{ textShadow: GREEN_AURA_SM }}
          >
            {hud.activeWeapon === 'knife'
              ? 'MELEE [2] SHOTGUN'
              : hud.ammoActive
              ? 'SHELLS (R RELOAD)'
              : 'AMMO ON QUEEN'}
          </span>
        </div>

        {/* CENTER: UPLOADED DOOMGUY FACE SHEET (Pulses with Proximity Heartbeat!) */}
        <div className="h-[94px] flex flex-col items-center justify-center">
          <div
            className="p-1 bg-[#070b0f] border-2 rounded shadow-inner transition-transform duration-75"
            style={{
              borderColor:
                hud.heartbeatIntensity > 0.45
                  ? `rgba(239, 68, 68, ${(0.55 + hud.heartbeatPulse * 0.45).toFixed(2)})`
                  : '#64748b',
              boxShadow:
                hud.heartbeatIntensity > 0.25
                  ? `0 0 ${Math.round(6 + hud.heartbeatPulse * 18)}px rgba(239, 68, 68, ${(
                      hud.heartbeatIntensity * 0.65
                    ).toFixed(2)})`
                  : undefined,
              transform: `scale(${(1 + hud.heartbeatIntensity * hud.heartbeatPulse * 0.08).toFixed(3)})`,
            }}
          >
            <canvas
              ref={faceCanvasRef}
              width={66}
              height={83}
              aria-label={`Hero HUD portrait from ${DOOM_FACE_SHEET_URL}`}
              className="w-[54px] h-[68px] sm:w-[66px] sm:h-[82px] block"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>
        </div>

        {/* ENTITIES / BACTERIA LEFT */}
        <div className="h-[86px] bg-[#0b1015] border-2 border-[#334155] rounded px-2 sm:px-3 flex flex-col items-center justify-center text-center">
          <span
            className="font-mono text-2xl sm:text-4xl font-bold text-[#4ADE80] tabular-nums leading-none"
            style={{ textShadow: GREEN_AURA_LG }}
          >
            {hud.queenSpawned ? hud.queenHp : hud.minionsRemaining}
          </span>
          <span
            className="font-mono text-[11px] sm:text-xs font-bold tracking-wider text-[#86EFAC] mt-1.5"
            style={{ textShadow: GREEN_AURA_SM }}
          >
            {hud.queenSpawned ? 'QUEEN SHELL HP' : 'ENTITIES LEFT'}
          </span>
        </div>

        {/* BREAKDOWN: HEALTH / BACTERIA / PROTEINS / CELLS */}
        <div className="h-[86px] bg-[#0b1015] border-2 border-[#334155] rounded px-2.5 sm:px-3 flex flex-col justify-center font-mono text-[11px] sm:text-xs font-bold leading-snug">
          <div className="flex justify-between text-[#86EFAC]" style={{ textShadow: GREEN_AURA_SM }}>
            <span>HEALTH</span>
            <span className="tabular-nums text-[#ECFDF5]">{hud.health}%</span>
          </div>
          <div className="flex justify-between text-[#86EFAC]" style={{ textShadow: GREEN_AURA_SM }}>
            <span>BACTERIA</span>
            <span className="tabular-nums text-[#ECFDF5]">{hud.bacteriaLeft}</span>
          </div>
          <div className="flex justify-between text-[#86EFAC]" style={{ textShadow: GREEN_AURA_SM }}>
            <span>PROTEINS</span>
            <span className="tabular-nums text-[#ECFDF5]">{hud.proteinsLeft}</span>
          </div>
          <div className="flex justify-between text-[#86EFAC]" style={{ textShadow: GREEN_AURA_SM }}>
            <span>CELLS</span>
            <span className="tabular-nums text-[#ECFDF5]">{hud.cellsLeft}</span>
          </div>
        </div>
      </footer>
      )}

      {/* Expandable 2D DOOM Fortress Automap Modal (Key M) */}
      {bigMapOpen && (
        <div className="fixed inset-0 z-40 bg-black/82 flex items-center justify-center p-6">
          <div className="rounded-xl border-2 border-emerald-400/50 bg-[#040C09] p-5 shadow-2xl flex flex-col items-center gap-4">
            <div className="w-full flex items-center justify-between gap-4">
              <h2
                className="font-display text-2xl font-bold text-[#ECFDF5]"
                style={{ textShadow: GREEN_AURA_LG }}
              >
                2D Cellular Fortress Map (23×23)
              </h2>
              <button
                type="button"
                onClick={(e) => {
                  e.currentTarget.blur();
                  setBigMapOpen(false);
                  focusGameViewport();
                }}
                className="px-3.5 py-1.5 rounded bg-emerald-500 text-slate-950 font-mono text-sm font-bold cursor-pointer"
              >
                Close (M)
              </button>
            </div>
            <canvas
              ref={bigMapCanvasRef}
              className="rounded border border-emerald-400/35"
              style={{ imageRendering: 'pixelated' }}
            />
            <div
              className="flex flex-wrap items-center justify-center gap-4 font-mono text-xs sm:text-sm text-[#86EFAC]"
              style={{ textShadow: GREEN_AURA_SM }}
            >
              <span className="text-white">● You</span>
              <span className="text-[#EF4444]">■ Shells</span>
              <span className="text-[#4ADE80]">■ Bio-Machine</span>
              <span className="text-[#4ADE80]">● Green Bacillus</span>
              <span className="text-[#EF4444]">● Crimson Strep</span>
              <span className="text-[#C084FC]">● Violet Spirillum</span>
              <span className="text-[#F59E0B]">● Amber Staph</span>
              <span className="text-[#FB923C]">● Protein</span>
              <span className="text-[#38BDF8]">● Guard Cell</span>
              <span className="text-[#FACC15]">● Queen</span>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Presentation Question Modal for Minions (Unlocks Free Fire Shotgun) */}
      {activeAmbush && gameOutcome === 'playing' && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Bio-Combat Presentation Question"
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        >
          <div className="w-full max-w-3xl rounded-2xl border-2 border-emerald-400/65 bg-[#040E0A] p-6 sm:p-8 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-emerald-400/25">
              <div>
                <div
                  className="font-mono text-xs sm:text-sm font-bold text-[#FB7185]"
                  style={{ textShadow: GREEN_AURA_SM }}
                >
                  ENTITY ENCOUNTER · {activeAmbush.label.toUpperCase()}
                </div>
                <div
                  className="font-mono text-sm sm:text-base font-bold text-[#86EFAC] mt-0.5"
                  style={{ textShadow: GREEN_AURA_SM }}
                >
                  LO5 Topic: {activeAmbush.question.topic}
                </div>
              </div>

              <div
                className={`px-4 py-2 rounded-lg border font-mono text-2xl sm:text-3xl font-bold tabular-nums ${
                  quizSecondsLeft <= 12
                    ? 'border-red-500 bg-red-950/80 text-red-300 animate-pulse'
                    : 'border-emerald-400/50 bg-[#061810] text-[#4ADE80]'
                }`}
                style={{ textShadow: GREEN_AURA_LG }}
              >
                {formatTimer(quizSecondsLeft)}
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-emerald-400/30 bg-[#061810]/85 px-4 py-3">
              <div className="font-mono text-xs font-bold text-[#4ADE80] uppercase tracking-wider mb-1">
                Presentation Reference Details
              </div>
              <p
                className="font-body text-sm sm:text-base text-[#D1FAE5] leading-relaxed"
                style={{ textShadow: GREEN_AURA_SM }}
              >
                {activeAmbush.question.contextClue}
              </p>
            </div>

            <h2
              className="font-display text-xl sm:text-3xl font-bold text-[#ECFDF5] leading-snug mt-5 mb-5"
              style={{ textShadow: GREEN_AURA_SM }}
            >
              {activeAmbush.question.question}
            </h2>

            <div className="grid grid-cols-1 gap-3">
              {activeAmbush.question.options.map((opt, idx) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleAnswerQuiz(idx)}
                  className="w-full text-left px-5 py-3.5 rounded-xl border border-emerald-400/35 bg-[#06150F] hover:bg-[#0B2A1E] hover:border-emerald-400 font-display text-base sm:text-lg font-semibold text-[#ECFDF5] cursor-pointer transition-colors"
                  style={{ textShadow: GREEN_AURA_SM }}
                >
                  <span className="font-mono text-[#4ADE80] mr-3">
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* QUEEN HAND-HOLD CHALLENGE: Queen Claws Screen Sides — Type ONE Protein Word in Seconds! */}
      {queenGrabActive && gameOutcome === 'playing' && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Queen of the Cells Grip — Fast Protein Typing"
          className="fixed inset-0 z-50 bg-black/88 flex items-center justify-center p-4 sm:p-6 overflow-hidden"
        >
          {/* Giant Animated Pink Claws Clutching Left & Right Edges of Screen */}
          <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-y-0 left-0 w-16 sm:w-28 bg-gradient-to-r from-pink-700/80 via-rose-600/40 to-transparent flex flex-col justify-around py-10"
          >
            {[0, 1, 2, 3].map((f) => (
              <div
                key={f}
                className="h-8 sm:h-12 w-full rounded-r-full bg-gradient-to-r from-[#9d174d] to-[#ec4899] border-2 border-[#fef08a]/70 shadow-[0_0_20px_rgba(236,72,153,0.9)] animate-pulse"
              />
            ))}
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-y-0 right-0 w-16 sm:w-28 bg-gradient-to-l from-pink-700/80 via-rose-600/40 to-transparent flex flex-col justify-around py-10"
          >
            {[0, 1, 2, 3].map((f) => (
              <div
                key={f}
                className="h-8 sm:h-12 w-full rounded-l-full bg-gradient-to-l from-[#9d174d] to-[#ec4899] border-2 border-[#fef08a]/70 shadow-[0_0_20px_rgba(236,72,153,0.9)] animate-pulse"
              />
            ))}
          </div>

          <div className="relative z-10 w-full max-w-2xl rounded-2xl border-2 border-[#EC4899] bg-[#160510]/95 p-6 sm:p-8 shadow-[0_0_50px_rgba(236,72,153,0.55)] text-center">
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-pink-500/35">
              <div className="text-left">
                <div className="font-mono text-xs sm:text-sm font-bold text-pink-300 uppercase tracking-widest">
                  THE QUEEN HOLDS YOU WITH HER HANDS!
                </div>
                <h2
                  className="font-display text-2xl sm:text-3xl font-bold text-white mt-0.5"
                  style={{ textShadow: RED_AURA_LG }}
                >
                  TYPE THIS PROTEIN WORD TO BREAK FREE!
                </h2>
              </div>

              <div
                className={`px-4 py-2 rounded-xl border font-mono text-3xl font-black tabular-nums ${
                  grabSecondsLeft <= 3
                    ? 'border-red-500 bg-red-950 text-red-300 animate-pulse'
                    : 'border-pink-400 bg-pink-950 text-[#FDE047]'
                }`}
              >
                {grabSecondsLeft}s
              </div>
            </div>

            {/* Active Target Word with Live Character Highlighting */}
            <div className="mt-7">
              <div className="font-mono text-xs text-pink-300 uppercase tracking-widest mb-2">
                TYPE EXACT SPELLING BEFORE {grabSecondsLeft} SECONDS RUN OUT:
              </div>
              <div className="font-mono text-4xl sm:text-6xl font-black tracking-widest uppercase">
                {FAST_PROTEIN_TARGETS[proteinStepIdx]
                  .split('')
                  .map((char, cIdx) => {
                    const typedChar = proteinTyped.trim().toLowerCase()[cIdx];
                    const matched = typedChar === char;
                    return (
                      <span
                        key={cIdx}
                        className={
                          matched
                            ? 'text-[#4ADE80]'
                            : typedChar !== undefined
                            ? 'text-red-500'
                            : 'text-[#FDE047]'
                        }
                      >
                        {char}
                      </span>
                    );
                  })}
              </div>
            </div>

            <input
              ref={grabInputRef}
              type="text"
              autoFocus
              value={proteinTyped}
              onChange={(e) => handleProteinTypingChange(e.target.value)}
              placeholder={`Type ${FAST_PROTEIN_TARGETS[proteinStepIdx]}...`}
              autoComplete="off"
              spellCheck={false}
              className="mt-6 w-full rounded-xl border-2 border-[#FACC15] bg-black px-5 py-4 text-center font-mono text-2xl sm:text-3xl font-bold text-[#4ADE80] uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
        </div>
      )}

      {/* Instant Black Death Screen: Red "YOU DEAD" & Forced Replay */}
      {gameOutcome === 'dead' && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-6 text-center">
          <h2
            className="font-display text-6xl sm:text-8xl md:text-9xl font-black tracking-widest text-red-600 mb-6"
            style={{ textShadow: RED_AURA_LG }}
          >
            YOU DEAD
          </h2>
          <p className="font-mono text-base sm:text-xl text-red-300/90 max-w-xl mb-10">
            Killed by {killerSpecies}. Solve every encounter & type each protein word fast to defeat the Queen!
          </p>
          <button
            type="button"
            onClick={handleRestartGame}
            className="px-10 py-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-display text-xl sm:text-2xl font-bold tracking-wide shadow-[0_0_25px_rgba(220,38,38,0.75)] cursor-pointer transition-colors"
          >
            Replay Game
          </button>
        </div>
      )}

      {/* Victory Sequence: Bio-Machine DNA Insertion -> Protein Data -> Launch 3D Grow-Back & 3D Dorm Room */}
      {gameOutcome === 'victory' && (
        <VictorySequence
          elapsedSec={hud.elapsedSec}
          onReplayLevel={handleRestartGame}
          onActivateCureIn3DRoom={handleStartCureIn3DRoom}
        />
      )}

      {/* Finale Black Screen: Glowing Green Aura "THE END" + 3D Dancing Cell from the Car */}
      {gameOutcome === 'the-end' && (
        <TheEndScene
          onContinueToCredits={onCompleteToOutro}
          onReplayGame={handleRestartGame}
        />
      )}
    </section>
  );
}
