import { useEffect, useRef } from 'react';
import {
  HeroMood,
  drawHarshFacePortrait,
  drawHarshHeroSprite,
} from './game/HarshPixelArt';

interface PixelBioHeroCanvasProps {
  variant: 'portrait' | 'fullbody';
  mood?: HeroMood;
  suitRed?: boolean;
  hasKnife?: boolean;
  className?: string;
}

export function PixelBioHeroCanvas({
  variant,
  mood = 'stern',
  suitRed = false,
  hasKnife = true,
  className = '',
}: PixelBioHeroCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = variant === 'portrait' ? 64 : 64;
    const h = variant === 'portrait' ? 64 : 96;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, w, h);

    // Subtle dark pixel-hatch backdrop behind sprite
    ctx.fillStyle = '#0c110d';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#141d15';
    for (let y = 0; y < h; y += 4) {
      ctx.fillRect(0, y, w, 1);
    }

    if (variant === 'portrait') {
      drawHarshFacePortrait(ctx, 0, 0, 2, mood, suitRed);
    } else {
      drawHarshHeroSprite(ctx, 29, 88, 2, {
        mood,
        suitRed,
        hasKnife,
      });
    }
  }, [variant, mood, suitRed, hasKnife]);

  return (
    <canvas
      ref={canvasRef}
      aria-label={
        variant === 'portrait'
          ? 'Detailed pixel character portrait'
          : 'Harsh 2D pixel protagonist sprite'
      }
      className={`block ${className}`}
      style={{ imageRendering: 'pixelated' }}
    />
  );
}
