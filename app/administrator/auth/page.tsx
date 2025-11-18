"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Loader2, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { identifierType, validatePassword } from "@/lib/validations";
import { toast } from "sonner";

export default function AdminAuthPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // Login state
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Register state
  const [registerIdentifier, setRegisterIdentifier] = useState("");
  const [registerFullName, setRegisterFullName] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const type = identifierType(loginIdentifier);
    if (type === "invalid") {
      toast.error("Email o teléfono inválido");
      return;
    }

    if (!loginPassword) {
      toast.error("La contraseña es requerida");
      return;
    }

    setIsLoggingIn(true);

    try {
      const response = await fetch("/api/auth/login-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: loginIdentifier.trim(),
          password: loginPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Error al iniciar sesión");
        setIsLoggingIn(false);
        return;
      }

      // Verificar que el usuario es administrador
      if (data.user_type !== "administrator") {
        toast.error("Esta página es solo para administradores");
        setIsLoggingIn(false);
        return;
      }

      toast.success("Sesión iniciada correctamente");
      router.push("/administrator");
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      toast.error("Error de conexión");
      setIsLoggingIn(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    const type = identifierType(registerIdentifier);
    if (type === "invalid") {
      toast.error("Email o teléfono inválido");
      return;
    }

    if (!registerFullName.trim() || registerFullName.trim().length < 3) {
      toast.error("El nombre debe tener al menos 3 caracteres");
      return;
    }

    const passwordValidation = validatePassword(registerPassword);
    if (!passwordValidation.isValid) {
      toast.error(passwordValidation.errors.join(", "));
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    setIsRegistering(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_type: "administrator",
          identifier: registerIdentifier.trim(),
          identifier_type: type,
          password: registerPassword,
          full_name: registerFullName.trim(),
          consent_version: "1.0",
          consent_date: new Date().toISOString(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Error al registrar");
        setIsRegistering(false);
        return;
      }

      toast.success("Administrador registrado correctamente");

      // Iniciar sesión automáticamente
      const loginResponse = await fetch("/api/auth/login-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: registerIdentifier.trim(),
          password: registerPassword,
        }),
      });

      if (loginResponse.ok) {
        toast.success("Iniciando sesión...");
        setTimeout(() => {
          router.push("/administrator");
        }, 1000);
      } else {
        toast.info("Registro exitoso. Por favor, inicia sesión.");
        setActiveTab("login");
        setLoginIdentifier(registerIdentifier);
        setIsRegistering(false);
      }
    } catch (error) {
      console.error("Error al registrar:", error);
      toast.error("Error de conexión");
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        <Card className="border-border shadow-lg">
          <CardHeader className="space-y-1">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al inicio
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-foreground">
                  Panel de Administración
                </CardTitle>
                <CardDescription className="text-base">
                  Inicia sesión o crea tu cuenta
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "register")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                <TabsTrigger value="register">Registrarse</TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-identifier">Email o Teléfono</Label>
                    <Input
                      id="login-identifier"
                      type="text"
                      placeholder="admin@empresa.com o 987654321"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      disabled={isLoggingIn}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Contraseña</Label>
                    <PasswordInput
                      id="login-password"
                      placeholder="Ingresa tu contraseña"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      disabled={isLoggingIn}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isLoggingIn}
                  >
                    {isLoggingIn ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Iniciando sesión...
                      </>
                    ) : (
                      "Iniciar Sesión"
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register" className="space-y-4">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-identifier">Email o Teléfono</Label>
                    <Input
                      id="register-identifier"
                      type="text"
                      placeholder="admin@empresa.com o 987654321"
                      value={registerIdentifier}
                      onChange={(e) => setRegisterIdentifier(e.target.value)}
                      disabled={isRegistering}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-fullname">Nombre Completo</Label>
                    <Input
                      id="register-fullname"
                      type="text"
                      placeholder="Ej: Juan Pérez"
                      value={registerFullName}
                      onChange={(e) => setRegisterFullName(e.target.value)}
                      disabled={isRegistering}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">Contraseña</Label>
                    <PasswordInput
                      id="register-password"
                      placeholder="Mínimo 8 caracteres"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      disabled={isRegistering}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Mínimo 8 caracteres, incluir mayúsculas, minúsculas y números
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-confirm">Confirmar Contraseña</Label>
                    <PasswordInput
                      id="register-confirm"
                      placeholder="Repite tu contraseña"
                      value={registerConfirmPassword}
                      onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                      disabled={isRegistering}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isRegistering}
                  >
                    {isRegistering ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Creando cuenta...
                      </>
                    ) : (
                      "Crear Cuenta"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
