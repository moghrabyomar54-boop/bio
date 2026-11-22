import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { PresentationSimState, PROTEIN_SLIDES } from '../data/slides';
import { createMaterialLibrary } from '../three/materials';
import { buildProteinUniverse } from '../three/proteinModels';

interface ProteinUniverseCanvasProps {
  activeSlideIndex: number;
  simState: PresentationSimState;
  cameraResetToken: number;
  zenMode: boolean;
  microscopeMode: boolean;
  showIntro: boolean;
  onTransitChange?: (inTransit: boolean) => void;
}

const _camSample = new THREE.Vector3();
const _targetSample = new THREE.Vector3();

function quinticInOut(t: number): number {
  return t < 0.5
    ? 16 * t * t * t * t * t
    : 1 - Math.pow(-2 * t + 2, 5) / 2;
}

export function ProteinUniverseCanvas({
  activeSlideIndex,
  simState,
  cameraResetToken,
  zenMode,
  microscopeMode,
  showIntro,
  onTransitChange,
}: ProteinUniverseCanvasProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [webglError, setWebglError] = useState<string | null>(null);

  const simRef = useRef<PresentationSimState>(simState);
  simRef.current = simState;

  const zenRef = useRef<boolean>(zenMode);
  zenRef.current = zenMode;

  const microscopeRef = useRef<boolean>(microscopeMode);
  microscopeRef.current = microscopeMode;

  const showIntroRef = useRef<boolean>(showIntro);
  showIntroRef.current = showIntro;

  const activeSlideRef = useRef<number>(activeSlideIndex);
  activeSlideRef.current = activeSlideIndex;

  const onTransitRef = useRef(onTransitChange);
  onTransitRef.current = onTransitChange;

  const flightControllerRef = useRef<{
    flyToSlide: (
      idx: number,
      immediate?: boolean,
      isMicroscope?: boolean,
      isIntro?: boolean
    ) => void;
  } | null>(null);

  const prevSlideRef = useRef<number>(activeSlideIndex);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

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

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglError('WebGL rendering is unavailable in this browser context.');
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(
      isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2)
    );
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    renderer.setSize(width, height);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const initialSlide = PROTEIN_SLIDES[activeSlideIndex] ?? PROTEIN_SLIDES[0];
    const currentBg = new THREE.Color(
      showIntroRef.current ? '#04080F' : initialSlide.worldBgHex
    );
    const targetBg = new THREE.Color(
      showIntroRef.current ? '#04080F' : initialSlide.worldBgHex
    );
    const currentRim = new THREE.Color(
      showIntroRef.current ? '#22C55E' : initialSlide.worldRimHex
    );
    const targetRim = new THREE.Color(
      showIntroRef.current ? '#22C55E' : initialSlide.worldRimHex
    );

    scene.background = currentBg;
    scene.fog = new THREE.FogExp2(currentBg.getHex(), 0.017);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envRT = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envRT.texture;
    roomEnv.dispose();
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 240);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.065;
    controls.minDistance = 1.6;
    controls.maxDistance = 24;
    controls.enablePan = false;

    const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x0f172a, 0.9);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff1e0, 2.2);
    keyLight.position.set(14, 22, 16);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(currentRim.getHex(), 1.45);
    rimLight.position.set(-16, -6, -18);
    scene.add(rimLight);

    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const mats = createMaterialLibrary(maxAniso, isSoftwareGl);
    const universe = buildProteinUniverse(mats);
    scene.add(universe.root);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    let isFlying = false;
    let flightProgress = 1;
    let currentDuration = 1.4;
    let startFov = 46;
    let endFov = 46;
    let isCrossStationFlight = false;
    let flightCurve: THREE.CatmullRomCurve3 | null = null;
    const flightStartTarget = new THREE.Vector3();
    const flightEndTarget = new THREE.Vector3();
    let userDragging = false;

    const getSlideGoal = (idx: number, isMicro: boolean, isIntro: boolean) => {
      if (isIntro) {
        return {
          camPos: new THREE.Vector3(0, 0.2, 13.5),
          lookPos: new THREE.Vector3(0, 0, -9),
          targetFov: 50,
        };
      }

      const slide = PROTEIN_SLIDES[idx] ?? PROTEIN_SLIDES[0];
      const sp = slide.stationPos;

      if (isMicro) {
        const camPos = new THREE.Vector3(
          sp[0] + slide.microscopeOffset[0],
          sp[1] + slide.microscopeOffset[1],
          sp[2] + slide.microscopeOffset[2]
        );
        const lookPos = new THREE.Vector3(
          sp[0] + slide.microscopeLookAtOffset[0],
          sp[1] + slide.microscopeLookAtOffset[1],
          sp[2] + slide.microscopeLookAtOffset[2]
        );
        return { camPos, lookPos, targetFov: 31 };
      }

      const zenShift = zenRef.current ? 0 : slide.lookAtOffset[0];
      const camPos = new THREE.Vector3(
        sp[0] + slide.cameraOffset[0],
        sp[1] + slide.cameraOffset[1],
        sp[2] + slide.cameraOffset[2]
      );
      const lookPos = new THREE.Vector3(
        sp[0] + zenShift,
        sp[1] + slide.lookAtOffset[1],
        sp[2] + slide.lookAtOffset[2]
      );
      return { camPos, lookPos, targetFov: 46 };
    };

    const flyToSlide = (
      idx: number,
      immediate = false,
      isMicroscope = false,
      isIntro = false
    ) => {
      const slide = PROTEIN_SLIDES[idx] ?? PROTEIN_SLIDES[0];
      targetBg.set(isIntro ? '#04080F' : slide.worldBgHex);
      targetRim.set(isIntro ? '#22C55E' : slide.worldRimHex);

      const { camPos, lookPos, targetFov } = getSlideGoal(
        idx,
        isMicroscope,
        isIntro
      );
      if (immediate) {
        currentBg.copy(targetBg);
        currentRim.copy(targetRim);
        if (scene.fog) scene.fog.color.copy(currentBg);
        rimLight.color.copy(currentRim);

        camera.position.copy(camPos);
        controls.target.copy(lookPos);
        camera.fov = targetFov;
        camera.updateProjectionMatrix();
        controls.update();
        isFlying = false;
        flightProgress = 1;
        onTransitRef.current?.(false);
        return;
      }

      const startPos = camera.position.clone();
      flightStartTarget.copy(controls.target);
      flightEndTarget.copy(lookPos);
      startFov = camera.fov;
      endFov = targetFov;

      const dist = startPos.distanceTo(camPos);
      void dist;
      isCrossStationFlight = false;
      currentDuration = isMicroscope ? 0.78 : 0.62;

      const mid = startPos.clone().lerp(camPos, 0.5);

      flightCurve = new THREE.CatmullRomCurve3([startPos, mid, camPos]);
      flightProgress = 0;
      isFlying = true;
      onTransitRef.current?.(true);
    };

    flightControllerRef.current = { flyToSlide };
    flyToSlide(activeSlideIndex, true, microscopeRef.current, showIntroRef.current);

    const handleControlStart = () => {
      userDragging = true;
      if (isFlying) {
        isFlying = false;
        onTransitRef.current?.(false);
      }
    };
    const handleControlEnd = () => {
      userDragging = false;
    };
    controls.addEventListener('start', handleControlStart);
    controls.addEventListener('end', handleControlEnd);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setWebglError('3D graphics context paused. Restoring...');
    };
    const handleContextRestored = () => {
      setWebglError(null);
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
    renderer.domElement.addEventListener(
      'webglcontextrestored',
      handleContextRestored
    );

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    const clock = new THREE.Clock();
    let frameId = 0;
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
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      if (disposed) return;
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Smoothly transition world sky/fog & rim lighting between worlds
      const colorStep = 1 - Math.exp(-3.5 * Math.min(delta, 0.05));
      currentBg.lerp(targetBg, colorStep);
      currentRim.lerp(targetRim, colorStep);
      if (scene.fog) scene.fog.color.copy(currentBg);
      rimLight.color.copy(currentRim);

      if (isFlying && flightCurve) {
        flightProgress = Math.min(1, flightProgress + delta / currentDuration);
        const eased = quinticInOut(flightProgress);
        flightCurve.getPointAt(eased, _camSample);
        _targetSample.lerpVectors(flightStartTarget, flightEndTarget, eased);

        camera.position.copy(_camSample);
        controls.target.copy(_targetSample);

        const baseFov = THREE.MathUtils.lerp(startFov, endFov, eased);
        const transitPulse = isCrossStationFlight
          ? Math.sin(flightProgress * Math.PI) * 7.5
          : 0;
        const desiredFov = baseFov + transitPulse;
        if (Math.abs(camera.fov - desiredFov) > 0.05) {
          camera.fov = desiredFov;
          camera.updateProjectionMatrix();
        }

        if (flightProgress >= 1) {
          isFlying = false;
          camera.fov = endFov;
          camera.updateProjectionMatrix();
          onTransitRef.current?.(false);
        }
      } else if (!userDragging) {
        const targetFov = showIntroRef.current
          ? 50
          : microscopeRef.current
          ? 31
          : 46;
        if (Math.abs(camera.fov - targetFov) > 0.05) {
          camera.fov = THREE.MathUtils.damp(camera.fov, targetFov, 8, delta);
          camera.updateProjectionMatrix();
        }
      }

      controls.update();
      universe.update(
        elapsed,
        delta,
        simRef.current,
        microscopeRef.current,
        activeSlideRef.current,
        showIntroRef.current
      );

      keyLight.position.set(
        controls.target.x + 12,
        controls.target.y + 18,
        controls.target.z + 14
      );
      rimLight.position.set(
        controls.target.x - 14,
        controls.target.y - 6,
        controls.target.z - 16
      );

      renderer.render(scene, camera);

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
      window.removeEventListener('resize', handleResize);
      controls.removeEventListener('start', handleControlStart);
      controls.removeEventListener('end', handleControlEnd);
      renderer.domElement.removeEventListener(
        'webglcontextlost',
        handleContextLost
      );
      renderer.domElement.removeEventListener(
        'webglcontextrestored',
        handleContextRestored
      );
      controls.dispose();
      universe.dispose();
      mats.dispose();
      envRT.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const slideChanged = prevSlideRef.current !== activeSlideIndex;
    prevSlideRef.current = activeSlideIndex;
    void slideChanged;
    flightControllerRef.current?.flyToSlide(
      activeSlideIndex,
      false,
      microscopeMode,
      showIntro
    );
  }, [activeSlideIndex, cameraResetToken, zenMode, microscopeMode, showIntro]);

  return (
    <div className="relative w-full h-full bg-[#060A12]">
      <div
        ref={mountRef}
        className={`w-full h-full ${
          microscopeMode
            ? 'cursor-crosshair'
            : 'cursor-grab active:cursor-grabbing'
        }`}
      />
      {webglError && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#060A12] text-slate-300 text-sm px-6 text-center">
          <div className="max-w-md border border-white/10 bg-[#0D1422] p-6 rounded-xl">
            <p className="font-display text-lg font-semibold text-white mb-2">
              3D Molecular Viewport Fallback
            </p>
            <p className="text-slate-400">{webglError}</p>
          </div>
        </div>
      )}
    </div>
  );
}
