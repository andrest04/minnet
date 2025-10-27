'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';

interface Profile {
  id: string;
  full_name: string;
  company_name: string;
  position: string;
  validation_status: 'pending' | 'approved' | 'rejected';
  assigned_projects: string[];
  user_type: string;
}

export default function EmpresaPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    checkAuthAndLoadProfile();
  }, []);

  const checkAuthAndLoadProfile = async () => {
    try {
      // Check authentication using Supabase session
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        router.push('/login');
        return;
      }

      // Fetch profile data
      await fetchProfile();
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
      router.push('/login');
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error(data.error || 'Error al cargar perfil');
      }

      if (data.success && data.profile) {
        // Verify user is empresa
        if (data.profile.user_type !== 'empresa') {
          router.push(`/${data.profile.user_type}`);
          return;
        }

        setProfile(data.profile);
      }
    } catch (error) {
      console.error('Error al cargar perfil:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  const isPending = profile?.validation_status === 'pending';
  const isRejected = profile?.validation_status === 'rejected';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Panel de Empresa</h1>
          <p className="text-muted-foreground">{profile?.company_name}</p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          Cerrar sesión
        </Button>
      </div>

      {isPending && (
        <div className="bg-warning/10 border border-warning/20 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-warning" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-warning mb-1">Cuenta en Revisión</h3>
              <p className="text-sm text-muted-foreground">
                Tu cuenta está siendo revisada por un administrador. Recibirás acceso completo a
                los indicadores una vez que tu identidad sea verificada.
              </p>
            </div>
          </div>
        </div>
      )}

      {isRejected && (
        <div className="bg-error/10 border border-error/20 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-error/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-error" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-error mb-1">Cuenta Rechazada</h3>
              <p className="text-sm text-muted-foreground">
                Tu solicitud de acceso ha sido rechazada. Por favor, contacta al administrador
                para más información.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-xl border border-border">
        <h2 className="text-xl font-bold text-foreground mb-4">Información de tu Cuenta</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Nombre</p>
            <p className="font-semibold text-foreground">{profile?.full_name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Cargo</p>
            <p className="font-semibold text-foreground">{profile?.position}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Estado</p>
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                isPending
                  ? 'bg-warning/10 text-warning'
                  : isRejected
                  ? 'bg-error/10 text-error'
                  : 'bg-success/10 text-success'
              }`}
            >
              {isPending ? 'Pendiente' : isRejected ? 'Rechazada' : 'Aprobada'}
            </span>
          </div>
        </div>
      </div>

      {!isPending && !isRejected && (
        <div className="bg-white p-6 rounded-xl border border-border">
          <h2 className="text-xl font-bold text-foreground mb-4">Indicadores y Reportes</h2>
          <p className="text-muted-foreground">
            Esta sección mostrará los indicadores estratégicos de las comunidades asociadas a
            tus proyectos asignados.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Por ahora, el sistema está en fase de recolección de datos.
          </p>
        </div>
      )}
    </div>
  );
}
