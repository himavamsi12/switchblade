"use client";
import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Environment, useTexture } from "@react-three/drei";
import * as THREE from "three";
import type { Group } from "three";
// "Fat lines" helpers for a genuinely THICK wireframe — see the mode==="wire" branch below for
// why plain `wireframe:true` on a standard material can't do this.
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { LineSegmentsGeometry } from "three/examples/jsm/lines/LineSegmentsGeometry.js";
import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";
import { nudgeCanvasResize } from "@/lib/canvasResizeNudge";

export type StarMode = "wire" | "classic" | "chrome";
export type StarAlign = "center" | "ground";

const TARGET_H = 3.4;
const VIEW_BOTTOM = -1.86; 

function applyY(o: THREE.Object3D, align: StarAlign, minY: number, sizeY: number, s: number) {
  if (align === "ground") o.position.y = VIEW_BOTTOM - minY * s;
  else o.position.y = -(minY + sizeY / 2) * s;
}

function GlbModel({ mode, align, speed }: { mode: StarMode; align: StarAlign; speed: number }) {
  const ref = useRef<Group>(null);
  const { scene } = useGLTF("/Compass.glb");
  const { size } = useThree();
  // LineMaterial instances created for the current "wire" build — kept so their `resolution`
  // (canvas pixel dimensions) can be re-synced on resize; without this the fat-line stroke width
  // renders wrong (too thick/thin) whenever the canvas isn't the size it had when created.
  const wireMaterialsRef = useRef<LineMaterial[]>([]);

  // Brushed-concrete PBR set for "classic" mode's material (from
  // brushed_concrete_2_4k.blend/textures, the same source the diffuse map was originally taken
  // from). Re-verified this time before wiring it in — a previous unrelated attempt at a
  // scratched-metal look used a broken/watermarked-preview download whose normal map measured as
  // completely flat (a real lesson in verifying pixel data, not just trusting a source looks
  // legitimate); this concrete set's diffuse/normal/roughness were all checked for genuine pixel
  // variance (not flat) before being converted and dropped in here.
  //
  // Loaded unconditionally (drei's useTexture is a hook, can't be called only when
  // mode==="classic") but only actually attached to the material below in that branch, so
  // "wire"/"chrome" pay the load cost but never use it. colorSpace only applies to the diffuse
  // map — normal/roughness maps encode raw directional/scalar data, not colors, and would be
  // visibly wrong if gamma-corrected like the diffuse map.
  const [classicMap, classicNormalMap, classicRoughnessMap] = useTexture([
    "/textures/brushed-concrete-diffuse.jpg",
    "/textures/brushed-concrete-normal.png",
    "/textures/brushed-concrete-roughness.jpg",
  ]);
  classicMap.colorSpace = THREE.SRGBColorSpace;
  // Repeat 0.15x0.15 — NOT a guess, measured directly from Compass.glb's own TEXCOORD_0 data:
  // the star mesh's UVs span roughly U -3.27..4.27 and V -3.77..7.02 (a ~7.5 x 10.8 tile range),
  // not the usual 0..1. That means at repeat(1,1) this texture already repeats ~75 times across
  // the surface before we touch anything, which fragments the concrete's few large storytelling
  // features (cracks, trowel strokes) into small, hard-to-read pieces. Going well BELOW 1
  // compensates for the mesh's own inherent UV scale, landing the effective on-surface tiling
  // back down to roughly 1-2x (0.15 x ~7.5-10.8 tile range ≈ 1.1-1.6) so the surface reads as one
  // continuous slab instead of a repeated pattern.
  [classicMap, classicNormalMap, classicRoughnessMap].forEach((t) => {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(0.15, 0.15);
  });

  const obj = useMemo(() => {
    const c = scene.clone(true);
    wireMaterialsRef.current = [];
    c.traverse((ch) => {
      const m = ch as THREE.Mesh;
      if (!m.isMesh) return;

      if (mode === "wire") {
        // Cosmos: THICK stroke lines only — no filled/shaded geometry. Plain `wireframe:true` on
        // a standard material draws real GL_LINES primitives, and WebGL/every browser/GPU driver
        // hard-ignores any requested linewidth on those — they always render at ~1px, which read
        // as thin/wispy regardless of color/opacity tuning. Three's "fat lines" system
        // (LineSegments2 + LineSegmentsGeometry + LineMaterial, from three/examples/jsm/lines)
        // instead renders each segment as actual screen-space quad geometry, so `linewidth` (in
        // pixels) genuinely controls stroke thickness. THREE.EdgesGeometry (rather than a full
        // WireframeGeometry) keeps only edges whose adjoining faces meet at an angle — dropping
        // the diagonal seam every quad's triangulation leaves behind — so the model reads as
        // clean strokes along its real silhouette/creases instead of a dense cross-hatched mesh.
        const edges = new THREE.EdgesGeometry(m.geometry, 1);
        const lineGeo = new LineSegmentsGeometry().fromEdgesGeometry(edges);
        const lineMat = new LineMaterial({
          color: 0x8a8a8a,
          linewidth: 1, // CSS pixels (worldUnits defaults to false) — thin, not bold, strokes
          transparent: true,
          opacity: 0.55,
          resolution: new THREE.Vector2(size.width, size.height),
        });
        wireMaterialsRef.current.push(lineMat);
        const ls = new LineSegments2(lineGeo, lineMat);
        ls.position.copy(m.position);
        ls.rotation.copy(m.rotation);
        ls.scale.copy(m.scale);

        const parent = m.parent;
        if (parent) {
          const idx = parent.children.indexOf(m);
          if (idx !== -1) parent.children[idx] = ls;
          ls.parent = parent;
        }
        return;
      }

      m.material =
        // Classic: a soft, matte "clay" look — light neutral gray, low metalness, higher
        // roughness — instead of a flat unlit black silhouette. MeshStandardMaterial (PBR, lit)
        // is used deliberately here (not MeshBasicMaterial) so it picks up the two directional
        // lights below as gentle shading/highlight across the surface. color is plain white —
        // MeshStandardMaterial's color MULTIPLIES the diffuse map, and any tint here would wash
        // out/desaturate the photographed concrete's own contrast instead of letting it read as
        // authored. Low metalness (0.05) matches this mode's matte-clay intent and, separately,
        // avoids a real problem confirmed live with a HIGH metalness value here: metals have
        // near-zero diffuse response and rely on reflecting an environment map for their lit
        // look, which this mode doesn't have (only "chrome" below gets <Environment>) — under
        // just two plain directional lights a highly metallic material has nothing to reflect
        // and renders almost solid black.
        mode === "classic"
          ? new THREE.MeshStandardMaterial({
              color: new THREE.Color("#ffffff"),
              map: classicMap,
              normalMap: classicNormalMap,
              roughnessMap: classicRoughnessMap,
              metalness: 0.05,
              roughness: 0.7,
              side: THREE.DoubleSide,
            })
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
    const size3 = new THREE.Vector3(); box.getSize(size3);
    const ctr = new THREE.Vector3(); box.getCenter(ctr);
    const s = TARGET_H / (size3.y || 1);
    c.scale.setScalar(s);
    c.position.x = -ctr.x * s; c.position.z = -ctr.z * s;
    applyY(c, align, box.min.y, size3.y, s);
    return c;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, mode, align]);

  useEffect(() => {
    wireMaterialsRef.current.forEach((m) => m.resolution.set(size.width, size.height));
  }, [size]);

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
      <Canvas
        camera={{ position: [0, 0, 5], fov: 42 }}
        gl={{ antialias: true, alpha: true, toneMappingExposure: mode === "classic" ? 1.9 : 1 }}
        dpr={[1, 1.75]}
      >
        {/* "classic" mode's concrete texture photographs dark under the same lighting the
            metal/wire modes use — those modes rely on specular/reflection so exposure barely
            shows on them, but a matte diffuse map like the concrete reads its lit brightness
            almost directly. Boosted ambient + both directional intensities specifically for
            "classic" (other modes unchanged) to match the lighter reference look, rather than
            re-exporting the texture files themselves. Raising light intensity alone plateaus
            fast under the default ACES filmic tone mapping (it compresses highlights), so
            toneMappingExposure above does the rest of the brightening multiplicatively. */}
        <ambientLight intensity={mode === "classic" ? 1.1 : 0.4} />
        <directionalLight position={[4, 8, 4]} intensity={mode === "classic" ? 3.6 : 2.4} color="#FFFFFF" />
        <directionalLight position={[-5, -2, -4]} intensity={mode === "classic" ? 2.3 : 1.2} color={mode === "classic" ? "#FFFFFF" : "#9FB4D8"} />
        <Suspense fallback={null}>
          {/* All 3 modes now render the real GLB star (see GlbModel's material branch for the
              per-mode look) — "wire" no longer swaps in a separate simplified placeholder
              geometry. */}
          <GlbModel mode={mode} align={align} speed={speed} />
          {mode === "chrome" && <Environment preset="sunset" />}
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload("/Compass.glb");
