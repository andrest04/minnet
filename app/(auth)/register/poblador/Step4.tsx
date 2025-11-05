"use client";

import { useState } from "react";
import { Loader2, Lock } from "lucide-react";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { validatePassword } from "@/lib/validations";
import type { PobladorRegistrationData } from "@/lib/types";

interface Step4Props {
  updateFormData: (data: Partial<PobladorRegistrationData>) => void;
  onSubmit: (password?: string) => void;
  isSubmitting: boolean;
}

export const Step4 = ({
  updateFormData,
  onSubmit,
  isSubmitting,
}: Step4Props) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPasswordValid, setIsPasswordValid] = useState(false);

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

  const handleSubmit = () => {
    if (validate()) {
      updateFormData({ password });
      onSubmit(password);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-blue-900">
            Configura tu contraseña
          </h3>
        </div>
        <p className="text-sm text-blue-800">
          Establece una contraseña para acceder más rápido en el futuro. Ya no
          necesitarás códigos OTP cada vez que inicies sesión.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <PasswordInput
          id="password"
          placeholder="Crea una contraseña segura"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isSubmitting}
          showStrength
          onValidationChange={setIsPasswordValid}
          aria-invalid={!!errors.password}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
        <PasswordInput
          id="confirmPassword"
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

      <div className="flex items-center gap-2 pt-2">
        <Checkbox
          checked={rememberMe}
          onCheckedChange={(checked) => setRememberMe(checked === true)}
        />
        <Label
          htmlFor="remember"
          className="text-sm font-normal cursor-pointer"
        >
          Mantener mi sesión iniciada
        </Label>
      </div>

      <div className="pt-4">
        <Button
          className="w-full"
          size="lg"
          onClick={handleSubmit}
          disabled={
            isSubmitting || !isPasswordValid || password !== confirmPassword
          }
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Completando registro...
            </>
          ) : (
            "Completar registro"
          )}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Al completar el registro, aceptas nuestros términos y condiciones
      </p>
    </div>
  );
};
