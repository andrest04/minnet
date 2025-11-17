"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);
  const [passwordValid, setPasswordValid] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        setIsValidSession(true);
      } else {
        setIsValidSession(false);
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsValidSession(true);
      } else if (event === "SIGNED_OUT") {
        setIsValidSession(false);
      } else if (session) {
        setIsValidSession(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordValid) {
      toast.error("La contraseña no cumple con los requisitos de seguridad");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Error al actualizar la contraseña");
        setIsLoading(false);
        return;
      }

      toast.success("Contraseña actualizada correctamente. Ya puedes iniciar sesión.");

      const supabase = createClient();
      await supabase.auth.signOut();

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err) {
      console.error("Error al actualizar contraseña:", err);
      toast.error("Error de conexión. Por favor, intenta nuevamente.");
      setIsLoading(false);
    }
  };

  if (isValidSession === null) {
    return (
      <div className="w-full space-y-6">
        <Card className="border-border shadow-sm">
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isValidSession === false) {
    return (
      <div className="w-full space-y-6">
        <Card className="border-border shadow-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-foreground">
              Enlace inválido o expirado
            </CardTitle>
            <CardDescription className="text-base">
              El enlace de recuperación no es válido o ha expirado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Por favor, solicita un nuevo enlace de recuperación desde la página de inicio de sesión.
            </p>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => router.push("/login")}
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al inicio de sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <Card className="border-border shadow-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-foreground">
            Nueva contraseña
          </CardTitle>
          <CardDescription className="text-base">
            Ingresa tu nueva contraseña
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nueva Contraseña</Label>
              <PasswordInput
                id="password"
                placeholder="Ingresa tu nueva contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                showStrength={true}
                onValidationChange={(isValid) => setPasswordValid(isValid)}
              />
              <p className="text-xs text-muted-foreground">
                Mínimo 8 caracteres, debe incluir mayúsculas, minúsculas y números
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <PasswordInput
                id="confirmPassword"
                placeholder="Confirma tu nueva contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  Las contraseñas no coinciden
                </p>
              )}
              {confirmPassword && password === confirmPassword && (
                <p className="text-xs text-success flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Las contraseñas coinciden
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading || !passwordValid || password !== confirmPassword}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Actualizando...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  Actualizar contraseña
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
