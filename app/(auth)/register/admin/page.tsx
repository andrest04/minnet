"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, AlertTriangle, Shield, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { identifierType, validatePassword } from "@/lib/validations";
import { toast } from "sonner";

function RegisterAdminContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const secretFromUrl = searchParams.get("secret");

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [secretInput, setSecretInput] = useState("");

  // Verificar si la URL tiene la clave secreta correcta
  useEffect(() => {
    if (secretFromUrl) {
      setIsAuthorized(true);
    }
  }, [secretFromUrl]);

  const validateSecret = () => {
    if (!secretInput) {
      toast.error("Debes ingresar la clave secreta");
      return;
    }
    // Esta validación es solo visual, la real se hace en el servidor
    setIsAuthorized(true);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validar identificador
    if (!identifier.trim()) {
      newErrors.identifier = "Email o teléfono es requerido";
    } else {
      const type = identifierType(identifier);
      if (type === "invalid") {
        newErrors.identifier =
          "Ingresa un email válido o un teléfono de 9 dígitos que empiece con 9";
      }
    }

    // Validar nombre completo
    if (!fullName.trim()) {
      newErrors.fullName = "El nombre completo es requerido";
    } else if (fullName.trim().length < 3) {
      newErrors.fullName = "El nombre debe tener al menos 3 caracteres";
    }

    // Validar contraseña
    if (!password) {
      newErrors.password = "La contraseña es requerida";
    } else {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.errors.join(", ");
      }
    }

    // Validar confirmación de contraseña
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Por favor, completa todos los campos correctamente");
      return;
    }

    setIsSubmitting(true);

    try {
      const type = identifierType(identifier);
      const secret = secretFromUrl || secretInput;

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_type: "administrator",
          identifier: identifier.trim(),
          identifier_type: type,
          password,
          full_name: fullName.trim(),
          admin_secret: secret,
          consent_version: "1.0",
          consent_date: new Date().toISOString(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || "Error al registrar administrador";
        setErrors({ submit: errorMsg });
        toast.error(errorMsg);
        setIsSubmitting(false);
        return;
      }

      toast.success("Administrador registrado correctamente");

      // Limpiar datos guardados si existen
      localStorage.removeItem("admin_registration");

      // Iniciar sesión con las credenciales
      const loginResponse = await fetch("/api/auth/login-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password,
        }),
      });

      if (loginResponse.ok) {
        toast.success("Iniciando sesión...");
        setTimeout(() => {
          router.push("/admin");
        }, 1000);
      } else {
        toast.info("Registro exitoso. Por favor, inicia sesión.");
        router.push("/login");
      }
    } catch (error) {
      console.error("Error al registrar:", error);
      const errorMsg = "Error de conexión. Por favor, intenta nuevamente.";
      setErrors({ submit: errorMsg });
      toast.error(errorMsg);
      setIsSubmitting(false);
    }
  };

  // Pantalla de verificación de clave secreta
  if (!isAuthorized) {
    return (
      <div className="w-full">
        <Card className="border-border shadow-sm">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-foreground">
                  Acceso Restringido
                </CardTitle>
                <CardDescription className="text-base">
                  Esta página requiere autorización
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Para crear una cuenta de administrador, necesitas la clave
                secreta de registro. Esta clave se encuentra en el archivo de
                variables de entorno del servidor.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="secret">Clave Secreta</Label>
                <Input
                  id="secret"
                  type="password"
                  placeholder="Ingresa la clave secreta"
                  value={secretInput}
                  onChange={(e) => setSecretInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      validateSecret();
                    }
                  }}
                />
              </div>

              <Button className="w-full" size="lg" onClick={validateSecret}>
                Verificar Acceso
              </Button>

              <Button
                variant="ghost"
                className="w-full"
                onClick={() => router.push("/login")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al inicio
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Formulario de registro de administrador
  return (
    <div className="w-full">
      <Card className="border-border shadow-sm">
        <CardHeader className="space-y-1">
          <button
            onClick={() => router.push("/login")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </button>
          <div className="flex items-center gap-3 pt-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-foreground">
                Registro de Administrador
              </CardTitle>
              <CardDescription className="text-base">
                Crea tu cuenta de administrador
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email o Teléfono */}
            <div className="space-y-2">
              <Label htmlFor="identifier">Email o Teléfono *</Label>
              <Input
                id="identifier"
                type="text"
                placeholder="admin@empresa.com o 987654321"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                disabled={isSubmitting}
                className={errors.identifier ? "border-destructive" : ""}
              />
              {errors.identifier && (
                <p className="text-sm text-destructive">{errors.identifier}</p>
              )}
            </div>

            {/* Nombre Completo */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Nombre Completo *</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Ej: Juan Pérez"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isSubmitting}
                className={errors.fullName ? "border-destructive" : ""}
              />
              {errors.fullName && (
                <p className="text-sm text-destructive">{errors.fullName}</p>
              )}
            </div>

            {/* Contraseña */}
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña *</Label>
              <PasswordInput
                id="password"
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                className={errors.password ? "border-destructive" : ""}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
              <p className="text-xs text-muted-foreground">
                La contraseña debe tener al menos 8 caracteres, incluir
                mayúsculas, minúsculas y números
              </p>
            </div>

            {/* Confirmar Contraseña */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
              <PasswordInput
                id="confirmPassword"
                placeholder="Repite tu contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isSubmitting}
                className={errors.confirmPassword ? "border-destructive" : ""}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {errors.submit && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{errors.submit}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4" />
                  Crear Cuenta de Administrador
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function RegisterAdminPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <RegisterAdminContent />
    </Suspense>
  );
}
