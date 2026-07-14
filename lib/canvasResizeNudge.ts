"use client";

let rafScheduled = false;
let timeoutScheduled = false;

export function nudgeCanvasResize() {
  if (!rafScheduled) {
    rafScheduled = true;
    requestAnimationFrame(() => {
      window.dispatchEvent(new Event("resize"));
      rafScheduled = false;
    });
  }
  if (!timeoutScheduled) {
    timeoutScheduled = true;
    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
      timeoutScheduled = false;
    }, 150);
  }
}
