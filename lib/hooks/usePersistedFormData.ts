"use client";

import { useState, useEffect } from "react";

export function usePersistedFormData<T extends Record<string, any>>(
  storageKey: string,
  initialData: T
) {
  const [data, setData] = useState<T>(() => {
    if (typeof window === "undefined") return initialData;

    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...initialData, ...parsed };
      } catch (error) {
        console.error("Error al cargar datos guardados:", error);
      }
    }
    return initialData;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(storageKey, JSON.stringify(data));
  }, [storageKey, data]);

  const clearData = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(storageKey);
  };

  return { data, setData, clearData };
}

export function usePersistedStep(storageKey: string, initialStep = 0) {
  const [step, setStep] = useState(() => {
    if (typeof window === "undefined") return initialStep;

    const savedStep = localStorage.getItem(storageKey);
    return savedStep ? parseInt(savedStep) : initialStep;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(storageKey, step.toString());
  }, [storageKey, step]);

  const clearStep = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(storageKey);
  };

  return { step, setStep, clearStep };
}
