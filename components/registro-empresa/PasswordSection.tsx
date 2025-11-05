import { Lock } from "lucide-react";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { CustomCheckbox as Checkbox } from "@/components/ui/checkbox";

interface PasswordSectionProps {
  password: string;
  confirmPassword: string;
  rememberMe: boolean;
  errors: {
    password?: string;
    confirmPassword?: string;
  };
  isSubmitting: boolean;
  onPasswordChange: (password: string) => void;
  onConfirmPasswordChange: (confirmPassword: string) => void;
  onRememberMeChange: (rememberMe: boolean) => void;
}

export default function PasswordSection({
  password,
  confirmPassword,
  rememberMe,
  errors,
  isSubmitting,
  onPasswordChange,
  onConfirmPasswordChange,
  onRememberMeChange,
}: PasswordSectionProps) {
  return (
    <div className="pt-4 border-t border-border">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Lock className="h-5 w-5 text-blue-600" />
          <h3 className="text-base font-semibold text-blue-900">
            Configura tu contraseña <span className="text-destructive">*</span>
          </h3>
        </div>
        <p className="text-sm text-blue-800">
          Establece una contraseña para acceder más rápido en el futuro. Ya no
          necesitarás códigos OTP cada vez que inicies sesión.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="password">Contraseña</Label>
          <PasswordInput
            id="password"
            placeholder="Crea una contraseña segura"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            disabled={isSubmitting}
            showStrength
            aria-invalid={!!errors.password}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-destructive">{errors.password}</p>
          )}
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
          <PasswordInput
            id="confirmPassword"
            placeholder="Vuelve a ingresar tu contraseña"
            value={confirmPassword}
            onChange={(e) => onConfirmPasswordChange(e.target.value)}
            disabled={isSubmitting}
            aria-invalid={!!errors.confirmPassword}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-destructive">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Checkbox checked={rememberMe} onChange={onRememberMeChange} />
          <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
            Mantener mi sesión iniciada
          </Label>
        </div>
      </div>
    </div>
  );
}
