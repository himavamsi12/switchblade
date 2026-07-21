"use client";
import { useEffect, useRef } from "react";
import type * as THREE from "three";
import { SweepText } from "@/components/shared/SweepText";
import { SparkleMark } from "@/components/shared/SparkleMark";

interface GlobeCanvasProps {
  onFormTrigger: (fn: () => void) => void;
}

function GlobeCanvas({ onFormTrigger }: GlobeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let killed = false;
    let animId: number;

    (async () => {
      const THREE   = await import("three");
      const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js");
      const { gsap }          = await import("gsap");
      if (killed) return;

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0xffffff, 1);
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);

      const scene  = new THREE.Scene();
      scene.background = new THREE.Color(0xffffff);

      const camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.01, 1000);
      camera.position.set(0, 0, 4);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enablePan       = false;
      controls.enableZoom      = false;
      controls.autoRotate      = true;
      controls.autoRotateSpeed = 0.35;
      controls.rotateSpeed     = 0.3;
      controls.enableDamping   = true;
      controls.dampingFactor   = 0.35;
      controls.minDistance     = 2;
      controls.maxDistance     = 8;

      const raycaster = new THREE.Raycaster();
      const pointer   = new THREE.Vector2();
      const meshes: (THREE.Mesh & { targetScale: number })[] = [];
      let zoomed = false;
      let savedCamPos: THREE.Vector3, savedTarget: THREE.Vector3;

      const onPointerMove = (e: PointerEvent) => {
        if (zoomed) return;
        const r = canvas.getBoundingClientRect();
        pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
        pointer.y = -((e.clientY - r.top) / r.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObjects(meshes, false);
        const hov  = hits.length ? hits[0].object as typeof meshes[0] : null;
        meshes.forEach(m => { m.targetScale = m === hov ? 1.25 : 1.0; });
      };
      canvas.addEventListener("pointermove", onPointerMove);

      const onPointerLeave = () => {
        if (!zoomed) meshes.forEach(m => { m.targetScale = 1.0; });
      };
      canvas.addEventListener("pointerleave", onPointerLeave);

      const onPointerDown = (e: PointerEvent) => {
        if (zoomed) {
          gsap.to(controls.target, { x: savedTarget.x, y: savedTarget.y, z: savedTarget.z, duration: 1.2, ease: "power2.inOut" });
          gsap.to(camera.position, {
            x: savedCamPos.x, y: savedCamPos.y, z: savedCamPos.z,
            duration: 1.2, ease: "power2.inOut",
            onUpdate: () => controls.update(),
            onComplete: () => { zoomed = false; controls.autoRotate = true; controls.enableRotate = true; meshes.forEach(m => { m.targetScale = 1.0; }); },
          });
          return;
        }
        const r = canvas.getBoundingClientRect();
        pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
        pointer.y = -((e.clientY - r.top) / r.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObjects(meshes, false);
        if (!hits.length) return;
        zoomed = true;
        const clicked = hits[0].object as typeof meshes[0];
        clicked.targetScale = 1.2;
        savedCamPos   = camera.position.clone();
        savedTarget   = controls.target.clone();
        controls.autoRotate   = false;
        controls.enableRotate = false;
        const meshPos = clicked.getWorldPosition(new THREE.Vector3());
        const dir     = camera.position.clone().sub(controls.target).normalize();
        gsap.to(controls.target, { x: meshPos.x, y: meshPos.y, z: meshPos.z, duration: 1.2, ease: "power2.inOut" });
        gsap.to(camera.position, {
          x: meshPos.x + dir.x * 0.8, y: meshPos.y + dir.y * 0.8, z: meshPos.z + dir.z * 0.8,
          duration: 1.2, ease: "power2.inOut", onUpdate: () => controls.update(),
        });
      };
      canvas.addEventListener("pointerdown", onPointerDown);

      const IMG_URLS = [
        "https://images.unsplash.com/photo-1535385793343-27dff1413c5a?w=800&q=80&fit=crop",
        "https://images.unsplash.com/photo-1559739790-1d316574ca31?w=800&q=80&fit=crop",
        "https://images.unsplash.com/photo-1524230572899-a752b3835840?w=800&q=80&fit=crop",
        "https://images.unsplash.com/photo-1559739790-2a4df7c229f5?w=800&q=80&fit=crop",
        "https://images.unsplash.com/photo-1558688077-dcc0f0988f14?w=800&q=80&fit=crop",
        "https://images.unsplash.com/photo-1601652773741-3ef64a7cae2f?w=800&q=80&fit=crop",
        "https://images.unsplash.com/photo-1755268236509-08cf32816917?w=800&q=80&fit=crop",
        "https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?w=800&q=80&fit=crop",
        "https://images.unsplash.com/photo-1493421419110-74f4e85ba126?w=800&q=80&fit=crop",
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80&fit=crop",
      ];

      const COUNT = 80, R = 2.2, Hgt = 0.38, Wth = Hgt * 0.75;
      const loader = new THREE.TextureLoader();
      const phi    = Math.PI * (3 - Math.sqrt(5));

      const textures = await Promise.all(
        IMG_URLS.map(u => new Promise<THREE.Texture>(res => {
          loader.load(u, tex => {
            const ir = tex.image.width / tex.image.height;
            const pr = Wth / Hgt;
            let rx = 1, ry = 1, ox = 0, oy = 0;
            if (ir > pr) { rx = pr / ir; ox = (1 - rx) / 2; }
            else         { ry = ir / pr; oy = (1 - ry) / 2; }
            tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
            tex.repeat.set(rx, ry);
            tex.offset.set(ox, oy);
            tex.generateMipmaps = true;
            tex.minFilter = THREE.LinearMipMapLinearFilter;
            tex.magFilter = THREE.LinearFilter;
            tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
            res(tex);
          });
        }))
      );
      if (killed) return;

      const targets: { x: number; y: number; z: number; rx: number; ry: number; rz: number }[] = [];

      for (let i = 0; i < COUNT; i++) {
        const v  = (i + 0.5) / COUNT;
        const th = phi * i;
        const z  = 1 - 2 * v;
        const r0 = Math.sqrt(1 - z * z);
        const tx = Math.cos(th) * r0 * R;
        const ty = z * R;
        const tz = Math.sin(th) * r0 * R;

        const dummy = new THREE.Mesh(new THREE.PlaneGeometry(Wth, Hgt), new THREE.MeshBasicMaterial());
        dummy.position.set(tx, ty, tz);
        dummy.lookAt(new THREE.Vector3(0, 0, 0));

        targets.push({ x: tx, y: ty, z: tz, rx: dummy.rotation.x, ry: dummy.rotation.y, rz: dummy.rotation.z });

        const mesh = new THREE.Mesh(
          new THREE.PlaneGeometry(Wth, Hgt),
          new THREE.MeshBasicMaterial({ map: textures[i % textures.length], transparent: true, opacity: 0, side: THREE.DoubleSide })
        ) as unknown as THREE.Mesh & { targetScale: number };

        mesh.position.set(0, 0, 0);
        mesh.rotation.set(targets[i].rx, targets[i].ry, targets[i].rz);
        mesh.scale.set(0, 0, 0);
        mesh.targetScale = 1.0;
        scene.add(mesh);
        meshes.push(mesh);
      }

      onFormTrigger(() => {
        meshes.forEach((mesh, i) => {
          const t = targets[i];
          const delay = i * 0.009; 
          gsap.to(mesh.position, { x: t.x, y: t.y, z: t.z, duration: 1.6, ease: "power3.out", delay });
          gsap.to(mesh.scale,    { x: 1,   y: 1,   z: 1,   duration: 0.7, ease: "back.out(1.4)", delay });
          gsap.to(mesh.material, { opacity: 1,              duration: 0.6, ease: "power2.out",    delay: delay + 0.05 });
        });
      });

      function animate() {
        if (killed) return;
        animId = requestAnimationFrame(animate);
        meshes.forEach(m => {
          const s = THREE.MathUtils.lerp(m.scale.x, m.targetScale, 0.12);
          m.scale.set(s, s, s);
        });
        controls.update();
        renderer.render(scene, camera);
      }
      animate();

      const onResize = () => {
        const w = canvas.clientWidth, h = canvas.clientHeight;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      window.addEventListener("resize", onResize);

      (canvas as unknown as Record<string, unknown>).__cleanup = () => {
        window.removeEventListener("resize", onResize);
        canvas.removeEventListener("pointermove", onPointerMove);
        canvas.removeEventListener("pointerleave", onPointerLeave);
        canvas.removeEventListener("pointerdown", onPointerDown);
        cancelAnimationFrame(animId);
        renderer.dispose();
      };
    })();

    return () => {
      killed = true;
      cancelAnimationFrame(animId);
      const c = canvas as unknown as Record<string, unknown>;
      if (typeof c.__cleanup === "function") c.__cleanup();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: "block", width: "100%", height: "100%", touchAction: "none" }}
    />
  );
}

export function ClassicsGlobeSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const introRef   = useRef<HTMLParagraphElement>(null);
  const descRef    = useRef<HTMLParagraphElement>(null);
  const ctaRef     = useRef<HTMLAnchorElement>(null);
  const formGlobe  = useRef<(() => void) | null>(null);
  const triggered  = useRef(false);

  const runSequence = async () => {
    const { gsap } = await import("gsap");

    gsap.fromTo(introRef.current,
      { opacity: 0, scale: 3.5, y: -8 },
      { opacity: 1, scale: 1,   y:  0, duration: 0.85, ease: "power4.out", delay: 0 }
    );

    gsap.fromTo(descRef.current,
      { opacity: 0, y: 18 },
      { opacity: 1, y:  0, duration: 0.65, ease: "power2.out", delay: 0.9 }
    );

    gsap.fromTo(ctaRef.current,
      { opacity: 0, y: 14, scale: 0.94 },
      { opacity: 1, y:  0, scale: 1, duration: 0.55, ease: "power2.out", delay: 1.1 }
    );

    setTimeout(() => { formGlobe.current?.(); }, 1000);
  };

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !triggered.current) {
          triggered.current = true;
          runSequence();
          observer.disconnect();
        }
      },
      { threshold: 0.18 }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        position:   "relative",
        width:      "100%",
        height:     "100vh",
        minHeight:  "640px",
        background: "#ffffff",
        overflow:   "hidden",
      }}
    >
      <div style={{ position: "absolute", inset: 0 }}>
        <GlobeCanvas onFormTrigger={fn => { formGlobe.current = fn; }} />
      </div>

      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        height: "22%", zIndex: 8, pointerEvents: "none",
        background: "linear-gradient(to bottom, #ffffff 0%, rgba(255,255,255,0) 100%)",
      }} />

      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        height: "22%", zIndex: 8, pointerEvents: "none",
        background: "linear-gradient(to top, #ffffff 0%, rgba(255,255,255,0) 100%)",
      }} />

      <div style={{
        position: "absolute", inset: 0, zIndex: 9, pointerEvents: "none",
        background: "radial-gradient(ellipse 46% 42% at 50% 50%, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.85) 45%, rgba(255,255,255,0) 78%)",
      }} />

      <div style={{
        position:       "absolute",
        inset:          0,
        display:        "flex",
        flexDirection:  "column",
        alignItems:     "center",
        justifyContent: "center",
        textAlign:      "center",
        zIndex:         10,
        gap:            0,
      }}>
        <p
          ref={introRef}
          style={{
            display:       "inline-flex",
            fontFamily:    "var(--font-ibm-mono)",
            fontWeight:    700,
            fontSize:      "clamp(10px, 0.9vw, 13px)",
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color:         "#444",
            border:        "1px solid #D3D3D3",
            borderRadius:  6,
            padding:       "4px 6px",
            marginBottom:  "clamp(14px, 1.8vw, 22px)",
            opacity:       0,
            transformOrigin: "center center",
          }}
        >
          Introducing
        </p>

        <h2
          style={{
            fontFamily:    "var(--font-barlow)",
            fontWeight:    900,
            fontSize:      "clamp(40px, 7vw, 96px)",
            lineHeight:    1,
            letterSpacing: "-0.02em",
            textTransform: "uppercase",
            marginBottom:  "clamp(18px, 2.2vw, 28px)",
          }}
        >
          <SweepText tone="dark">Switchblade<br />Classics</SweepText>
        </h2>

        <p
          ref={descRef}
          style={{
            fontFamily:    "var(--font-archivo)",
            fontSize:      "clamp(13px, 1vw, 16px)",
            fontWeight:    500,
            lineHeight:    1.15,
            letterSpacing: "0.06em",
            color:         "rgba(0,0,0,0.5)",
            maxWidth:      "440px",
            
            marginBottom:  "clamp(28px, 3vw, 40px)",
            opacity:       0,
          }}
        >
          Explore more of the archive and <br/> inspiration
        </p>

        <a
          ref={ctaRef}
          href="/classics"
          className="rounded-lg"
          style={{
            display:        "inline-flex",
            alignItems:     "center",
            gap:            10,
            background:     "#FF802B",
            color:          "#ffffff",
            fontFamily:     "var(--font-archivo)",
            fontSize:       "clamp(14px, 1vw, 16px)",
            fontWeight:     600,
            textDecoration: "none",
            padding:        "8px 8px 8px 18px",
            opacity:        0,
            transition:     "opacity 0.18s ease, transform 0.18s ease",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLAnchorElement).style.opacity    = "0.85";
            (e.currentTarget as HTMLAnchorElement).style.transform  = "scale(1.04)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLAnchorElement).style.opacity    = "1";
            (e.currentTarget as HTMLAnchorElement).style.transform  = "scale(1)";
          }}
        >
          Classics
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, background: "#fff", borderRadius: 6 }}>
            <SparkleMark className="h-[14px] w-auto shrink-0 text-[#0D0D0D]" />
          </span>
        </a>
      </div>
    </section>
  );
}
