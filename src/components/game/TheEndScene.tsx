import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface TheEndSceneProps {
  onContinueToCredits: () => void;
  onReplayGame: () => void;
}

const GREEN_AURA_XL =
  '0 0 18px rgba(74, 222, 128, 0.98), 0 0 42px rgba(34, 197, 94, 0.82), 0 0 84px rgba(16, 185, 129, 0.58)';
const GREEN_AURA_SM =
  '0 0 10px rgba(74, 222, 128, 0.88), 0 0 24px rgba(34, 197, 94, 0.55)';

export function TheEndScene({
  onContinueToCredits,
  onReplayGame,
}: TheEndSceneProps) {
  const cellMountRef = useRef<HTMLDivElement | null>(null);

  // Render the exact 3D Giant Eukaryotic Cell that drove the car, dancing on a pure black screen!
  useEffect(() => {
    const mount = cellMountRef.current;
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

    const width = 460;
    const height = 340;
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height, false);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    mount.innerHTML = '';
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 50);
    camera.position.set(0, 0.55, 5.2);
    camera.lookAt(0, 0.25, 0);

    const hemi = new THREE.HemisphereLight(0xa7f3d0, 0x052e16, 1.4);
    const keyLight = new THREE.PointLight(0x4ade80, 6.5, 22, 1.0);
    keyLight.position.set(2.5, 3.2, 4.2);
    const rimLight = new THREE.PointLight(0xa855f7, 4.0, 20, 1.0);
    rimLight.position.set(-3.2, -1.2, 2.5);
    scene.add(hemi, keyLight, rimLight);

    // Exact Giant Cell from the Car (Translucent Membrane + Nucleus + Mitochondria + Happy Dancing Limbs)
    const dancingCell = new THREE.Group();
    scene.add(dancingCell);

    const membraneGeo = new THREE.SphereGeometry(1.22, 28, 22);
    const membraneMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 0.55,
      transparent: true,
      opacity: 0.72,
      roughness: 0.2,
    });
    const membrane = new THREE.Mesh(membraneGeo, membraneMat);

    const nucleusGeo = new THREE.SphereGeometry(0.48, 18, 14);
    const nucleusMat = new THREE.MeshStandardMaterial({
      color: 0x7c3aed,
      emissive: 0x6d28d9,
      emissiveIntensity: 0.85,
      roughness: 0.25,
    });
    const nucleus = new THREE.Mesh(nucleusGeo, nucleusMat);
    nucleus.position.set(-0.12, 0.1, 0.08);

    const mitoGeo = new THREE.BoxGeometry(0.4, 0.22, 0.22);
    const mitoMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.75,
    });
    const mito1 = new THREE.Mesh(mitoGeo, mitoMat);
    mito1.position.set(0.5, 0.28, 0.36);
    const mito2 = new THREE.Mesh(mitoGeo, mitoMat);
    mito2.position.set(-0.44, -0.24, -0.34);

    // Cute Cool Shades & Little Dancing Pseudopod Arms so it clearly grooves!
    const eyeGeo = new THREE.BoxGeometry(0.32, 0.16, 0.1);
    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0x020617,
      emissive: 0x22d3ee,
      emissiveIntensity: 0.35,
      roughness: 0.1,
    });
    const shadeL = new THREE.Mesh(eyeGeo, eyeMat);
    shadeL.position.set(-0.28, 0.32, 1.15);
    const shadeR = new THREE.Mesh(eyeGeo, eyeMat);
    shadeR.position.set(0.28, 0.32, 1.15);
    const bridgeGeo = new THREE.BoxGeometry(0.25, 0.05, 0.08);
    const bridge = new THREE.Mesh(bridgeGeo, eyeMat);
    bridge.position.set(0, 0.34, 1.16);

    const limbGeo = new THREE.CapsuleGeometry(0.11, 0.45, 6, 10);
    const limbMat = new THREE.MeshStandardMaterial({
      color: 0x34d399,
      emissive: 0x10b981,
      emissiveIntensity: 0.65,
    });
    const armL = new THREE.Mesh(limbGeo, limbMat);
    armL.position.set(-1.35, 0.15, 0);
    armL.rotation.z = 0.7;
    const armR = new THREE.Mesh(limbGeo, limbMat);
    armR.position.set(1.35, 0.15, 0);
    armR.rotation.z = -0.7;

    const legL = new THREE.Mesh(limbGeo, limbMat);
    legL.position.set(-0.5, -1.32, 0);
    const legR = new THREE.Mesh(limbGeo, limbMat);
    legR.position.set(0.5, -1.32, 0);

    dancingCell.add(
      membrane,
      nucleus,
      mito1,
      mito2,
      shadeL,
      shadeR,
      bridge,
      armL,
      armR,
      legL,
      legR
    );

    // Floating celebratory green/gold protein sparkles around the dancing Cell
    const sparkGeo = new THREE.OctahedronGeometry(0.08, 0);
    const sparkColors = [0x4ade80, 0xfacc15, 0x22d3ee, 0xfb7185, 0xc084fc];
    const sparks: Array<{ mesh: THREE.Mesh; angle: number; radius: number; yOff: number; speed: number }> = [];
    const sparkMats: THREE.Material[] = [];
    for (let i = 0; i < 14; i++) {
      const col = sparkColors[i % sparkColors.length];
      const sm = new THREE.MeshStandardMaterial({
        color: col,
        emissive: col,
        emissiveIntensity: 1.3,
      });
      sparkMats.push(sm);
      const mesh = new THREE.Mesh(sparkGeo, sm);
      scene.add(mesh);
      sparks.push({
        mesh,
        angle: (i / 14) * Math.PI * 2,
        radius: 1.75 + (i % 3) * 0.35,
        yOff: ((i % 5) - 2) * 0.4,
        speed: 1.6 + (i % 4) * 0.45,
      });
    }

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

    function tick() {
      if (disposed) return;
      const t = clock.getElapsedTime();

      // Energetic rhythmic dance bounce & groove!
      const beat = t * 6.4;
      dancingCell.position.y = Math.abs(Math.sin(beat)) * 0.42;
      dancingCell.position.x = Math.sin(beat * 0.5) * 0.55;
      dancingCell.rotation.y = Math.sin(beat * 0.5) * 0.55 + t * 0.85;
      dancingCell.rotation.z = Math.sin(beat) * 0.16;

      // Squash & stretch membrane on beat
      const squash = 1 + Math.sin(beat * 2) * 0.08;
      dancingCell.scale.set(1 / Math.sqrt(squash), squash, 1 / Math.sqrt(squash));

      // Pumping arms & kicking legs
      armL.rotation.z = 0.85 + Math.sin(beat) * 0.75;
      armR.rotation.z = -0.85 + Math.sin(beat + Math.PI) * 0.75;
      legL.rotation.x = Math.sin(beat) * 0.55;
      legR.rotation.x = Math.sin(beat + Math.PI) * 0.55;

      // Organelles wiggle inside membrane
      nucleus.position.y = 0.1 + Math.sin(beat * 1.5) * 0.09;
      mito1.rotation.y += 0.06;
      mito2.rotation.x += 0.05;

      sparks.forEach((sp, idx) => {
        const a = sp.angle + t * sp.speed;
        sp.mesh.position.set(
          Math.cos(a) * sp.radius,
          sp.yOff + Math.sin(t * 3 + idx) * 0.35,
          Math.sin(a) * sp.radius
        );
        sp.mesh.rotation.y += 0.08;
      });

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
      membraneGeo.dispose();
      membraneMat.dispose();
      nucleusGeo.dispose();
      nucleusMat.dispose();
      mitoGeo.dispose();
      mitoMat.dispose();
      eyeGeo.dispose();
      eyeMat.dispose();
      bridgeGeo.dispose();
      limbGeo.dispose();
      limbMat.dispose();
      sparkGeo.dispose();
      sparkMats.forEach((m) => m.dispose());
      renderer.dispose();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-6 text-center select-none">
      <h1
        className="font-display text-6xl sm:text-8xl md:text-9xl font-black tracking-[0.18em] text-[#4ADE80] mb-2"
        style={{ textShadow: GREEN_AURA_XL }}
      >
        THE END
      </h1>
      <p
        className="font-mono text-xs sm:text-sm tracking-[0.26em] uppercase text-[#86EFAC] mb-4"
        style={{ textShadow: GREEN_AURA_SM }}
      >
        CURED BY THE POWER OF PROTEINS · THE CELL FROM THE CAR IS CELEBRATING!
      </p>

      {/* Pure Black 3D Canvas of the Dancing Cell */}
      <div
        ref={cellMountRef}
        className="w-[min(92vw,460px)] h-[min(45vh,340px)] bg-black border-2 border-[#3c4a32] shadow-[5px_5px_0px_#020305] overflow-hidden"
      />

      <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
        <button
          type="button"
          onClick={onReplayGame}
          className="px-6 py-3 border-2 border-[#4d6b38] bg-[#0b120c] hover:bg-[#162417] font-mono text-base sm:text-lg font-bold text-[#A3E635] cursor-pointer transition-colors shadow-[4px_4px_0px_#020305]"
          style={{ textShadow: GREEN_AURA_SM }}
        >
          Replay Bio-Doom
        </button>
        <button
          type="button"
          onClick={onContinueToCredits}
          className="px-8 py-3.5 bg-[#4ADE80] hover:bg-[#86EFAC] border-2 border-white text-slate-950 font-mono text-lg sm:text-xl font-black shadow-[4px_4px_0px_#020305] cursor-pointer transition-colors"
        >
          Roll Final Credits →
        </button>
      </div>
    </div>
  );
}
