"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
// Compass.glb is meshopt-compressed (EXT_meshopt_compression, a REQUIRED extension — 7.5MB → 627KB),
// so every loader that touches it must have this decoder set or the parse fails outright. drei's
// useGLTF (Star3D, JourneyStar3D) wires it automatically; these raw GLTFLoaders do not.
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import "./classics-experience.css";

/**
 * One image plus the focal point an editor picked for it in the Payload admin ("Edit Image" →
 * focal point), as percentages 0-100 from the image's top-left. 50/50 is dead center.
 *
 * Every surface here cover-crops to a different aspect ratio — the 3D panels to a ~3:4 portrait
 * plane, the detail popup to a wide media box, the thumbnail strip to 84x64 — so a single upload
 * gets framed three different ways and no fixed anchor is right for every photo. These coordinates
 * are what each of those crops centers on, so the subject survives all three.
 *
 * Set by collections/Media.ts (focalPoint), carried through Supabase by
 * lib/payload/syncClassicsCard.ts, and applied by applyCoverUv (WebGL) and applyImage (DOM) below.
 */
export interface CmsImage { url: string; focalX: number; focalY: number }

interface Project { title: string; cat: string; img: CmsImage; gallery?: CmsImage[]; body?: string[]; instagram?: string }

export type CmsProject = Project;

/**
 * Points a DOM <img> at an image and anchors its object-fit:cover crop to that image's focal point.
 *
 * Replaces the blanket `object-position: top` that .detail__img and .detail__thumb img used to
 * hardcode (see classics-experience.css) — that was a workaround for portrait photos getting their
 * subjects' heads cut off by the default centered crop, but it just traded one fixed guess for
 * another, cropping the bottom off anything where the subject sat low in the frame.
 */
function applyImage(el: HTMLImageElement | null, image: CmsImage | undefined) {
  if (!el || !image) return;
  el.src = image.url;
  el.style.objectPosition = `${image.focalX}% ${image.focalY}%`;
}

// Disabled by request ("remove the images which are not part of ppt like hardcoded content and
// images in classic pages... not remove comment that part it for now") — these were placeholder
// picsum.photos stock images + made-up titles, never part of the client's PPT content, kept only
// as a fallback so the gallery wasn't empty before real cards existed. Commented out, not deleted,
// per that same request — allProjects below now resolves to just cmsProjects (the real,
// Supabase-synced cards). Restore by uncommenting this const AND the `...PROJECTS,` spread below.
// const PROJECTS: Project[] = [
//   { title: "Winter Portrait",  cat: "Archive 2024",   img: "https://picsum.photos/seed/winter-portrait/700/900" },
//   { title: "Red Abstract",     cat: "Visual Study",    img: "https://picsum.photos/seed/red-abstract/700/900" },
//   { title: "Fabric Study",     cat: "Material",        img: "https://picsum.photos/seed/fabric-grey/700/900" },
//   { title: "Mountain Lake",    cat: "Landscape",       img: "https://picsum.photos/seed/mountains-lake/700/900" },
//   { title: "City At Night",    cat: "Urban 2025",      img: "https://picsum.photos/seed/city-night/700/900" },
//   { title: "Forest Path",      cat: "Nature",          img: "https://picsum.photos/seed/forest-path/700/900" },
//   { title: "Desert Sands",     cat: "Expedition",      img: "https://picsum.photos/seed/desert-sand/700/900" },
//   { title: "Still Life I",     cat: "Seasonal",        img: "https://picsum.photos/seed/christmas-tree/700/900" },
//   { title: "Two Of Us",        cat: "Portrait",        img: "https://picsum.photos/seed/couple-selfie/700/900" },
//   { title: "Ocean Wave",       cat: "Seascape",        img: "https://picsum.photos/seed/ocean-wave/700/900" },
//   { title: "Portrait Study",   cat: "Editorial",       img: "https://picsum.photos/seed/portrait-woman/700/900" },
//   { title: "Hands & Wreath",   cat: "Craft",           img: "https://picsum.photos/seed/wreath-hands/700/900" },
//   { title: "Street Art",       cat: "Urban Culture",   img: "https://picsum.photos/seed/street-art/700/900" },
//   { title: "Vintage Drive",    cat: "Transport",       img: "https://picsum.photos/seed/vintage-car/700/900" },
//   { title: "Jazz Club",        cat: "Nightlife",       img: "https://picsum.photos/seed/jazz-club/700/900" },
//   { title: "Rooftop View",     cat: "Cityscape",       img: "https://picsum.photos/seed/rooftop-view/700/900" },
//   { title: "Summer Bloom",     cat: "Botanical",       img: "https://picsum.photos/seed/summer-bloom/700/900" },
//   { title: "Concrete Wall",    cat: "Brutalism",       img: "https://picsum.photos/seed/concrete-wall/700/900" },
// ];

const LOREM = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.",
];

// Escapes quotes too (not just &/</>) — this is used both inside text nodes (detailBodyHtml
// below) and inside HTML attributes (the pg-card src="…"/alt="…" template strings further down),
// and a literal " in an admin-entered heading or image URL would otherwise break out of those
// attributes. Escaping quotes is always safe in a text-node context too, so one function covers
// both call sites correctly.
function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Falls back to the studio's main Instagram profile for projects with no card-specific link (the
// hardcoded PROJECTS list has none) — same URL as the site footer's Instagram link — instead of
// hiding the icon, which is how it always displayed before per-card links existed.
const DEFAULT_IG_URL = "https://www.instagram.com/switchbladeworld?igsh=Mmw2dHBscHdnYzgx&utm_source=qr";
function applyIgLink(el: HTMLAnchorElement | null, url: string | undefined) {
  if (!el) return;
  el.href = url || DEFAULT_IG_URL;
}

function detailBodyHtml(body: string[] | undefined) {
  return (body?.length ? body : LOREM).map(p => `<p>${escapeHtml(p)}</p>`).join("");
}

/**
 * Writes a card's body copy AND returns that card to the top of its text.
 *
 * The scroll reset is the whole reason this exists rather than assigning innerHTML directly.
 * .detail__body is its own scroll container (see classics-experience.css), and scrollTop is a
 * property of the ELEMENT, not of the content inside it — replacing the HTML leaves the offset
 * exactly where the reader had dragged it. So after scrolling down one project and moving to the
 * next, the new card opened part-way down its own copy, often past the first paragraph entirely.
 *
 * Every place that swaps body copy goes through here, so a new navigation path can't reintroduce
 * it by forgetting the reset.
 */
function setDetailBody(el: HTMLElement | null, body: string[] | undefined) {
  if (!el) return;
  el.innerHTML = detailBodyHtml(body);
  el.scrollTop = 0;
}

const PANELS_PER_ROW = 12, ROWS = 5;
// Most thumbnails the detail popup's strip can show before its prev/next arrows are worth having,
// by request ("if the gallery images are less/equal to 5 don't show the arrows"). At or below this
// the whole strip fits on screen, so the arrows would scroll nothing.
const THUMB_NAV_MIN_COUNT = 5;
const PANEL_SCALE = 1.1;
const SPIRAL_RADIUS_RATIO = 0.72;
const SPIRAL_SCALE_DESKTOP = 1.26, SPIRAL_SCALE_MOBILE = 0.88;
const INITIAL_BLUR = 0;
const ENTRANCE_DURATION_MS = 760;
const ENTRANCE_DELAY_MIN_MS = 840, ENTRANCE_DELAY_RANGE_MS = 980;
const BEND_H_CLAMP = 0.25, BEND_V_CLAMP = 0.15;
const BG_COLOR = 0xffffff;
const FLIP_MS = 480;
// Boot reveal timings. BOOT_FALL_MS must match the .classics-boot__cover.is-falling transition
// duration in classics-experience.css — it's only used to know when the panel has fully cleared.
//
// BOOT_HOLD_MS is a MINIMUM, not the whole wait: the gradient also holds until every panel texture
// has finished loading (see the boot gate below), so the gallery is fully imaged and turning by
// the time it's uncovered instead of revealing a ring of blank panels that pop in one by one. The
// minimum is what governs a warm cache, where the textures resolve almost instantly and the
// loading screen would otherwise flash by before it could be read.
// Beat before the loading screen's title wipes in, so the gradient has visibly arrived first and
// the reveal reads as a deliberate entrance rather than something that was always there.
const BOOT_TITLE_DELAY_MS = 90;
const BOOT_TITLE_FADE_MS = 400;
// Long enough for the title to finish fading in, plus a beat where the ring is visibly filling
// before anything can pull the screen away. Derived rather than hardcoded: on a warm cache a
// shorter hold reveals the gallery mid-fade, so the word never fully resolves — a half-faded title
// disappearing reads as a glitch rather than an intro.
//
// This dropped from 1090ms when the "Know information in ease" tag was removed; the tag's fade
// used to be the last beat the hold had to cover.
const BOOT_HOLD_MS = BOOT_TITLE_DELAY_MS + BOOT_TITLE_FADE_MS + 250;
const BOOT_FALL_MS = 2200;
// Failsafe on that wait — deliberately generous, because the loading screen shows a real
// percentage now. A visitor watching a counter climb will happily wait far longer than one staring
// at a blank gradient, so this is set to catch a genuinely stuck load (a hung request, a dead
// connection) rather than to bound normal waiting. Failed loads already count as settled, so one
// broken URL can't run the clock out on its own. Past this the bar is swept to 100% and the reveal
// proceeds with whatever is still in flight filling in behind it.
const BOOT_MAX_WAIT_MS = 20000;

interface ViewportConfig {
  fov: number; cameraZ: number; radius: number;
  panelW: number; panelH: number; rowSpacing: number; starScale: number;
}

// The star's own base scale — see loadCenterStar's `cfg.starScale / maxDim`.
const STAR_BASE_SCALE = 4.6;

// fov/cameraZ/rowSpacing are the ORIGINAL values, restored by request ("i think the camera is
// zoomed in, revert back this change to previous one how it was there").
//
// They had been retuned to flatten perspective: panels sit at a fixed `radius` around a cylinder
// (see buildPanels' `mesh.position.set(Math.cos(tR)*cfg.radius, y, Math.sin(tR)*cfg.radius)`) with
// the camera `cameraZ` away, so a panel facing the camera dead-on sits at (cameraZ - radius) while
// a side-rotated one sits at sqrt(cameraZ² + radius²) — on desktop, 5.2 vs 15.16, making side
// panels ~2.9x farther and therefore visibly smaller (apparent size scales inversely with
// distance). That's plain perspective, not a per-image fit bug — every panel shares one
// PlaneGeometry and the shader maps each texture 0..1 with no cover-crop. Pulling the camera way
// back and narrowing the fov to match (the telephoto trick) compressed that ratio to ~1.5x, but
// the narrower fov also frames a much smaller slice of the scene, which is what read as "zoomed
// in" — hence this revert. Two follow-on tweaks made only to compensate for that camera move are
// gone with it: a per-breakpoint star-scale correction (the star sits on the camera axis, so it
// took its own unrelated size shift from the move), and a halving of rowSpacing (a narrower fov
// shows less vertical extent, so the same fixed world-space row gap read as a bigger gap).
// Reverting the camera makes both unnecessary — starScale is now just the flat base constant, and
// the row gaps below are the originals again.
function getConfig(): ViewportConfig {
  const w = window.innerWidth;
  const aspect = window.innerHeight / Math.max(w, 1);
  const portrait = aspect > 1;
  if (w < 500)  return { fov: 70, cameraZ: 7.5, radius: 4.5, panelW: 1.0 * PANEL_SCALE, panelH: 1.4 * PANEL_SCALE, rowSpacing: 5.5, starScale: STAR_BASE_SCALE };
  if (w < 768)  return { fov: 70, cameraZ: 9.5, radius: 4.6, panelW: 1.0 * PANEL_SCALE, panelH: 1.4 * PANEL_SCALE, rowSpacing: 3.8, starScale: STAR_BASE_SCALE };
  if (w < 1024 && portrait) return { fov: 65, cameraZ: 9,  radius: 5.5, panelW: 1.0 * PANEL_SCALE, panelH: 1.4 * PANEL_SCALE, rowSpacing: 6.5, starScale: STAR_BASE_SCALE };
  if (w < 1024) return { fov: 60, cameraZ: 11,  radius: 6.5, panelW: 1.2 * PANEL_SCALE, panelH: 1.6 * PANEL_SCALE, rowSpacing: 4, starScale: STAR_BASE_SCALE };
  // *1.6 (by request, "in desktop make it big") — a deliberate desktop-only enlargement of the
  // star beyond its base size, kept across the camera revert above since it was its own request,
  // not part of the camera compensation.
  return          { fov: 50, cameraZ: 13,  radius: 7.8, panelW: 1.4 * PANEL_SCALE, panelH: 1.9 * PANEL_SCALE, rowSpacing: 7, starScale: STAR_BASE_SCALE * 1.6 };
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
uniform vec3 uDepthColor;uniform vec2 uUvScale,uUvOffset;varying vec2 vUv;varying float vViewZ;${GLSL_SRGB}
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
  // uUvScale/uUvOffset (by request — "images around the 3D model are shrinking/squeezed... make
  // it cover"): the plane's own UVs (vUv) run a plain 0..1 across the panel regardless of the
  // loaded texture's own aspect ratio, so a texture whose aspect didn't match the panel's just
  // got stretched to fill it — squeezed narrower or shorter depending on the source image's shape.
  // These two uniforms are computed per-texture in loadPanelTexture (JS side) from the actual
  // image aspect vs. this panel's aspect, the same math CSS object-fit:cover does: scale one axis
  // up so the image's short side fully covers the panel, centering the crop via the offset so the
  // excess on the long axis is trimmed evenly off both edges instead of stretching either axis.
  vec2 uv=vUv*uUvScale+uUvOffset;
  vec4 col=blurSample(uTexture,uv,uBlur);
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
  uUvScale: THREE.IUniform<THREE.Vector2>;
  uUvOffset: THREE.IUniform<THREE.Vector2>;
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
  // Portal target for the mobile detail-close button (see its own comment further down) —
  // document.body isn't available during SSR, so this flips true only after mount.
  const [portalMounted, setPortalMounted] = useState(false);
  useEffect(() => { setPortalMounted(true); }, []);
  // closeDetail itself is defined inside the big imperative effect below (it needs that effect's
  // closure — currentSource, detailClosing etc.), so it isn't directly callable from a separate
  // effect. Stashed here once that effect runs, so the close button's own click-wiring effect
  // (below, gated on portalMounted) can call the CURRENT closeDetail without needing it in scope.
  const closeDetailFnRef = useRef<() => void>(() => {});

  // `...PROJECTS,` removed from this spread (see PROJECTS' own comment above, near its now-
  // commented-out declaration) — the gallery now shows only the real, Supabase-synced cards.
  const allProjects = useMemo(() => [...cmsProjects], [cmsProjects]);

  const bootLoaderRef  = useRef<HTMLDivElement>(null);
  const bootLayerRef   = useRef<HTMLDivElement>(null);
  // Loading-screen readouts, driven from the boot gate's real texture-load progress (see
  // updateBootUi). Written imperatively rather than through state: this updates every frame while
  // the gradient is up, and re-rendering the whole experience tree at 60fps for a percentage
  // counter would be wasteful and could stutter the 3D scene setting up behind it.
  const bootPctRef     = useRef<HTMLSpanElement>(null);
  const bootRingRef    = useRef<SVGCircleElement>(null);

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
  const detailCloseRef = useRef<HTMLButtonElement>(null);
  // The close button only exists in the DOM once portalMounted flips true — a SECOND render after
  // the one the big effect's setup below ran on. Wiring its click listener inside that big effect
  // (like detailPrevRef/detailNextRef are) reads detailCloseRef.current as null forever, since
  // that effect has an empty dep array and never re-runs once the portal's button actually
  // mounts — the listener would silently never attach. This effect re-runs specifically when
  // portalMounted flips, i.e. exactly when the button first exists.
  useEffect(() => {
    if (!portalMounted) return;
    const el = detailCloseRef.current;
    const onClick = () => closeDetailFnRef.current();
    el?.addEventListener("click", onClick);
    return () => el?.removeEventListener("click", onClick);
  }, [portalMounted]);
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
  const detailIgRef = useRef<HTMLAnchorElement>(null);
  const detailGhostPrevIgRef = useRef<HTMLAnchorElement>(null);
  const detailGhostNextIgRef = useRef<HTMLAnchorElement>(null);
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
    // antialias was disabled on mobile for performance, but that's what was making the star's
    // (and every panel's) edges look jagged/pixelated there — turning it back on for all
    // devices. The pixel ratio cap is also bumped to match desktop (2, up from 1.5) since a
    // lower cap compounds the same blurriness on higher-density phone screens.
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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
          uUvScale: { value: new THREE.Vector2(1, 1) }, uUvOffset: { value: new THREE.Vector2(0, 0) },
        },
        vertexShader: PANEL_VERT, fragmentShader: PANEL_FRAG,
        side: THREE.DoubleSide, transparent: true, depthWrite: false, toneMapped: false,
      }) as PanelMaterial;
    }

    // Same math as CSS object-fit:cover + object-position, applied to a shader UV instead of a DOM
    // box: scale whichever axis needs it so the texture's short side fully covers the panel, then
    // slide the crop window along the overflowing axis so it sits over the image's focal point
    // rather than stretching either axis to fit (see PANEL_FRAG's own comment on
    // uUvScale/uUvOffset).
    //
    // The window has (1 - scale) of travel on each axis, and gets clamped into that range: a focal
    // point near an edge pins the crop to that edge instead of sliding past it and sampling the
    // texture's clamped border pixels. An unadjusted image is 50/50, which lands the window dead
    // center — exactly what this did before focal points existed.
    //
    // The Y axis is flipped relative to focalY. THREE textures default to flipY = true, so v = 0
    // is the BOTTOM of the image as displayed, while focalY (like CSS object-position) counts
    // percent down from the TOP — hence 1 - focalY rather than focalY.
    function applyCoverUv(mat: PanelMaterial, tex: THREE.Texture, panelAspect: number, image: CmsImage) {
      const img = tex.image as { width?: number; height?: number } | undefined;
      const w = img?.width, h = img?.height;
      if (!w || !h) return;
      const imgAspect = w / h;
      let scaleX = 1, scaleY = 1;
      if (imgAspect > panelAspect) scaleX = panelAspect / imgAspect;
      else scaleY = imgAspect / panelAspect;
      const focalU = image.focalX / 100;
      const focalV = 1 - image.focalY / 100;
      const clamp = (v: number, max: number) => Math.max(0, Math.min(max, v));
      mat.uniforms.uUvScale.value.set(scaleX, scaleY);
      mat.uniforms.uUvOffset.value.set(
        clamp(focalU - scaleX / 2, 1 - scaleX),
        clamp(focalV - scaleY / 2, 1 - scaleY),
      );
    }

    // Boot gate — holds the intro gradient until the gallery is actually ready to be seen.
    //
    // Tracks the textures the FIRST buildPanels() asks for (it also re-runs on resize, which must
    // not re-arm this) and counts them down as they settle. Gating on the panels' own requests
    // rather than on every project's image matters: the rows deal out a shuffled subset, so this
    // waits for exactly what's about to be on screen and nothing more.
    //
    // tryBootFall is a no-op placeholder until the boot sequence further down installs the real
    // one — that code runs later in this same effect, so assigning through a mutable binding
    // avoids a temporal-dead-zone crash if a cached texture settles synchronously during the build.
    // Two sets rather than one countdown, so the loading screen can show a real fraction: `wanted`
    // is every DISTINCT url the first build asked for, `settled` is how many of those have
    // finished. Distinct matters — the rows deal the same project into several panels, and a
    // plain counter would then count one image two or three times and stall the bar short of 100%.
    const bootWanted = new Set<string>();
    const bootSettled = new Set<string>();
    let bootCollecting = true;
    let bootBuildDone = false;
    let bootTexturesReady = false;
    let tryBootFall: () => void = () => {};
    let onBootProgress: (() => void) | null = null;
    const noteBootTexture = (url: string) => {
      // Ignores urls this gate isn't waiting on (resize rebuilds) and repeat callbacks for one
      // already counted, either of which would otherwise push the fraction past 100%.
      if (!bootWanted.has(url) || bootSettled.has(url)) return;
      bootSettled.add(url);
      onBootProgress?.();
      if (bootBuildDone && bootSettled.size >= bootWanted.size) {
        bootTexturesReady = true;
        tryBootFall();
      }
    };

    const textureCache = new Map<string, THREE.Texture>();
    function loadPanelTexture(url: string, onReady: (tex: THREE.Texture) => void) {
      const cached = textureCache.get(url);
      if (cached) { onReady(cached); noteBootTexture(url); return; }
      texLoader.load(
        url,
        tex => {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.minFilter = THREE.LinearFilter;
          textureCache.set(url, tex);
          onReady(tex);
          noteBootTexture(url);
        },
        undefined,
        // Settled-but-failed still counts, or one dead image URL would hold the gradient up until
        // BOOT_MAX_WAIT_MS every single load. The panel simply stays untextured, as it did before.
        () => noteBootTexture(url),
      );
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

          // Registered before the load starts so a texture that's already cached (and therefore
          // calls back synchronously) is added and removed in the right order rather than being
          // counted down before it was ever counted up.
          if (bootCollecting && proj.img.url) bootWanted.add(proj.img.url);
          loadPanelTexture(proj.img.url, tex => {
            mat.uniforms.uTexture.value = tex;
            applyCoverUv(mat, tex, cfg.panelW / cfg.panelH, proj.img);
          });
        }
      }
    }
    buildPanels();
    // The gate can only be judged complete once the whole build has finished registering — during
    // the loop a run of cached textures can momentarily empty the set while panels are still to
    // come, which would otherwise release the gradient early.
    bootCollecting = false;
    bootBuildDone = true;
    if (bootSettled.size >= bootWanted.size) bootTexturesReady = true;

    let centerStar: THREE.Group | null = null;
    function loadCenterStar() {
      // Neutral studio environment (RoomEnvironment) rather than the former blue canvas gradient —
      // the blue env was what tinted this metallic star flat blue. This gives the same silver
      // CHROME reflections the site's Star3D uses everywhere else, matching its look.
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      pmrem.dispose();
      scene.environmentIntensity = 1.4;
      scene.add(new THREE.AmbientLight(0xffffff, 0.4));
      const dl = new THREE.DirectionalLight(0xffffff, 2.4); dl.position.set(4, 8, 5); scene.add(dl);
      const dl2 = new THREE.DirectionalLight(0x9fb6ff, 1.2); dl2.position.set(-5, -2, -3); scene.add(dl2);
      const grp = new THREE.Group(); grp.position.set(0, 0, 0); scene.add(grp); centerStar = grp;
      new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).load("/Compass.glb", gltf => {
        const m = gltf.scene;
        // Same chrome material as the site-wide Star3D (components/shared/Star3D.tsx): silver
        // MeshPhysicalMaterial with clearcoat, so this star reads identically to the rest of the site.
        m.traverse(o => { if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).material = new THREE.MeshPhysicalMaterial({ color: new THREE.Color("#B8C0CE"), metalness: 0.97, roughness: 0.05, clearcoat: 0.6, clearcoatRoughness: 0.04, envMapIntensity: 2.4, side: THREE.DoubleSide }); });
        const size = new THREE.Box3().setFromObject(m).getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        // cfg.starScale is STAR_BASE_SCALE at every breakpoint except desktop, which enlarges it
        // deliberately (by request) — see getConfig.
        m.scale.setScalar(cfg.starScale / maxDim);
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
          // p.title/p.img.url can come from a classics card entered in the Payload admin (see
          // ClassicsPageClient's cmsProjects prop) — escaped here the same way detailBodyHtml
          // escapes card body text below, so a crafted heading/image URL can't break out of these
          // attributes into a stored XSS payload.
          //
          // No object-position needed on these: .pg-card__img is width:100%/height:auto, so it
          // renders at the image's natural aspect and never crops. The focal point only matters
          // where something cover-crops (the 3D panels, the detail popup, the thumb strip).
          card.innerHTML = `<img class="pg-card__img" src="${escapeHtml(p.img.url)}" alt="${escapeHtml(p.title)}">
            <span class="pg-card__cta">CLICK TO SEE</span>
            <span class="pg-card__title"${titleStyle}>/${escapeHtml(p.title.toUpperCase())}</span>`;
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
        card.innerHTML = `<img class="pg-card__img" src="${escapeHtml(p.img.url)}" alt="${escapeHtml(p.title)}">
          <span class="pg-card__cta">CLICK TO SEE</span>
          <span class="pg-card__title">/${escapeHtml(p.title.toUpperCase())}</span>`;
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
      // Neutral studio environment (RoomEnvironment) for the same silver chrome look as the
      // site-wide Star3D, matching the center star above (was a blue canvas gradient that tinted
      // this metallic star flat blue).
      const pmrem = new THREE.PMREMGenerator(starRenderer);
      starScene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      pmrem.dispose();
      starScene.environmentIntensity = 1.5;
      starScene.add(new THREE.AmbientLight(0xffffff, 0.35));
      const dl = new THREE.DirectionalLight(0xffffff, 2.4); dl.position.set(4, 8, 5); starScene.add(dl);
      const dl2 = new THREE.DirectionalLight(0x9fb6ff, 1.2); dl2.position.set(-5, -2, -3); starScene.add(dl2);
      const grp = new THREE.Group(); starScene.add(grp); starModel = grp;
      new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).load("/Compass.glb", gltf => {
        const m = gltf.scene;
        // Same chrome material as the site-wide Star3D.
        m.traverse(o => { if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).material = new THREE.MeshPhysicalMaterial({ color: new THREE.Color("#B8C0CE"), metalness: 0.97, roughness: 0.05, clearcoat: 0.6, clearcoatRoughness: 0.04, envMapIntensity: 2.4, side: THREE.DoubleSide }); });
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
    let currentGalleryImages: CmsImage[] = [];
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
      const next = currentGalleryImages[idx];
      if (!img || !track || !next || img.src === next.url) return;
      currentThumbIndex = idx;
      img.style.transition = "opacity .15s ease";
      img.style.opacity = "0";
      setTimeout(() => {
        applyImage(img, next);
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
      applyImage(detailGhostPrevImgRef.current, prevProj.img);
      if (detailGhostPrevTitleRef.current) detailGhostPrevTitleRef.current.textContent = prevProj.title.toUpperCase();
      if (detailGhostPrevBadgeRef.current) detailGhostPrevBadgeRef.current.textContent = prevProj.cat.toUpperCase();
      setDetailBody(detailGhostPrevBodyRef.current, prevProj.body);
      applyIgLink(detailGhostPrevIgRef.current, prevProj.instagram);
      applyImage(detailGhostNextImgRef.current, nextProj.img);
      if (detailGhostNextTitleRef.current) detailGhostNextTitleRef.current.textContent = nextProj.title.toUpperCase();
      if (detailGhostNextBadgeRef.current) detailGhostNextBadgeRef.current.textContent = nextProj.cat.toUpperCase();
      setDetailBody(detailGhostNextBodyRef.current, nextProj.body);
      applyIgLink(detailGhostNextIgRef.current, nextProj.instagram);
    }

    function renderThumbs(proj: Project) {
      const wrap = detailThumbsRef.current;
      const track = detailThumbTrackRef.current;
      if (!wrap || !track) return;
      currentGalleryImages = [proj.img, ...(proj.gallery ?? [])];
      currentThumbIndex = 0;
      track.innerHTML = "";
      // The prev/next arrows only exist to scroll a thumbnail strip that overflows its track, so
      // they're shown only once there are actually more thumbs than fit — at or below
      // THUMB_NAV_MIN_COUNT the whole strip is visible at once and the arrows are decoration that
      // does nothing when clicked. Toggled here rather than in CSS because the count isn't
      // something CSS can see. Counts the thumbs as rendered, i.e. the main image plus the gallery,
      // which is what's actually on screen to scroll through.
      wrap.classList.toggle("has-thumbNav", currentGalleryImages.length > THUMB_NAV_MIN_COUNT);
      if (currentGalleryImages.length <= 1) {
        wrap.classList.remove("is-visible");
        stopAutoplay();
        return;
      }
      wrap.classList.add("is-visible");
      currentGalleryImages.forEach((image, i) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "detail__thumb" + (i === 0 ? " is-active" : "");
        btn.setAttribute("aria-label", `Show image ${i + 1} of ${currentGalleryImages.length}`);
        const im = document.createElement("img");
        applyImage(im, image);
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
      applyImage(img, proj.img);
      detailTitleRef.current.textContent = proj.title.toUpperCase();
      detailBadgeRef.current.textContent = proj.cat.toUpperCase();
      setDetailBody(detailBodyRef.current, proj.body);
      applyIgLink(detailIgRef.current, proj.instagram);
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
      // detailCloseRef is portaled straight to document.body (see its own comment in the JSX) —
      // no longer a descendant of `root`, so the CSS "root.detail-open .detail__close" selector
      // that gates .detail's own children can't reach it. Toggled directly here instead.
      detailCloseRef.current?.classList.add("is-open");
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
      detailCloseRef.current?.classList.remove("is-open");

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
    // See closeDetailFnRef's own declaration above — the portaled close button's click listener
    // is wired in a separate effect (gated on portalMounted) that can't see this closure directly.
    closeDetailFnRef.current = closeDetail;

    function showAdjacentProject(dir: 1 | -1) {
      if (!detailOpen || detailClosing) return;
      currentProjectIndex = (currentProjectIndex + dir + allProjects.length) % allProjects.length;
      const proj = allProjects[currentProjectIndex];
      const img = detailImgRef.current;
      if (!img || !detailTitleRef.current || !detailBadgeRef.current || !detailBodyRef.current) return;
      img.style.transition = "opacity .15s ease";
      img.style.opacity = "0";
      setTimeout(() => {
        applyImage(img, proj.img);
        detailTitleRef.current!.textContent = proj.title.toUpperCase();
        detailBadgeRef.current!.textContent = proj.cat.toUpperCase();
        setDetailBody(detailBodyRef.current, proj.body);
        applyIgLink(detailIgRef.current, proj.instagram);
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
          applyImage(detailImgRef.current, proj.img);
          if (detailTitleRef.current) detailTitleRef.current.textContent = proj.title.toUpperCase();
          if (detailBadgeRef.current) detailBadgeRef.current.textContent = proj.cat.toUpperCase();
          setDetailBody(detailBodyRef.current, proj.body);
          applyIgLink(detailIgRef.current, proj.instagram);
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

    // Swipe-down-to-close was REMOVED here by request ("on swipe down it is closing, i don't want
    // that — there is already a close button, so only on close button it should close").
    //
    // It listened on the whole modal, so any downward flick anywhere in the popup dismissed it —
    // including ones meant as a scroll through the body copy, or the vertical component of a
    // sloppy horizontal card-swipe. The detail view is now dismissed only by its explicit close
    // button (and Escape on desktop, see the keydown handler below), which is the deliberate,
    // unambiguous action.
    //
    // Nothing else needs to change to compensate: the horizontal card-swipe (project navigation)
    // and the gallery swipe on the image are both independent trackers that bail out the moment a
    // gesture reads as more vertical than horizontal, so removing this leaves them untouched.

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
      if (e.key === "Escape") {
        if (contactOpen) closeContact();
        else if (detailOpen) closeDetail();
        return;
      }
      // Desktop keyboard equivalent of the prev/next arrow buttons — by request. Guarded on
      // !contactOpen (the contact/booking modal sits ON TOP of the detail view; arrow keys there
      // should have no effect on the cards underneath it) and detailOpen (showAdjacentProject
      // itself also checks this, but bailing here skips the project-index math entirely when
      // there's no detail view to navigate). Desktop only — mobile already has its own arrow-key-
      // free swipe gesture for this (see the card-swipe carousel below), and phones don't have a
      // hardware keyboard to fire these events from anyway.
      if (contactOpen || !detailOpen || window.innerWidth <= 820) return;
      if (e.key === "ArrowLeft") showAdjacentProject(-1);
      else if (e.key === "ArrowRight") showAdjacentProject(1);
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
      // Mobile relies on the explicit "X" button instead — a stray tap while scrolling the body
      // text or swiping between ghost cards was closing the popup unintentionally, since almost
      // the entire viewport counts as "backdrop" on a small screen. (This used to also list
      // swipe-down-to-close, which has since been removed by request — see the note where its
      // handlers used to live.) So on mobile the close button is now the ONLY way out, which is
      // the intent: nothing accidental can dismiss the popup.
      if (window.innerWidth <= 820) return;
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

    // Boot reveal — see the .classics-boot markup/CSS. The full gradient holds until BOTH the
    // minimum hold has elapsed AND every panel texture has settled (the boot gate up by
    // loadPanelTexture), then the gradient panel falls away and the experience is uncovered from
    // the top down — by which point the gallery behind it is fully imaged and already turning,
    // rather than a ring of blank panels filling in one at a time in front of the visitor.
    const bootTimers: number[] = [];
    let bootMinHoldDone = false;
    let bootFallen = false;
    let bootRaf = 0;
    // What the bar/percentage currently SHOW, eased toward the true fraction rather than snapping
    // to it. Real load progress arrives as a step per image — with 50 images that's 2% jumps, and
    // on a warm cache most of them land in the same frame, which reads as a broken counter
    // flicking straight to 100. Easing turns it into a continuous sweep while still being driven
    // entirely by genuine completions, never a fake timed animation.
    let bootShown = 0;
    // Set by the failsafe below so the bar still animates cleanly to 100% and falls, rather than
    // the reveal cutting away mid-count.
    let bootForceComplete = false;

    const fallBoot = () => {
      if (bootFallen) return;
      bootFallen = true;
      if (bootRaf) cancelAnimationFrame(bootRaf);
      // Fades the loading screen's text/bar out (see .classics-boot.is-revealing) while the
      // gradient itself slides down, so the copy dissolves in place instead of being dragged off
      // the bottom of the screen with the panel.
      bootLoaderRef.current?.classList.add("is-revealing");
      bootLayerRef.current?.classList.add("is-falling");
      // Reveal + start the scene's own entrance right as the fall begins, NOT after it finishes:
      // the panel takes BOOT_FALL_MS to clear, so the content needs to already be live behind it
      // to be progressively uncovered. Revealing afterwards would show a blank page for the whole
      // fall and then pop the content in.
      canvas.classList.add("is-revealed");
      dockRef.current?.classList.add("is-revealed");
      startEntrance();
      // Once the panel is clear, stop it intercepting pointer events.
      bootTimers.push(window.setTimeout(() => {
        bootLoaderRef.current?.classList.add("is-done");
        if (bootLoaderRef.current) bootLoaderRef.current.style.display = "none";
      }, BOOT_FALL_MS));
    };

    // Reassigns the placeholder declared next to the boot gate, so a texture settling later can
    // reach this. All three are re-checked on every call because any can land last: on a cold load
    // the textures finish well after the hold, on a warm cache the hold is the long pole, and the
    // bar's own easing always needs a few frames to actually arrive at 100.
    tryBootFall = () => {
      if (!bootMinHoldDone || !bootTexturesReady) return;
      // Normally waits for the bar to visibly reach 100 before revealing. But that value only
      // advances on rAF, which browsers PAUSE entirely in a hidden tab — so a visitor who opens
      // this page and immediately switches away would come back to a gradient still sitting at
      // whatever percent it froze on. Nobody is watching the sweep in that case, so don't hold the
      // reveal hostage to it.
      if (bootShown >= 1 || document.visibilityState === "hidden") fallBoot();
    };

    // Drives the percentage, the bar fill and the star knob from the real fraction of panel
    // textures that have finished. Runs on its own rAF rather than the scene's render loop,
    // because it has to be animating during exactly the window where that loop is still starting
    // up — which is the whole reason there's a loading screen at all.
    const updateBootUi = () => {
      // Cleared up front, not on exit, so onBootProgress below can always tell whether a loop is
      // actually pending — leaving a stale id here would make it think one is and never restart.
      bootRaf = 0;
      const target = bootForceComplete || bootWanted.size === 0
        ? 1
        : bootSettled.size / bootWanted.size;
      bootShown += (target - bootShown) * 0.12;
      // Snap once close enough, so the asymptote can't leave it frozen at 99% forever.
      if (target - bootShown < 0.004) bootShown = target;
      const pct = Math.min(100, Math.round(bootShown * 100));
      if (bootPctRef.current) bootPctRef.current.textContent = `${String(pct).padStart(2, "0")}%`;
      // The ring's circumference is normalised to 100 units by pathLength, so the drawn dash is
      // literally the percentage — no 2*pi*r, and nothing to update if the radius ever changes.
      // (dashoffset is left to the CSS, which uses it to start the arc at 12 o'clock.)
      if (bootRingRef.current) bootRingRef.current.style.strokeDasharray = `${bootShown * 100} 100`;
      if (bootShown >= 1) { tryBootFall(); return; }   // arrived: stop the loop
      bootRaf = requestAnimationFrame(updateBootUi);
    };
    // Nudges the loop awake when a texture lands, in case it already stopped at a completed frame.
    onBootProgress = () => { if (!bootFallen && !bootRaf) bootRaf = requestAnimationFrame(updateBootUi); };
    bootRaf = requestAnimationFrame(updateBootUi);

    bootTimers.push(window.setTimeout(() => { bootMinHoldDone = true; tryBootFall(); }, BOOT_HOLD_MS));
    // Failsafe — see BOOT_MAX_WAIT_MS. Rather than cutting the reveal in mid-count, it declares the
    // load complete so the bar sweeps up to 100% and falls through the normal path.
    bootTimers.push(window.setTimeout(() => {
      bootForceComplete = true;
      bootTexturesReady = true;
      bootMinHoldDone = true;
      if (!bootRaf) bootRaf = requestAnimationFrame(updateBootUi);
      // Also attempted directly, not left to the loop alone — same hidden-tab reasoning as
      // tryBootFall above: with rAF paused, the frame that would have triggered this never comes,
      // and the failsafe would fail to be a failsafe in exactly the case it exists for.
      tryBootFall();
    }, BOOT_MAX_WAIT_MS));

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
      // The loading-screen loop is normally stopped by fallBoot, but unmounting mid-load (a route
      // change while images are still downloading) leaves it running against detached elements.
      if (bootRaf) cancelAnimationFrame(bootRaf);
      onBootProgress = null;
      bootTimers.forEach(clearTimeout);
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
    <>
    {/* Boot reveal — the homepage hero's "gradient falls in" motion, reused here as the page's
        loading screen (it replaced a blue growing-box + [0-100] counter). The wrapper is the
        fixed, clipping viewport; the inner cover is the gradient panel that slides straight DOWN
        and off, uncovering the experience from the top. Its top edge is feathered by a mask and
        it starts overhanging above the viewport, so the soft edge is off-screen at rest and the
        reveal reads as a wash rather than a hard sliding panel — same construction as
        components/shared/GradientReveal.tsx.

        Deliberately a SIBLING of .classics-exp, not a child: `position: fixed` creates a stacking
        context, so .classics-exp traps any z-index used inside it. Nested here, the panel's
        z-index was scoped within .classics-exp — which itself sits at z-auto in the root stacking
        context — so the site navbar (z-1200, a root-level sibling) painted straight over the
        falling gradient no matter how high the panel's own z-index went. As a sibling its z-index
        competes at the root level, where it can actually cover the nav. */}
    {/* The loading screen that sits ON the gradient while the gallery's images download — the
        gradient is the backdrop, this is the content on top of it. Both live inside .classics-boot
        so they're removed together once the reveal finishes; the cover slides away while this
        fades, so the falling gradient isn't dragging text down the screen with it. */}
    <div className="classics-boot" ref={bootLoaderRef} aria-hidden="true">
      <div className="classics-boot__cover" ref={bootLayerRef} />
      <div className="classics-boot__ui">
        <div className="classics-boot__center">
          {/* The "Know information in ease" tag was removed by request — the ring and the title are
              the whole loading screen now.

              The title fades in (rather than the gradient wipe it once shared with the site's
              scroll-triggered headings): besides being shorter, it means the word never depends on
              rAF to become visible. SweepText renders fully transparent at rest and only resolves
              as its wipe runs, so a browser throttling rAF — any hidden tab — could leave it
              invisible. A CSS animation with fill-mode:both cannot. */}
          {/* The progress ring encircling the title, replacing the bar that used to run along the
              bottom. Both the ring's diameter and the title's font-size come from one --ring
              custom property (see the CSS): "CLASSICS" measures 6.542px wide per 1px of font-size
              in this face, so the type is sized at a fixed fraction of the diameter. Tie them
              together and the word can't outgrow its circle at some viewport nobody checked.

              pathLength="100" re-maps the circle's own circumference to 100 units, so progress can
              be written straight into strokeDashoffset as (100 - percent) with no 2*pi*r arithmetic
              and nothing to recompute if the radius ever changes. */}
          <div className="classics-boot__ringWrap">
            <svg className="classics-boot__ring" viewBox="0 0 100 100" aria-hidden="true">
              {/* The ring is stroked with the INVERSE of the backdrop — white at the top, blue at
                  the bottom — because a single flat colour can't stay legible across this gradient.
                  A white ring vanished into the pale lower half; a blue one would vanish into the
                  dark upper half. Running it the other way keeps contrast at both ends. */}
              {/* gradientTransform cancels the circles' own rotate(-90) below. An SVG <circle>
                  path begins at 3 o'clock, so the geometry has to be turned a quarter-turn for
                  progress to start at the top — but that rotation carries the stroke's gradient
                  with it, tipping the white/blue axis onto its side. Rotating the gradient back by
                  the same amount leaves it upright while the arc still starts at 12 o'clock.
                  (Offsetting the dash pattern instead avoids the rotation but does not place the
                  arc's start where you'd expect — measured, not assumed.) */}
              <defs>
                <linearGradient id="classicsBootRing" x1="0" y1="0" x2="0" y2="1" gradientTransform="rotate(90 0.5 0.5)">
                  <stop offset="0" stopColor="#FFFFFF" />
                  <stop offset="0.55" stopColor="#8FA8E4" />
                  <stop offset="1" stopColor="#1130A2" />
                </linearGradient>
              </defs>
              <circle className="classics-boot__ringTrack" cx="50" cy="50" r="46" pathLength="100" transform="rotate(-90 50 50)" />
              <circle className="classics-boot__ringFill" cx="50" cy="50" r="46" pathLength="100" transform="rotate(-90 50 50)" ref={bootRingRef} />
            </svg>
            {/* Title, caption and percentage now sit together INSIDE the ring, stacked and centred
                — by request, moved in from the bottom of the screen. Both readouts are sized from
                --ring like the title is, so the whole group scales with the circle instead of
                drifting out of proportion at some viewport. */}
            <div className="classics-boot__inner">
              <div
                className="classics-boot__title"
                style={{ animationDelay: `${BOOT_TITLE_DELAY_MS}ms`, animationDuration: `${BOOT_TITLE_FADE_MS}ms` }}
              >
                Classics
              </div>
              <p className="classics-boot__caption">Curating list of<br />archives for you</p>
            </div>
            {/* The percentage sits outside the stacked group but INSIDE the circle, low down near
                the bottom arc — by request. Absolutely positioned against the ring wrapper rather
                than placed in the flow, so it stays pinned there no matter how the title and
                caption above it change height.

                Starts at 00% rather than blank so the reveal never flashes an empty slot on a warm
                cache, where the first paint can already be most of the way through the load.
                The "%" used to be a separate, shrunken span: the TBJ *Demo* font drew it at 1.715x
                its own digit height, so inline it towered over the number. The licensed release
                draws it at 1.103x with a proper descender — i.e. designed to sit with the figures —
                so the correction is gone and the glyph is left as the type designer drew it. */}
            <span className="classics-boot__pct" ref={bootPctRef}>00%</span>
          </div>
        </div>
        {/* The bottom strip that held the caption, the percentage, the horizontal track, its fill
            and the star knob is gone entirely — all of it either moved inside the ring or was
            removed by request. */}
      </div>
    </div>

    <div ref={rootRef} className="classics-exp">

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
              {/* detail__textWrap: on mobile this becomes the REAL flex container that lets
                  .detail__body shrink and scroll within a bounded height (see the CSS comment on
                  .detail__textWrap) — without a class here (this used to be a bare <div>),
                  .detail__body's own flex/min-height/overflow rules were inert, since a flex item's
                  properties only take effect when its DIRECT parent is a flex container, and this
                  div was plain display:block. */}
              <div className="detail__textWrap">
                {/* badge + Instagram icon side by side (by request — "add instagram icon beside
                    the tag") — was its own row below the body; moving it up here frees that space
                    for .detail__body to grow into (see the "little down" request on the body). */}
                <div className="detail__badgeRow">
                  <span className="detail__badge" ref={detailGhostPrevBadgeRef} />
                  <a className="detail__ig" ref={detailGhostPrevIgRef} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="5" stroke="#111" strokeWidth="1.6" /><circle cx="12" cy="12" r="4.2" stroke="#111" strokeWidth="1.6" /><circle cx="17.3" cy="6.7" r="1.1" fill="#111" /></svg>
                  </a>
                </div>
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
              <div className="detail__textWrap">
                <div className="detail__badgeRow">
                  <span className="detail__badge" ref={detailBadgeRef} />
                  <a className="detail__ig" ref={detailIgRef} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="5" stroke="#111" strokeWidth="1.6" /><circle cx="12" cy="12" r="4.2" stroke="#111" strokeWidth="1.6" /><circle cx="17.3" cy="6.7" r="1.1" fill="#111" /></svg>
                  </a>
                </div>
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
              <div className="detail__textWrap">
                <div className="detail__badgeRow">
                  <span className="detail__badge" ref={detailGhostNextBadgeRef} />
                  <a className="detail__ig" ref={detailGhostNextIgRef} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="5" stroke="#111" strokeWidth="1.6" /><circle cx="12" cy="12" r="4.2" stroke="#111" strokeWidth="1.6" /><circle cx="17.3" cy="6.7" r="1.1" fill="#111" /></svg>
                  </a>
                </div>
                <div className="detail__body" ref={detailGhostNextBodyRef} />
              </div>
            </div>
          </div>

          <button type="button" className="detail__nav" ref={detailNextRef} aria-label="Next">
            <img src="/classics/icons/right-arrow.svg" alt="" width={20} height={18} />
          </button>
        </div>
      </div>

      {/* Mobile-only close affordance — rendered via a PORTAL straight into document.body, not as
          a plain descendant anywhere in this tree. Reason: position:fixed elements ALWAYS
          establish their own stacking context (true even with z-index:auto — this differs from
          position:absolute/relative, which only do that when z-index is explicitly set). Both
          .detail (explicit z-index:700) AND .classics-exp itself (position:fixed, z-index:auto)
          are such elements, so ANY descendant's z-index — this button was tried at up to 1300,
          first nested in .detail, then merely a sibling of it still inside .classics-exp — only
          ever ranks against its own siblings INSIDE that ancestor's local context. The whole
          .classics-exp subtree still only ever competes as a single unit against SiteNav's
          z-[1200] (components/shared/SiteNav.tsx, a totally separate fixed element elsewhere in
          the tree) — and loses, since .classics-exp itself has no z-index high enough to beat it.
          No descendant z-index can ever escape that. Portaling to document.body sidesteps the
          whole ancestor chain: this button now competes directly in the ROOT stacking context,
          where its z-index:1300 genuinely outranks SiteNav's 1200. Visibility is driven by the
          "detail-open" class openDetail/closeDetail already toggle on the root element (see
          rootRef) via the .classics-exp.detail-open selector in the CSS, since portaling moves
          this out from under .detail's own opacity/pointer-events toggle too. Tap-outside-to-close
          is disabled below 820px (see onDetailBackdropClick), and swipe-down-to-close has been
          removed by request, so on mobile this button is the ONLY way to dismiss the popup —
          worth knowing before changing anything about how it mounts or when it's visible.
          portalMounted guards against document.body being unavailable during SSR. */}
      {portalMounted && createPortal(
        <button type="button" className="detail__close" ref={detailCloseRef} aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 6L18 18M18 6L6 18" stroke="#111" strokeWidth="1.8" strokeLinecap="round" /></svg>
        </button>,
        document.body
      )}

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
            <a className="contact__book" href="https://calendly.com/sanjamthappa25/30min" target="_blank" rel="noopener noreferrer">
              <span className="contact__book-arrow"><svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 14L14 4M14 4H6M14 4V12" stroke="#111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
              <span className="contact__book-row">
                <svg width="26" height="26" viewBox="0 0 526 536" fill="none"><path d="M360.401 347.4C343.401 362.49 322.191 381.27 283.621 381.27H260.621C232.741 381.27 207.391 371.15 189.251 352.78C171.531 334.84 161.771 310.28 161.771 283.62V252.11C161.771 225.45 171.531 200.89 189.251 182.95C207.391 164.58 232.741 154.46 260.621 154.46H283.621C322.191 154.46 343.381 173.24 360.401 188.33C378.051 203.98 393.301 217.49 433.921 217.49C440.117 217.491 446.304 216.996 452.421 216.01C452.421 215.89 452.341 215.78 452.291 215.66C449.855 209.617 446.998 203.753 443.741 198.11L416.581 151.06C404.335 129.852 386.724 112.241 365.516 99.9952C344.308 87.75 320.25 81.3022 295.761 81.2998H241.431C216.942 81.3022 192.884 87.75 171.676 99.9952C150.468 112.241 132.857 129.852 120.611 151.06L93.451 198.11C81.2074 219.318 74.7617 243.376 74.7617 267.865C74.7617 292.354 81.2074 316.411 93.451 337.62L120.611 384.67C132.857 405.876 150.469 423.486 171.677 435.73C192.885 447.974 216.942 454.419 241.431 454.42H295.761C320.25 454.419 344.307 447.974 365.515 435.73C386.723 423.486 404.335 405.876 416.581 384.67L443.741 337.62C446.998 331.977 449.855 326.113 452.291 320.07C452.291 319.95 452.381 319.84 452.421 319.72C446.304 318.733 440.117 318.238 433.921 318.24C393.301 318.24 378.051 331.75 360.401 347.4Z" fill="#006BFF" /><path d="M283.62 183H260.62C218.2 183 190.32 213.3 190.32 252.09V283.6C190.32 322.39 218.2 352.69 260.62 352.69H283.62C345.44 352.69 340.62 289.69 433.92 289.69C442.766 289.683 451.593 290.49 460.29 292.1C463.12 276.071 463.12 259.669 460.29 243.64C451.594 245.259 442.766 246.069 433.92 246.06C340.59 246.05 345.44 183 283.62 183Z" fill="#006BFF" /><path d="M513.91 315.13C498.007 303.506 479.673 295.642 460.29 292.13C460.29 292.29 460.24 292.45 460.21 292.6C458.546 301.895 455.936 310.996 452.42 319.76C468.434 322.238 483.629 328.49 496.75 338C496.75 338.14 496.67 338.28 496.62 338.43C489.184 362.579 477.946 385.388 463.33 406C448.881 426.421 431.337 444.464 411.33 459.48C362.897 495.915 302.443 512.616 242.175 506.209C181.907 499.803 126.315 470.767 86.6242 424.964C46.9333 379.161 26.1006 320.003 28.3327 259.437C30.5648 198.871 55.6953 141.407 98.65 98.65C127.831 69.4906 164.052 48.3656 203.799 37.3232C243.547 26.2807 285.474 25.6954 325.514 35.6241C365.555 45.5527 402.35 65.6584 432.334 93.9918C462.318 122.325 484.473 157.925 496.65 197.34C496.7 197.49 496.74 197.63 496.78 197.77C483.65 207.281 468.444 213.53 452.42 216C455.935 224.772 458.548 233.879 460.22 243.18C460.22 243.33 460.22 243.48 460.29 243.62C479.676 240.117 498.011 232.252 513.91 220.62C529.2 209.31 526.24 196.53 523.91 188.97C490.22 79.52 388.33 0 267.86 0C119.93 0 0 119.93 0 267.86C0 415.79 119.93 535.73 267.86 535.73C388.33 535.73 490.22 456.21 523.86 346.79C526.24 339.23 529.2 326.45 513.91 315.13Z" fill="#006BFF" /><path d="M452.42 216C446.302 216.987 440.116 217.482 433.92 217.48C393.3 217.48 378.05 203.97 360.4 188.32C343.4 173.23 322.19 154.45 283.62 154.45H260.62C232.74 154.45 207.39 164.57 189.25 182.94C171.53 200.88 161.77 225.44 161.77 252.1V283.61C161.77 310.27 171.53 334.83 189.25 352.77C207.39 371.14 232.74 381.26 260.62 381.26H283.62C322.19 381.26 343.38 362.48 360.4 347.39C378.05 331.74 393.3 318.23 433.92 318.23C440.116 318.229 446.302 318.724 452.42 319.71C455.936 310.946 458.546 301.845 460.21 292.55C460.21 292.4 460.27 292.24 460.29 292.08C451.592 290.47 442.765 289.663 433.92 289.67C340.59 289.67 345.44 352.67 283.62 352.67H260.62C218.2 352.67 190.32 322.37 190.32 283.58V252.11C190.32 213.32 218.2 183.02 260.62 183.02H283.62C345.44 183.02 340.62 246.02 433.92 246.02C442.765 246.029 451.593 245.219 460.29 243.6C460.29 243.46 460.29 243.31 460.22 243.16C458.547 233.866 455.933 224.766 452.42 216Z" fill="#0AE9EF" /></svg>
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
    </>
  );
});
