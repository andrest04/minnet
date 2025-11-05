"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Loader2, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
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
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { identifierType } from "@/lib/validations";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const type = identifierType(identifier);

    if (type === "invalid") {
      const errorMsg =
        "Por favor, ingresa un email válido o un teléfono de 9 dígitos que empiece con 9";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    if (!password) {
      const errorMsg = "Por favor, ingresa tu contraseña";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || "Error al iniciar sesión";
        setError(errorMsg);
        toast.error(errorMsg);
        setIsLoading(false);
        return;
      }

      toast.success("Sesión iniciada correctamente");

      const redirectMap: Record<string, string> = {
        poblador: "/poblador",
        empresa: "/empresa",
        admin: "/admin",
      };

      router.push(redirectMap[data.user_type] || "/poblador");
    } catch (err) {
      console.error("Error al iniciar sesión:", err);
      const errorMsg = "Error de conexión. Por favor, intenta nuevamente.";
      setError(errorMsg);
      toast.error(errorMsg);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <Card className="border-border shadow-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-foreground">
            Iniciar sesión
          </CardTitle>
          <CardDescription className="text-base">
            Ingresa tus credenciales para acceder
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="identifier">Email o Teléfono</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="identifier"
                  type="text"
                  placeholder="ejemplo@correo.com o 987654321"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  disabled={isLoading}
                  className="pl-10"
                  aria-invalid={!!error}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <PasswordInput
                id="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                aria-invalid={!!error}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                />
                <Label
                  htmlFor="remember"
                  className="text-sm font-normal cursor-pointer"
                >
                  Mantener sesión iniciada
                </Label>
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  Iniciar sesión
                </>
              )}
            </Button>
          </form>

          <Separator className="my-6" />

          <p className="text-sm text-muted-foreground text-center">
            ¿No tienes cuenta?{" "}
            <button
              type="button"
              onClick={() => router.push("/signup")}
              className="text-primary font-semibold hover:underline"
            >
              Regístrate aquí
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
