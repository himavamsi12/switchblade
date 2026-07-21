"use client";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import type { Group } from "three";
import { nudgeCanvasResize } from "@/lib/canvasResizeNudge";

// One full revolution. Slow enough to read as ambient drift rather than a spinner.
const REVOLUTION_SECONDS = 70;

/**
 * Latitude/longitude graticule as real 3D line segments. This is what sells the rotation as a
 * sphere rather than a spinning disc: the meridians converge at the poles and compress toward
 * the limb as they turn away from the camera, which a flat image can't fake.
 */
function useGraticule(radius: number) {
  return useMemo(() => {
    const pts: number[] = [];
    const STEP = 30;
    const SEG = 128;

    // Meridians — constant longitude, swept pole to pole. lon=90 is skipped, by request.
    for (let lon = 0; lon < 360; lon += STEP) {
      if (lon === 90) continue;
      const p = (lon * Math.PI) / 180;
      for (let i = 0; i < SEG; i++) {
        for (const t of [i, i + 1]) {
          const lat = -Math.PI / 2 + (t / SEG) * Math.PI;
          pts.push(
            radius * Math.cos(lat) * Math.sin(p),
            radius * Math.sin(lat),
            radius * Math.cos(lat) * Math.cos(p)
          );
        }
      }
    }

    // Parallels — constant latitude, swept through longitude. The poles are skipped: a parallel
    // at +/-90deg collapses to zero radius and renders as a dot artifact.
    for (let lat = -90 + STEP; lat < 90; lat += STEP) {
      const t = (lat * Math.PI) / 180;
      const r = radius * Math.cos(t);
      const y = radius * Math.sin(t);
      for (let i = 0; i < SEG; i++) {
        for (const s of [i, i + 1]) {
          const p = (s / SEG) * Math.PI * 2;
          pts.push(r * Math.sin(p), y, r * Math.cos(p));
        }
      }
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return geom;
  }, [radius]);
}

function GlobeBody({ radius = 1 }: { radius?: number }) {
  const spinRef = useRef<Group>(null);
  const texture = useLoader(THREE.TextureLoader, "/world-equirect.png");
  // 1.002 (only 0.7% outside the 0.995 occluder below) was too thin a depth margin — confirmed
  // live as z-fighting near the limb (grazing view angles), reading as broken/dashed line
  // segments rather than clean continuous meridians/parallels. 1.01 widens that gap enough to
  // clear it.
  const graticule = useGraticule(radius * 1.01);

  // colorSpace matters even for an unlit material — without it the greys render darker than the
  // source artwork. RepeatWrapping so the seam at +/-180deg longitude stays clean as it turns.
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 16;
  texture.wrapS = THREE.RepeatWrapping;

  useFrame((_, delta) => {
    if (spinRef.current) {
      spinRef.current.rotation.y += (Math.PI * 2 * delta) / REVOLUTION_SECONDS;
    }
  });

  return (
    // Axial tilt applied OUTSIDE the spinning group, so the globe turns about its own tilted
    // axis rather than wobbling. ~23deg mirrors Earth's real tilt and keeps the poles off-centre,
    // which is what makes the rotation legible as a sphere.
    <group rotation={[0.41, 0, 0.08]}>
      <group ref={spinRef}>
        {/* Solid occluder a hair inside the textured shell. The land texture has transparent
            oceans, so without this the far hemisphere reads straight through the near side and
            the whole thing looks like a wireframe ball with no depth. White matches the section
            background, so it's invisible in itself — it exists purely to write depth and hide
            the back half, leaving only the front-facing surface visible. */}
        <mesh renderOrder={0}>
          <sphereGeometry args={[radius * 0.985, 64, 48]} />
          <meshBasicMaterial color="#ffffff" side={THREE.FrontSide} />
        </mesh>

        {/* depthTest (on by default) is what lets the occluder cull the far-side lines. */}
        <lineSegments geometry={graticule} renderOrder={1}>
          <lineBasicMaterial color="#c4c4c4" transparent opacity={0.7} depthWrite={false} />
        </lineSegments>

        {/* Land at full opacity. transparent stays true only so the oceans keep their alpha. */}
        <mesh renderOrder={2}>
          <sphereGeometry args={[radius, 64, 48]} />
          <meshBasicMaterial
            map={texture}
            transparent
            opacity={1}
            side={THREE.FrontSide}
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Vision-section globe — a real three.js sphere, replacing the former flat vision-globe.svg.
 * That artwork baked the two "50%" stat callouts into the same file, so it could not be rotated
 * without turning the text upside down, and rotating a flat image reads as tumbling rather than
 * a sphere turning. The callouts are now plain HTML, layered over this canvas by ParagraphReveal.
 */
export function Globe3D({ className = "" }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  // Browsers cap the number of live WebGL contexts per page. This site's homepage already runs
  // several other Star3D canvases (hero, footer, and RadiatesSection's travel), so mounting this
  // one unconditionally risks it losing its context on load. Only mounting the <Canvas> while its
  // wrapper is near the viewport (rootMargin gives a one-viewport-tall buffer above/below so it's
  // ready slightly before scrolling into view, not popping in late) keeps concurrent contexts low.
  const visible = useNearViewport(wrapRef);

  // Same nudge Star3D does. This canvas mounts lazily (both by the visible gate above and by
  // whatever else delays this component's own mount), and R3F sizes itself from a measurement
  // taken as it mounts — if that lands before layout settles it keeps the 300x150 HTML default
  // and the globe renders into a tiny box in the corner.
  useEffect(() => {
    if (visible) nudgeCanvasResize();
  }, [visible]);

  return (
    <div ref={wrapRef} className={className} style={{ width: "100%", height: "100%" }}>
      {visible && (
        <Canvas
          // near/far tightened from R3F's defaults (0.1/1000) to 1/10 — everything in this scene
          // sits within ~1 unit of the origin, seen from ~3 units away, so a 0.1-to-1000 range
          // wastes almost all of the depth buffer's precision on distances nothing ever occupies.
          // That starved the concentric graticule/occluder/land shells (only ~1-2% of radius
          // apart) of the precision they needed, confirmed live as z-fighting/broken line
          // segments on the graticule independent of viewing angle. A tight near/far gives this
          // small scene the full precision budget.
          camera={{ position: [0, 0, 3.05], fov: 45, near: 1, far: 10 }}
          // NoToneMapping is essential here, not a preference. R3F defaults to ACES filmic, which
          // compresses highlights — it renders the pure-white occluder sphere at roughly #ededed,
          // so the oceans came out grey and the mild-grey continents lost nearly all contrast
          // against them. These materials are unlit and already authored in final display colours,
          // so any tone curve is purely destructive.
          gl={{ antialias: true, alpha: true, toneMapping: THREE.NoToneMapping }}
          dpr={[1, 2]}
          style={{ pointerEvents: "none", background: "transparent" }}
        >
          {/* Required: GlobeBody's useLoader suspends while the texture decodes, and without a
              boundary the whole canvas renders empty. */}
          <Suspense fallback={null}>
            {/* radius 0.82 (down from 1) — shrinks the sphere within its box, confirmed live as
                reading too large relative to the "50%" callouts around it at the full radius. */}
            <GlobeBody radius={0.82} />
          </Suspense>
        </Canvas>
      )}
    </div>
  );
}

function useNearViewport(ref: React.RefObject<HTMLElement | null>) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "100% 0px 100% 0px", threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
  return visible;
}
