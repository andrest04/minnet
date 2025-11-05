"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Loader2, Lock, Shield } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { identifierType } from "@/lib/validations";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"user" | "admin">("user");

  // User login state
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Admin login state
  const [adminIdentifier, setAdminIdentifier] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");
  const [isAdminLoading, setIsAdminLoading] = useState(false);

  const handleUserLogin = async (e: React.FormEvent) => {
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
        resident: "/poblador",
        company: "/empresa",
        administrator: "/admin",
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

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError("");

    const type = identifierType(adminIdentifier);
    if (type === "invalid") {
      toast.error("Email o teléfono inválido");
      return;
    }

    if (!adminPassword) {
      toast.error("La contraseña es requerida");
      return;
    }

    setIsAdminLoading(true);

    try {
      const response = await fetch("/api/auth/login-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: adminIdentifier,
          password: adminPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setAdminError(data.error || "Error al iniciar sesión");
        toast.error(data.error || "Error al iniciar sesión");
        setIsAdminLoading(false);
        return;
      }

      if (data.user_type !== "administrator") {
        setAdminError("Esta cuenta no es de administrador");
        toast.error("Esta cuenta no es de administrador");
        setIsAdminLoading(false);
        return;
      }

      toast.success("Sesión iniciada como administrador");
      router.push("/admin");
    } catch (error) {
      console.error("Error:", error);
      setAdminError("Error de conexión");
      toast.error("Error de conexión");
      setIsAdminLoading(false);
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
            Selecciona tu tipo de cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "user" | "admin")}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="user">
                <User className="h-4 w-4 mr-2" />
                Poblador / Empresa
              </TabsTrigger>
              <TabsTrigger value="admin">
                <Shield className="h-4 w-4 mr-2" />
                Administrador
              </TabsTrigger>
            </TabsList>

            <TabsContent value="user">
              <form onSubmit={handleUserLogin} className="space-y-4">
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
            </TabsContent>

            <TabsContent value="admin">
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-identifier">Email o Teléfono</Label>
                  <Input
                    id="admin-identifier"
                    type="text"
                    placeholder="admin@example.com"
                    value={adminIdentifier}
                    onChange={(e) => setAdminIdentifier(e.target.value)}
                    disabled={isAdminLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-password">Contraseña</Label>
                  <PasswordInput
                    id="admin-password"
                    placeholder="••••••••"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    disabled={isAdminLoading}
                  />
                </div>

                {adminError && (
                  <p className="text-sm text-destructive">{adminError}</p>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isAdminLoading}
                >
                  {isAdminLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Iniciando sesión...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4" />
                      Iniciar sesión como Admin
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
