// Is a Shop deep-link landing currently in progress — i.e. the nav/footer "Shop" flow that opens
// the Origins story and JUMPS the scroll position straight to it (see OriginsSection's `run`)?
//
// Why this exists: several sections between the hero and Origins deliberately FREEZE the page
// when the reader scrolls into them. RadiatesSection's entrance hold and ParagraphReveal's pin
// hold both call lenis.stop() (~1.65s and ~0.35s) so a fast flick can't skip their animation.
// That is correct for someone actually scrolling down — but the deep-link jumps the scroll
// position straight PAST those sections, and their triggers still fire on the way through. The
// holds then lock scrolling mid-jump, and Lenis additionally ignores any scrollTo while stopped
// (its `force` option defaults to false), so the queued corrective jumps silently no-op too.
// Net effect: the page appears to stall at each section on the way down instead of cutting
// straight to Origins. Those sections consult this flag to stand down for the duration.
//
// A plain module-level boolean rather than a sessionStorage read: the storage key that starts
// this flow is consumed and removed immediately by OriginsSection, whereas the holds above only
// reach their code much later (behind an async gsap import, then a scroll-trigger callback), so
// they would always read it too late. `begin` is called at the very start of the flow — before
// the jump that trips those triggers — which is what makes the ordering reliable.
let active = false;

export function isShopDeepLink(): boolean {
  return active;
}

// Called at the start of the Shop flow, covering BOTH ways it can begin: a full navigation from
// another page, and a click while already on the homepage (no remount, live event).
export function beginShopDeepLink(): void {
  active = true;
}

// Called once the landing has settled, so the rest of the session behaves normally.
export function endShopDeepLink(): void {
  active = false;
}
