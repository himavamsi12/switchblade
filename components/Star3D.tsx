"use client";
import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";
import type { Group } from "three";
import { nudgeCanvasResize } from "@/lib/canvasResizeNudge";

function StarModel({ scale = 2.2, spinRef }: { scale?: number; spinRef?: React.RefObject<number> }) {
  const groupRef = useRef<Group>(null);
  const { scene } = useGLTF("/estar.glb");
  const entranceStart = useRef<number | null>(null);

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

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();

    if (entranceStart.current === null) entranceStart.current = t;

    const ENTRANCE_DURATION = 1.15;
    const elapsed = t - entranceStart.current;
    const p = Math.min(elapsed / ENTRANCE_DURATION, 1);
    const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic

    // Always rotate — the model's rotation axis passes through its horizontal center, so a
    // continuously spinning star keeps its center point fixed (stays centered) while the arms
    // sweep. It never freezes.
    const extraSpin = (spinRef?.current ?? 0) * Math.PI * 2;
    groupRef.current.rotation.y = t * 0.25 + (1 - eased) * Math.PI * 0.6 + extraSpin;
    groupRef.current.scale.setScalar(scale * (0.05 + eased * 0.95));
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

export function Star3D({ className = "", scale = 2.2, cameraZ = 4, spinRef }: { className?: string; scale?: number; cameraZ?: number; spinRef?: React.RefObject<number> }) {
  useEffect(() => {
    nudgeCanvasResize();
  }, []);

  return (
    <div className={className} style={{ width: "100%", height: "100%" }}>
      <Canvas
        camera={{ position: [0, 0, cameraZ], fov: 44 }}
        gl={{ antialias: true, alpha: true }}
        shadows={false}
        dpr={[1, 2]}
        style={{ pointerEvents: "none" }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[4, 8, 4]}  intensity={2.4} color="#FFFFFF" />
        <directionalLight position={[-4, -4, -4]} intensity={1.2}  color="#7090FF" />

        <Suspense fallback={<Loader />}>
          <StarModel scale={scale} spinRef={spinRef} />
          <Environment preset="sunset" />
        </Suspense>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableDamping={false}
          autoRotate={false}
          target={[0, 0.5 * scale, 0]}
        />
      </Canvas>
    </div>
  );
}

useGLTF.preload("/estar.glb");
