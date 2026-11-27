"use client";

import { useSyncExternalStore } from "react";

/**
 * The site's own animation switch. Animations play by default, even when the device says "reduce motion"
 * (they are gentle and decorative); a visitor can pause them with the toggle, which is remembered.
 * Name kept for the callers: `true` means "keep it still".
 */
const KEY = "motion";
const EVENT = "motionchange";

function read(): boolean {
  try {
    return localStorage.getItem(KEY) === "off";
  } catch {
    return false;
  }
}

export function setMotionOff(off: boolean) {
  try {
    localStorage.setItem(KEY, off ? "off" : "on");
  } catch {
    /* private mode: the choice just lasts for this page view */
  }
  document.documentElement.dataset.motion = off ? "off" : "on";
  window.dispatchEvent(new Event(EVENT));
}

export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener(EVENT, cb);
      window.addEventListener("storage", cb);
      return () => {
        window.removeEventListener(EVENT, cb);
        window.removeEventListener("storage", cb);
      };
    },
    read,
    () => false,
  );
}
