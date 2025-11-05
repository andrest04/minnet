"use client";

import { useState, useRef, useEffect } from "react";

export function useOTPInput(length = 6, onComplete?: (code: string) => void) {
  const [code, setCode] = useState<string[]>(Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newCode.every((digit) => digit !== "") && index === length - 1) {
      onComplete?.(newCode.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, length);

    if (/^\d+$/.test(pastedData)) {
      const newCode = pastedData
        .split("")
        .concat(Array(length).fill(""))
        .slice(0, length);
      setCode(newCode);

      const nextEmptyIndex = newCode.findIndex((digit) => digit === "");
      if (nextEmptyIndex !== -1) {
        inputRefs.current[nextEmptyIndex]?.focus();
      } else {
        onComplete?.(newCode.join(""));
      }
    }
  };

  const reset = () => {
    setCode(Array(length).fill(""));
    inputRefs.current[0]?.focus();
  };

  return {
    code,
    inputRefs,
    handleChange,
    handleKeyDown,
    handlePaste,
    reset,
  };
}
