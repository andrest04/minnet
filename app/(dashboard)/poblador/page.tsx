'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Users, GraduationCap, Briefcase, Loader2, Calendar } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Cargando tu perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Bienvenido a MinneT</h1>
        <p className="text-muted-foreground">Tu espacio para conectar con el proyecto minero</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <CardTitle>Tu Comunidad</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Proyecto</p>
              <p className="font-semibold text-foreground">{project?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Comunidad</p>
              <p className="font-semibold text-foreground">{community?.name || 'N/A'}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-secondary" />
              <CardTitle>Tu Perfil</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Educación</p>
                <p className="font-semibold text-foreground capitalize">{profile?.education_level || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Profesión</p>
                <p className="font-semibold text-foreground capitalize">{profile?.profession || 'N/A'}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rango de Edad</p>
              <p className="font-semibold text-foreground">{profile?.age_range || 'N/A'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-r from-primary to-primary/90 border-0 text-white">
        <CardHeader>
          <CardTitle className="text-white">Tus Temas de Interés</CardTitle>
          <CardDescription className="text-white/80">
            Áreas que te interesan sobre el proyecto minero
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {profile?.topics_interest?.map((topic) => (
              <Badge key={topic} variant="secondary" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                {topic}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Próximas Actividades</CardTitle>
          <CardDescription>
            Asambleas, capacitaciones y encuestas disponibles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-2">
              No hay actividades programadas
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Esta sección mostrará las próximas asambleas, capacitaciones y encuestas disponibles para tu comunidad.
            </p>
            <p className="text-xs text-muted-foreground mt-2 bg-blue-50 px-3 py-2 rounded-md border border-blue-100">
              El sistema está en fase de recolección de datos.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
