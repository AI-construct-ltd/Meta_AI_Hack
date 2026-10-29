"use client";

import { useSyncExternalStore } from "react";

/** The person's own Gemini API key. It lives only in this browser and rides along with AI requests. */
const K = "aiconstruct:gemini-key";

export function getUserKey(): string {
  try {
    return localStorage.getItem(K) ?? localStorage.getItem("aiconstruct:together-key") ?? "";
  } catch {
    return "";
  }
}

export function setUserKey(v: string) {
  try {
    if (v) {
      localStorage.setItem(K, v.trim());
      localStorage.setItem("aiconstruct:together-key", v.trim());
    } else {
      localStorage.removeItem(K);
      localStorage.removeItem("aiconstruct:together-key");
    }
    window.dispatchEvent(new Event("aiconstruct:key"));
  } catch {
    /* storage blocked */
  }
}

export function keyHeaders(): Record<string, string> {
  const k = getUserKey();
  return k ? { "x-gemini-key": k, "x-together-key": k } : {};
}

export function subscribeKey(cb: () => void) {
  window.addEventListener("aiconstruct:key", cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener("aiconstruct:key", cb);
    window.removeEventListener("storage", cb);
  };
}

/** The saved key, kept in step across tabs; "" until the page is in the browser. */
export function useUserKey() {
  return useSyncExternalStore(subscribeKey, getUserKey, () => "");
}

/** Where to make a Google Gemini API key. */
export const KEY_URL = "https://aistudio.google.com/app/apikey";
