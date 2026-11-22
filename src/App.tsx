/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useState } from 'react';
import { BottomDock } from './components/BottomDock';
import { CurriculumOverlay } from './components/CurriculumOverlay';
import { IntroOverlay } from './components/IntroOverlay';
import { MicroscopeOverlay } from './components/MicroscopeOverlay';
import { ProteinUniverseCanvas } from './components/ProteinUniverseCanvas';
import { SlideHUD } from './components/SlideHUD';
import { VoidAmbientOverlay } from './components/VoidAmbientOverlay';
import { CURRICULUM_SLIDES } from './data/curriculumSlides';
import { INITIAL_SIM_STATE, PROTEIN_SLIDES } from './data/slides';
import {
  playMicroscopeZoomSound,
  playMindMapTickSound,
  playProteinSound,
  playSlideTransitionSound,
} from './utils/soundEffects';

type PresentationPhase = 'intro' | 'curriculum' | 'protein' | 'outro';

export default function App() {
  const [phase, setPhase] = useState<PresentationPhase>('intro');
  const [curriculumIndex, setCurriculumIndex] = useState(0);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [mindMapBranchIndex, setMindMapBranchIndex] = useState(0);
  const [simState] = useState(INITIAL_SIM_STATE);
  const [inTransit, setInTransit] = useState(false);
  const [microscopeMode, setMicroscopeMode] = useState(false);

  const currentSlide = PROTEIN_SLIDES[activeSlideIndex] ?? PROTEIN_SLIDES[0];
  const currentCurriculum =
    phase === 'curriculum'
      ? CURRICULUM_SLIDES[curriculumIndex] ?? CURRICULUM_SLIDES[0]
      : null;

  const showVoid = phase !== 'protein';

  const handleSelectSlide = useCallback((idx: number) => {
    const clamped = Math.max(0, Math.min(PROTEIN_SLIDES.length - 1, idx));
    setPhase('protein');
    setMicroscopeMode(false);
    setMindMapBranchIndex(0);
    setActiveSlideIndex(clamped);
    playProteinSound(clamped);
  }, []);

  const handleToggleMicroscope = useCallback(() => {
    if (phase !== 'protein') return;
    setMicroscopeMode((prev) => {
      playMicroscopeZoomSound(!prev);
      return !prev;
    });
  }, [phase]);

  const handleGoToThankYou = useCallback(() => {
    setMicroscopeMode(false);
    setPhase('outro');
    playSlideTransitionSound();
  }, []);

  // Keyboard navigation across the full presentation:
  // Intro -> Overview + 7 Curriculum Slides -> 5 Protein Worlds -> Final Thank You Slide
  // Q = switch Mind Map section, E = Microscope zoom, Esc = exit Microscope
  // 1-5 = jump to protein worlds, 0/Home = Intro, T/6/End = Thank You
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      const keyLower = e.key.toLowerCase();

      if (keyLower === 'q' && phase === 'protein' && !microscopeMode) {
        e.preventDefault();
        const count = currentSlide.mindMapBranches.length || 4;
        setMindMapBranchIndex((prev) => (prev + 1) % count);
        playMindMapTickSound();
      } else if (keyLower === 'e') {
        e.preventDefault();
        handleToggleMicroscope();
      } else if (e.key === 'Escape') {
        if (microscopeMode) {
          setMicroscopeMode(false);
          playMicroscopeZoomSound(false);
        }
      } else if (e.key === '0' || e.key === 'Home') {
        setMicroscopeMode(false);
        setPhase('intro');
        playSlideTransitionSound();
      } else if (keyLower === 't' || e.key === '6' || e.key === 'End') {
        handleGoToThankYou();
      } else if (
        e.key === 'ArrowRight' ||
        e.key === 'PageDown' ||
        (e.key === ' ' && tag !== 'BUTTON') ||
        (e.key === 'Enter' && phase !== 'protein')
      ) {
        e.preventDefault();
        if (phase === 'intro') {
          setPhase('curriculum');
          setCurriculumIndex(0);
          playSlideTransitionSound();
        } else if (phase === 'curriculum') {
          if (curriculumIndex < CURRICULUM_SLIDES.length - 1) {
            setCurriculumIndex((prev) => prev + 1);
            playSlideTransitionSound();
          } else {
            handleSelectSlide(0);
          }
        } else if (phase === 'protein') {
          setMicroscopeMode(false);
          if (activeSlideIndex >= PROTEIN_SLIDES.length - 1) {
            handleGoToThankYou();
          } else {
            const nextIdx = activeSlideIndex + 1;
            setMindMapBranchIndex(0);
            setActiveSlideIndex(nextIdx);
            playProteinSound(nextIdx);
          }
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        if (phase === 'outro') {
          handleSelectSlide(PROTEIN_SLIDES.length - 1);
        } else if (phase === 'protein') {
          setMicroscopeMode(false);
          if (activeSlideIndex === 0) {
            setPhase('curriculum');
            setCurriculumIndex(CURRICULUM_SLIDES.length - 1);
            playSlideTransitionSound();
          } else {
            const prevIdx = activeSlideIndex - 1;
            setMindMapBranchIndex(0);
            setActiveSlideIndex(prevIdx);
            playProteinSound(prevIdx);
          }
        } else if (phase === 'curriculum') {
          if (curriculumIndex > 0) {
            setCurriculumIndex((prev) => prev - 1);
            playSlideTransitionSound();
          } else {
            setPhase('intro');
            playSlideTransitionSound();
          }
        }
      } else if (e.key >= '1' && e.key <= '5') {
        handleSelectSlide(parseInt(e.key, 10) - 1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    activeSlideIndex,
    curriculumIndex,
    currentSlide.mindMapBranches.length,
    handleGoToThankYou,
    handleSelectSlide,
    handleToggleMicroscope,
    microscopeMode,
    phase,
  ]);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#060A12] select-none">
      {/* Full-Viewport 3D Molecular Worlds & Intro/Curriculum/Outro Bio-Void */}
      <ProteinUniverseCanvas
        activeSlideIndex={activeSlideIndex}
        simState={simState}
        cameraResetToken={0}
        zenMode={false}
        microscopeMode={microscopeMode}
        showIntro={showVoid}
        onTransitChange={setInTransit}
      />

      {/* Minimal Horizon Header Colored to Match Active Protein Slide (Top-Right Removed) */}
      {phase === 'protein' && (
        <header className="fixed top-0 left-0 z-20 px-6 py-3.5 pointer-events-none">
          <span
            className="font-display text-xl font-bold tracking-tight transition-colors duration-300"
            style={{ color: currentSlide.accentColor }}
          >
            Proteome Atlas
          </span>
        </header>
      )}

      {/* Ambient Floating DNA Strands & Stylized Cell Organelles Behind Intro & Curriculum Void Slides */}
      <VoidAmbientOverlay active={phase === 'intro' || phase === 'curriculum'} />

      {/* Floating Green-Aura Intro & Movie-Style Credits Outro Slides */}
      <IntroOverlay
        mode={
          phase === 'intro' ? 'intro' : phase === 'outro' ? 'outro' : 'hidden'
        }
        onExitOutro={() => handleSelectSlide(PROTEIN_SLIDES.length - 1)}
      />

      {/* Glowing Green-Aura Title & Overview + 7 Curriculum Slides */}
      <CurriculumOverlay slide={currentCurriculum} />

      {/* Mind Map & Context HUD */}
      {phase === 'protein' && (
        <SlideHUD
          slide={currentSlide}
          simState={simState}
          inTransit={inTransit}
          microscopeMode={microscopeMode}
          mindMapBranchIndex={mindMapBranchIndex}
          onSelectMindMapBranch={setMindMapBranchIndex}
          onGoToThankYou={handleGoToThankYou}
        />
      )}

      {/* Optical Microscope Zoom & Enlarged Reference Figure Overlay (Key E) */}
      <MicroscopeOverlay
        slide={currentSlide}
        active={phase === 'protein' && microscopeMode}
      />

      {/* Strictly 5-Button Protein World Launcher Interface */}
      <BottomDock
        activeSlideIndex={activeSlideIndex}
        microscopeMode={microscopeMode}
        isProteinView={phase === 'protein'}
        onSelectSlide={handleSelectSlide}
      />
    </main>
  );
}
