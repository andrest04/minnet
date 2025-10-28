'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Building2, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/dashboard/StatCard';
import { toast } from 'sonner';

interface Company {
  id: string;
  full_name: string;
  company_name: string;
  position: string;
  validation_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  email: string;
}

interface Stats {
  total_pobladores: number;
  total_empresas: number;
  empresas_pendientes: number;
  empresas_aprobadas: number;
}

export default function AdminPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    try {
      const [companiesRes, statsRes] = await Promise.all([
        fetch('/api/admin/companies'),
        fetch('/api/admin/stats'),
      ]);

      // Check for auth errors
      if (companiesRes.status === 401 || statsRes.status === 401) {
        router.push('/login');
        return;
      }

      if (companiesRes.status === 403 || statsRes.status === 403) {
        router.push('/poblador'); // Not admin, redirect to default
        return;
      }

      const companiesData = await companiesRes.json();
      const statsData = await statsRes.json();

      if (companiesData.success) setCompanies(companiesData.data);
      if (statsData.success) setStats(statsData.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const checkAuthAndLoadData = useCallback(async () => {
    try {
      // Check authentication using Supabase session
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        router.push('/login');
        return;
      }

      // Verify user is admin by trying to fetch admin data
      // If not admin, the API will return 403
      await fetchData();
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
      router.push('/login');
    }
  }, [router, supabase, fetchData]);

  useEffect(() => {
    checkAuthAndLoadData();
  }, [checkAuthAndLoadData]);

  const handleUpdateStatus = async (companyId: string, status: 'approved' | 'rejected') => {
    try {
      const response = await fetch('/api/admin/companies', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_id: companyId, validation_status: status }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Empresa ${status === 'approved' ? 'aprobada' : 'rechazada'} correctamente`);
        fetchData();
      } else {
        toast.error(data.error || 'Error al actualizar estado');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión');
    }
  };

  const filteredCompanies = companies.filter(
    (c) => filter === 'all' || c.validation_status === filter
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Panel de Administración</h1>
        <p className="text-muted-foreground">Gestiona empresas y visualiza estadísticas</p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Pobladores"
            value={stats.total_pobladores}
            icon={Users}
          />
          <StatCard
            title="Total Empresas"
            value={stats.total_empresas}
            icon={Building2}
          />
          <StatCard
            title="Empresas Pendientes"
            value={stats.empresas_pendientes}
            icon={Clock}
          />
          <StatCard
            title="Empresas Aprobadas"
            value={stats.empresas_aprobadas}
            icon={CheckCircle2}
          />
        </div>
      )}

      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Gestión de Empresas</CardTitle>
            <div className="flex gap-2">
              {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
                <Button
                  key={f}
                  onClick={() => setFilter(f)}
                  variant={filter === f ? 'default' : 'outline'}
                  size="sm"
                >
                  {f === 'all' ? 'Todas' : f === 'pending' ? 'Pendientes' : f === 'approved' ? 'Aprobadas' : 'Rechazadas'}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {filteredCompanies.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No hay empresas en esta categoría</p>
            ) : (
              filteredCompanies.map((company) => (
                <div key={company.id} className="border border-border rounded-lg p-4 hover:bg-accent/5 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-1">
                      <h3 className="font-semibold text-foreground">{company.full_name}</h3>
                      <p className="text-sm text-muted-foreground">{company.company_name}</p>
                      <p className="text-sm text-muted-foreground">{company.position}</p>
                      <p className="text-sm text-muted-foreground">{company.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Registrado: {new Date(company.created_at).toLocaleDateString('es-PE')}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <Badge
                        variant={
                          company.validation_status === 'pending'
                            ? 'secondary'
                            : company.validation_status === 'approved'
                            ? 'default'
                            : 'destructive'
                        }
                        className={
                          company.validation_status === 'pending'
                            ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                            : ''
                        }
                      >
                        {company.validation_status === 'pending'
                          ? 'Pendiente'
                          : company.validation_status === 'approved'
                          ? 'Aprobada'
                          : 'Rechazada'}
                      </Badge>

                      {company.validation_status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleUpdateStatus(company.id, 'approved')}
                          >
                            Aprobar
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleUpdateStatus(company.id, 'rejected')}
                          >
                            Rechazar
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
