import { useCallback, useEffect, useRef, useState } from 'react';
import { BioDoomGame } from './BioDoomGame';
import { StoryCutscene2D } from './StoryCutscene2D';

export interface ShotgunAmmoHudState {
  showAmmoHud: boolean;
  activeWeapon: 'shotgun' | 'knife';
  ammoActive: boolean;
  magAmmo: number;
  reserveShells: number;
  maxMag: number;
  reloading: boolean;
  weaponUnlocked: boolean;
  reloadCount: number;
  knifeThrown: boolean;
}

export interface EnemyDefeatedEvent {
  viaKnife: boolean;
  kind: string;
  label: string;
  colorHex: string;
  isBoss: boolean;
}

interface BloodDroplet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  fadeRate: number;
  gravity: number;
  color: string;
  sticky: boolean;
  trailLen: number;
}

interface KnifeSwingFx {
  age: number;
  duration: number;
  didHit: boolean;
  dir: number;
}

const BLOOD_PALETTE = [
  '#7F1D1D',
  '#991B1B',
  '#B91C1C',
  '#DC2626',
  '#EF4444',
  '#881337',
];

interface GameStageProps {
  onCompleteToOutro: () => void;
  onBackToPresentation?: () => void;
}

const INITIAL_AMMO_HUD: ShotgunAmmoHudState = {
  showAmmoHud: true,
  activeWeapon: 'shotgun',
  ammoActive: false,
  magAmmo: 0,
  reserveShells: 0,
  maxMag: 8,
  reloading: false,
  weaponUnlocked: false,
  reloadCount: 0,
  knifeThrown: false,
};

export function GameStage({ onCompleteToOutro, onBackToPresentation }: GameStageProps) {
  const [stage, setStage] = useState<'cutscene' | 'play'>('cutscene');
  const [ammoHud, setAmmoHud] = useState<ShotgunAmmoHudState>(INITIAL_AMMO_HUD);
  const [knifeSlashing, setKnifeSlashing] = useState(false);
  const dropletCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const dropletsRef = useRef<BloodDroplet[]>([]);
  const knifeSwingsRef = useRef<KnifeSwingFx[]>([]);
  const slashFlipRef = useRef(1);
  const slashHudTimerRef = useRef<number>(0);
  const dropletRafRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);

  const handleAmmoHudChange = useCallback((next: ShotgunAmmoHudState) => {
    setAmmoHud(next);
  }, []);

  const stepDroplets = useCallback((now: number) => {
    const canvas = dropletCanvasRef.current;
    const list = dropletsRef.current;
    const swings = knifeSwingsRef.current;
    if (!canvas || (list.length === 0 && swings.length === 0)) {
      dropletRafRef.current = 0;
      lastFrameTimeRef.current = 0;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const targetW = Math.floor(window.innerWidth * dpr);
    const targetH = Math.floor(window.innerHeight * dpr);
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      dropletRafRef.current = 0;
      return;
    }

    const dt =
      lastFrameTimeRef.current > 0
        ? Math.min(0.05, (now - lastFrameTimeRef.current) / 1000)
        : 0.016;
    lastFrameTimeRef.current = now;

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    const w = window.innerWidth;
    const h = window.innerHeight;
    const cx = w * 0.5;
    const cy = h * 0.46;

    // 1. Smooth 60fps Screen-Space Knife Swing Crescent & Sweeping Blade
    for (let i = swings.length - 1; i >= 0; i--) {
      const sw = swings[i];
      sw.age += dt;
      const rawP = sw.age / sw.duration;
      if (rawP >= 1) {
        swings.splice(i, 1);
        continue;
      }

      const easeOut = 1 - Math.pow(1 - rawP, 3);
      const fade = rawP < 0.25 ? rawP / 0.25 : 1 - (rawP - 0.25) / 0.75;
      const span = Math.min(w, h) * 0.32;

      const evalArc = (u: number): [number, number] => {
        const xOff = (1 - 2 * u) * span * 0.92 * sw.dir;
        const yCurve = -Math.sin(u * Math.PI) * span * 0.24;
        const yDiag = (u - 0.5) * span * 1.05;
        return [cx + xOff, cy + yDiag + yCurve];
      };

      const leadU = Math.min(1, easeOut * 1.15);
      const tailU = Math.max(0, easeOut - 0.52);

      // Tapered crescent arc polygon along the cut
      const segs = 18;
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, fade));

      // Outer luminous emerald bio-steel slash ribbon
      ctx.beginPath();
      for (let s = 0; s <= segs; s++) {
        const t = s / segs;
        const u = tailU + (leadU - tailU) * t;
        const [ax, ay] = evalArc(u);
        const width = Math.sin(t * Math.PI) * 20 * (1 - rawP * 0.45);
        if (s === 0) ctx.moveTo(ax, ay - width * 0.5);
        else ctx.lineTo(ax, ay - width * 0.5);
      }
      for (let s = segs; s >= 0; s--) {
        const t = s / segs;
        const u = tailU + (leadU - tailU) * t;
        const [ax, ay] = evalArc(u);
        const width = Math.sin(t * Math.PI) * 20 * (1 - rawP * 0.45);
        ctx.lineTo(ax, ay + width * 0.5);
      }
      ctx.closePath();

      const grad = ctx.createLinearGradient(
        cx + span * sw.dir,
        cy - span * 0.5,
        cx - span * sw.dir,
        cy + span * 0.5
      );
      grad.addColorStop(0, 'rgba(74, 222, 128, 0.12)');
      grad.addColorStop(0.5, sw.didHit ? 'rgba(248, 113, 113, 0.85)' : 'rgba(134, 239, 172, 0.82)');
      grad.addColorStop(1, 'rgba(248, 250, 252, 0.96)');
      ctx.fillStyle = grad;
      ctx.fill();

      // Inner razor-white core streak
      ctx.beginPath();
      for (let s = 0; s <= segs; s++) {
        const t = s / segs;
        const u = tailU + (leadU - tailU) * t;
        const [ax, ay] = evalArc(u);
        if (s === 0) ctx.moveTo(ax, ay);
        else ctx.lineTo(ax, ay);
      }
      ctx.strokeStyle = '#F8FAFC';
      ctx.lineWidth = Math.max(1.5, 4.5 * (1 - rawP));
      ctx.lineCap = 'round';
      ctx.stroke();

      // Sweeping translucent screen-space knife blade silhouette at the leading edge
      if (rawP < 0.72) {
        const [bx, by] = evalArc(Math.min(1, easeOut));
        ctx.save();
        ctx.translate(bx, by);
        ctx.rotate((sw.dir > 0 ? -0.65 : 0.65) - easeOut * 1.45 * sw.dir);
        ctx.globalAlpha = Math.max(0, (1 - rawP / 0.72) * 0.75);
        ctx.fillStyle = '#E2E8F0';
        ctx.beginPath();
        ctx.moveTo(0, -56);
        ctx.lineTo(10, -8);
        ctx.lineTo(4, 18);
        ctx.lineTo(-4, 18);
        ctx.lineTo(-9, -10);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#4ADE80';
        ctx.fillRect(-8, -14, 3, 28);
        ctx.restore();
      }

      // Impact star glint on enemy contact
      if (sw.didHit && rawP < 0.6) {
        const hitAlpha = Math.sin((rawP / 0.6) * Math.PI);
        const glintR = 26 + rawP * 42;
        ctx.globalAlpha = hitAlpha * 0.92;
        ctx.strokeStyle = '#FCA5A5';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx - glintR, cy - glintR * 0.6);
        ctx.lineTo(cx + glintR, cy + glintR * 0.6);
        ctx.moveTo(cx + glintR * 0.7, cy - glintR * 0.8);
        ctx.lineTo(cx - glintR * 0.7, cy + glintR * 0.8);
        ctx.stroke();
      }

      ctx.restore();
    }

    for (let i = list.length - 1; i >= 0; i--) {
      const p = list[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += p.gravity * dt;
      if (p.sticky) {
        p.vx *= Math.max(0, 1 - 6.5 * dt);
        p.vy = Math.min(92, p.vy);
        p.trailLen = Math.min(p.radius * 5.2, p.trailLen + Math.abs(p.vy) * dt * 0.48);
      } else {
        p.vx *= Math.max(0, 1 - 1.15 * dt);
      }
      p.alpha -= p.fadeRate * dt;

      if (p.alpha <= 0 || p.y > h + 60 || p.x < -60 || p.x > w + 60) {
        list.splice(i, 1);
        continue;
      }

      ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
      ctx.fillStyle = p.color;

      if (p.sticky) {
        // Viscous blood-like droplet sliding down the visor with a drip tail
        if (p.trailLen > 1) {
          ctx.beginPath();
          ctx.moveTo(p.x - p.radius * 0.42, p.y);
          ctx.lineTo(p.x + p.radius * 0.42, p.y);
          ctx.lineTo(p.x + p.radius * 0.14, p.y - p.trailLen);
          ctx.lineTo(p.x - p.radius * 0.14, p.y - p.trailLen);
          ctx.closePath();
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // High-speed directional blood droplet stretched along velocity
        const speed = Math.hypot(p.vx, p.vy);
        const angle = Math.atan2(p.vy, p.vx);
        const stretch = Math.min(3.4, 1 + speed / 420);
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.ellipse(0, 0, p.radius * stretch, p.radius * 0.72, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Glossy wet highlight on larger droplets
      if (p.radius >= 4.2) {
        ctx.globalAlpha = Math.max(0, Math.min(0.45, p.alpha * 0.48));
        ctx.fillStyle = '#FCA5A5';
        ctx.beginPath();
        ctx.arc(p.x - p.radius * 0.28, p.y - p.radius * 0.28, p.radius * 0.28, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();

    if (list.length > 0 || swings.length > 0) {
      dropletRafRef.current = requestAnimationFrame(stepDroplets);
    } else {
      dropletRafRef.current = 0;
      lastFrameTimeRef.current = 0;
    }
  }, []);

  const handleKnifeSwing = useCallback(
    (didHit: boolean) => {
      slashFlipRef.current *= -1;
      knifeSwingsRef.current.push({
        age: 0,
        duration: 0.28,
        didHit,
        dir: slashFlipRef.current,
      });

      setKnifeSlashing(true);
      if (slashHudTimerRef.current) {
        window.clearTimeout(slashHudTimerRef.current);
      }
      slashHudTimerRef.current = window.setTimeout(() => {
        setKnifeSlashing(false);
      }, 240);

      if (!dropletRafRef.current) {
        lastFrameTimeRef.current = 0;
        dropletRafRef.current = requestAnimationFrame(stepDroplets);
      }
    },
    [stepDroplets]
  );

  const handleEnemyDefeated = useCallback(
    (event: EnemyDefeatedEvent) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const cx = w * 0.5;
      const cy = h * 0.46;

      // Knife defeats spawn a much denser, visceral diagonal slash spray of blood-like droplets
      const count = event.viaKnife
        ? event.isBoss
          ? 84
          : 56
        : event.isBoss
        ? 64
        : 26;

      const list = dropletsRef.current;

      for (let i = 0; i < count; i++) {
        const isSticky = i % 5 === 0;
        const color = BLOOD_PALETTE[Math.floor(Math.random() * BLOOD_PALETTE.length)];

        if (isSticky) {
          list.push({
            x: cx + (Math.random() - 0.5) * w * (event.viaKnife ? 0.78 : 0.62),
            y: cy + (Math.random() - 0.45) * h * 0.55,
            vx: (Math.random() - 0.5) * 45,
            vy: 18 + Math.random() * 44,
            radius: (event.viaKnife ? 4.2 : 3.2) + Math.random() * 5.2,
            alpha: 0.78 + Math.random() * 0.2,
            fadeRate: 0.55 + Math.random() * 0.35,
            gravity: 48,
            color,
            sticky: true,
            trailLen: 2 + Math.random() * 6,
          });
        } else {
          // Knife kills bias droplets along the diagonal slash vector (upper-left to lower-right / burst)
          const slashBias = event.viaKnife && i % 2 === 0;
          const angle = slashBias
            ? -Math.PI * 0.78 + (Math.random() - 0.5) * 1.15
            : Math.random() * Math.PI * 2;
          const speed = event.viaKnife
            ? 320 + Math.random() * 760
            : 210 + Math.random() * 540;
          list.push({
            x: cx + (Math.random() - 0.5) * (event.viaKnife ? 130 : 80),
            y: cy + (Math.random() - 0.5) * (event.viaKnife ? 90 : 70),
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - (110 + Math.random() * 190),
            radius: (event.viaKnife ? 3.0 : 2.3) + Math.random() * 4.8,
            alpha: 0.85 + Math.random() * 0.15,
            fadeRate: 0.85 + Math.random() * 0.55,
            gravity: 1180,
            color,
            sticky: false,
            trailLen: 0,
          });
        }
      }

      if (list.length > 260) {
        list.splice(0, list.length - 260);
      }

      if (!dropletRafRef.current) {
        lastFrameTimeRef.current = 0;
        dropletRafRef.current = requestAnimationFrame(stepDroplets);
      }
    },
    [stepDroplets]
  );

  useEffect(() => {
    return () => {
      if (dropletRafRef.current) {
        cancelAnimationFrame(dropletRafRef.current);
      }
      if (slashHudTimerRef.current) {
        window.clearTimeout(slashHudTimerRef.current);
      }
      dropletsRef.current = [];
      knifeSwingsRef.current = [];
    };
  }, []);

  if (stage === 'cutscene') {
    return (
      <StoryCutscene2D
        onStartGame={() => {
          dropletsRef.current = [];
          knifeSwingsRef.current = [];
          setAmmoHud(INITIAL_AMMO_HUD);
          setStage('play');
        }}
        onSkipToOutro={onCompleteToOutro}
        onBackToPresentation={onBackToPresentation}
      />
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      <BioDoomGame
        onCompleteToOutro={onCompleteToOutro}
        onReplayStory={() => {
          dropletsRef.current = [];
          knifeSwingsRef.current = [];
          setStage('cutscene');
        }}
        onAmmoHudChange={handleAmmoHudChange}
        onEnemyDefeated={handleEnemyDefeated}
        onKnifeSwing={handleKnifeSwing}
      />

      {/* Screen-Space Knife Slash Animation & Blood-Like Droplet Particle Canvas */}
      <canvas
        ref={dropletCanvasRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[35]"
      />

      {/* Visual Dynamic Weapon & Ammunition Counter HUD (Hidden completely in Cure-Grow / 3D Dorm Room / THE END) */}
      {ammoHud.showAmmoHud && (
        <aside
          aria-label="Weapon and Ammunition HUD"
          className="pointer-events-none fixed bottom-[122px] sm:bottom-[132px] left-4 z-40 rounded-xl border-2 border-emerald-400/55 bg-[#050C0A]/92 px-3.5 py-2.5 shadow-[0_0_24px_rgba(34,197,94,0.3)] min-w-[248px] sm:min-w-[290px]"
        >
          {ammoHud.activeWeapon === 'knife' ? (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-3 font-mono text-[11px] font-bold tracking-wider">
                <span className="text-[#4ADE80]">[1] BIO-COMBAT KNIFE</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] border transition-transform duration-150 ${
                    knifeSlashing
                      ? 'bg-emerald-400 text-slate-950 border-white scale-110'
                      : 'bg-emerald-950 text-[#4ADE80] border-emerald-400/60'
                  }`}
                >
                  {knifeSlashing ? 'SLASHING!' : 'EQUIPPED'}
                </span>
              </div>
              <div className="flex items-center justify-between font-mono text-xs text-emerald-100">
                <span
                  className={`font-black text-base transition-transform duration-150 ${
                    knifeSlashing ? 'text-white scale-105' : 'text-[#86EFAC]'
                  }`}
                >
                  ∞ MELEE SLASH
                </span>
                <span className="text-[11px] text-slate-300">[2] SHOTGUN</span>
              </div>
            </div>
          ) : !ammoHud.ammoActive ? (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-3 font-mono text-[11px] font-bold tracking-wider">
                <span className="text-[#86EFAC]">[2] PROTEIN SHOTGUN</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] ${
                    ammoHud.weaponUnlocked
                      ? 'bg-emerald-950 text-[#4ADE80] border border-emerald-400/50'
                      : 'bg-red-950 text-red-300 border border-red-400/50'
                  }`}
                >
                  {ammoHud.weaponUnlocked ? 'QUIZ BLASTER FREE' : 'LOCKED'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 py-0.5">
                {Array.from({ length: ammoHud.maxMag }).map((_, idx) => (
                  <div
                    key={idx}
                    className="w-4 h-7 rounded-sm border border-slate-700/80 bg-slate-900/70 opacity-45 flex flex-col overflow-hidden"
                  >
                    <div className="h-2 bg-slate-700" />
                    <div className="flex-1 bg-slate-800" />
                  </div>
                ))}
                <span className="ml-2 font-mono text-xs font-bold text-slate-400">
                  [1] KNIFE · AMMO ON QUEEN
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-col">
                  <span
                    className="font-mono text-[10px] sm:text-xs font-bold tracking-widest text-[#86EFAC]"
                    style={{ textShadow: '0 0 8px rgba(74, 222, 128, 0.7)' }}
                  >
                    [2] SHELLS · RELOAD #{ammoHud.reloadCount}
                  </span>
                  <div className="flex items-baseline gap-1.5 font-mono leading-none mt-0.5">
                    <span
                      className={`text-2xl sm:text-3xl font-black tabular-nums ${
                        ammoHud.magAmmo === 0 ? 'text-red-400' : 'text-[#FDE047]'
                      }`}
                      style={{ textShadow: '0 0 12px rgba(250, 204, 21, 0.7)' }}
                    >
                      {ammoHud.magAmmo}
                    </span>
                    <span className="text-sm font-bold text-slate-400">
                      / {ammoHud.reserveShells} RESERVE
                    </span>
                  </div>
                </div>

                <div
                  className={`px-2 py-1 rounded font-mono text-[11px] font-bold border ${
                    ammoHud.reloading
                      ? 'bg-amber-950/90 border-amber-400 text-amber-300 animate-pulse'
                      : ammoHud.magAmmo === 0
                      ? 'bg-red-950/90 border-red-500 text-red-300 animate-pulse'
                      : 'bg-emerald-950/90 border-emerald-400/60 text-[#4ADE80]'
                  }`}
                >
                  {ammoHud.reloading
                    ? 'RELOADING...'
                    : ammoHud.magAmmo === 0
                    ? 'PRESS [R]'
                    : '[R] RELOAD'}
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {Array.from({ length: ammoHud.maxMag }).map((_, idx) => {
                  const loaded = idx < ammoHud.magAmmo;
                  return (
                    <div
                      key={idx}
                      className={`w-4 sm:w-5 h-8 rounded-sm border transition-all duration-150 flex flex-col overflow-hidden ${
                        ammoHud.reloading
                          ? 'border-amber-300 scale-105 shadow-[0_0_8px_rgba(251,191,36,0.85)]'
                          : loaded
                          ? 'border-amber-300/90 shadow-[0_0_8px_rgba(239,68,68,0.65)]'
                          : 'border-slate-700 bg-slate-950/80 opacity-35'
                      }`}
                    >
                      <div
                        className={`h-2.5 w-full ${
                          loaded || ammoHud.reloading ? 'bg-[#FACC15]' : 'bg-slate-700'
                        }`}
                      />
                      <div
                        className={`flex-1 w-full flex items-center justify-center ${
                          ammoHud.reloading
                            ? 'bg-amber-500'
                            : loaded
                            ? 'bg-gradient-to-b from-red-500 to-red-700'
                            : 'bg-slate-900'
                        }`}
                      >
                        {loaded && !ammoHud.reloading && (
                          <div className="w-1 h-2.5 rounded-full bg-emerald-300/90" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {ammoHud.reloading && (
                <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden border border-amber-400/50">
                  <div className="h-full w-full bg-gradient-to-r from-amber-400 via-emerald-400 to-cyan-400 animate-pulse" />
                </div>
              )}
            </div>
          )}
        </aside>
      )}
    </div>
  );
}
