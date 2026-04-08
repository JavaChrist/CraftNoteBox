"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useRef,
  type ReactNode,
} from "react";
import type { AiAction } from "@/lib/ai/types";

type Ctx = {
  runJavaChrist: (action: AiAction) => void;
  setRunner: (fn: (action: AiAction) => void) => void;
};

const JavaChristContext = createContext<Ctx | null>(null);

export function JavaChristProvider({ children }: { children: ReactNode }) {
  const runnerRef = useRef<(action: AiAction) => void>(() => {});

  const setRunner = useCallback((fn: (action: AiAction) => void) => {
    runnerRef.current = fn;
  }, []);

  const runJavaChrist = useCallback((action: AiAction) => {
    runnerRef.current(action);
  }, []);

  return (
    <JavaChristContext.Provider value={{ runJavaChrist, setRunner }}>
      {children}
    </JavaChristContext.Provider>
  );
}

export function useJavaChristController() {
  const ctx = useContext(JavaChristContext);
  if (!ctx) {
    throw new Error("JavaChristProvider manquant");
  }
  return ctx;
}

export function useRegisterJavaChristRunner(run: (action: AiAction) => void) {
  const { setRunner } = useJavaChristController();
  useLayoutEffect(() => {
    setRunner(run);
    return () => setRunner(() => {});
  }, [run, setRunner]);
}
