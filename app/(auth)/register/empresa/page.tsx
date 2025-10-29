"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Check, Loader2, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CustomSelect as Select } from "@/components/ui/select";
import { CustomCheckbox as Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  COMPANY_POSITIONS,
  USE_OBJECTIVES,
  CONSULTATION_FREQUENCIES,
  EXPORT_FORMATS,
  validateCorporateEmail,
} from "@/lib/validations";
import type { EmpresaRegistrationData } from "@/lib/types";
import { toast } from "sonner";

function RegisterEmpresaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const identifier = searchParams.get("identifier");
  const type = searchParams.get("type");

  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [formData, setFormData] = useState<Partial<EmpresaRegistrationData>>({
    identifier: identifier || "",
    assigned_projects: [],
  });
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!identifier) {
      router.push("/login");
    } else if (!validateCorporateEmail(identifier)) {
      toast.error("Debes usar un email corporativo (no Gmail, Hotmail, etc.)");
      router.push("/login");
    }
  }, [identifier, router]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("/api/projects");
        const data = await response.json();
        if (data.success) {
          setProjects(data.data);
        }
      } catch (error) {
        console.error("Error al cargar proyectos:", error);
      }
    };

    fetchProjects();
  }, []);

  const toggleProject = (projectId: string) => {
    const current = formData.assigned_projects || [];
    const updated = current.includes(projectId)
      ? current.filter((p) => p !== projectId)
      : [...current, projectId];
    setFormData({ ...formData, assigned_projects: updated });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name?.trim())
      newErrors.full_name = "Ingresa tu nombre completo";
    if (!formData.company_name?.trim())
      newErrors.company_name = "Ingresa el nombre de la empresa";
    if (!formData.position) newErrors.position = "Selecciona tu cargo";
    if (
      !formData.assigned_projects ||
      formData.assigned_projects.length === 0
    ) {
      newErrors.assigned_projects = "Selecciona al menos un proyecto";
    }
    if (!consent)
      newErrors.consent = "Debes aceptar la declaración de veracidad";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          identifier_type: type,
          user_type: "empresa",
          consent_version: "1.0",
          consent_date: new Date().toISOString(),
          consent: consent,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || "Error al registrar";
        toast.error(errorMsg);
        setIsSubmitting(false);
        return;
      }

      // La sesión se gestiona automáticamente con cookies HTTP-only de Supabase

      toast.success(
        "Registro exitoso. Tu cuenta será revisada por un administrador."
      );
      router.push("/empresa");
    } catch (error) {
      console.error("Error al registrar:", error);
      toast.error("Error de conexión. Intenta nuevamente.");
      setIsSubmitting(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <Card className="border-border shadow-sm">
        <CardHeader className="space-y-1">
          <button
            onClick={() => router.push("/login")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </button>
          <CardTitle className="text-2xl font-bold text-foreground pt-4">
            Registro de Empresa
          </CardTitle>
          <CardDescription className="text-base">
            Completa tu información corporativa para acceder a los indicadores
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sección: Información Básica */}
            <div>
              <h3 className="text-base font-semibold text-foreground mb-4">
                Información Básica
              </h3>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Nombre Completo <span className="text-destructive">*</span>
                  </label>
              <Input
                placeholder="Ej: Juan Pérez García"
                value={formData.full_name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
              />
              {errors.full_name && (
                <p className="mt-1 text-sm text-destructive">
                  {errors.full_name}
                </p>
              )}
            </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Empresa / Institución <span className="text-destructive">*</span>
                  </label>
              <Input
                placeholder="Ej: Minera Las Bambas S.A."
                value={formData.company_name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, company_name: e.target.value })
                }
              />
              {errors.company_name && (
                <p className="mt-1 text-sm text-destructive">
                  {errors.company_name}
                </p>
              )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Cargo <span className="text-destructive">*</span>
                  </label>
              <Select
                placeholder="Selecciona tu cargo"
                value={formData.position || ""}
                onChange={(value) =>
                  setFormData({ ...formData, position: value })
                }
                options={COMPANY_POSITIONS}
              />
              {errors.position && (
                <p className="mt-1 text-sm text-destructive">
                  {errors.position}
                </p>
              )}
                </div>
              </div>
            </div>

            {/* Sección: Proyectos Asignados */}
            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-foreground">
                  Proyectos Asignados <span className="text-destructive">*</span>
                </h3>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                  {formData.assigned_projects?.length || 0} seleccionado{(formData.assigned_projects?.length || 0) !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="space-y-2">
                {projects.map((project) => (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() => toggleProject(project.id)}
                    className={`w-full px-4 py-3 rounded-lg text-left transition-all duration-200 flex items-center gap-3 ${
                      formData.assigned_projects?.includes(project.id)
                        ? "bg-primary/10 border-2 border-primary"
                        : "bg-muted border-2 border-transparent hover:border-border"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                        formData.assigned_projects?.includes(project.id)
                          ? "bg-primary border-primary"
                          : "border-border"
                      }`}
                    >
                      {formData.assigned_projects?.includes(project.id) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <span className="text-sm font-medium">{project.name}</span>
                  </button>
                ))}
              </div>
              {errors.assigned_projects && (
                <p className="mt-2 text-sm text-destructive">
                  {errors.assigned_projects}
                </p>
              )}
            </div>

            {/* Sección: Preferencias */}
            <div className="pt-4 border-t border-border">
              <h3 className="text-base font-semibold text-foreground mb-4">
                Preferencias <span className="text-xs text-muted-foreground font-normal">(Opcional)</span>
              </h3>

              <div className="space-y-4">
                <Select
                  label="Objetivo de uso"
                  placeholder="Selecciona una opción"
                  value={formData.use_objective || ""}
                  onChange={(value) =>
                    setFormData({ ...formData, use_objective: value })
                  }
                  options={USE_OBJECTIVES}
                />

                <Select
                  label="Frecuencia de consulta esperada"
                  placeholder="Selecciona una opción"
                  value={formData.consultation_frequency || ""}
                  onChange={(value) =>
                    setFormData({ ...formData, consultation_frequency: value })
                  }
                  options={CONSULTATION_FREQUENCIES}
                />

                <Select
                  label="Formato preferido de exportación"
                  placeholder="Selecciona una opción"
                  value={formData.export_format || ""}
                  onChange={(value) =>
                    setFormData({ ...formData, export_format: value })
                  }
                  options={EXPORT_FORMATS}
                />
              </div>
            </div>

            {/* Sección: Consentimiento */}
            <div className="pt-4 border-t border-border">
              <h3 className="text-base font-semibold text-foreground mb-4">
                Consentimiento <span className="text-destructive">*</span>
              </h3>
              <Checkbox
                label={
                  <span className="text-sm">
                    Declaro que la información proporcionada es verídica y me
                    comprometo a usar esta plataforma de forma responsable y
                    ética, respetando los derechos de las comunidades.
                  </span>
                }
                checked={consent}
                onChange={setConsent}
                error={errors.consent}
              />
            </div>

            <Alert className="border-amber-200 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-sm text-amber-800">
                Tu cuenta será revisada por un administrador antes de ser
                aprobada. Recibirás acceso completo una vez verificada tu
                identidad.
              </AlertDescription>
            </Alert>

            <Button
              className="w-full"
              size="lg"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                "Completar registro"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function RegisterEmpresaPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <RegisterEmpresaContent />
    </Suspense>
  );
}
