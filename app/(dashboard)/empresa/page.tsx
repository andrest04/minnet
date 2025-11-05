"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  User,
  Briefcase,
  Clock,
  XCircle,
  Loader2,
  BarChart3,
  Mail,
  Phone,
  Target,
  Calendar,
} from "lucide-react";
import { useAuthenticatedUser } from "@/lib/hooks/useAuthenticatedUser";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Profile {
  id: string;
  company_name: string;
  responsible_area: string;
  position: string;
  validation_status: "pending" | "approved" | "rejected";
  use_objective?: string;
  consultation_frequency?: string;
  email?: string;
  phone?: string;
  user_type: string;
}

export default function EmpresaPage() {
  const router = useRouter();
  const { checkAuth } = useAuthenticatedUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch("/api/profile");
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error(data.error || "Error al cargar perfil");
      }

      if (data.success && data.profile) {
        // Verify user is company (API returns 'empresa' for backward compatibility)
        if (data.profile.user_type !== "empresa") {
          // Redirect based on user type
          const routeMap: Record<string, string> = {
            poblador: "/poblador",
            admin: "/admin",
          };
          router.push(routeMap[data.profile.user_type] || "/");
          return;
        }

        setProfile(data.profile);
      }
    } catch (error) {
      console.error("Error al cargar perfil:", error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const checkAuthAndLoadProfile = useCallback(async () => {
    const user = await checkAuth();
    if (user) {
      await fetchProfile();
    }
  }, [checkAuth, fetchProfile]);

  useEffect(() => {
    checkAuthAndLoadProfile();
  }, [checkAuthAndLoadProfile]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Cargando tu cuenta...</p>
        </div>
      </div>
    );
  }

  const isPending = profile?.validation_status === "pending";
  const isRejected = profile?.validation_status === "rejected";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Panel de Empresa</h1>
        <p className="text-muted-foreground">{profile?.company_name}</p>
      </div>

      {isPending && (
        <Alert className="border-amber-200 bg-amber-50">
          <Clock className="h-5 w-5 text-amber-600" />
          <AlertDescription className="text-sm text-amber-900">
            <span className="font-semibold block mb-1">Cuenta en Revisión</span>
            Tu cuenta está siendo revisada por un administrador. Recibirás
            acceso completo a los indicadores una vez que tu identidad sea
            verificada.
          </AlertDescription>
        </Alert>
      )}

      {isRejected && (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-5 w-5 text-red-600" />
          <AlertDescription className="text-sm text-red-900">
            <span className="font-semibold block mb-1">Cuenta Rechazada</span>
            Tu solicitud de acceso ha sido rechazada. Por favor, contacta al
            administrador para más información.
          </AlertDescription>
        </Alert>
      )}

      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <CardTitle>Información de tu Cuenta</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Empresa</p>
                <p className="font-semibold text-foreground">
                  {profile?.company_name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Cargo</p>
                <p className="font-semibold text-foreground">
                  {profile?.position === "gerente_social"
                    ? "Gerente de Responsabilidad Social"
                    : profile?.position === "gestion_social"
                    ? "Gestión Social"
                    : profile?.position === "conflictos"
                    ? "Resolución de Conflictos"
                    : profile?.position === "analista"
                    ? "Analista"
                    : profile?.position === "otro"
                    ? "Otro"
                    : profile?.position || "No especificado"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Área Responsable</p>
                <p className="font-semibold text-foreground">
                  {profile?.responsible_area === "gerencia_general_proyecto"
                    ? "Gerencia General del Proyecto"
                    : profile?.responsible_area === "gerencia_relaciones_sociales"
                    ? "Gerencia de Relaciones Sociales"
                    : profile?.responsible_area === "otro"
                    ? "Otro"
                    : profile?.responsible_area || "No especificado"}
                </p>
              </div>
            </div>

            {profile?.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-semibold text-foreground">
                    {profile.email}
                  </p>
                </div>
              </div>
            )}

            {profile?.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Teléfono</p>
                  <p className="font-semibold text-foreground">
                    {profile.phone}
                  </p>
                </div>
              </div>
            )}

            {profile?.use_objective && (
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Objetivo de Uso</p>
                  <p className="font-semibold text-foreground">
                    {profile.use_objective === "percepciones"
                      ? "Monitoreo de Percepciones"
                      : profile.use_objective === "estrategias"
                      ? "Desarrollo de Estrategias"
                      : profile.use_objective === "reportes"
                      ? "Generación de Reportes"
                      : profile.use_objective === "riesgos"
                      ? "Gestión de Riesgos"
                      : profile.use_objective === "otro"
                      ? "Otro"
                      : profile.use_objective}
                  </p>
                </div>
              </div>
            )}

            {profile?.consultation_frequency && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Frecuencia de Consulta</p>
                  <p className="font-semibold text-foreground">
                    {profile.consultation_frequency === "semanal"
                      ? "Semanal"
                      : profile.consultation_frequency === "quincenal"
                      ? "Quincenal"
                      : profile.consultation_frequency === "mensual"
                      ? "Mensual"
                      : profile.consultation_frequency === "trimestral"
                      ? "Trimestral"
                      : profile.consultation_frequency}
                  </p>
                </div>
              </div>
            )}

            <div className="md:col-span-2">
              <p className="text-sm text-muted-foreground mb-2">
                Estado de la Cuenta
              </p>
              <Badge
                variant={
                  isPending
                    ? "secondary"
                    : isRejected
                    ? "destructive"
                    : "default"
                }
                className={
                  isPending
                    ? "bg-amber-100 text-amber-900 hover:bg-amber-200"
                    : ""
                }
              >
                {isPending
                  ? "Pendiente"
                  : isRejected
                  ? "Rechazada"
                  : "Aprobada"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {!isPending && !isRejected && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Indicadores y Reportes</CardTitle>
            <CardDescription>
              Métricas estratégicas de las comunidades asociadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <BarChart3 className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">
                No hay indicadores disponibles
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Esta sección mostrará los indicadores estratégicos de las
                comunidades asociadas a tus proyectos asignados.
              </p>
              <p className="text-xs text-muted-foreground mt-2 bg-blue-50 px-3 py-2 rounded-md border border-blue-100">
                El sistema está en fase de recolección de datos.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
