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
