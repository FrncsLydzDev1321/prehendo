"use client";
// React hook around localStorage progress (useSyncExternalStore keeps
// every component in sync and avoids hydration mismatches).
import { useSyncExternalStore } from "react";
import { EMPTY_PROGRESS, loadProgress, saveProgress, type Progress } from "@/lib/progress";

let cache: Progress | null = null;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): Progress {
  cache ??= loadProgress();
  return cache;
}

const getServerSnapshot = () => EMPTY_PROGRESS;

export function setProgress(p: Progress) {
  cache = p;
  saveProgress(p);
  listeners.forEach((l) => l());
}

export function useProgress(): Progress {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

const noop = () => () => {};
/** true once we're running in the browser (after hydration). */
export function useHydrated(): boolean {
  return useSyncExternalStore(noop, () => true, () => false);
}
