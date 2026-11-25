// Preloaded singleton audio manager for 0ms instant track transitions

export const TRACK_URLS = {
  d45k13: '/assets/aistudio/11_-_D45K13_-_fruit___FrutigerAero_1eab5dd3.mp3',
  adhd: '/assets/aistudio/adhd__0xpcMXpkKzw__3019168c.mp3',
  sixdays: '/assets/aistudio/30_-_Tokyo_Drift_-_Six_Days__4K__ed8ca362.mp3',
  credits: '/assets/aistudio/07_-_Wii_Shop_Channel_Main_Theme__HQ__3d997258.mp3',
} as const;

export type MusicTrackId = keyof typeof TRACK_URLS;

const audioPool: Partial<Record<MusicTrackId, HTMLAudioElement>> = {};
let activeTrack: MusicTrackId | null = null;
let initialized = false;

function ensurePool() {
  if (typeof window === 'undefined') return;
  if (initialized) return;
  initialized = true;

  (Object.keys(TRACK_URLS) as MusicTrackId[]).forEach((id) => {
    const el = new Audio(TRACK_URLS[id]);
    el.preload = 'auto';
    el.load();
    audioPool[id] = el;
  });
}

/**
 * Eagerly warm-loads all MP3 tracks into browser memory so event cues trigger with zero lag.
 */
export function preloadAllMusicTracks() {
  ensurePool();
}

/**
 * Unlocks HTMLAudio playback inside a user gesture without interrupting currently playing music.
 */
export function unlockAudioFromGesture() {
  ensurePool();
  if (activeTrack) {
    const cur = audioPool[activeTrack];
    if (cur && cur.paused) {
      cur.play().catch(() => {});
    }
  }
}

export function playMusicTrack(
  id: MusicTrackId,
  options?: { volume?: number; loop?: boolean; startTime?: number }
) {
  ensurePool();

  // Pause every other track immediately
  (Object.keys(audioPool) as MusicTrackId[]).forEach((otherId) => {
    if (otherId !== id) {
      const other = audioPool[otherId];
      if (other) {
        other.pause();
        try {
          other.currentTime = 0;
        } catch {
          // Ignore seek errors
        }
      }
    }
  });

  const target = audioPool[id];
  if (!target) return;

  activeTrack = id;
  target.loop = options?.loop ?? true;
  target.volume = options?.volume ?? 0.72;

  const seekSec = options?.startTime ?? 0;
  try {
    target.currentTime = seekSec;
  } catch {
    // Fallback if metadata wasn't ready
    target.addEventListener(
      'loadedmetadata',
      () => {
        if (activeTrack === id) {
          try {
            target.currentTime = seekSec;
          } catch {
            // Ignore
          }
        }
      },
      { once: true }
    );
  }

  target.play().catch(() => {});
}

export function stopAllMusic() {
  activeTrack = null;
  (Object.keys(audioPool) as MusicTrackId[]).forEach((id) => {
    const el = audioPool[id];
    if (el) {
      el.pause();
      try {
        el.currentTime = 0;
      } catch {
        // Ignore
      }
    }
  });
}
