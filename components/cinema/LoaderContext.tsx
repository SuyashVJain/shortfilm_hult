"use client";

import { useSyncExternalStore } from "react";

/*
 * Loader state lives on <html data-loader="off">. The boot script sets it
 * before first paint when the loader is skipped; the loader sets it on exit.
 * Reading it through useSyncExternalStore keeps hydration consistent: the
 * server snapshot is "not done", the client re-renders with the real value.
 */

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-loader"] });
  return () => observer.disconnect();
}

const getSnapshot = () => document.documentElement.dataset.loader === "off";
const getServerSnapshot = () => false;

/** True once the loader has exited or was skipped. */
export function useLoaderDone() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Marks the loader finished: releases the scroll lock and starts page entrances. */
export function finishLoader() {
  document.documentElement.dataset.loader = "off";
}

/** Page wrapper: hidden from assistive tech while the loader is up. */
export function PageShell({ children }: { children: React.ReactNode }) {
  const done = useLoaderDone();
  return (
    <div aria-hidden={done ? undefined : true} inert={!done}>
      {children}
    </div>
  );
}
