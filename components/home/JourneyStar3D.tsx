"use client";
import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Environment } from "@react-three/drei";
import * as THREE from "three";
import type { Group } from "three";
import { nudgeCanvasResize } from "@/lib/canvasResizeNudge";

export type StarMode = "wire" | "classic" | "chrome";
export type StarAlign = "center" | "ground";

const TARGET_H = 3.4;
const VIEW_BOTTOM = -1.86; 

function makeStarGeo(): THREE.BufferGeometry {
  const H = 0.6262, ARM = 0.351, TH = 0.079, WX = 0.06, WY = 0.055;
  const V: [number, number, number][] = [
    [0, 1, 0], [ARM, H, 0], [0, 0, 0], [-ARM, H, 0],
    [WX, H + WY, 0], [WX, H - WY, 0], [-WX, H - WY, 0], [-WX, H + WY, 0],
    [0, H, TH], [0, H, -TH],
  ];
  const outline = [0, 4, 1, 5, 2, 6, 3, 7];
  const pos: number[] = []; V.forEach((v) => pos.push(...v));
  const idx: number[] = [];
  for (let i = 0; i < 8; i++) { const a = outline[i], b = outline[(i + 1) % 8]; idx.push(a, b, 8); idx.push(b, a, 9); }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx); geo.computeVertexNormals();
  return geo;
}

function applyY(o: THREE.Object3D, align: StarAlign, minY: number, sizeY: number, s: number) {
  if (align === "ground") o.position.y = VIEW_BOTTOM - minY * s;
  else o.position.y = -(minY + sizeY / 2) * s;
}

function WireModel({ align, speed }: { align: StarAlign; speed: number }) {
  const ref = useRef<Group>(null);
  const obj = useMemo(() => {
    const geo = makeStarGeo();
    const o = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 1), new THREE.LineBasicMaterial({ color: "#3A3A3A", transparent: true, opacity: 0.92 }));
    const s = TARGET_H; o.scale.setScalar(s); applyY(o, align, 0, 1, s); 
    return o;
  }, [align]);
  useFrame((st) => { if (ref.current) ref.current.rotation.y = st.clock.getElapsedTime() * speed; });
  return <group ref={ref}><primitive object={obj} /></group>;
}

function GlbModel({ mode, align, speed }: { mode: StarMode; align: StarAlign; speed: number }) {
  const ref = useRef<Group>(null);
  const { scene } = useGLTF("/estar.glb");
  const obj = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((ch) => {
      const m = ch as THREE.Mesh;
      if (!m.isMesh) return;
      m.material = mode === "classic"
        ? new THREE.MeshStandardMaterial({ color: new THREE.Color("#0E0E0E"), metalness: 0.45, roughness: 0.4, side: THREE.DoubleSide })
        : new THREE.MeshPhysicalMaterial({
            color: new THREE.Color("#B8C0CE"),
            metalness: 0.97,
            roughness: 0.05,
            clearcoat: 0.6,
            clearcoatRoughness: 0.04,
            envMapIntensity: 2.4,
            side: THREE.DoubleSide,
          });
    });
    const box = new THREE.Box3().setFromObject(c);
    const size = new THREE.Vector3(); box.getSize(size);
    const ctr = new THREE.Vector3(); box.getCenter(ctr);
    const s = TARGET_H / (size.y || 1);
    c.scale.setScalar(s);
    c.position.x = -ctr.x * s; c.position.z = -ctr.z * s;
    applyY(c, align, box.min.y, size.y, s);
    return c;
  }, [scene, mode, align]);
  useFrame((st) => { if (ref.current) ref.current.rotation.y = st.clock.getElapsedTime() * speed; });
  return <group ref={ref}><primitive object={obj} /></group>;
}

export function JourneyStar3D({ mode, align = "center", className = "", speed = 0.55 }: { mode: StarMode; align?: StarAlign; className?: string; speed?: number }) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    nudgeCanvasResize();

    // BrandJourney animates this component's own wrapper width via a CSS transition (sliding
    // between the "active"/"side" card sizes) rather than remounting it — nudgeCanvasResize's
    // two fixed-delay dispatches (on mount, then 100ms/400ms after) only correct the canvas's
    // render buffer at two sparse checkpoints, not throughout that ~550ms transition, so the
    // model briefly rendered at a stale (small) size before snapping to fit once a checkpoint
    // caught up. A ResizeObserver on this wrapper fires on every actual size change instead —
    // real time, every frame of the transition — so the Three.js canvas stays in sync
    // continuously instead of catching up in two visible jumps.
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      window.dispatchEvent(new Event("resize"));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className={className} style={{ width: "100%", height: "100%" }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 42 }} gl={{ antialias: true, alpha: true }} dpr={[1, 1.75]}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[4, 8, 4]} intensity={2.4} color="#FFFFFF" />
        <directionalLight position={[-5, -2, -4]} intensity={1.2} color="#9FB4D8" />
        <Suspense fallback={null}>
          {mode === "wire" ? <WireModel align={align} speed={speed} /> : <GlbModel mode={mode} align={align} speed={speed} />}
          {mode === "chrome" && <Environment preset="sunset" />}
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload("/estar.glb");
