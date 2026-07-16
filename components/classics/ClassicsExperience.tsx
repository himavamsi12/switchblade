"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import "./classics-experience.css";

interface Project { title: string; cat: string; img: string; gallery?: string[]; body?: string[] }

export type CmsProject = Project;

const PROJECTS: Project[] = [
  { title: "Winter Portrait",  cat: "Archive 2024",   img: "https://picsum.photos/seed/winter-portrait/700/900" },
  { title: "Red Abstract",     cat: "Visual Study",    img: "https://picsum.photos/seed/red-abstract/700/900" },
  { title: "Fabric Study",     cat: "Material",        img: "https://picsum.photos/seed/fabric-grey/700/900" },
  { title: "Mountain Lake",    cat: "Landscape",       img: "https://picsum.photos/seed/mountains-lake/700/900" },
  { title: "City At Night",    cat: "Urban 2025",      img: "https://picsum.photos/seed/city-night/700/900" },
  { title: "Forest Path",      cat: "Nature",          img: "https://picsum.photos/seed/forest-path/700/900" },
  { title: "Desert Sands",     cat: "Expedition",      img: "https://picsum.photos/seed/desert-sand/700/900" },
  { title: "Still Life I",     cat: "Seasonal",        img: "https://picsum.photos/seed/christmas-tree/700/900" },
  { title: "Two Of Us",        cat: "Portrait",        img: "https://picsum.photos/seed/couple-selfie/700/900" },
  { title: "Ocean Wave",       cat: "Seascape",        img: "https://picsum.photos/seed/ocean-wave/700/900" },
  { title: "Portrait Study",   cat: "Editorial",       img: "https://picsum.photos/seed/portrait-woman/700/900" },
  { title: "Hands & Wreath",   cat: "Craft",           img: "https://picsum.photos/seed/wreath-hands/700/900" },
  { title: "Street Art",       cat: "Urban Culture",   img: "https://picsum.photos/seed/street-art/700/900" },
  { title: "Vintage Drive",    cat: "Transport",       img: "https://picsum.photos/seed/vintage-car/700/900" },
  { title: "Jazz Club",        cat: "Nightlife",       img: "https://picsum.photos/seed/jazz-club/700/900" },
  { title: "Rooftop View",     cat: "Cityscape",       img: "https://picsum.photos/seed/rooftop-view/700/900" },
  { title: "Summer Bloom",     cat: "Botanical",       img: "https://picsum.photos/seed/summer-bloom/700/900" },
  { title: "Concrete Wall",    cat: "Brutalism",       img: "https://picsum.photos/seed/concrete-wall/700/900" },
];

const LOREM = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.",
];

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function detailBodyHtml(body: string[] | undefined) {
  return (body?.length ? body : LOREM).map(p => `<p>${escapeHtml(p)}</p>`).join("");
}

const PANELS_PER_ROW = 12, ROWS = 5;
const PANEL_SCALE = 1.1;
const SPIRAL_RADIUS_RATIO = 0.72;
const SPIRAL_SCALE_DESKTOP = 1.26, SPIRAL_SCALE_MOBILE = 0.88;
const INITIAL_BLUR = 0;
const ENTRANCE_DURATION_MS = 760;
const ENTRANCE_DELAY_MIN_MS = 840, ENTRANCE_DELAY_RANGE_MS = 980;
const BEND_H_CLAMP = 0.25, BEND_V_CLAMP = 0.15;
const BG_COLOR = 0xffffff;
const FLIP_MS = 480;
const BOOT_DUR = 2200;

interface ViewportConfig {
  fov: number; cameraZ: number; radius: number;
  panelW: number; panelH: number; rowSpacing: number;
}

function getConfig(): ViewportConfig {
  const w = window.innerWidth;
  const aspect = window.innerHeight / Math.max(w, 1);
  const portrait = aspect > 1;
  if (w < 500)  return { fov: 70, cameraZ: 7.5,  radius: 4.5, panelW: 1.0 * PANEL_SCALE, panelH: 1.4 * PANEL_SCALE, rowSpacing: 5.5 };
  if (w < 768)  return { fov: 70, cameraZ: 9.5,  radius: 4.6, panelW: 1.0 * PANEL_SCALE, panelH: 1.4 * PANEL_SCALE, rowSpacing: 3.8 };
  if (w < 1024 && portrait) return { fov: 65, cameraZ: 9,  radius: 5.5, panelW: 1.0 * PANEL_SCALE, panelH: 1.4 * PANEL_SCALE, rowSpacing: 6.5 };
  if (w < 1024) return { fov: 60, cameraZ: 11,   radius: 6.5, panelW: 1.2 * PANEL_SCALE, panelH: 1.6 * PANEL_SCALE, rowSpacing: 4 };
  return          { fov: 50, cameraZ: 13,   radius: 7.8, panelW: 1.4 * PANEL_SCALE, panelH: 1.9 * PANEL_SCALE, rowSpacing: 7 };
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed >>> 0;
  const rng = () => {
    s = (s + 1831565813) >>> 0;
    let n = s;
    n = Math.imul(n ^ (n >>> 15), n | 1);
    n ^= n + Math.imul(n ^ (n >>> 7), n | 61);
    return ((n ^ (n >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const GLSL_SRGB = `vec3 linearToSRGB(vec3 c){return pow(max(c,0.0),vec3(1.0/2.2));}`;

const PANEL_VERT = `
uniform float uBendH,uBendV,uTime,uPhase;
varying vec2 vUv;varying float vViewZ;
void main(){
  vUv=uv;vec3 pos=position;
  float xn=(uv.x-.5)*2.,yn=(uv.y-.5)*2.;
  float archX=1.-xn*xn,archY=1.-yn*yn;
  pos.z-=archX*uBendH;pos.z-=archY*uBendV;
  pos.z+=sin(uv.y*6.283+uTime*.55+uPhase)*sin(uv.x*3.14+uTime*.35+uPhase*1.3)*.016;
  vec4 mvPos=modelViewMatrix*vec4(pos,1.0);
  vViewZ=-mvPos.z;gl_Position=projectionMatrix*mvPos;
}`;

const PANEL_FRAG = `
uniform sampler2D uTexture;uniform float uOpacity,uBlur,uDepthNear,uDepthFar,uDepthStrength;
uniform vec3 uDepthColor;varying vec2 vUv;varying float vViewZ;${GLSL_SRGB}
vec4 blurSample(sampler2D t,vec2 uv,float b){
  if(b<=.0005)return texture2D(t,uv);
  vec4 a=texture2D(t,uv)*.25;
  a+=texture2D(t,uv+vec2(b,0.))*.125;a+=texture2D(t,uv+vec2(-b,0.))*.125;
  a+=texture2D(t,uv+vec2(0.,b))*.125;a+=texture2D(t,uv+vec2(0.,-b))*.125;
  a+=texture2D(t,uv+vec2(b,b))*.0625;a+=texture2D(t,uv+vec2(-b,b))*.0625;
  a+=texture2D(t,uv+vec2(b,-b))*.0625;a+=texture2D(t,uv+vec2(-b,-b))*.0625;
  return a;
}
void main(){
  vec4 col=blurSample(uTexture,vUv,uBlur);
  float d=smoothstep(uDepthNear,uDepthFar,vViewZ);
  float luma=dot(col.rgb,vec3(.2126,.7152,.0722));
  vec3 c=mix(col.rgb,vec3(luma),d*.12);
  c=mix(c,uDepthColor,d*uDepthStrength);
  col.rgb=linearToSRGB(c);col.a*=uOpacity;
  gl_FragColor=col;
}`;

interface PanelMeta { proj: Project; tR: number; tS: number; yS: number; delay: number; done: boolean }
type PanelMaterial = THREE.ShaderMaterial & { uniforms: {
  uTexture: THREE.IUniform<THREE.Texture | null>;
  uOpacity: THREE.IUniform<number>;
  uBlur: THREE.IUniform<number>;
  uBendH: THREE.IUniform<number>;
  uBendV: THREE.IUniform<number>;
  uTime: THREE.IUniform<number>;
  uPhase: THREE.IUniform<number>;
  uDepthNear: THREE.IUniform<number>;
  uDepthFar: THREE.IUniform<number>;
  uDepthColor: THREE.IUniform<THREE.Color>;
  uDepthStrength: THREE.IUniform<number>;
} };
type PanelMesh = THREE.Mesh<THREE.PlaneGeometry, PanelMaterial> & { _scaleTarget?: number };

export interface ClassicsExperienceHandle {
  openContact: () => void;
}

interface ClassicsExperienceProps {
  cmsProjects?: CmsProject[];
}

export const ClassicsExperience = forwardRef<ClassicsExperienceHandle, ClassicsExperienceProps>(function ClassicsExperience({ cmsProjects = [] }, ref) {
  const rootRef = useRef<HTMLDivElement>(null);

  const allProjects = useMemo(() => [...PROJECTS, ...cmsProjects], [cmsProjects]);

  const bootLoaderRef  = useRef<HTMLDivElement>(null);
  const bootLayerRef   = useRef<HTMLDivElement>(null);
  const bootCounterRef = useRef<HTMLDivElement>(null);

  const cursorRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const topicGroupRef = useRef<HTMLDivElement>(null);
  const sortBtnRef    = useRef<HTMLButtonElement>(null);
  const sortMenuRef   = useRef<HTMLDivElement>(null);
  const sortLabelRef  = useRef<HTMLSpanElement>(null);

  const projectLabelRef  = useRef<HTMLDivElement>(null);
  const projectPillRef   = useRef<HTMLDivElement>(null);
  const labelTitleRef    = useRef<HTMLSpanElement>(null);
  const labelCatRef      = useRef<HTMLSpanElement>(null);
  const scrollCuePillRef = useRef<HTMLDivElement>(null);

  const detailRef      = useRef<HTMLDivElement>(null);
  const detailImgRef   = useRef<HTMLImageElement>(null);
  const detailTitleRef = useRef<HTMLHeadingElement>(null);
  const detailBadgeRef = useRef<HTMLSpanElement>(null);
  const detailBodyRef  = useRef<HTMLDivElement>(null);
  const detailPrevRef  = useRef<HTMLButtonElement>(null);
  const detailNextRef  = useRef<HTMLButtonElement>(null);
  const detailInnerRef = useRef<HTMLDivElement>(null);
  const detailCardRef  = useRef<HTMLDivElement>(null);
  // Mobile-only peek cards (see classics-experience.css .detail__card--ghost) — real, full
  // cards showing the prev/next project, not a decorative sliver, so the swipe reveals actual
  // content sliding in rather than a placeholder that gets replaced after the fact.
  const detailGhostPrevRef = useRef<HTMLDivElement>(null);
  const detailGhostPrevImgRef = useRef<HTMLImageElement>(null);
  const detailGhostPrevTitleRef = useRef<HTMLHeadingElement>(null);
  const detailGhostPrevBadgeRef = useRef<HTMLSpanElement>(null);
  const detailGhostPrevBodyRef = useRef<HTMLDivElement>(null);
  const detailGhostNextRef = useRef<HTMLDivElement>(null);
  const detailGhostNextImgRef = useRef<HTMLImageElement>(null);
  const detailGhostNextTitleRef = useRef<HTMLHeadingElement>(null);
  const detailGhostNextBadgeRef = useRef<HTMLSpanElement>(null);
  const detailGhostNextBodyRef = useRef<HTMLDivElement>(null);
  const detailThumbsRef     = useRef<HTMLDivElement>(null);
  const detailThumbTrackRef = useRef<HTMLDivElement>(null);
  const detailThumbPrevRef  = useRef<HTMLButtonElement>(null);
  const detailThumbNextRef  = useRef<HTMLButtonElement>(null);

  const pgRef      = useRef<HTMLDivElement>(null);
  const pgStageRef = useRef<HTMLDivElement>(null);
  const pgScrollRef = useRef<HTMLDivElement>(null);

  const contactRef       = useRef<HTMLDivElement>(null);
  const contactStarCvRef = useRef<HTMLCanvasElement>(null);

  const dockRef   = useRef<HTMLDivElement>(null);
  const expSegRef = useRef<HTMLDivElement>(null);
  const randomImageBtnRef = useRef<HTMLButtonElement>(null);

  const openContactRef = useRef<() => void>(() => {});
  useImperativeHandle(ref, () => ({ openContact: () => openContactRef.current() }), []);

  useEffect(() => {
    const root = rootRef.current!;
    document.body.classList.add("classics-exp-active");
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const isMobile = window.matchMedia("(hover:none)").matches;
    let cfg = getConfig();

    const canvas = canvasRef.current!;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.setClearColor(new THREE.Color(BG_COLOR), 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(cfg.fov, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = cfg.cameraZ;

    const depthColor = new THREE.Color(2766408).convertSRGBToLinear();
    const texLoader = new THREE.TextureLoader();

    let groups: THREE.Group[] = [];
    let allMeshes: PanelMesh[] = [];
    let panelMeta: PanelMeta[] = [];
    const rowSeeds = Array.from({ length: ROWS }, () => (Math.random() * 0xffffffff) >>> 0);

    function newPanelMat(): PanelMaterial {
      return new THREE.ShaderMaterial({
        uniforms: {
          uTexture: { value: null }, uOpacity: { value: 0 }, uBlur: { value: INITIAL_BLUR },
          uBendH: { value: 0 }, uBendV: { value: 0 }, uTime: { value: 0 }, uPhase: { value: Math.random() * Math.PI * 2 },
          uDepthNear: { value: cfg.cameraZ * 0.58 }, uDepthFar: { value: cfg.cameraZ * 1.85 },
          uDepthColor: { value: depthColor }, uDepthStrength: { value: 0.22 },
        },
        vertexShader: PANEL_VERT, fragmentShader: PANEL_FRAG,
        side: THREE.DoubleSide, transparent: true, depthWrite: false, toneMapped: false,
      }) as PanelMaterial;
    }

    const textureCache = new Map<string, THREE.Texture>();
    function loadPanelTexture(url: string, onReady: (tex: THREE.Texture) => void) {
      const cached = textureCache.get(url);
      if (cached) { onReady(cached); return; }
      texLoader.load(url, tex => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearFilter;
        textureCache.set(url, tex);
        onReady(tex);
      });
    }

    let panelGeo: THREE.PlaneGeometry | null = null;
    function buildPanels() {
      groups.forEach(g => { g.children.forEach(m => (m as PanelMesh).material.dispose()); scene.remove(g); });
      groups = []; allMeshes = []; panelMeta = [];
      panelGeo?.dispose();

      const geo = new THREE.PlaneGeometry(cfg.panelW, cfg.panelH, 12, 8);
      panelGeo = geo;
      const dn = cfg.cameraZ * 0.58, df = cfg.cameraZ * 1.85;

      for (let s = 0; s < ROWS; s++) {
        const grp = new THREE.Group();
        grp.position.y = s * cfg.rowSpacing - (ROWS - 1) * cfg.rowSpacing / 2;
        scene.add(grp); groups.push(grp);

        const deck = seededShuffle(allProjects, rowSeeds[s]);
        for (let h = 0; h < PANELS_PER_ROW; h++) {
          const proj = deck[h % deck.length];
          const tR = (h + s * 0.5) / PANELS_PER_ROW * Math.PI * 2;
          const tS = h / PANELS_PER_ROW * Math.PI * 2;
          const yS = (h / PANELS_PER_ROW - 0.5) * cfg.rowSpacing;

          const mat = newPanelMat();
          mat.uniforms.uDepthNear.value = dn;
          mat.uniforms.uDepthFar.value = df;

          const mesh = new THREE.Mesh(geo, mat) as PanelMesh;
          mesh.frustumCulled = false;
          mesh.position.set(Math.cos(tR) * cfg.radius, 0, Math.sin(tR) * cfg.radius);
          mesh.rotation.y = -(tR - Math.PI / 2);

          grp.add(mesh);
          allMeshes.push(mesh);
          panelMeta.push({ proj, tR, tS, yS, delay: ENTRANCE_DELAY_MIN_MS + Math.random() * ENTRANCE_DELAY_RANGE_MS, done: false });

          loadPanelTexture(proj.img, tex => { mat.uniforms.uTexture.value = tex; });
        }
      }
    }
    buildPanels();

    let centerStar: THREE.Group | null = null;
    function loadCenterStar() {
      const ec = document.createElement("canvas"); ec.width = 256; ec.height = 128;
      const ex = ec.getContext("2d")!;
      const eg = ex.createLinearGradient(0, 0, 0, 128);
      eg.addColorStop(0, "#ffffff"); eg.addColorStop(0.42, "#cfe0fb"); eg.addColorStop(0.62, "#3f5db0"); eg.addColorStop(1, "#0b1f63");
      ex.fillStyle = eg; ex.fillRect(0, 0, 256, 128);
      const bg = ex.createRadialGradient(180, 34, 4, 180, 34, 70);
      bg.addColorStop(0, "#ffffff"); bg.addColorStop(1, "rgba(255,255,255,0)");
      ex.fillStyle = bg; ex.fillRect(0, 0, 256, 128);
      const envTex = new THREE.CanvasTexture(ec);
      envTex.mapping = THREE.EquirectangularReflectionMapping; envTex.colorSpace = THREE.SRGBColorSpace; envTex.needsUpdate = true;
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromEquirectangular(envTex).texture;
      pmrem.dispose();
      scene.environmentIntensity = 1.4;
      scene.add(new THREE.AmbientLight(0xffffff, 0.4));
      const dl = new THREE.DirectionalLight(0xffffff, 2.4); dl.position.set(4, 8, 5); scene.add(dl);
      const dl2 = new THREE.DirectionalLight(0x9fb6ff, 1.2); dl2.position.set(-5, -2, -3); scene.add(dl2);
      const grp = new THREE.Group(); grp.position.set(0, 0, 0); scene.add(grp); centerStar = grp;
      new GLTFLoader().load("/estar.glb", gltf => {
        const m = gltf.scene;
        m.traverse(o => { if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).material = new THREE.MeshStandardMaterial({ color: new THREE.Color("#cdd9ef"), metalness: 1, roughness: 0.1, envMapIntensity: 2.0, side: THREE.DoubleSide }); });
        const size = new THREE.Box3().setFromObject(m).getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        m.scale.setScalar(4.6 / maxDim);
        const ctr = new THREE.Box3().setFromObject(m).getCenter(new THREE.Vector3());
        m.position.sub(ctr);
        grp.add(m);
      });
    }
    loadCenterStar();

    const onContextLost = (e: Event) => { e.preventDefault(); };
    const onContextRestored = () => { buildPanels(); applyLayout(spiralF); loadCenterStar(); };
    canvas.addEventListener("webglcontextlost", onContextLost);
    canvas.addEventListener("webglcontextrestored", onContextRestored);

    const spiralQ = 0; let spiralF = 0;
    function applyLayout(f: number) {
      const r = cfg.radius * (1 + (SPIRAL_RADIUS_RATIO - 1) * f);
      const Ve = 1 + ((isMobile ? SPIRAL_SCALE_MOBILE : SPIRAL_SCALE_DESKTOP) - 1) * f;
      allMeshes.forEach((mesh, i) => {
        const { tR, tS, yS } = panelMeta[i];
        const theta = tR + (tS - tR) * f;
        mesh.position.x = Math.cos(theta) * r;
        mesh.position.z = Math.sin(theta) * r;
        mesh.position.y = yS * f;
        mesh.rotation.y = -(theta - Math.PI / 2);
        mesh._scaleTarget = Ve;
      });
    }

    let entranceT0 = 0, entranceActive = false;
    function startEntrance() { entranceT0 = performance.now(); entranceActive = true; }
    function tickEntrance(now: number) {
      if (!entranceActive) return;
      const elapsed = now - entranceT0;
      let allDone = true;
      allMeshes.forEach((mesh, i) => {
        const d = panelMeta[i];
        if (d.done) return;
        const t = elapsed - d.delay;
        if (t <= 0) { allDone = false; return; }
        const p = Math.min(1, t / ENTRANCE_DURATION_MS);
        const e = 1 - Math.pow(1 - p, 3);
        const mat = mesh.material;
        mat.uniforms.uOpacity.value = e;
        mat.uniforms.uBlur.value = INITIAL_BLUR * (1 - e);
        if (p >= 1) { d.done = true; mat.transparent = false; mat.depthWrite = true; }
        else allDone = false;
      });
      if (allDone) entranceActive = false;
    }

    let scrollTarget = 0, scrollSmoothed = 0, scrollDelta = 0, momentum = 0, ringRotation = 0;
    let detailOpen = false, playgroundOn = false;

    function hideScrollCue() {
      if (scrolled) return;
      scrolled = true;
      const el = scrollCuePillRef.current;
      if (el) { el.style.opacity = "0"; setTimeout(() => { el.style.display = "none"; }, 400); }
    }
    let scrolled = false;

    const onWheel = (ev: WheelEvent) => {
      if (detailOpen || playgroundOn) return;
      scrollTarget -= ev.deltaY * 0.005;
      momentum += ev.deltaY * 0.004;
      momentum = THREE.MathUtils.clamp(momentum, -2, 2);
      hideScrollCue();
    };
    window.addEventListener("wheel", onWheel, { passive: true });

    let touchStartY = 0, touchLastY = 0;
    const onTouchStart = (ev: TouchEvent) => { touchStartY = touchLastY = ev.touches[0].clientY; };
    const onTouchMove = (ev: TouchEvent) => {
      if (detailOpen || playgroundOn) return;
      const dy = touchLastY - ev.touches[0].clientY;
      scrollTarget -= dy * 0.008 * 0.6;
      momentum += dy * 0.007 * 0.6;
      momentum = THREE.MathUtils.clamp(momentum, -2, 2);
      touchLastY = ev.touches[0].clientY;
      hideScrollCue();
    };
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    void touchStartY;

    const raycaster = new THREE.Raycaster();
    const ndcMouse = new THREE.Vector2(-9, -9);
    let hoveredMesh: PanelMesh | null = null;

    function setHovered(mesh: PanelMesh | null) {
      if (mesh === hoveredMesh) return;
      hoveredMesh = mesh;
      const cursorEl = cursorRef.current, pillEl = projectPillRef.current;
      if (mesh) {
        cursorEl?.classList.add("hovering");
        const idx = allMeshes.indexOf(mesh);
        const p = panelMeta[idx]?.proj;
        if (p && labelTitleRef.current && labelCatRef.current) {
          labelTitleRef.current.textContent = p.title;
          labelCatRef.current.textContent = p.cat;
        }
        pillEl?.classList.add("visible");
        if (scrollCuePillRef.current) scrollCuePillRef.current.style.display = "none";
      } else {
        cursorEl?.classList.remove("hovering");
        pillEl?.classList.remove("visible");
        if (!scrolled && scrollCuePillRef.current) scrollCuePillRef.current.style.display = "";
      }
    }

    const onCanvasMouseMove = (ev: MouseEvent) => {
      ndcMouse.x = (ev.clientX / window.innerWidth) * 2 - 1;
      ndcMouse.y = -(ev.clientY / window.innerHeight) * 2 + 1;
      const labelEl = projectLabelRef.current;
      if (labelEl) labelEl.style.transform = `translate(${ev.clientX + 24}px,${ev.clientY}px)`;
    };
    const onCanvasMouseLeave = () => { ndcMouse.set(-9, -9); setHovered(null); };
    canvas.addEventListener("mousemove", onCanvasMouseMove);
    canvas.addEventListener("mouseleave", onCanvasMouseLeave);

    let mX = -200, mY = -200, cX = -200, cY = -200;
    const onDocMouseMove = (ev: MouseEvent) => { mX = ev.clientX; mY = ev.clientY; };
    document.addEventListener("mousemove", onDocMouseMove);
    let cursorRaf = 0;
    (function tickCursor() {
      cX += (mX - cX) * 0.14; cY += (mY - cY) * 0.14;
      if (cursorRef.current) cursorRef.current.style.transform = `translate3d(${cX}px,${cY}px,0) translate(-50%,-50%)`;
      cursorRaf = requestAnimationFrame(tickCursor);
    })();

    const tagEls = topicGroupRef.current ? Array.from(topicGroupRef.current.querySelectorAll<HTMLButtonElement>(".tag")) : [];
    const onTagClick = (tag: HTMLButtonElement) => () => {
      tagEls.forEach(t => t.classList.remove("is-active"));
      tag.classList.add("is-active");
    };
    const tagCleanups: Array<() => void> = [];
    tagEls.forEach(tag => {
      const fn = onTagClick(tag);
      tag.addEventListener("click", fn);
      tagCleanups.push(() => tag.removeEventListener("click", fn));
    });

    function closeSort() {
      sortMenuRef.current?.classList.remove("is-open");
      sortBtnRef.current?.classList.remove("is-open");
      sortBtnRef.current?.setAttribute("aria-expanded", "false");
    }
    const sortBtnEl = sortBtnRef.current;
    const onSortBtnClick = (e: MouseEvent) => {
      e.stopPropagation();
      const open = sortMenuRef.current?.classList.toggle("is-open") ?? false;
      sortBtnEl?.classList.toggle("is-open", open);
      sortBtnEl?.setAttribute("aria-expanded", String(open));
    };
    sortBtnEl?.addEventListener("click", onSortBtnClick);
    const sortItemEls = sortMenuRef.current ? Array.from(sortMenuRef.current.querySelectorAll<HTMLButtonElement>(".sort-menu__item")) : [];
    const sortItemCleanups: Array<() => void> = [];
    sortItemEls.forEach(item => {
      const fn = (e: MouseEvent) => {
        e.stopPropagation();
        sortItemEls.forEach(i => i.classList.remove("is-active"));
        item.classList.add("is-active");
        if (sortLabelRef.current) sortLabelRef.current.textContent = item.dataset.sort ?? "";
        closeSort();
      };
      item.addEventListener("click", fn);
      sortItemCleanups.push(() => item.removeEventListener("click", fn));
    });
    document.addEventListener("click", closeSort);

    const pgCardCleanups: Array<() => void> = [];
    function buildPlayground() {
      const stage = pgStageRef.current;
      if (!stage) return;
      stage.innerHTML = "";
      let seed = 0x9e3779b9 >>> 0;
      const rng = () => {
        seed = (seed + 0x6d2b79f5) >>> 0;
        let t = seed;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
      // Mobile gets its own layout entirely, not just a scaled-down version of desktop's. The
      // desktop scatter (3 random-width columns + random rotation) relies on having a wide
      // canvas for those random offsets to land without touching each other — compressed onto a
      // phone-width screen, the same randomness has nowhere near enough room, so cards collided
      // and read as one merged mess. Mobile instead lays every image out one per row, in strict
      // document order, alternating left/right — no randomness, no overlap possible by
      // construction, since each row gets its own fixed vertical slot.
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        const rowH = 210;
        let top = 190;
        allProjects.forEach((p, i) => {
          const alignRight = i % 2 === 1;
          const w = Math.min(180, Math.round(window.innerWidth * 0.48));
          const card = document.createElement("button");
          card.className = "pg-card";
          card.style.top = top + "px";
          card.style.width = w + "px";
          if (alignRight) card.style.right = "6%"; else card.style.left = "6%";
          // .pg-card__title's default CSS anchors it to the card's RIGHT edge (right:2px) —
          // fine for desktop's scattered cards, but on mobile's left-positioned cards that put
          // the title floating away from the image's own left edge instead of sitting flush
          // above it. Right-positioned cards keep the default (their right edge already lines
          // up); left-positioned cards get the title anchored to their left edge instead.
          const titleStyle = alignRight ? "" : ' style="right:auto;left:2px;text-align:left;"';
          card.innerHTML = `<img class="pg-card__img" src="${p.img}" alt="${p.title}">
            <span class="pg-card__cta">CLICK TO SEE</span>
            <span class="pg-card__title"${titleStyle}>/${p.title.toUpperCase()}</span>`;
          const onClick = () => { if (!detailOpen) openDetail(p, card); };
          card.addEventListener("click", onClick);
          pgCardCleanups.push(() => card.removeEventListener("click", onClick));
          stage.appendChild(card);
          top += rowH;
        });
        stage.style.height = top + 160 + "px";
        return;
      }

      const cols = 3, colW = 100 / cols, rowH = 360;
      let maxBottom = 0;
      allProjects.forEach((p, i) => {
        const col = i % cols, row = Math.floor(i / cols);
        const w = 170 + Math.round(rng() * 150);
        const left = col * colW + 3 + rng() * (colW - (w / window.innerWidth) * 100 - 6);
        const top = 190 + row * rowH + (col === 1 ? 120 : 0) + rng() * 150;
        const rot = (rng() * 2 - 1) * 6;
        const card = document.createElement("button");
        card.className = "pg-card";
        card.style.left = left + "%"; card.style.top = top + "px"; card.style.width = w + "px";
        card.style.transform = `rotate(${rot.toFixed(2)}deg)`;
        card.innerHTML = `<img class="pg-card__img" src="${p.img}" alt="${p.title}">
          <span class="pg-card__cta">CLICK TO SEE</span>
          <span class="pg-card__title">/${p.title.toUpperCase()}</span>`;
        const onClick = () => { if (!detailOpen) openDetail(p, card); };
        card.addEventListener("click", onClick);
        pgCardCleanups.push(() => card.removeEventListener("click", onClick));
        stage.appendChild(card);
        maxBottom = Math.max(maxBottom, top + w * 1.1);
      });
      stage.style.height = maxBottom + 160 + "px";
    }
    buildPlayground();

    function openPlayground() {
      if (playgroundOn) return;
      playgroundOn = true;
      if (pgScrollRef.current) pgScrollRef.current.scrollTop = 0;
      pgRef.current?.classList.add("is-on");
      pgRef.current?.setAttribute("aria-hidden", "false");
      root.classList.add("playground-on");
      hoveredMesh = null;
      projectPillRef.current?.classList.remove("visible");
      cursorRef.current?.classList.remove("hovering");
    }
    function closePlayground() {
      if (!playgroundOn) return;
      playgroundOn = false;
      pgRef.current?.classList.remove("is-on", "pg--blur");
      pgRef.current?.setAttribute("aria-hidden", "true");
      root.classList.remove("playground-on");
    }

    const segBtns = expSegRef.current ? Array.from(expSegRef.current.querySelectorAll<HTMLButtonElement>(".sb-seg__btn")) : [];
    const segCleanups: Array<() => void> = [];
    segBtns.forEach(btn => {
      const fn = () => {
        segBtns.forEach(b => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        if (btn.dataset.exp === "playground") openPlayground(); else closePlayground();
      };
      btn.addEventListener("click", fn);
      segCleanups.push(() => btn.removeEventListener("click", fn));
    });

    let contactOpen = false;
    let starInited = false;
    let starRenderer: THREE.WebGLRenderer | null = null;
    let starScene: THREE.Scene | null = null;
    let starCam: THREE.PerspectiveCamera | null = null;
    let starModel: THREE.Group | null = null;
    let starRaf = 0;

    function initContactStar() {
      if (starInited) return;
      starInited = true;
      const cv = contactStarCvRef.current;
      if (!cv) return;
      const w = cv.clientWidth || 340, h = cv.clientHeight || 340;
      starRenderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true });
      starRenderer.setSize(w, h, false);
      starRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      starRenderer.outputColorSpace = THREE.SRGBColorSpace;
      starScene = new THREE.Scene();
      starCam = new THREE.PerspectiveCamera(40, w / h, 0.1, 100);
      starCam.position.set(0, 0, 4.6);
      const ec = document.createElement("canvas"); ec.width = 256; ec.height = 128;
      const ex = ec.getContext("2d")!;
      const eg = ex.createLinearGradient(0, 0, 0, 128);
      eg.addColorStop(0, "#ffffff"); eg.addColorStop(0.42, "#cfe0fb"); eg.addColorStop(0.62, "#3f5db0"); eg.addColorStop(1, "#0b1f63");
      ex.fillStyle = eg; ex.fillRect(0, 0, 256, 128);
      const bg = ex.createRadialGradient(180, 34, 4, 180, 34, 70);
      bg.addColorStop(0, "#ffffff"); bg.addColorStop(1, "rgba(255,255,255,0)");
      ex.fillStyle = bg; ex.fillRect(0, 0, 256, 128);
      const envTex = new THREE.CanvasTexture(ec);
      envTex.mapping = THREE.EquirectangularReflectionMapping; envTex.colorSpace = THREE.SRGBColorSpace; envTex.needsUpdate = true;
      const pmrem = new THREE.PMREMGenerator(starRenderer);
      starScene.environment = pmrem.fromEquirectangular(envTex).texture;
      pmrem.dispose();
      starScene.environmentIntensity = 1.5;
      starScene.add(new THREE.AmbientLight(0xffffff, 0.35));
      const dl = new THREE.DirectionalLight(0xffffff, 2.4); dl.position.set(4, 8, 5); starScene.add(dl);
      const dl2 = new THREE.DirectionalLight(0x9fb6ff, 1.2); dl2.position.set(-5, -2, -3); starScene.add(dl2);
      const grp = new THREE.Group(); starScene.add(grp); starModel = grp;
      new GLTFLoader().load("/estar.glb", gltf => {
        const m = gltf.scene;
        m.traverse(o => { if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).material = new THREE.MeshStandardMaterial({ color: new THREE.Color("#cdd9ef"), metalness: 1, roughness: 0.1, envMapIntensity: 2.0, side: THREE.DoubleSide }); });
        const size = new THREE.Box3().setFromObject(m).getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        m.scale.setScalar(2.3 / maxDim);
        const ctr = new THREE.Box3().setFromObject(m).getCenter(new THREE.Vector3());
        m.position.sub(ctr);
        grp.add(m);
      });
      (function starTick() {
        starRaf = requestAnimationFrame(starTick);
        if (!contactOpen) return;
        if (starModel) starModel.rotation.y += 0.006;
        if (starRenderer && starScene && starCam) starRenderer.render(starScene, starCam);
      })();
    }

    function openContact() {
      contactOpen = true;
      contactRef.current?.classList.add("is-open");
      contactRef.current?.setAttribute("aria-hidden", "false");
      root.classList.add("contact-open");
      initContactStar();
    }
    function closeContact() {
      if (!contactOpen) return;
      contactOpen = false;
      contactRef.current?.classList.remove("is-open");
      contactRef.current?.setAttribute("aria-hidden", "true");
      root.classList.remove("contact-open");
    }
    openContactRef.current = openContact;

    const onContactClose = () => closeContact();
    const contactEl = contactRef.current;
    const onContactBackdropClick = (e: MouseEvent) => { if (e.target === contactEl) closeContact(); };
    const onContactFormSubmit = (e: SubmitEvent) => { e.preventDefault(); closeContact(); };
    contactEl?.addEventListener("click", onContactBackdropClick);
    const contactCloseBtn = contactEl?.querySelector<HTMLButtonElement>(".contact__close");
    contactCloseBtn?.addEventListener("click", onContactClose);

    // Reuses the same openDetail FLIP-animation path a panel click uses — the detail view
    // "grows" from this button's own position instead of a project thumbnail's, so the popup
    // still animates in consistently rather than just appearing.
    const randomImageBtn = randomImageBtnRef.current;
    const onRandomImageClick = () => {
      if (detailOpen || !randomImageBtn || allProjects.length === 0) return;
      const proj = allProjects[Math.floor(Math.random() * allProjects.length)];
      openDetail(proj, randomImageBtn);
    };
    randomImageBtn?.addEventListener("click", onRandomImageClick);
    const contactForm = contactEl?.querySelector<HTMLFormElement>(".contact__form");
    contactForm?.addEventListener("submit", onContactFormSubmit as EventListener);

    let currentSource: PanelMesh | HTMLElement | null = null;
    let detailClosing = false;
    let currentProjectIndex = 0;
    let currentGalleryImages: string[] = [];
    let currentThumbIndex = 0;
    let autoplayTimer: number | null = null;
    const _v3 = new THREE.Vector3();

    function rectFromMesh(mesh: PanelMesh) {
      mesh.updateWorldMatrix(true, false);
      const hw = cfg.panelW / 2, hh = cfg.panelH / 2;
      const corners: Array<[number, number]> = [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]];
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const [x, y] of corners) {
        _v3.set(x, y, 0).applyMatrix4(mesh.matrixWorld).project(camera);
        const sx = (_v3.x * 0.5 + 0.5) * window.innerWidth;
        const sy = (-_v3.y * 0.5 + 0.5) * window.innerHeight;
        minX = Math.min(minX, sx); maxX = Math.max(maxX, sx);
        minY = Math.min(minY, sy); maxY = Math.max(maxY, sy);
      }
      return { left: minX, top: minY, width: maxX - minX, height: maxY - minY };
    }
    function isMesh(src: PanelMesh | HTMLElement): src is PanelMesh { return (src as PanelMesh).isObject3D === true; }
    function srcRect(src: PanelMesh | HTMLElement) { return isMesh(src) ? rectFromMesh(src) : src.getBoundingClientRect(); }
    function srcHide(src: PanelMesh | HTMLElement, hide: boolean) {
      if (isMesh(src)) src.visible = !hide;
      else src.style.visibility = hide ? "hidden" : "";
    }

    function selectThumb(idx: number) {
      const img = detailImgRef.current;
      const track = detailThumbTrackRef.current;
      const src = currentGalleryImages[idx];
      if (!img || !track || !src || img.src === src) return;
      currentThumbIndex = idx;
      img.style.transition = "opacity .15s ease";
      img.style.opacity = "0";
      setTimeout(() => {
        img.src = src;
        img.style.opacity = "1";
      }, 150);
      track.querySelectorAll<HTMLButtonElement>(".detail__thumb").forEach((el, i) => {
        el.classList.toggle("is-active", i === idx);
      });
      track.children[idx]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    }

    // Auto-advances multi-image galleries one image at a time while the detail view is open —
    // restarted (not just left running) after every manual navigation (thumb click, prev/next,
    // swipe) so the next auto-advance is always a full interval away from whatever the visitor
    // just did, instead of firing awkwardly right on top of it.
    function stopAutoplay() {
      if (autoplayTimer !== null) { window.clearInterval(autoplayTimer); autoplayTimer = null; }
    }
    function startAutoplay() {
      stopAutoplay();
      if (currentGalleryImages.length <= 1) return;
      autoplayTimer = window.setInterval(() => {
        selectThumb((currentThumbIndex + 1) % currentGalleryImages.length);
      }, 3200);
    }

    // Mobile-only peek cards (see .detail__card--ghost in classics-experience.css) — populates
    // the two real, full ghost cards flanking the active one with the actual prev/next project's
    // content, so the swipe reveals genuine cards instead of a placeholder. Cheap to call
    // unconditionally (openDetail/showAdjacentProject/the swipe commit all already know
    // currentProjectIndex at the point they call this); the elements are display:none on desktop
    // so populating them there is inert.
    function updateGhosts() {
      if (allProjects.length === 0) return;
      const prevProj = allProjects[(currentProjectIndex - 1 + allProjects.length) % allProjects.length];
      const nextProj = allProjects[(currentProjectIndex + 1) % allProjects.length];
      if (detailGhostPrevImgRef.current) detailGhostPrevImgRef.current.src = prevProj.img;
      if (detailGhostPrevTitleRef.current) detailGhostPrevTitleRef.current.textContent = "/" + prevProj.title.toUpperCase();
      if (detailGhostPrevBadgeRef.current) detailGhostPrevBadgeRef.current.textContent = prevProj.cat.toUpperCase();
      if (detailGhostPrevBodyRef.current) detailGhostPrevBodyRef.current.innerHTML = detailBodyHtml(prevProj.body);
      if (detailGhostNextImgRef.current) detailGhostNextImgRef.current.src = nextProj.img;
      if (detailGhostNextTitleRef.current) detailGhostNextTitleRef.current.textContent = "/" + nextProj.title.toUpperCase();
      if (detailGhostNextBadgeRef.current) detailGhostNextBadgeRef.current.textContent = nextProj.cat.toUpperCase();
      if (detailGhostNextBodyRef.current) detailGhostNextBodyRef.current.innerHTML = detailBodyHtml(nextProj.body);
    }

    function renderThumbs(proj: Project) {
      const wrap = detailThumbsRef.current;
      const track = detailThumbTrackRef.current;
      if (!wrap || !track) return;
      currentGalleryImages = [proj.img, ...(proj.gallery ?? [])];
      currentThumbIndex = 0;
      track.innerHTML = "";
      if (currentGalleryImages.length <= 1) {
        wrap.classList.remove("is-visible");
        stopAutoplay();
        return;
      }
      wrap.classList.add("is-visible");
      currentGalleryImages.forEach((src, i) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "detail__thumb" + (i === 0 ? " is-active" : "");
        btn.setAttribute("aria-label", `Show image ${i + 1} of ${currentGalleryImages.length}`);
        const im = document.createElement("img");
        im.src = src;
        im.alt = "";
        btn.appendChild(im);
        btn.addEventListener("click", () => { selectThumb(i); startAutoplay(); });
        track.appendChild(btn);
      });
      startAutoplay();
    }

    function openDetail(proj: Project, src: PanelMesh | HTMLElement) {
      if (detailOpen) return;
      detailOpen = true; currentSource = src;
      currentProjectIndex = allProjects.indexOf(proj);
      const img = detailImgRef.current;
      if (!img || !detailTitleRef.current || !detailBadgeRef.current || !detailBodyRef.current) return;
      img.src = proj.img;
      detailTitleRef.current.textContent = "/" + proj.title.toUpperCase();
      detailBadgeRef.current.textContent = proj.cat.toUpperCase();
      detailBodyRef.current.innerHTML = detailBodyHtml(proj.body);
      renderThumbs(proj);
      updateGhosts();
      // Safety reset — guards against opening a fresh detail view while the 3-card group from a
      // PREVIOUS mobile swipe session was left mid-transform for any reason (e.g. the popup was
      // closed mid-drag).
      [detailGhostPrevRef.current, detailCardRef.current, detailGhostNextRef.current].forEach(el => {
        if (!el) return;
        el.style.transition = "none";
        el.style.transform = "translateX(0)";
      });
      detailRef.current?.classList.add("is-open");
      detailRef.current?.setAttribute("aria-hidden", "false");
      canvas.classList.add("is-detail");
      root.classList.add("detail-open");
      if (playgroundOn) pgRef.current?.classList.add("pg--blur");
      setHovered(null);

      const from = srcRect(src);
      const to = img.getBoundingClientRect();
      const sx = from.width / to.width, sy = from.height / to.height;
      const tx = from.left - to.left, ty = from.top - to.top;
      img.style.transition = "none";
      img.style.transformOrigin = "top left";
      img.style.opacity = "1";
      img.style.transform = `translate(${tx}px,${ty}px) scale(${sx},${sy})`;
      img.getBoundingClientRect();
      img.style.transition = `transform ${FLIP_MS}ms cubic-bezier(.22,1,.36,1)`;
      img.style.transform = "none";
      srcHide(src, true);
    }

    function closeDetail() {
      if (!detailOpen || detailClosing || !currentSource) return;
      detailClosing = true;
      stopAutoplay();
      detailRef.current?.classList.add("is-closing");
      canvas.classList.remove("is-detail");

      const img = detailImgRef.current!;
      const to = img.getBoundingClientRect();
      const from = srcRect(currentSource);
      const sx = from.width / to.width, sy = from.height / to.height;
      const tx = from.left - to.left, ty = from.top - to.top;
      img.style.transition = `transform ${FLIP_MS}ms cubic-bezier(.5,0,.2,1),opacity ${FLIP_MS}ms ease`;
      img.style.transformOrigin = "top left";
      img.style.transform = `translate(${tx}px,${ty}px) scale(${sx},${sy})`;
      img.style.opacity = "0";

      setTimeout(() => {
        if (currentSource) srcHide(currentSource, false);
        detailRef.current?.classList.remove("is-open", "is-closing");
        detailRef.current?.setAttribute("aria-hidden", "true");
        root.classList.remove("detail-open");
        img.style.transition = "none";
        img.style.transform = "none";
        img.style.opacity = "";
        currentSource = null; detailClosing = false;
        detailOpen = false;
        if (playgroundOn) pgRef.current?.classList.remove("pg--blur");
      }, FLIP_MS + 20);
    }

    function showAdjacentProject(dir: 1 | -1) {
      if (!detailOpen || detailClosing) return;
      currentProjectIndex = (currentProjectIndex + dir + allProjects.length) % allProjects.length;
      const proj = allProjects[currentProjectIndex];
      const img = detailImgRef.current;
      if (!img || !detailTitleRef.current || !detailBadgeRef.current || !detailBodyRef.current) return;
      img.style.transition = "opacity .15s ease";
      img.style.opacity = "0";
      setTimeout(() => {
        img.src = proj.img;
        detailTitleRef.current!.textContent = "/" + proj.title.toUpperCase();
        detailBadgeRef.current!.textContent = proj.cat.toUpperCase();
        detailBodyRef.current!.innerHTML = detailBodyHtml(proj.body);
        renderThumbs(proj);
        updateGhosts();
        img.style.opacity = "1";
      }, 150);
    }
    const onDetailPrev = () => showAdjacentProject(-1);
    const onDetailNext = () => showAdjacentProject(1);
    const detailPrevEl = detailPrevRef.current;
    const detailNextEl = detailNextRef.current;
    detailPrevEl?.addEventListener("click", onDetailPrev);
    detailNextEl?.addEventListener("click", onDetailNext);

    // Card-swipe project navigation (mobile only — the nav arrows are hidden below 820px in
    // favor of this, see classics-experience.css). Drags all 3 cards (ghost-prev, active,
    // ghost-next — real DOM elements, not placeholders) together as one rigid row, so the swipe
    // reveals the ACTUAL neighboring project sliding into view, not a generic peek that gets
    // replaced afterward. Segmented from the existing per-image gallery swipe below by
    // touch-start target: starting on .detail__media (the photo itself) is left entirely to that
    // gallery swipe, so dragging the photo still browses a multi-image gallery without this also
    // dragging the whole row. Starting anywhere else on a card (padding, title, body text) drags
    // the row and switches PROJECTS instead.
    //
    // Fixed roles, not DOM reordering: detailCardEl is ALWAYS the interactive one (owns
    // thumbs/gallery-swipe/autoplay), ghost-prev/ghost-next are ALWAYS the flanking previews.
    // After a committed swipe, the "seamless" illusion comes from timing, not from moving which
    // element plays which role: right as the group finishes sliding by exactly one card-width,
    // the ghost that just arrived at center already shows the correct (new) content (it was
    // populated by updateGhosts() from the START), so rewriting the real active card underneath
    // it — currently sitting off-center — to match, then instantly snapping the whole group's
    // transform back to 0, swaps which physical element renders the center pixels without the
    // rendered PICTURE ever changing. Same trick for the row's other two slots: the outgoing
    // active card settles exactly into the ghost-prev slot showing its own (still correct, still
    // unchanged) old content, and ghost-prev/ghost-next are simply repopulated via updateGhosts()
    // from the new currentProjectIndex before the snap, so every slot is already correct at the
    // instant the group resets.
    let cardTouchX = 0, cardTouchY = 0, cardTouchTracking = false, cardDragging = false;
    const CARD_SWIPE_THRESHOLD = 60;
    const detailCardEl = detailCardRef.current;
    const detailInnerEl = detailInnerRef.current;
    const groupEls = () => [detailGhostPrevRef.current, detailCardRef.current, detailGhostNextRef.current];
    const setGroupTransform = (x: number, withTransition: boolean) => {
      groupEls().forEach(el => {
        if (!el) return;
        el.style.transition = withTransition ? "transform .3s cubic-bezier(.22,1,.36,1)" : "none";
        el.style.transform = `translateX(${x}px)`;
      });
    };
    const onCardTouchStart = (e: TouchEvent) => {
      if (window.innerWidth > 820 || (e.target as HTMLElement).closest(".detail__media")) return;
      cardTouchX = e.touches[0].clientX;
      cardTouchY = e.touches[0].clientY;
      cardTouchTracking = true;
      cardDragging = false;
    };
    const onCardTouchMove = (e: TouchEvent) => {
      if (!cardTouchTracking) return;
      const dx = e.touches[0].clientX - cardTouchX;
      const dy = e.touches[0].clientY - cardTouchY;
      if (!cardDragging) {
        // Undecided yet whether this is a horizontal card-swipe or a vertical page scroll —
        // wait for enough movement to tell, then commit for the rest of this touch.
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        if (Math.abs(dy) > Math.abs(dx)) { cardTouchTracking = false; return; }
        cardDragging = true;
      }
      setGroupTransform(dx, false);
    };
    const onCardTouchEnd = (e: TouchEvent) => {
      if (!cardTouchTracking) return;
      cardTouchTracking = false;
      if (!cardDragging || !detailCardEl) return;
      cardDragging = false;
      const dx = e.changedTouches[0].clientX - cardTouchX;
      const step = detailCardEl.getBoundingClientRect().width + 12; // 12 = .detail__inner's gap
      if (Math.abs(dx) > CARD_SWIPE_THRESHOLD) {
        const dir: 1 | -1 = dx < 0 ? 1 : -1;
        setGroupTransform(-dir * step, true);
        setTimeout(() => {
          currentProjectIndex = (currentProjectIndex + dir + allProjects.length) % allProjects.length;
          const proj = allProjects[currentProjectIndex];
          if (detailImgRef.current) detailImgRef.current.src = proj.img;
          if (detailTitleRef.current) detailTitleRef.current.textContent = "/" + proj.title.toUpperCase();
          if (detailBadgeRef.current) detailBadgeRef.current.textContent = proj.cat.toUpperCase();
          if (detailBodyRef.current) detailBodyRef.current.innerHTML = detailBodyHtml(proj.body);
          renderThumbs(proj);
          updateGhosts();
          setGroupTransform(0, false);
        }, 300);
      } else {
        setGroupTransform(0, true);
      }
    };
    detailInnerEl?.addEventListener("touchstart", onCardTouchStart, { passive: true });
    detailInnerEl?.addEventListener("touchmove", onCardTouchMove, { passive: true });
    detailInnerEl?.addEventListener("touchend", onCardTouchEnd, { passive: true });

    // Swipe-down-to-close (mobile only) — attached to the whole modal (not just the card row)
    // so it also catches swipes starting on the backdrop/ghost peeks, not just the active card.
    // Independent of the horizontal card-swipe above: that one already bails out the instant a
    // gesture reads as more vertical than horizontal, so there's no conflict — this tracker
    // picks up exactly the gestures the other one ignores.
    let vSwipeX = 0, vSwipeY = 0, vSwipeTracking = false;
    const CLOSE_SWIPE_THRESHOLD = 90;
    const onDetailVSwipeStart = (e: TouchEvent) => {
      if (window.innerWidth > 820) return;
      vSwipeX = e.touches[0].clientX;
      vSwipeY = e.touches[0].clientY;
      vSwipeTracking = true;
    };
    const onDetailVSwipeEnd = (e: TouchEvent) => {
      if (!vSwipeTracking) return;
      vSwipeTracking = false;
      const dx = e.changedTouches[0].clientX - vSwipeX;
      const dy = e.changedTouches[0].clientY - vSwipeY;
      // Downward only (dy > 0, not just |dy|) and clearly more vertical than horizontal — a
      // diagonal flick during a horizontal card-swipe shouldn't also close the popup.
      if (dy > CLOSE_SWIPE_THRESHOLD && dy > Math.abs(dx)) closeDetail();
    };
    const detailElForVSwipe = detailRef.current;
    detailElForVSwipe?.addEventListener("touchstart", onDetailVSwipeStart, { passive: true });
    detailElForVSwipe?.addEventListener("touchend", onDetailVSwipeEnd, { passive: true });

    const onThumbPrev = () => { selectThumb((currentThumbIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length); startAutoplay(); };
    const onThumbNext = () => { selectThumb((currentThumbIndex + 1) % currentGalleryImages.length); startAutoplay(); };
    const detailThumbPrevEl = detailThumbPrevRef.current;
    const detailThumbNextEl = detailThumbNextRef.current;
    detailThumbPrevEl?.addEventListener("click", onThumbPrev);
    detailThumbNextEl?.addEventListener("click", onThumbNext);

    // Swipe-through-gallery on touch devices — separate from the desktop prev/next arrows, this
    // lets a finger-drag on the image itself step through a multi-image gallery (not between
    // different projects, which is what the outer detail__nav arrows already do).
    let galleryTouchX = 0, galleryTouchY = 0, galleryTouchActive = false;
    const detailImgEl = detailImgRef.current;
    const onGalleryTouchStart = (e: TouchEvent) => {
      if (currentGalleryImages.length <= 1) return;
      galleryTouchX = e.touches[0].clientX;
      galleryTouchY = e.touches[0].clientY;
      galleryTouchActive = true;
    };
    const onGalleryTouchEnd = (e: TouchEvent) => {
      if (!galleryTouchActive) return;
      galleryTouchActive = false;
      const dx = e.changedTouches[0].clientX - galleryTouchX;
      const dy = e.changedTouches[0].clientY - galleryTouchY;
      if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
      if (dx < 0) selectThumb((currentThumbIndex + 1) % currentGalleryImages.length);
      else selectThumb((currentThumbIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length);
      startAutoplay();
    };
    detailImgEl?.addEventListener("touchstart", onGalleryTouchStart, { passive: true });
    detailImgEl?.addEventListener("touchend", onGalleryTouchEnd, { passive: true });

    const onCanvasClick = (ev: MouseEvent) => {
      if (detailOpen || playgroundOn) return;
      ndcMouse.x = (ev.clientX / window.innerWidth) * 2 - 1;
      ndcMouse.y = -(ev.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(ndcMouse, camera);
      const hits = raycaster.intersectObjects(allMeshes, false);
      if (hits.length) {
        const idx = allMeshes.indexOf(hits[0].object as PanelMesh);
        const m = panelMeta[idx];
        if (m) openDetail(m.proj, hits[0].object as PanelMesh);
      }
    };
    canvas.addEventListener("click", onCanvasClick);

    const onKeydown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (contactOpen) closeContact();
      else if (detailOpen) closeDetail();
    };
    window.addEventListener("keydown", onKeydown);
    const detailEl = detailRef.current;
    // Was `e.target === detailEl` — only matched a tap that landed on the outer modal's own box
    // directly, never on any descendant. On mobile the 3-card row (see the swipe carousel below)
    // spans the full 100vw width via .detail__inner, so there was no gap left where a tap could
    // ever hit detailEl itself — "tap empty space to close" was effectively dead. The ghost peek
    // cards look empty (blank corners) but are still real .detail__card elements sitting inside
    // .detail__inner, so a tap there resolved to .detail__inner as e.target (ghosts have
    // pointer-events:none), never detailEl — same dead-end. Broadened to: close on ANY tap that
    // isn't on the real (non-ghost) active card or the desktop nav buttons — i.e. backdrop, the
    // ghost peeks, and .detail__inner's own empty space all close it now, matching what visually
    // reads as "empty" to someone tapping there.
    const onDetailBackdropClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest(".detail__card:not(.detail__card--ghost)") || target.closest(".detail__nav")) return;
      closeDetail();
    };
    detailEl?.addEventListener("click", onDetailBackdropClick);

    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    const onResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        cfg = getConfig();
        camera.fov = cfg.fov; camera.aspect = window.innerWidth / window.innerHeight;
        camera.position.z = cfg.cameraZ; camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight, false);
        buildPanels();
        applyLayout(spiralF);
        startEntrance();
      }, 200);
    };
    window.addEventListener("resize", onResize);

    const bootT0 = performance.now();
    let bootRaf = 0;
    requestAnimationFrame(() => bootLayerRef.current?.classList.add("go"));
    (function tickBoot() {
      const t = Math.min((performance.now() - bootT0) / BOOT_DUR, 1);
      const e = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      if (bootCounterRef.current) bootCounterRef.current.textContent = `[${Math.floor(e * 100)}]`;
      if (t < 1) bootRaf = requestAnimationFrame(tickBoot);
      else {
        if (bootCounterRef.current) bootCounterRef.current.textContent = "[100]";
        setTimeout(endBoot, 240);
      }
    })();
    function endBoot() {
      bootLoaderRef.current?.classList.add("is-fading");
      setTimeout(() => { if (bootLoaderRef.current) bootLoaderRef.current.style.display = "none"; }, 1200);
      setTimeout(() => {
        canvas.classList.add("is-revealed");
        dockRef.current?.classList.add("is-revealed");
        startEntrance();
      }, 350);
    }

    let lastT = performance.now(), totalT = 0;
    let bendHSmoothed = 0, bendVSmoothed = 0;
    let mainRaf = 0;

    (function tick() {
      mainRaf = requestAnimationFrame(tick);
      const now = performance.now();
      const dt = Math.min((now - lastT) / 1000, 0.05);
      lastT = now;

      tickEntrance(now);

      if (!detailOpen && !playgroundOn) {
        raycaster.setFromCamera(ndcMouse, camera);
        const hits = raycaster.intersectObjects(allMeshes, false);
        setHovered(hits.length ? (hits[0].object as PanelMesh) : null);
      }

      if (!detailOpen && !playgroundOn) {
        totalT += dt;

        if (Math.abs(spiralQ - spiralF) > 1e-4) {
          spiralF += (spiralQ - spiralF) * (1 - Math.exp(-3.2 * dt));
          if (Math.abs(spiralQ - spiralF) <= 1e-4) spiralF = spiralQ;
          applyLayout(spiralF);
        }

        momentum *= Math.pow(0.92, dt * 60);
        ringRotation += (0.08 + momentum) * dt;

        scrollSmoothed += (scrollTarget - scrollSmoothed) * 0.1;
        const o = scrollSmoothed - scrollDelta; scrollDelta = scrollSmoothed;

        const totalH = ROWS * cfg.rowSpacing;
        const wrapLim = totalH / 2 + cfg.rowSpacing;
        groups.forEach(g => {
          g.position.y -= o;
          if (g.position.y > wrapLim) g.position.y -= totalH;
          if (g.position.y < -wrapLim) g.position.y += totalH;
          g.rotation.y = ringRotation;
        });

        const bendHTarget = THREE.MathUtils.clamp(momentum * 0.1, -BEND_H_CLAMP, BEND_H_CLAMP);
        const bendVTarget = THREE.MathUtils.clamp(o * 8, -BEND_V_CLAMP, BEND_V_CLAMP);
        bendHSmoothed += (bendHTarget - bendHSmoothed) * 0.08;
        bendVSmoothed += (bendVTarget - bendVSmoothed) * 0.12;

        const h8 = 1 - Math.exp(-8 * dt);
        allMeshes.forEach(mesh => {
          const mat = mesh.material;
          if (!mat.uniforms) return;
          mat.uniforms.uTime.value = totalT;
          mat.uniforms.uBendH.value = bendHSmoothed;
          mat.uniforms.uBendV.value = bendVSmoothed;

          const Ve = mesh._scaleTarget ?? 1;
          const hov = (!isMobile && mesh === hoveredMesh) ? 1.08 : 1;
          const ts = Ve * hov;
          mesh.scale.x += (ts - mesh.scale.x) * h8;
          mesh.scale.y += (ts - mesh.scale.y) * h8;
          mesh.scale.z += (ts - mesh.scale.z) * h8;
        });
        if (centerStar) (centerStar as THREE.Group).rotation.y += 0.004;
      }

      renderer.render(scene, camera);
    })();

    return () => {
      document.body.classList.remove("classics-exp-active");
      document.body.style.overflow = prevOverflow;

      cancelAnimationFrame(mainRaf);
      cancelAnimationFrame(bootRaf);
      cancelAnimationFrame(cursorRaf);
      cancelAnimationFrame(starRaf);
      if (resizeTimer) clearTimeout(resizeTimer);

      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKeydown);
      detailEl?.removeEventListener("click", onDetailBackdropClick);
      document.removeEventListener("mousemove", onDocMouseMove);
      document.removeEventListener("click", closeSort);
      canvas.removeEventListener("mousemove", onCanvasMouseMove);
      canvas.removeEventListener("mouseleave", onCanvasMouseLeave);
      canvas.removeEventListener("click", onCanvasClick);
      detailPrevEl?.removeEventListener("click", onDetailPrev);
      detailNextEl?.removeEventListener("click", onDetailNext);
      detailInnerEl?.removeEventListener("touchstart", onCardTouchStart);
      detailInnerEl?.removeEventListener("touchmove", onCardTouchMove);
      detailInnerEl?.removeEventListener("touchend", onCardTouchEnd);
      detailElForVSwipe?.removeEventListener("touchstart", onDetailVSwipeStart);
      detailElForVSwipe?.removeEventListener("touchend", onDetailVSwipeEnd);
      detailThumbPrevEl?.removeEventListener("click", onThumbPrev);
      detailThumbNextEl?.removeEventListener("click", onThumbNext);
      detailImgEl?.removeEventListener("touchstart", onGalleryTouchStart);
      detailImgEl?.removeEventListener("touchend", onGalleryTouchEnd);
      stopAutoplay();
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
      sortBtnEl?.removeEventListener("click", onSortBtnClick);
      contactEl?.removeEventListener("click", onContactBackdropClick);
      contactCloseBtn?.removeEventListener("click", onContactClose);
      contactForm?.removeEventListener("submit", onContactFormSubmit as EventListener);
      randomImageBtn?.removeEventListener("click", onRandomImageClick);
      tagCleanups.forEach(fn => fn());
      sortItemCleanups.forEach(fn => fn());
      segCleanups.forEach(fn => fn());
      pgCardCleanups.forEach(fn => fn());

      groups.forEach(g => { g.children.forEach(m => (m as PanelMesh).material.dispose()); });
      panelGeo?.dispose();
      textureCache.forEach(tex => tex.dispose());
      textureCache.clear();
      renderer.dispose();
      starRenderer?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={rootRef} className="classics-exp">
      <div className="boot-loader" ref={bootLoaderRef} aria-hidden="true">
        <div className="boot-loader__stack">
          <div className="boot-loader__layer" ref={bootLayerRef} />
          <div className="boot-loader__counter" ref={bootCounterRef}>[0]</div>
        </div>
      </div>

      <div className="app-bg" aria-hidden="true" />
      <div className="cursor" ref={cursorRef} aria-hidden="true" />

      <canvas className="webgl" ref={canvasRef} aria-hidden="true" />

      <div className="topbar is-revealed" aria-hidden="true">
        <div className="topbar__group" ref={topicGroupRef}>
          <span className="topbar__label">Topics</span>
          <button className="tag is-active" data-topic="Editorial">Editorial</button>
          <button className="tag" data-topic="Archive">Archive</button>
          <button className="tag" data-topic="Studies">Studies</button>
        </div>
        <div className="topbar__group">
          <span className="topbar__label">Sort by</span>
          <div className="sort-wrap">
            <button className="sort" ref={sortBtnRef} aria-haspopup="listbox" aria-expanded="false">
              <span ref={sortLabelRef}>Featured</span>
              <svg className="sort__chev" width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <div className="sort-menu" ref={sortMenuRef} role="listbox">
              <button className="sort-menu__item is-active" data-sort="Featured">Featured</button>
              <button className="sort-menu__item" data-sort="Relevant">Relevant</button>
            </div>
          </div>
        </div>
      </div>

      <div className="project-label" ref={projectLabelRef} aria-hidden="true">
        <div className="project-label__pill" ref={projectPillRef}>
          <svg className="project-label__arrow" width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 10L10 2M10 2H4M10 2V8" stroke="#111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="project-label__text">
            <span className="project-label__title" ref={labelTitleRef} />
            <span className="project-label__category" ref={labelCatRef} />
          </div>
        </div>
        <div className="project-label__pill project-label__pill--cue scroll-cue-pill" ref={scrollCuePillRef}>
          <span className="project-label__cue">SCROLL</span>
        </div>
      </div>

      <div className="detail" ref={detailRef} aria-hidden="true">
        <div className="detail__esc">[ESC] to close</div>
        <div className="detail__inner" ref={detailInnerRef}>
          <button type="button" className="detail__nav" ref={detailPrevRef} aria-label="Previous">
            <img src="/classics/icons/left-arrow.svg" alt="" width={20} height={18} />
          </button>

          {/* Mobile-only peek card, real content (not a decorative sliver) — see
              .detail__card--ghost in classics-experience.css (display:none on desktop) and
              updateGhosts()/the swipe handlers below. pointer-events:none: it's not
              interactive, purely a visual preview of what a swipe reveals. */}
          <div className="detail__card detail__card--ghost" ref={detailGhostPrevRef} aria-hidden="true">
            <div className="detail__mediaCol">
              <div className="detail__media">
                <img className="detail__img" ref={detailGhostPrevImgRef} alt="" />
              </div>
            </div>
            <div className="detail__content">
              <h2 className="detail__title" ref={detailGhostPrevTitleRef} />
              <div>
                <span className="detail__badge" ref={detailGhostPrevBadgeRef} />
                <div className="detail__body" ref={detailGhostPrevBodyRef} />
              </div>
            </div>
          </div>

          <div className="detail__card" ref={detailCardRef}>
            <div className="detail__mediaCol">
              <div className="detail__media">
                <img className="detail__img" ref={detailImgRef} alt="" />
              </div>
              <div className="detail__thumbs" ref={detailThumbsRef} aria-hidden="true">
                <button type="button" className="detail__thumbNav detail__thumbNav--prev" ref={detailThumbPrevRef} aria-label="Scroll thumbnails left">
                  <img src="/classics/icons/left-arrow.svg" alt="" width={12} height={11} />
                </button>
                <div className="detail__thumbTrack" ref={detailThumbTrackRef} />
                <button type="button" className="detail__thumbNav detail__thumbNav--next" ref={detailThumbNextRef} aria-label="Scroll thumbnails right">
                  <img src="/classics/icons/right-arrow.svg" alt="" width={12} height={11} />
                </button>
              </div>
            </div>
            <div className="detail__content">
              <h2 className="detail__title" ref={detailTitleRef} />
              <div>
                <span className="detail__badge" ref={detailBadgeRef} />
                <div className="detail__body" ref={detailBodyRef} />
              </div>
            </div>
          </div>

          <div className="detail__card detail__card--ghost" ref={detailGhostNextRef} aria-hidden="true">
            <div className="detail__mediaCol">
              <div className="detail__media">
                <img className="detail__img" ref={detailGhostNextImgRef} alt="" />
              </div>
            </div>
            <div className="detail__content">
              <h2 className="detail__title" ref={detailGhostNextTitleRef} />
              <div>
                <span className="detail__badge" ref={detailGhostNextBadgeRef} />
                <div className="detail__body" ref={detailGhostNextBodyRef} />
              </div>
            </div>
          </div>

          <button type="button" className="detail__nav" ref={detailNextRef} aria-label="Next">
            <img src="/classics/icons/right-arrow.svg" alt="" width={20} height={18} />
          </button>
        </div>
      </div>

      <div className="pg" ref={pgRef} aria-hidden="true">
        <div className="pg__scroll" ref={pgScrollRef}>
          <span className="pg__archive">archive</span>
          <div className="pg__stage" ref={pgStageRef} />
        </div>
      </div>

      <div className="contact" ref={contactRef} aria-hidden="true">
        <div className="contact__panel">
          <button className="contact__close" type="button">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="#111" strokeWidth="1.6" strokeLinecap="round" /></svg> CLOSE
          </button>
          <div className="contact__left">
            <canvas className="contact__star" ref={contactStarCvRef} />
            <div className="contact__bottom">
              <span className="contact__tag">BIRTH OF <b>STAR</b></span>
              <h2 className="contact__headline">Born<br />Not Launched</h2>
            </div>
          </div>
          <div className="contact__card">
            <h3 className="contact__h"><span>Join a community</span><br />that&apos;s shaping the<br />future together.</h3>
            <a className="contact__book" href="#" onClick={(e) => e.preventDefault()}>
              <span className="contact__book-arrow"><svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 14L14 4M14 4H6M14 4V12" stroke="#111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
              <span className="contact__book-row">
                <svg width="26" height="26" viewBox="0 0 48 48"><path fill="#00832d" d="M6 16a4 4 0 0 1 4-4h16v24H10a4 4 0 0 1-4-4z" /><path fill="#0066da" d="M26 18l10-7v26l-10-7z" /><path fill="#e94235" d="M26 12h-7l7 7z" /><path fill="#ffba00" d="M26 36h-7l7-7z" /></svg>
                <span>Book a quick call</span>
              </span>
              <span className="contact__book-meta"><svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#6b7280" strokeWidth="1.6" /><path d="M12 7v5l3 2" stroke="#6b7280" strokeWidth="1.6" strokeLinecap="round" /></svg> 15 MINUTES</span>
            </a>
            <form className="contact__form">
              <div className="contact__field"><label>NAME</label><input type="text" name="name" autoComplete="name" /></div>
              <div className="contact__field"><label>E-MAIL</label><input type="email" name="email" autoComplete="email" /></div>
              <div className="contact__field"><label>PHONE</label><input type="tel" name="phone" autoComplete="tel" /></div>
              <button type="submit" className="contact__submit">SUBMIT</button>
            </form>
          </div>
        </div>
      </div>

      <div className="sb-dock" ref={dockRef} aria-hidden="true">
        <span className="sb-dock__exp">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" stroke="#111" strokeWidth="1.6" /><circle cx="12" cy="12" r="3" stroke="#111" strokeWidth="1.6" /></svg>
          <span className="sb-dock__exp-label">Experience Shift</span>
        </span>
        <div className="sb-seg" ref={expSegRef}>
          <button className="sb-seg__btn is-active" data-exp="random">Random</button>
          <button className="sb-seg__btn" data-exp="playground">Playground</button>
        </div>
        <button
          ref={randomImageBtnRef}
          type="button"
          className="sb-dock__random"
          aria-label="Show a random image"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="4" stroke="#111" strokeWidth="1.6" /><circle cx="8.5" cy="8.5" r="1.4" fill="#111" /><circle cx="15.5" cy="8.5" r="1.4" fill="#111" /><circle cx="8.5" cy="15.5" r="1.4" fill="#111" /><circle cx="15.5" cy="15.5" r="1.4" fill="#111" /><circle cx="12" cy="12" r="1.4" fill="#111" /></svg>
          <span className="sb-dock__random-label">Surprise Me</span>
        </button>
      </div>
    </div>
  );
});
