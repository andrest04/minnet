"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { validateOTP } from "@/lib/validations";
import { toast } from "sonner";

function VerifyOTPContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const identifier = searchParams.get("identifier");
  const type = searchParams.get("type");

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutos en segundos
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!identifier || !type) {
      router.push("/login");
    }
  }, [identifier, type, router]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;

    const intervalId = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(intervalId);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft]);

  useEffect(() => {
    // Auto-focus en el primer input
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    // Solo permitir dígitos
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError("");

    // Auto-focus en el siguiente input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit cuando se completen los 6 dígitos
    if (newCode.every((digit) => digit !== "") && index === 5) {
      handleVerify(newCode.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);

    if (/^\d+$/.test(pastedData)) {
      const newCode = pastedData
        .split("")
        .concat(Array(6).fill(""))
        .slice(0, 6);
      setCode(newCode);
      setError("");

      // Focus en el último input completado
      const nextEmptyIndex = newCode.findIndex((digit) => digit === "");
      if (nextEmptyIndex !== -1) {
        inputRefs.current[nextEmptyIndex]?.focus();
      } else {
        handleVerify(newCode.join(""));
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const handleVerify = async (codeToVerify?: string) => {
    const otpCode = codeToVerify || code.join("");

    if (!validateOTP(otpCode)) {
      setError("Por favor, completa los 6 dígitos");
      return;
    }

    if (timeLeft === 0) {
      setError("El código ha expirado. Por favor, solicita uno nuevo.");
      toast.error("El código ha expirado");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier,
          code: otpCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || "Error al verificar código";
        setError(errorMsg);
        toast.error(errorMsg);
        setIsLoading(false);
        setCode(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        return;
      }

      // Si el usuario existe, redirigir al dashboard según su tipo
      // La sesión se gestiona automáticamente con cookies HTTP-only de Supabase
      if (data.user_exists) {
        // Redirigir según el tipo de usuario
        if (data.user_type === "administrator") {
          router.push("/administrator");
        } else if (data.user_type === "company") {
          router.push("/company");
        } else {
          router.push("/resident");
        }
      } else {
        // Si no existe, redirigir al registro
        router.push(
          `/register?identifier=${encodeURIComponent(identifier!)}&type=${type}`
        );
      }
    } catch (err) {
      console.error("Error al verificar OTP:", err);
      const errorMsg = "Error de conexión. Por favor, intenta nuevamente.";
      setError(errorMsg);
      toast.error(errorMsg);
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setError("");

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || "Error al reenviar código";
        setError(errorMsg);
        toast.error(errorMsg);
        setIsResending(false);
        return;
      }

      // Limpiar código, reiniciar timer y mostrar mensaje de éxito
      setCode(["", "", "", "", "", ""]);
      setTimeLeft(300); // Reiniciar a 5 minutos
      inputRefs.current[0]?.focus();
      toast.success("Código reenviado correctamente");
    } catch (err) {
      console.error("Error al reenviar OTP:", err);
      const errorMsg = "Error de conexión. Por favor, intenta nuevamente.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <Card className="border-border shadow-sm">
        <CardHeader className="space-y-1">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </button>
          <CardTitle className="text-2xl font-bold text-foreground pt-4">
            Verificar código
          </CardTitle>
          <CardDescription className="text-base">
            Ingresa el código de 6 dígitos enviado a{" "}
            <span className="font-medium text-foreground">
              {type === "email" ? "tu email" : "tu teléfono"}
            </span>
          </CardDescription>

          {/* Timer visual */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <div
              className={`text-sm font-medium ${
                timeLeft === 0
                  ? "text-destructive"
                  : timeLeft < 60
                  ? "text-warning"
                  : "text-muted-foreground"
              }`}
            >
              {timeLeft === 0 ? (
                "Código expirado"
              ) : (
                <>
                  Tiempo restante:{" "}
                  <span className="font-mono">{formatTime(timeLeft)}</span>
                </>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Inputs de OTP */}
          <div className="flex gap-3 justify-center" onPaste={handlePaste}>
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={isLoading}
                className={`w-12 h-14 text-center text-2xl font-bold rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
                  error
                    ? "border-destructive"
                    : digit
                    ? "border-primary bg-primary/5"
                    : "border-border"
                } ${isLoading ? "opacity-60 cursor-not-allowed" : ""}`}
              />
            ))}
          </div>

          {error && (
            <p className="text-sm text-destructive text-center flex items-center justify-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {error}
            </p>
          )}

          <Button
            className="w-full"
            size="lg"
            onClick={() => handleVerify()}
            disabled={code.some((digit) => digit === "") || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Verificando...
              </>
            ) : (
              "Verificar código"
            )}
          </Button>

          <div className="text-center">
            <button
              onClick={handleResend}
              disabled={isResending}
              className="text-sm text-primary font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending
                ? "Reenviando..."
                : "¿No recibiste el código? Reenviar"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <VerifyOTPContent />
    </Suspense>
  );
}
