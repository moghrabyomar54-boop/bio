import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  playAntManShrinkSound,
  playCutsceneBlipSound,
  playShotgunBlastSound,
} from '../../utils/soundEffects';

interface StoryCutscene2DProps {
  onStartGame: () => void;
  onSkipToOutro: () => void;
  onBackToPresentation?: () => void;
}

type HeroExpression = 'neutral' | 'grin' | 'pain' | 'shock';

interface CutsceneBeat {
  chapter: string;
  title: string;
  narrative: string;
  badgeText: string;
}

const CUTSCENE_BEATS: CutsceneBeat[] = [
  {
    chapter: 'CHAPTER 01 · COLLEGE DORMS',
    title: 'He Woke Up Late in the College Dorms',
    narrative:
      'Inside his college dorm room, afternoon sunlight poured through the window—he overslept straight past lunch while studying LO5 Biology.',
    badgeText: 'DORM ROOM 404 · 2:45 PM · LATE!',
  },
  {
    chapter: 'CHAPTER 02 · DINING HALL',
    title: 'He Came Late to Lunch — Nothing Left to Eat',
    narrative:
      'He sprinted to the dorm cafeteria, but the shutters were already shut and every lunch tray was empty. Starving with 0% nutrients, his stomach growled violently.',
    badgeText: 'LUNCH CLOSED · 0% ENERGY · STARVING',
  },
  {
    chapter: 'CHAPTER 03 · QUANTUM COLLAPSE',
    title: 'Because He Was Hungry, He Shrank Tiny Like the Cells!',
    narrative:
      'Because he was so hungry and missed lunch, his metabolic energy collapsed—triggering an Ant-Man scale drop down into the microscopic world of living cells!',
    badgeText: 'HUNGER COLLAPSE · 1.8 m → 10 μm',
  },
  {
    chapter: 'CHAPTER 04 · CELLULAR CITADEL',
    title: 'Clear the Horde to Summon the Queen of the Cells',
    narrative:
      'Now tiny inside the cellular fortress, a Rogue Protein tests you first—solve its Bio-Quiz to unlock your Shotgun, wipe out the entities, then face the Queen of the Cells!',
    badgeText: 'MISSION: CLEAR ENTITIES → SUMMON THE QUEEN',
  },
];

const GREEN_HEADING_AURA =
  '0 0 12px rgba(74, 222, 128, 0.95), 0 0 32px rgba(34, 197, 94, 0.72), 0 0 60px rgba(16, 185, 129, 0.45)';

const GREEN_TEXT_AURA =
  '0 0 8px rgba(74, 222, 128, 0.78), 0 0 22px rgba(34, 197, 94, 0.45)';

export function StoryCutscene2D({
  onStartGame,
  onSkipToOutro,
  onBackToPresentation,
}: StoryCutscene2DProps) {
  const [beatIndex, setBeatIndex] = useState(0);
  const [typedCount, setTypedCount] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const beat = CUTSCENE_BEATS[beatIndex] ?? CUTSCENE_BEATS[0];

  // Typewriter reveal for in-cutscene animated text + Ant-Man shrink audio on Beat 2
  useEffect(() => {
    setTypedCount(0);
    if (beatIndex === 2) {
      playAntManShrinkSound();
    }
    const targetLen = beat.narrative.length;
    const interval = window.setInterval(() => {
      setTypedCount((prev) => {
        if (prev >= targetLen) {
          window.clearInterval(interval);
          return prev;
        }
        return prev + 2;
      });
    }, 18);
    return () => window.clearInterval(interval);
  }, [beatIndex, beat.narrative.length]);

  const handleNext = () => {
    if (beatIndex < CUTSCENE_BEATS.length - 1) {
      setBeatIndex((prev) => prev + 1);
      playCutsceneBlipSound();
    } else {
      playShotgunBlastSound();
      onStartGame();
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        e.key === 'ArrowRight' ||
        e.key === 'PageDown' ||
        e.key === ' ' ||
        e.key === 'Enter'
      ) {
        e.preventDefault();
        e.stopPropagation();
        if (beatIndex < CUTSCENE_BEATS.length - 1) {
          setBeatIndex((prev) => prev + 1);
          playCutsceneBlipSound();
        } else {
          playShotgunBlastSound();
          onStartGame();
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        e.stopPropagation();
        if (beatIndex > 0) {
          setBeatIndex((prev) => prev - 1);
          playCutsceneBlipSound();
        } else {
          onBackToPresentation?.();
        }
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [beatIndex, onBackToPresentation, onStartGame]);

  // Smooth High-DPI 2D Professional Animated Cutscene Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = 1280;
    const H = 720;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    let rafId = 0;
    const sceneStart = performance.now();

    const drawHero2D = (
      x: number,
      y: number,
      scale: number,
      options: {
        mood: HeroExpression;
        hasGun?: boolean;
        holdingStomach?: boolean;
        runningPhase?: number;
        alpha?: number;
        suitTint?: boolean;
      }
    ) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      if (options.alpha !== undefined) ctx.globalAlpha = options.alpha;

      const stride = options.runningPhase ? Math.sin(options.runningPhase) * 14 : 0;

      // Soft ground contact shadow
      const shadowGrad = ctx.createRadialGradient(0, 92, 4, 0, 92, 44);
      shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
      shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.ellipse(0, 92, 44, 11, 0, 0, Math.PI * 2);
      ctx.fill();

      // Smooth tapered legs (dark slate jeans)
      const drawLeg = (lx: number, liftY: number) => {
        const legGrad = ctx.createLinearGradient(lx - 10, 32, lx + 10, 82);
        legGrad.addColorStop(0, '#1e293b');
        legGrad.addColorStop(1, '#0f172a');
        ctx.fillStyle = legGrad;
        ctx.beginPath();
        ctx.moveTo(lx - 11, 30);
        ctx.quadraticCurveTo(lx - 12, 58, lx - 9, 80 + liftY);
        ctx.lineTo(lx + 9, 80 + liftY);
        ctx.quadraticCurveTo(lx + 11, 58, lx + 11, 30);
        ctx.closePath();
        ctx.fill();

        // Rounded athletic sneaker
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(lx - 11, 78 + liftY, 24, 12, 6);
        ctx.fill();
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.roundRect(lx - 11, 86 + liftY, 24, 4, 2);
        ctx.fill();
      };
      drawLeg(-14, stride * 0.45);
      drawLeg(14, -stride * 0.45);

      // Jacket / Bio-Suit Torso with soft volumetric shading
      const torsoGrad = ctx.createLinearGradient(-32, -32, 32, 42);
      if (options.suitTint) {
        torsoGrad.addColorStop(0, '#ef4444');
        torsoGrad.addColorStop(0.55, '#b91c1c');
        torsoGrad.addColorStop(1, '#7f1d1d');
      } else {
        torsoGrad.addColorStop(0, '#34d399');
        torsoGrad.addColorStop(0.5, '#10b981');
        torsoGrad.addColorStop(1, '#065f46');
      }
      ctx.fillStyle = torsoGrad;
      ctx.beginPath();
      ctx.moveTo(-26, -24);
      ctx.quadraticCurveTo(0, -32, 26, -24);
      ctx.quadraticCurveTo(32, 6, 27, 38);
      ctx.quadraticCurveTo(0, 44, -27, 38);
      ctx.quadraticCurveTo(-32, 6, -26, -24);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = options.suitTint ? 'rgba(254,202,202,0.55)' : 'rgba(167,243,208,0.6)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Inner dark shirt & glowing accent stripe
      ctx.fillStyle = '#09110e';
      ctx.beginPath();
      ctx.roundRect(-14, -22, 28, 56, 8);
      ctx.fill();
      ctx.strokeStyle = options.suitTint ? '#f87171' : '#4ade80';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, -18);
      ctx.lineTo(0, 30);
      ctx.stroke();

      // Smooth Curved Arms & Hands
      const skinGrad = ctx.createLinearGradient(0, -80, 0, -25);
      skinGrad.addColorStop(0, '#eab089');
      skinGrad.addColorStop(1, '#c9855c');

      if (options.holdingStomach) {
        ctx.strokeStyle = options.suitTint ? '#b91c1c' : '#059669';
        ctx.lineWidth = 13;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(-26, -16);
        ctx.quadraticCurveTo(-34, 6, -10, 14);
        ctx.moveTo(26, -16);
        ctx.quadraticCurveTo(34, 6, 10, 14);
        ctx.stroke();

        ctx.fillStyle = '#d6976c';
        ctx.beginPath();
        ctx.arc(-8, 14, 6.5, 0, Math.PI * 2);
        ctx.arc(8, 14, 6.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (options.hasGun) {
        ctx.strokeStyle = '#059669';
        ctx.lineWidth = 13;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-25, -15);
        ctx.quadraticCurveTo(-30, 8, -8, 10);
        ctx.moveTo(25, -15);
        ctx.quadraticCurveTo(34, 0, 26, 6);
        ctx.stroke();

        // Sleek Bio-Blaster Weapon
        const gunGrad = ctx.createLinearGradient(0, -8, 86, 12);
        gunGrad.addColorStop(0, '#1e293b');
        gunGrad.addColorStop(1, '#475569');
        ctx.fillStyle = gunGrad;
        ctx.beginPath();
        ctx.roundRect(4, -5, 82, 13, 5);
        ctx.fill();
        ctx.fillStyle = '#4ade80';
        ctx.beginPath();
        ctx.roundRect(22, -1, 44, 4, 2);
        ctx.fill();
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.roundRect(-2, 4, 22, 13, 4);
        ctx.fill();
      } else {
        ctx.strokeStyle = options.suitTint ? '#b91c1c' : '#059669';
        ctx.lineWidth = 13;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-26, -16);
        ctx.quadraticCurveTo(-36, 4 - stride * 0.35, -31, 24 - stride * 0.45);
        ctx.moveTo(26, -16);
        ctx.quadraticCurveTo(36, 4 + stride * 0.35, 31, 24 + stride * 0.45);
        ctx.stroke();

        ctx.fillStyle = '#d6976c';
        ctx.beginPath();
        ctx.arc(-31, 26 - stride * 0.45, 6.5, 0, Math.PI * 2);
        ctx.arc(31, 26 + stride * 0.45, 6.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Neck
      ctx.fillStyle = '#bd7b54';
      ctx.beginPath();
      ctx.roundRect(-9, -36, 18, 16, 6);
      ctx.fill();

      // Smooth Contoured Head
      ctx.fillStyle = skinGrad;
      ctx.beginPath();
      ctx.moveTo(-24, -68);
      ctx.quadraticCurveTo(-24, -95, 0, -96);
      ctx.quadraticCurveTo(24, -95, 24, -68);
      ctx.quadraticCurveTo(24, -40, 0, -34);
      ctx.quadraticCurveTo(-24, -40, -24, -68);
      ctx.closePath();
      ctx.fill();

      // Soft Ears
      ctx.fillStyle = '#ce8b62';
      ctx.beginPath();
      ctx.ellipse(-24, -63, 4.5, 8, 0, 0, Math.PI * 2);
      ctx.ellipse(24, -63, 4.5, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Swept Wavy Dark Hair with Subtle Highlight
      ctx.fillStyle = '#1f1510';
      ctx.beginPath();
      ctx.moveTo(-26, -68);
      ctx.quadraticCurveTo(-28, -104, 0, -104);
      ctx.quadraticCurveTo(28, -104, 26, -68);
      ctx.quadraticCurveTo(20, -82, 8, -82);
      ctx.quadraticCurveTo(-4, -77, -14, -84);
      ctx.quadraticCurveTo(-22, -80, -26, -68);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-14, -96);
      ctx.quadraticCurveTo(0, -100, 14, -94);
      ctx.stroke();

      // Expressive Smooth Eyes & Arched Eyebrows
      const drawEye = (ex: number) => {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(ex, -64, 5.5, 4.8, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(ex + 0.6, -63.8, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(ex + 1.6, -65, 1.1, 0, Math.PI * 2);
        ctx.fill();
      };
      drawEye(-10);
      drawEye(10);

      // Eyebrows
      ctx.strokeStyle = '#1f1510';
      ctx.lineWidth = 2.6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      if (options.mood === 'pain') {
        ctx.moveTo(-16, -72);
        ctx.quadraticCurveTo(-10, -76, -4, -71);
        ctx.moveTo(4, -71);
        ctx.quadraticCurveTo(10, -76, 16, -72);
      } else if (options.mood === 'shock') {
        ctx.moveTo(-16, -75);
        ctx.quadraticCurveTo(-10, -80, -4, -75);
        ctx.moveTo(4, -75);
        ctx.quadraticCurveTo(10, -80, 16, -75);
      } else {
        ctx.moveTo(-16, -73);
        ctx.quadraticCurveTo(-10, -76, -4, -73);
        ctx.moveTo(4, -73);
        ctx.quadraticCurveTo(10, -76, 16, -73);
      }
      ctx.stroke();

      // Smooth Mouth Expression
      ctx.lineCap = 'round';
      if (options.mood === 'shock') {
        ctx.fillStyle = '#7f1d1d';
        ctx.beginPath();
        ctx.ellipse(0, -48, 6.5, 8, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (options.mood === 'pain') {
        ctx.strokeStyle = '#7f1d1d';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-8, -46);
        ctx.quadraticCurveTo(0, -52, 8, -46);
        ctx.stroke();
      } else if (options.mood === 'grin') {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(-10, -51);
        ctx.quadraticCurveTo(0, -42, 10, -51);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#7f1d1d';
        ctx.lineWidth = 1.6;
        ctx.stroke();
      } else {
        ctx.strokeStyle = '#7f1d1d';
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.moveTo(-7, -49);
        ctx.quadraticCurveTo(0, -46, 7, -49);
        ctx.stroke();
      }

      ctx.restore();
    };

    const renderFrame = (now: number) => {
      const t = (now - sceneStart) / 1000;
      ctx.clearRect(0, 0, W, H);

      if (beatIndex === 0) {
        // === SCENE 1: CINEMATIC SUNLIT COLLEGE DORM ROOM ===
        const wallGrad = ctx.createLinearGradient(0, 0, 0, 480);
        wallGrad.addColorStop(0, '#13212c');
        wallGrad.addColorStop(1, '#243b4a');
        ctx.fillStyle = wallGrad;
        ctx.fillRect(0, 0, W, 485);

        // Soft perspective corner walls
        ctx.fillStyle = 'rgba(7, 14, 20, 0.52)';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(185, 85);
        ctx.lineTo(185, 485);
        ctx.lineTo(0, 620);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(W, 0);
        ctx.lineTo(W - 185, 85);
        ctx.lineTo(W - 185, 485);
        ctx.lineTo(W, 620);
        ctx.closePath();
        ctx.fill();

        // Warm hardwood floor with perspective grain
        const floorGrad = ctx.createLinearGradient(0, 485, 0, H);
        floorGrad.addColorStop(0, '#452817');
        floorGrad.addColorStop(1, '#25140b');
        ctx.fillStyle = floorGrad;
        ctx.fillRect(0, 485, W, H - 485);

        ctx.strokeStyle = 'rgba(24, 12, 6, 0.45)';
        ctx.lineWidth = 2;
        for (let i = -5; i <= 5; i++) {
          ctx.beginPath();
          ctx.moveTo(W * 0.5 + i * 110, 485);
          ctx.lineTo(W * 0.5 + i * 250, H);
          ctx.stroke();
        }

        // Emerald accent rug
        const rugGrad = ctx.createLinearGradient(340, 525, 940, 675);
        rugGrad.addColorStop(0, '#064e3b');
        rugGrad.addColorStop(1, '#022c22');
        ctx.fillStyle = rugGrad;
        ctx.beginPath();
        ctx.moveTo(390, 525);
        ctx.lineTo(890, 525);
        ctx.lineTo(980, 675);
        ctx.lineTo(300, 675);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(52, 211, 153, 0.5)';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Window with sunlit blue-gold sky & panes
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(508, 108, 264, 196, 12);
        ctx.fill();

        const skyGrad = ctx.createLinearGradient(520, 120, 760, 292);
        skyGrad.addColorStop(0, '#7dd3fc');
        skyGrad.addColorStop(1, '#fde68a');
        ctx.fillStyle = skyGrad;
        ctx.beginPath();
        ctx.roundRect(520, 120, 240, 172, 8);
        ctx.fill();

        // Window mullions
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(640, 120);
        ctx.lineTo(640, 292);
        ctx.moveTo(520, 206);
        ctx.lineTo(760, 206);
        ctx.stroke();

        // Volumetric sunbeam casting across the room
        const beamGrad = ctx.createLinearGradient(580, 292, 860, 680);
        beamGrad.addColorStop(0, 'rgba(253, 224, 71, 0.24)');
        beamGrad.addColorStop(1, 'rgba(253, 224, 71, 0)');
        ctx.fillStyle = beamGrad;
        ctx.beginPath();
        ctx.moveTo(515, 292);
        ctx.lineTo(765, 292);
        ctx.lineTo(1060, 695);
        ctx.lineTo(420, 695);
        ctx.closePath();
        ctx.fill();

        // Floating sunlit dust motes
        for (let m = 0; m < 16; m++) {
          const mx = 520 + ((m * 37 + t * 14) % 420);
          const my = 260 + ((m * 53 + Math.sin(t * 1.4 + m) * 28) % 360);
          ctx.fillStyle = `rgba(254, 240, 138, ${0.25 + 0.25 * Math.sin(t * 2 + m)})`;
          ctx.beginPath();
          ctx.arc(mx, my, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Framed LO5 Biology Poster on Left Wall
        ctx.fillStyle = '#064e3b';
        ctx.beginPath();
        ctx.roundRect(245, 138, 152, 188, 10);
        ctx.fill();
        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = '#ecfdf5';
        ctx.font = 'bold 19px sans-serif';
        ctx.fillText('LO5 BIOLOGY', 260, 174);
        ctx.strokeStyle = 'rgba(134, 239, 172, 0.85)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(321, 240, 38, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(321, 240, 20, 48, Math.PI / 4, 0, Math.PI * 2);
        ctx.stroke();

        // Dorm Bed (Left)
        ctx.fillStyle = '#5c2d16';
        ctx.beginPath();
        ctx.roundRect(205, 360, 315, 128, 12);
        ctx.fill();
        const blanketGrad = ctx.createLinearGradient(215, 340, 510, 425);
        blanketGrad.addColorStop(0, '#1e40af');
        blanketGrad.addColorStop(1, '#1e3a8a');
        ctx.fillStyle = blanketGrad;
        ctx.beginPath();
        ctx.roundRect(218, 340, 290, 76, 14);
        ctx.fill();
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.roundRect(225, 314, 82, 34, 14);
        ctx.fill();

        // Study Desk + Open Book + Flashing 14:45 Clock (Right)
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.roundRect(810, 346, 265, 142, 10);
        ctx.fill();
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.roundRect(840, 330, 88, 18, 4);
        ctx.fill();
        ctx.fillStyle = '#09090b';
        ctx.beginPath();
        ctx.roundRect(952, 304, 102, 44, 8);
        ctx.fill();
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.stroke();
        if (Math.floor(t * 2.5) % 2 === 0) {
          ctx.fillStyle = '#f87171';
          ctx.font = 'bold 24px monospace';
          ctx.fillText('14:45', 966, 334);
        }

        // Animated waking hero
        const jumpY = 428 - Math.abs(Math.sin(t * 4.2)) * 24;
        drawHero2D(640 + Math.sin(t * 1.8) * 18, jumpY, 1.48, {
          mood: 'shock',
          runningPhase: t * 7.5,
        });
      } else if (beatIndex === 1) {
        // === SCENE 2: SLEEK PERSPECTIVE CAFETERIA HALL ===
        const wallGrad = ctx.createLinearGradient(0, 0, 0, 450);
        wallGrad.addColorStop(0, '#0f172a');
        wallGrad.addColorStop(1, '#1e293b');
        ctx.fillStyle = wallGrad;
        ctx.fillRect(0, 0, W, 450);

        // Overhead glowing light panels
        for (let lx = 260; lx <= 1020; lx += 380) {
          const glow = ctx.createRadialGradient(lx, 42, 10, lx, 42, 220);
          glow.addColorStop(0, 'rgba(226, 232, 240, 0.35)');
          glow.addColorStop(1, 'rgba(226, 232, 240, 0)');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(lx, 42, 220, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#f1f5f9';
          ctx.beginPath();
          ctx.roundRect(lx - 95, 28, 190, 14, 7);
          ctx.fill();
        }

        // Glossy checkered terrazzo floor
        ctx.fillStyle = '#141c2b';
        ctx.fillRect(0, 450, W, H - 450);
        for (let r = 0; r < 6; r++) {
          const y0 = 450 + r * 46;
          for (let c = 0; c < 15; c++) {
            if ((r + c) % 2 === 0) {
              ctx.fillStyle = 'rgba(51, 65, 85, 0.5)';
              ctx.beginPath();
              ctx.roundRect(c * 90 + 4, y0 + 2, 82, 40, 4);
              ctx.fill();
            }
          }
        }

        // Serving counter & closed metallic shutter
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.roundRect(220, 145, 840, 305, 14);
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(275, 192, 730, 175, 8);
        ctx.fill();
        for (let slat = 0; slat < 9; slat++) {
          ctx.fillStyle = slat % 2 === 0 ? '#64748b' : '#475569';
          ctx.beginPath();
          ctx.roundRect(285, 200 + slat * 18, 710, 13, 4);
          ctx.fill();
        }

        // Neon Lunch Closed Sign
        ctx.fillStyle = '#450a0a';
        ctx.beginPath();
        ctx.roundRect(455, 86, 370, 52, 12);
        ctx.fill();
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = Math.floor(t * 2.5) % 2 === 0 ? '#fecaca' : '#ef4444';
        ctx.font = 'bold 28px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('LUNCH CLOSED', 640, 121);
        ctx.textAlign = 'left';

        // Empty metal tray table (right)
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.roundRect(875, 464, 280, 26, 8);
        ctx.fill();
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.roundRect(905, 490, 18, 108, 4);
        ctx.roundRect(1105, 490, 18, 108, 4);
        ctx.fill();
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.roundRect(960, 450, 110, 12, 5);
        ctx.fill();

        // Hero slumping slightly, holding hungry stomach
        const sway = Math.sin(t * 3.8) * 6;
        drawHero2D(455 + sway, 468, 1.65, {
          mood: 'pain',
          holdingStomach: true,
        });

        // Clean Speech Pill
        ctx.fillStyle = 'rgba(69, 10, 10, 0.9)';
        ctx.beginPath();
        ctx.roundRect(280, 224, 340, 56, 28);
        ctx.fill();
        ctx.strokeStyle = '#f87171';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.fillStyle = '#fef2f2';
        ctx.font = 'bold 21px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('SO HUNGRY · ENERGY 0%', 450, 259);
        ctx.textAlign = 'left';
      } else if (beatIndex === 2) {
        // === SCENE 3: QUANTUM MICROSCOPIC SHRINK VORTEX ===
        const bgGrad = ctx.createRadialGradient(640, 360, 40, 640, 360, 760);
        bgGrad.addColorStop(0, '#072a1f');
        bgGrad.addColorStop(0.55, '#071422');
        bgGrad.addColorStop(1, '#02060b');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, W, H);

        // Bioluminescent vascular membrane horizon
        const floorGrad = ctx.createLinearGradient(0, 540, 0, H);
        floorGrad.addColorStop(0, '#2b0917');
        floorGrad.addColorStop(1, '#120309');
        ctx.fillStyle = floorGrad;
        ctx.fillRect(0, 540, W, H - 540);

        // Translucent biconcave Red Blood Cells floating gracefully
        const drawRbc = (rx: number, ry: number, rad: number) => {
          const rbcGrad = ctx.createRadialGradient(rx - 18, ry - 18, 12, rx, ry, rad);
          rbcGrad.addColorStop(0, '#f87171');
          rbcGrad.addColorStop(0.65, '#dc2626');
          rbcGrad.addColorStop(1, '#7f1d1d');
          ctx.fillStyle = rbcGrad;
          ctx.beginPath();
          ctx.ellipse(rx, ry, rad, rad * 0.64, 0.22, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = 'rgba(127, 29, 29, 0.55)';
          ctx.beginPath();
          ctx.ellipse(rx, ry + 4, rad * 0.56, rad * 0.34, 0.22, 0, Math.PI * 2);
          ctx.fill();
        };
        drawRbc(195, 210 + Math.sin(t * 1.9) * 16, 118);
        drawRbc(1095, 245 + Math.cos(t * 1.7) * 16, 128);

        // Smooth telescoping quantum energy rings
        for (let r = 0; r < 7; r++) {
          const p = (t * 0.72 + r / 7) % 1;
          const radius = 430 * (1 - p) + 26;
          ctx.strokeStyle =
            r % 2 === 0
              ? `rgba(248, 113, 113, ${0.55 * (1 - p)})`
              : `rgba(74, 222, 128, ${0.55 * (1 - p)})`;
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.ellipse(640, 490, radius, radius * 0.34, 0, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Smooth scaling echoes of the shrinking protagonist
        const echoCount = 7;
        const shrinkCycle = Math.min(1, (t % 3.2) / 2.2);
        for (let i = 0; i < echoCount; i++) {
          const stepFrac = i / (echoCount - 1);
          const scale = 2.05 - stepFrac * 1.56;
          const yPos = 355 + stepFrac * 210;
          const isFinalTiny = i === echoCount - 1;
          const echoAlpha = isFinalTiny
            ? 1.0
            : Math.max(0.14, 0.42 - stepFrac * 0.26) *
              (0.65 + 0.35 * Math.sin(t * 8 - i));

          if (stepFrac <= shrinkCycle + 0.15) {
            drawHero2D(640, yPos, scale, {
              mood: isFinalTiny ? 'shock' : 'pain',
              suitTint: true,
              alpha: echoAlpha,
            });
          }
        }

        // Crisp glowing caption pill
        ctx.fillStyle = 'rgba(4, 15, 10, 0.88)';
        ctx.beginPath();
        ctx.roundRect(275, 36, 730, 58, 29);
        ctx.fill();
        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.fillStyle = '#ecfdf5';
        ctx.font = 'bold 23px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('BECAUSE HE WAS HUNGRY, HIS BODY SHRANK LIKE ANT-MAN!', 640, 73);
        ctx.textAlign = 'left';
      } else {
        // === SCENE 4: CELLULAR FORTRESS & QUEEN OF THE CELLS STANDOFF ===
        const arenaGrad = ctx.createLinearGradient(0, 0, 0, 500);
        arenaGrad.addColorStop(0, '#160410');
        arenaGrad.addColorStop(1, '#360722');
        ctx.fillStyle = arenaGrad;
        ctx.fillRect(0, 0, W, 505);

        const floorGrad = ctx.createLinearGradient(0, 505, 0, H);
        floorGrad.addColorStop(0, '#270a19');
        floorGrad.addColorStop(1, '#12030b');
        ctx.fillStyle = floorGrad;
        ctx.fillRect(0, 505, W, H - 505);

        // Organic bioluminescent structural pillars
        const drawPillar = (px: number) => {
          const pGrad = ctx.createLinearGradient(px, 60, px + 68, 505);
          pGrad.addColorStop(0, '#501032');
          pGrad.addColorStop(1, '#2d081c');
          ctx.fillStyle = pGrad;
          ctx.beginPath();
          ctx.roundRect(px, 60, 68, 445, 18);
          ctx.fill();
          ctx.fillStyle = 'rgba(74, 222, 128, 0.72)';
          ctx.beginPath();
          ctx.roundRect(px + 27, 85, 14, 395, 7);
          ctx.fill();
        };
        drawPillar(140);
        drawPillar(1072);

        // Armed Hero on the Left
        drawHero2D(310, 455, 1.52, {
          mood: 'grin',
          hasGun: true,
        });

        // Sleek Organic Queen of the Cells on the Right
        const qx = 910;
        const qy = 305 + Math.sin(t * 2.2) * 12;

        const queenAura = ctx.createRadialGradient(qx, qy, 20, qx, qy, 190);
        queenAura.addColorStop(0, 'rgba(236, 72, 153, 0.42)');
        queenAura.addColorStop(1, 'rgba(236, 72, 153, 0)');
        ctx.fillStyle = queenAura;
        ctx.beginPath();
        ctx.arc(qx, qy, 190, 0, Math.PI * 2);
        ctx.fill();

        // Orbiting 5 Luminous Protein Keys
        const keyColors = ['#fb7185', '#6ee7b7', '#f97316', '#ec4899', '#2dd4bf'];
        keyColors.forEach((kc, idx) => {
          const ang = t * 1.4 + (idx / 5) * Math.PI * 2;
          const kx = qx + Math.cos(ang) * 160;
          const ky = qy + Math.sin(ang) * 95;
          ctx.fillStyle = kc;
          ctx.beginPath();
          ctx.arc(kx, ky, 13, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = kc;
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(kx, ky + 10);
          ctx.lineTo(kx, ky + 28);
          ctx.moveTo(kx, ky + 22);
          ctx.lineTo(kx + 8, ky + 22);
          ctx.stroke();
        });

        // Curved Golden Crown
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.moveTo(qx - 64, qy - 102);
        ctx.lineTo(qx - 48, qy - 146);
        ctx.lineTo(qx - 18, qy - 116);
        ctx.lineTo(qx, qy - 158);
        ctx.lineTo(qx + 18, qy - 116);
        ctx.lineTo(qx + 48, qy - 146);
        ctx.lineTo(qx + 64, qy - 102);
        ctx.closePath();
        ctx.fill();

        // Queen Organic Membrane Body
        const qBodyGrad = ctx.createRadialGradient(qx - 25, qy - 30, 18, qx, qy, 105);
        qBodyGrad.addColorStop(0, '#f472b6');
        qBodyGrad.addColorStop(0.65, '#be185d');
        qBodyGrad.addColorStop(1, '#831843');
        ctx.fillStyle = qBodyGrad;
        ctx.beginPath();
        ctx.ellipse(qx, qy, 88, 94, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(251, 207, 232, 0.55)';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Queen Glowing Eyes & Sinister Curved Smile
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.ellipse(qx - 28, qy - 22, 14, 9, -0.22, 0, Math.PI * 2);
        ctx.ellipse(qx + 28, qy - 22, 14, 9, 0.22, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(qx - 26, qy - 21, 5, 0, Math.PI * 2);
        ctx.arc(qx + 26, qy - 21, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#3b0724';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(qx - 36, qy + 18);
        ctx.quadraticCurveTo(qx, qy + 42, qx + 36, qy + 18);
        ctx.stroke();

        // Floating Organic Pathogens
        const bacSpots = [
          { x: 645, y: 438, col: '#22c55e' },
          { x: 715, y: 468, col: '#ef4444' },
          { x: 1080, y: 436, col: '#a855f7' },
          { x: 1145, y: 465, col: '#f59e0b' },
        ];
        bacSpots.forEach((b, idx) => {
          const by = b.y + Math.sin(t * 3.8 + idx) * 9;
          ctx.fillStyle = b.col;
          ctx.beginPath();
          ctx.ellipse(b.x, by, 22, 32, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(b.x - 7, by - 8, 4, 0, Math.PI * 2);
          ctx.arc(b.x + 7, by - 8, 4, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      rafId = requestAnimationFrame(renderFrame);
    };

    rafId = requestAnimationFrame(renderFrame);
    return () => cancelAnimationFrame(rafId);
  }, [beatIndex]);

  const shownNarrative = beat.narrative.slice(0, typedCount);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
      aria-label="2D Story Cutscene"
      className="fixed inset-0 z-30 bg-[#030A07] flex flex-col items-center justify-center px-5 sm:px-10 py-5 overflow-y-auto"
    >
      <div className="w-full max-w-6xl flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span
            className="font-mono text-sm sm:text-base font-bold tracking-widest text-[#86EFAC]"
            style={{ textShadow: GREEN_TEXT_AURA }}
          >
            {beat.chapter} · {beatIndex + 1} / {CUTSCENE_BEATS.length}
          </span>

          <div className="flex items-center gap-3">
            {onBackToPresentation && (
              <button
                type="button"
                onClick={onBackToPresentation}
                className="px-4 py-2 rounded-lg border border-emerald-400/35 bg-[#05120D] font-mono text-xs sm:text-sm font-semibold text-[#A7F3D0] hover:text-white cursor-pointer"
                style={{ textShadow: GREEN_TEXT_AURA }}
              >
                ← Presentation
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                playShotgunBlastSound();
                onStartGame();
              }}
              className="px-4 py-2 rounded-lg border border-emerald-400/45 bg-[#061810] font-mono text-xs sm:text-sm font-bold text-[#86EFAC] hover:bg-emerald-950/80 cursor-pointer"
              style={{ textShadow: GREEN_TEXT_AURA }}
            >
              Skip Story → Enter 3D Arena
            </button>
            <button
              type="button"
              onClick={onSkipToOutro}
              className="px-3.5 py-2 rounded-lg border border-emerald-400/25 bg-black/70 font-mono text-xs text-[#A7F3D0] hover:text-white cursor-pointer"
            >
              Credits →
            </button>
          </div>
        </div>

        <div className="relative w-full aspect-video max-h-[68vh] rounded-2xl overflow-hidden border border-emerald-400/45 bg-[#06100C] shadow-[0_0_40px_rgba(34,197,94,0.18)]">
          <canvas ref={canvasRef} className="w-full h-full block object-cover" />

          <div
            className="pointer-events-none absolute top-4 left-5 px-3.5 py-1.5 rounded-lg bg-[#03120B]/85 backdrop-blur-md border border-emerald-400/40 font-mono text-xs sm:text-sm font-bold text-[#86EFAC]"
            style={{ textShadow: GREEN_TEXT_AURA }}
          >
            {beat.badgeText}
          </div>

          <div className="absolute inset-x-4 bottom-4 rounded-xl bg-[#03100A]/86 backdrop-blur-md border border-emerald-400/40 px-5 py-4 sm:px-7 sm:py-5 shadow-2xl">
            <h1
              className="font-display text-2xl sm:text-4xl font-bold text-[#ECFDF5] mb-1.5"
              style={{ textShadow: GREEN_HEADING_AURA }}
            >
              {beat.title}
            </h1>
            <p
              className="text-base sm:text-xl text-[#DCFCE7] leading-relaxed min-h-[3.2rem]"
              style={{ textShadow: GREEN_TEXT_AURA }}
            >
              {shownNarrative}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {CUTSCENE_BEATS.map((b, idx) => (
              <button
                key={b.chapter}
                type="button"
                onClick={() => {
                  setBeatIndex(idx);
                  playCutsceneBlipSound();
                }}
                aria-label={`Jump to scene ${idx + 1}`}
                className={`h-2.5 rounded-full transition-all cursor-pointer ${
                  idx === beatIndex
                    ? 'w-10 bg-[#4ADE80] shadow-[0_0_12px_rgba(74,222,128,0.85)]'
                    : 'w-4 bg-emerald-400/30 hover:bg-emerald-400/60'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-3">
            {beatIndex > 0 && (
              <button
                type="button"
                onClick={() => {
                  setBeatIndex((prev) => prev - 1);
                  playCutsceneBlipSound();
                }}
                className="px-4 py-2.5 rounded-lg border border-emerald-400/35 bg-[#04100B] font-mono text-sm text-[#A7F3D0] hover:text-white cursor-pointer"
              >
                ← Prev Scene
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              className="px-7 py-3 rounded-lg bg-[#22C55E] hover:bg-[#4ADE80] text-slate-950 font-display text-base sm:text-lg font-bold cursor-pointer shadow-[0_0_24px_rgba(74,222,128,0.5)] transition-colors"
            >
              {beatIndex < CUTSCENE_BEATS.length - 1
                ? 'Next Scene →'
                : 'Enter Cellular Fortress →'}
            </button>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
