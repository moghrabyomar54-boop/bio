// Procedural Web Audio API synthesizer for protein worlds & slide interactions

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioCtor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtor) return null;
    audioCtx = new AudioCtor();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function playTone(
  ctx: AudioContext,
  freqStart: number,
  freqEnd: number,
  startTime: number,
  duration: number,
  type: OscillatorType,
  peakGain: number
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freqStart, startTime);
  if (freqEnd !== freqStart) {
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(20, freqEnd),
      startTime + duration
    );
  }
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.linearRampToValueAtTime(peakGain, startTime + Math.min(0.03, duration * 0.2));
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.02);
}

export function playProteinSound(proteinIndex: number) {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;

  switch (proteinIndex) {
    case 0: {
      // Hemoglobin: rhythmic arterial double heartbeat ("lub-dub") + warm O2 shimmer
      playTone(ctx, 88, 48, now, 0.16, 'sine', 0.24);
      playTone(ctx, 98, 52, now + 0.19, 0.18, 'sine', 0.2);
      playTone(ctx, 523.25, 659.25, now + 0.22, 0.35, 'triangle', 0.07);
      break;
    }
    case 1: {
      // Collagen: deep braided steel cable resonance chord (triple helix triad)
      playTone(ctx, 130.81, 130.81, now, 0.52, 'triangle', 0.14);
      playTone(ctx, 196.0, 196.0, now + 0.05, 0.48, 'triangle', 0.11);
      playTone(ctx, 261.63, 258.0, now + 0.1, 0.45, 'sine', 0.1);
      break;
    }
    case 2: {
      // Enzymes: rapid catalytic spark arpeggio (induced-fit transformation burst)
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((n, idx) => {
        playTone(ctx, n, n * 1.03, now + idx * 0.055, 0.14, 'sine', 0.11);
      });
      break;
    }
    case 3: {
      // Keratin: elastic coiled-spring stretch & rebound sweep
      playTone(ctx, 220, 490, now, 0.18, 'sine', 0.13);
      playTone(ctx, 490, 260, now + 0.17, 0.28, 'triangle', 0.12);
      playTone(ctx, 392, 523.25, now + 0.28, 0.2, 'sine', 0.06);
      break;
    }
    case 4: {
      // Chaperone Protein: soothing sanctuary pad + crisp ATP->ADP crystal resolution
      playTone(ctx, 293.66, 293.66, now, 0.55, 'sine', 0.11);
      playTone(ctx, 440.0, 440.0, now + 0.07, 0.5, 'sine', 0.09);
      playTone(ctx, 587.33, 587.33, now + 0.14, 0.5, 'triangle', 0.07);
      break;
    }
    default:
      break;
  }
}

export function playSlideTransitionSound() {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  playTone(ctx, 280, 420, now, 0.16, 'sine', 0.07);
}

export function playMicroscopeZoomSound(entering: boolean) {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  if (entering) {
    playTone(ctx, 240, 740, now, 0.28, 'sine', 0.11);
    playTone(ctx, 987.77, 1174.66, now + 0.22, 0.18, 'sine', 0.07);
  } else {
    playTone(ctx, 680, 240, now, 0.22, 'sine', 0.09);
  }
}

export function playMindMapTickSound() {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  playTone(ctx, 640, 760, now, 0.08, 'sine', 0.055);
}

export function playShotgunBlastSound() {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;

  // Heavy DOOM double-barrel sub punch boom
  playTone(ctx, 195, 32, now, 0.28, 'sawtooth', 0.34);
  playTone(ctx, 130, 26, now, 0.32, 'triangle', 0.32);
  playTone(ctx, 90, 24, now, 0.34, 'square', 0.12);

  // Crisp wide-band gunshot blast noise + shell echo
  const bufferSize = Math.floor(ctx.sampleRate * 0.32);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.24));
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(3400, now);
  filter.frequency.exponentialRampToValueAtTime(240, now + 0.3);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.42, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.31);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noise.start(now);

  // Chunky pump-action rack clack-clack
  playTone(ctx, 840, 520, now + 0.28, 0.055, 'square', 0.08);
  playTone(ctx, 560, 980, now + 0.35, 0.06, 'square', 0.08);
}

export function playEntityKillSound() {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  playTone(ctx, 320, 75, now, 0.26, 'sawtooth', 0.16);
  playTone(ctx, 523.25, 783.99, now + 0.08, 0.18, 'triangle', 0.1);
}

export function playQuizAmbushSound() {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  playTone(ctx, 520, 340, now, 0.14, 'square', 0.11);
  playTone(ctx, 680, 420, now + 0.14, 0.16, 'square', 0.11);
}

export function playPickupSound() {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  playTone(ctx, 440, 660, now, 0.09, 'square', 0.07);
  playTone(ctx, 660, 880, now + 0.08, 0.12, 'triangle', 0.08);
}

export function playPlayerHurtSound() {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  playTone(ctx, 180, 58, now, 0.25, 'sawtooth', 0.18);
}

export function playBacteriaEatDeathSound() {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  // Swarm biting crunches + descending doom death groan
  for (let i = 0; i < 6; i++) {
    playTone(ctx, 260 - i * 25, 95, now + i * 0.22, 0.15, 'sawtooth', 0.18);
  }
  playTone(ctx, 140, 34, now + 1.15, 0.85, 'sawtooth', 0.26);
}

export function playAntManShrinkSound() {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  playTone(ctx, 1280, 95, now, 0.95, 'sine', 0.18);
  playTone(ctx, 960, 65, now + 0.08, 0.9, 'triangle', 0.14);
}

export function playCutsceneBlipSound() {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  playTone(ctx, 380, 480, now, 0.07, 'square', 0.045);
}

export function playVictoryFanfareSound() {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  const chord = [523.25, 659.25, 783.99, 1046.5];
  chord.forEach((freq, i) => {
    playTone(ctx, freq, freq * 1.01, now + i * 0.09, 0.35, 'triangle', 0.12);
  });
}

export function playWallCrashSound() {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  // Sub impact rumble
  playTone(ctx, 110, 26, now, 0.55, 'sawtooth', 0.32);
  playTone(ctx, 75, 22, now, 0.65, 'triangle', 0.32);

  // Shattering stone debris burst
  const bufferSize = Math.floor(ctx.sampleRate * 0.55);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.32));
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1600, now);
  filter.frequency.exponentialRampToValueAtTime(140, now + 0.52);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.4, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.54);
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noise.start(now);
}

export function playMachineInsertSound() {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  playTone(ctx, 180, 320, now, 0.12, 'square', 0.12);
  playTone(ctx, 440, 880, now + 0.14, 0.25, 'sine', 0.14);
  playTone(ctx, 659.25, 1318.5, now + 0.28, 0.32, 'triangle', 0.11);
}

export function playGrowBiggerSound() {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  playTone(ctx, 95, 1280, now, 1.05, 'sine', 0.18);
  playTone(ctx, 130, 960, now + 0.1, 0.95, 'triangle', 0.13);
  playTone(ctx, 523.25, 1046.5, now + 0.85, 0.55, 'sine', 0.15);
}

/**
 * Plays a driving 94 BPM hip-hop breakbeat + bass + synth stab loop
 * synchronized to the 1:30 drop section of the cutscene track.
 * Returns a stop() function for clean teardown.
 */
export function startMinute30DropBeat(): () => void {
  const ctx = getCtx();
  if (!ctx) return () => {};

  let stopped = false;
  const stepMs = 158; // ~95 BPM 16th-note groove
  let step = 0;

  const bassNotes = [55.0, 55.0, 65.41, 73.42, 55.0, 55.0, 82.41, 73.42];
  const stabChord = [220, 261.63, 329.63];

  const triggerNoiseSnare = (t: number, vol: number) => {
    const len = Math.floor(ctx.sampleRate * 0.13);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const ch = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      ch[i] = (Math.random() * 2 - 1) * Math.exp(-i / (len * 0.32));
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.setValueAtTime(900, t);
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    src.connect(hp);
    hp.connect(g);
    g.connect(ctx.destination);
    src.start(t);
  };

  const timer = window.setInterval(() => {
    if (stopped) return;
    const now = ctx.currentTime;
    const s = step % 16;

    // Boom-bap kick pattern
    if (s === 0 || s === 3 || s === 8 || s === 10) {
      playTone(ctx, 130, 38, now, 0.18, 'sine', 0.25);
    }
    // Crisp backbeat snare on 2 & 4
    if (s === 4 || s === 12) {
      triggerNoiseSnare(now, 0.18);
      playTone(ctx, 195, 110, now, 0.08, 'triangle', 0.12);
    }
    // Tight closed hi-hat every 2 steps
    if (s % 2 === 0) {
      triggerNoiseSnare(now, 0.035);
    }
    // Sub bassline
    if (s === 0 || s === 3 || s === 6 || s === 8 || s === 11 || s === 14) {
      const note = bassNotes[(step >> 1) % bassNotes.length];
      playTone(ctx, note, note * 0.98, now, 0.24, 'sawtooth', 0.08);
    }
    // Dramatic brass/synth stabs on bar downbeats
    if (s === 0 || s === 10) {
      stabChord.forEach((f) => {
        playTone(ctx, f, f, now, 0.22, 'triangle', 0.042);
      });
    }
    step += 1;
  }, stepMs);

  return () => {
    stopped = true;
    window.clearInterval(timer);
  };
}

export function playReloadShellSound() {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  playTone(ctx, 540, 820, now, 0.055, 'square', 0.08);
  playTone(ctx, 760, 1120, now + 0.14, 0.055, 'square', 0.09);
  playTone(ctx, 640, 420, now + 0.34, 0.08, 'sawtooth', 0.11);
  playTone(ctx, 480, 960, now + 0.44, 0.08, 'square', 0.1);
}

export function playQueenSpawnSound() {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  playTone(ctx, 180, 52, now, 0.75, 'sawtooth', 0.25);
  playTone(ctx, 290, 96, now + 0.08, 0.65, 'square', 0.15);
  playTone(ctx, 880, 440, now + 0.18, 0.5, 'triangle', 0.12);
}

/**
 * Procedural rhythmic "lub-dub" cardiac heartbeat.
 * @param intensity 0.0 (resting subtle pulse in dorm) to 1.0 (intense danger pounding)
 */
export function playHeartbeatSound(intensity = 0.35) {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  const clamped = Math.max(0.12, Math.min(1, intensity));

  // First thump ("lub") - deep sub + audible chest-knock harmonic
  const lubVol = 0.11 + clamped * 0.42;
  playTone(ctx, 74 + clamped * 18, 38, now, 0.16, 'sine', lubVol);
  playTone(ctx, 128 + clamped * 32, 54, now, 0.11, 'triangle', lubVol * 0.55);

  // Second thump ("dub") ~165ms later (slightly tighter when heart races)
  const dubDelay = 0.18 - clamped * 0.04;
  const dubVol = lubVol * 0.82;
  playTone(ctx, 88 + clamped * 22, 42, now + dubDelay, 0.14, 'sine', dubVol);
  playTone(ctx, 148 + clamped * 36, 58, now + dubDelay, 0.09, 'triangle', dubVol * 0.5);
}

/**
 * Crisp DOOM combat knife slash whoosh + optional membrane slice impact.
 */
export function playKnifeSlashSound(didHit: boolean) {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;

  // Air-cutting blade whoosh (bandpass noise)
  const len = Math.floor(ctx.sampleRate * 0.14);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const ch = buf.getChannelData(0);
  for (let i = 0; i < len; i++) {
    ch[i] = (Math.random() * 2 - 1) * Math.sin((i / len) * Math.PI);
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;

  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.setValueAtTime(1600, now);
  bp.frequency.exponentialRampToValueAtTime(520, now + 0.13);
  bp.Q.value = 1.4;

  const g = ctx.createGain();
  g.gain.setValueAtTime(0.28, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
  src.connect(bp);
  bp.connect(g);
  g.connect(ctx.destination);
  src.start(now);

  // Steel glint ring
  playTone(ctx, 1180, 560, now, 0.09, 'triangle', 0.08);

  if (didHit) {
    // Crisp bio-slice crunch + punch
    playTone(ctx, 260, 72, now + 0.03, 0.16, 'sawtooth', 0.24);
    playTone(ctx, 920, 340, now + 0.03, 0.08, 'square', 0.11);
  }
}

export function playKnifeThrowSound() {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;

  // High-velocity spinning blade flutter whoosh
  const len = Math.floor(ctx.sampleRate * 0.22);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const ch = buf.getChannelData(0);
  for (let i = 0; i < len; i++) {
    const p = i / len;
    const flutter = 0.65 + 0.35 * Math.sin(p * Math.PI * 6);
    ch[i] = (Math.random() * 2 - 1) * flutter * Math.sin(p * Math.PI);
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;

  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.setValueAtTime(2100, now);
  bp.frequency.exponentialRampToValueAtTime(640, now + 0.21);
  bp.Q.value = 1.6;

  const g = ctx.createGain();
  g.gain.setValueAtTime(0.3, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
  src.connect(bp);
  bp.connect(g);
  g.connect(ctx.destination);
  src.start(now);

  // Metallic spin ping
  playTone(ctx, 1480, 760, now, 0.14, 'triangle', 0.11);
  playTone(ctx, 980, 1340, now + 0.07, 0.09, 'sine', 0.06);
}

export function playKnifeWallHitSound() {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  playTone(ctx, 1760, 620, now, 0.11, 'square', 0.11);
  playTone(ctx, 420, 140, now, 0.09, 'triangle', 0.14);
}

export function playKnifeCatchSound() {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  playTone(ctx, 320, 780, now, 0.08, 'triangle', 0.1);
  playTone(ctx, 1040, 1420, now + 0.04, 0.07, 'sine', 0.07);
}


