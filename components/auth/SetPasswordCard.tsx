"use client";

import { useState } from "react";
import { Lock, Loader2, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { validatePassword } from "@/lib/validations";
import { toast } from "sonner";

export function SetPasswordCard() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordSet, setIsPasswordSet] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!password) {
      newErrors.password = "La contraseña es requerida";
    } else {
      const validation = validatePassword(password);
      if (!validation.isValid) {
        newErrors.password = validation.errors[0];
      }
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Debes confirmar tu contraseña";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || "Error al establecer contraseña";
        toast.error(errorMsg);
        setIsSubmitting(false);
        return;
      }

      toast.success("Contraseña configurada correctamente");
      setIsPasswordSet(true);
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error al establecer contraseña:", error);
      toast.error("Error de conexión. Intenta nuevamente.");
      setIsSubmitting(false);
    }
  };

  if (isPasswordSet) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <CardTitle className="text-green-900">Contraseña Configurada</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-green-800">
            Tu contraseña ha sido configurada exitosamente. Ahora puedes iniciar sesión con tu email/teléfono y contraseña sin necesidad de códigos OTP.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-amber-600" />
          <CardTitle className="text-amber-900">Configurar Contraseña</CardTitle>
        </div>
        <CardDescription className="text-amber-800">
          Establece una contraseña para acceder más rápido en el futuro. Ya no necesitarás códigos OTP cada vez que inicies sesión.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">Nueva Contraseña</Label>
            <PasswordInput
              id="new-password"
              placeholder="Crea una contraseña segura"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              showStrength
              aria-invalid={!!errors.password}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-new-password">Confirmar Contraseña</Label>
            <PasswordInput
              id="confirm-new-password"
              placeholder="Vuelve a ingresar tu contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isSubmitting}
              aria-invalid={!!errors.confirmPassword}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Configurando...
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                Configurar Contraseña
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
