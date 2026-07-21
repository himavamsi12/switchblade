"use client";
import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";
import type { Group } from "three";
import { nudgeCanvasResize } from "@/lib/canvasResizeNudge";

function StarModel({ scale = 2.2, spinRef, dampRef, shrinkRef, autoRotate = true, entranceRef }: { scale?: number; spinRef?: React.RefObject<number>; dampRef?: React.RefObject<number>; shrinkRef?: React.RefObject<number>; autoRotate?: boolean; entranceRef?: React.RefObject<number> }) {
  const groupRef = useRef<Group>(null);
  const { scene } = useGLTF("/Compass.glb");
  const entranceStart = useRef<number | null>(null);
  // Accumulated base rotation, integrated frame-by-frame via delta rather than computed as
  // `elapsedTime * speed` — the scroll-driven extra spin (dampRef, added separately below) is
  // layered on top of this rather than folded into a variable speed here, so nothing about the
  // base spin's own rate ever changes or snaps.
  const baseRotationRef = useRef(0);

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.material = new THREE.MeshPhysicalMaterial({
          color:             new THREE.Color("#B8C0CE"),
          metalness:         0.97,
          roughness:         0.05,
          clearcoat:         0.6,
          clearcoatRoughness: 0.04,
          envMapIntensity:   2.4,
          side:              THREE.DoubleSide,
        });
        mesh.castShadow    = true;
        mesh.receiveShadow = false;
      }
    });

    // Normalize to a 1-unit-tall model grounded at y=0, centered on x/z,
    // so the fixed `scale` props tuned per-page stay correct across model swaps.
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3(); box.getSize(size);
    const center = new THREE.Vector3(); box.getCenter(center);
    const s = 1 / (size.y || 1);
    clone.scale.setScalar(s);
    clone.position.x = -center.x * s;
    clone.position.z = -center.z * s;
    clone.position.y = -box.min.y * s;

    return clone;
  }, [scene]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();

    if (entranceStart.current === null) entranceStart.current = t;

    const ENTRANCE_DURATION = 1.15;
    // Entrance progress 0→1 drives the scale-grow + rotation settle + rise. When an entranceRef is
    // supplied (the homepage hero), progress is driven EXTERNALLY by that ref — animated on the
    // Hero's own GSAP intro timeline, in lockstep with the star's opacity reveal — so the visible
    // "grow in" can't finish while the star is still transparent (which is what happened when this
    // ran on its own R3F clock but the opacity reveal was delayed behind the gradient wash). With
    // no entranceRef (footer, collaborate, modal, etc.) it falls back to the self-timed clock.
    const p = entranceRef
      ? Math.min(1, Math.max(0, entranceRef.current))
      : Math.min((t - entranceStart.current) / ENTRANCE_DURATION, 1);
    const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic

    // Ambient rotation — but ONLY after the entrance has fully settled (p >= 1). Accumulating it
    // from frame 1 meant the star settled at a DIFFERENT rotation angle every load (however much
    // base rotation happened to build up by the ~1.15s settle depends on real-frame timing), and
    // a rotating asymmetric star's silhouette reads as centered only at its front-facing pose —
    // so the star landed slightly left on one load and slightly right on the next. Holding base at
    // 0 through the entrance makes rotation.y settle at exactly 0 (front-facing, bilaterally
    // symmetric = genuinely centered) on EVERY load, deterministically, before the ambient drift
    // then begins from that centered pose.
    if (autoRotate && p >= 1) baseRotationRef.current += 0.25 * delta;
    // RadiatesSection's entrance spin (spinRef going 0→1 over its own timeline) — half a turn
    // (Math.PI radians = 180°), not a full 360°.
    const extraSpin = (spinRef?.current ?? 0) * Math.PI;
    // dampRef is extra rotation (radians) layered on top of the constant base spin, driven by
    // RadiatesSection's scroll progress rather than time — see rotationDampRef's declaration in
    // page.tsx for why this reads as "spins faster as you scroll through the shrink" regardless
    // of how fast that scroll happens.
    const scrollSpin = dampRef?.current ?? 0;
    groupRef.current.rotation.y = baseRotationRef.current + (1 - eased) * Math.PI * 0.6 + extraSpin + scrollSpin;

    // shrinkRef (1 = full size) shrinks the MODEL itself in 3D, not the CSS wrapper box — scaling
    // the wrapper via CSS pulled the star off to one side, because the star isn't centered inside
    // its (portrait) canvas: it's camera-framed/grounded, so the wrapper's geometric center isn't
    // the star's visual center, and CSS-scaling about that geometric center drags the star toward
    // it. Scaling the 3D group instead shrinks the star about its own geometry. The model's base
    // sits at group-local y=0 and it's one unit tall, so its center is at local y=0.5 → world
    // y = groupScale·0.5. Left alone, shrinking would drop that center; the position.y term below
    // lifts the group by exactly the amount needed to keep the center pinned at 0.5·scale (the
    // camera's target), so it shrinks straight toward its center — no drift in any direction.
    const shrink = shrinkRef?.current ?? 1;
    const entranceScale = 0.05 + eased * 0.95;
    groupRef.current.scale.setScalar(scale * entranceScale * shrink);
    groupRef.current.position.y = 0.5 * scale * (1 - shrink) * eased;
  });

  return (
    <group ref={groupRef}>
      <primitive object={clonedScene} />
    </group>
  );
}

function Loader() {
  return (
    <mesh>
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshBasicMaterial color="#4060FF" wireframe />
    </mesh>
  );
}

export function Star3D({ className = "", scale = 2.2, cameraZ = 4, fov = 44, spinRef, dampRef, shrinkRef, autoRotate = true, entranceRef }: { className?: string; scale?: number; cameraZ?: number; fov?: number; spinRef?: React.RefObject<number>; dampRef?: React.RefObject<number>; shrinkRef?: React.RefObject<number>; autoRotate?: boolean; entranceRef?: React.RefObject<number> }) {
  useEffect(() => {
    nudgeCanvasResize();
  }, []);

  return (
    <div className={className} style={{ width: "100%", height: "100%" }}>
      <Canvas
        // fov (default 44) is overridable so a caller can go near-orthographic (large cameraZ +
        // small fov, keeping cameraZ·tan(fov/2) constant to preserve on-screen size). The homepage
        // hero uses that to flatten perspective, so the continuously-spinning asymmetric star's
        // arms don't foreshorten unevenly as they turn — which is what made it read as leaning
        // off-centre at angled poses. Other placements keep the default dramatic 44° perspective.
        camera={{ position: [0, 0, cameraZ], fov }}
        gl={{ antialias: true, alpha: true }}
        shadows={false}
        dpr={[1, 2]}
        style={{ pointerEvents: "none" }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[4, 8, 4]}  intensity={2.4} color="#FFFFFF" />
        <directionalLight position={[-4, -4, -4]} intensity={1.2}  color="#7090FF" />

        <Suspense fallback={<Loader />}>
          <StarModel scale={scale} spinRef={spinRef} dampRef={dampRef} shrinkRef={shrinkRef} autoRotate={autoRotate} entranceRef={entranceRef} />
          <Environment preset="sunset" />
        </Suspense>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          // enableRotate was never explicitly set, so it defaulted to true — OrbitControls
          // attaches its own non-passive touch listeners for single-finger drag-to-rotate,
          // calling preventDefault() on touchmove. This star is a large, fixed, centered
          // element sitting right over the top of the viewport on every page that renders it
          // (home, collaborate, concept/3) — exactly where a pull-to-refresh gesture starts.
          // The canvas has pointer-events:none, which SHOULD make it untargetable, but that
          // isn't reliably respected for raw native touch events (vs. synthetic PointerEvents)
          // on every mobile browser. The star's rotation is entirely driven by our own
          // useFrame/GSAP logic, never by user interaction, so there's no actual use for
          // OrbitControls' rotate handling here — disabling it outright removes the risk.
          enableRotate={false}
          enableDamping={false}
          autoRotate={false}
          target={[0, 0.5 * scale, 0]}
        />
      </Canvas>
    </div>
  );
}

useGLTF.preload("/Compass.glb");
