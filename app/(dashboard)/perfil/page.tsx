'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ResidentProfileForm } from '@/components/perfil/ResidentProfileForm';
import { CompanyProfileForm } from '@/components/perfil/CompanyProfileForm';
import { AdministratorProfileForm } from '@/components/perfil/AdministratorProfileForm';
import { toast } from 'sonner';

export default function ProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [originalData, setOriginalData] = useState<Record<string, unknown>>({});
  const [region, setRegion] = useState<{ id: string; name: string } | null>(null);
  const [project, setProject] = useState<{ id: string; name: string } | null>(null);
  const [assignedProjects, setAssignedProjects] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/profile');
        const data = await response.json();

        if (!response.ok) {
          toast.error(data.error || 'Error al cargar el perfil');
          return;
        }

        setFormData(data.profile);
        setOriginalData(data.profile);

        if (data.region) {
          setRegion(data.region);
        }

        if (data.project) {
          setProject(data.project);
        }

        if (data.profile.assigned_projects_details) {
          setAssignedProjects(data.profile.assigned_projects_details);
        }
      } catch (error) {
        console.error('Error al cargar perfil:', error);
        toast.error('Error de conexión. Por favor, intenta nuevamente.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleFieldChange = (field: string, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const userType = formData.user_type as string;

    if (!userType) {
      toast.error('No se pudo determinar el tipo de usuario');
      return;
    }

    let fieldsToUpdate: string[] = [];

    if (userType === 'poblador' || userType === 'resident') {
      fieldsToUpdate = [
        'age_range',
        'education_level',
        'gender',
        'profession',
        'employment_status',
        'trust_level',
        'junta_link',
        'junta_relationship',
        'topics_interest',
        'knowledge_level',
        'participation_willingness',
      ];
    } else if (userType === 'empresa' || userType === 'company') {
      fieldsToUpdate = [
        'company_name',
        'position',
        'responsible_area',
        'use_objective',
        'consultation_frequency',
      ];
    } else if (userType === 'admin' || userType === 'administrator') {
      fieldsToUpdate = ['full_name'];
    }

    const updatePayload: Record<string, unknown> = {};
    let hasChanges = false;

    fieldsToUpdate.forEach((field) => {
      if (JSON.stringify(formData[field]) !== JSON.stringify(originalData[field])) {
        updatePayload[field] = formData[field];
        hasChanges = true;
      }
    });

    if (!hasChanges) {
      toast.info('No hay cambios para guardar');
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Error al actualizar el perfil');
        setIsSaving(false);
        return;
      }

      toast.success('Perfil actualizado correctamente');
      setOriginalData(formData);
      setIsSaving(false);
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      toast.error('Error de conexión. Por favor, intenta nuevamente.');
      setIsSaving(false);
    }
  };

  const userType = formData.user_type as string;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getTitle = () => {
    if (userType === 'poblador' || userType === 'resident') return 'Perfil de Poblador';
    if (userType === 'empresa' || userType === 'company') return 'Perfil de Empresa';
    if (userType === 'admin' || userType === 'administrator') return 'Perfil de Administrador';
    return 'Mi Perfil';
  };

  const getDescription = () => {
    return 'Actualiza tu información personal. Los campos marcados con fondo gris no se pueden modificar.';
  };

  return (
    <div className="container max-w-5xl py-8 px-4">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{getTitle()}</CardTitle>
          <CardDescription className="text-base">
            {getDescription()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {(userType === 'poblador' || userType === 'resident') && (
              <ResidentProfileForm
                formData={formData}
                onChange={handleFieldChange}
                isLoading={isSaving}
                regionName={region?.name}
                projectName={project?.name}
              />
            )}

            {(userType === 'empresa' || userType === 'company') && (
              <CompanyProfileForm
                formData={formData}
                onChange={handleFieldChange}
                isLoading={isSaving}
                assignedProjects={assignedProjects}
              />
            )}

            {(userType === 'admin' || userType === 'administrator') && (
              <AdministratorProfileForm
                formData={formData}
                onChange={handleFieldChange}
                isLoading={isSaving}
              />
            )}

            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Guardar cambios
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
