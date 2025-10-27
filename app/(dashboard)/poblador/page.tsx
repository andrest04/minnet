'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/Button';

interface Profile {
  id: string;
  project_id: string;
  community_id: string;
  age_range: string;
  education_level: string;
  profession: string;
  topics_interest: string[];
  knowledge_level: string;
  participation_willingness: string[];
  user_type: string;
}

interface Project {
  id: string;
  name: string;
}

interface Community {
  id: string;
  name: string;
}

export default function PobladorPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [community, setCommunity] = useState<Community | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const fetchProfile = useCallback(async () => {
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
        // Verify user is poblador
        if (data.profile.user_type !== 'poblador') {
          router.push(`/${data.profile.user_type}`);
          return;
        }

        setProfile(data.profile);
        if (data.project) setProject(data.project);
        if (data.community) setCommunity(data.community);
      }
    } catch (error) {
      console.error('Error al cargar perfil:', error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const checkAuthAndLoadProfile = useCallback(async () => {
    try {
      // Check authentication using Supabase session
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        router.push('/login');
        return;
      }

      // Fetch profile data using API (now secured with auth)
      await fetchProfile();
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
      router.push('/login');
    }
  }, [router, supabase, fetchProfile]);

  useEffect(() => {
    checkAuthAndLoadProfile();
  }, [checkAuthAndLoadProfile]);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Bienvenido a MinneT</h1>
          <p className="text-muted-foreground">Tu espacio para conectar con el proyecto minero</p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          Cerrar sesión
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-border">
          <h2 className="text-xl font-bold text-foreground mb-4">Tu Comunidad</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Proyecto</p>
              <p className="font-semibold text-foreground">{project?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Comunidad</p>
              <p className="font-semibold text-foreground">{community?.name || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-border">
          <h2 className="text-xl font-bold text-foreground mb-4">Tu Perfil</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Edad</p>
              <p className="font-semibold text-foreground">{profile?.age_range || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Educación</p>
              <p className="font-semibold text-foreground capitalize">{profile?.education_level || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Profesión</p>
              <p className="font-semibold text-foreground capitalize">{profile?.profession || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-primary to-primary-light p-6 rounded-xl text-white">
        <h2 className="text-xl font-bold mb-2">Tus Temas de Interés</h2>
        <div className="flex flex-wrap gap-2 mt-4">
          {profile?.topics_interest?.map((topic) => (
            <span key={topic} className="px-4 py-2 bg-white/20 backdrop-blur rounded-full text-sm">
              {topic}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-border">
        <h2 className="text-xl font-bold text-foreground mb-4">Próximas Actividades</h2>
        <p className="text-muted-foreground">
          Esta sección mostrará las próximas asambleas, capacitaciones y encuestas disponibles.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Por ahora, el sistema está en fase de recolección de datos.
        </p>
      </div>
    </div>
  );
}
