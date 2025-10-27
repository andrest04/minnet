'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/Button';

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
        fetchData();
      } else {
        alert(data.error || 'Error al actualizar estado');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    }
  };

  const filteredCompanies = companies.filter(
    (c) => filter === 'all' || c.validation_status === filter
  );

  const handleLogout = () => {
    localStorage.clear();
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
          <h1 className="text-3xl font-bold text-primary">Panel de Administración</h1>
          <p className="text-muted-foreground">Gestiona empresas y visualiza estadísticas</p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          Cerrar sesión
        </Button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl border border-border">
            <p className="text-sm text-muted-foreground mb-1">Total Pobladores</p>
            <p className="text-3xl font-bold text-primary">{stats.total_pobladores}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-border">
            <p className="text-sm text-muted-foreground mb-1">Total Empresas</p>
            <p className="text-3xl font-bold text-primary">{stats.total_empresas}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-border">
            <p className="text-sm text-muted-foreground mb-1">Empresas Pendientes</p>
            <p className="text-3xl font-bold text-warning">{stats.empresas_pendientes}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-border">
            <p className="text-sm text-muted-foreground mb-1">Empresas Aprobadas</p>
            <p className="text-3xl font-bold text-success">{stats.empresas_aprobadas}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Gestión de Empresas</h2>
          <div className="flex gap-2">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-primary text-white'
                    : 'bg-muted text-foreground hover:bg-primary/10'
                }`}
              >
                {f === 'all' ? 'Todas' : f === 'pending' ? 'Pendientes' : f === 'approved' ? 'Aprobadas' : 'Rechazadas'}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filteredCompanies.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No hay empresas en esta categoría</p>
          ) : (
            filteredCompanies.map((company) => (
              <div key={company.id} className="border border-border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{company.full_name}</h3>
                    <p className="text-sm text-muted-foreground">{company.company_name}</p>
                    <p className="text-sm text-muted-foreground">{company.position}</p>
                    <p className="text-sm text-muted-foreground mt-1">{company.email}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Registrado: {new Date(company.created_at).toLocaleDateString('es-PE')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        company.validation_status === 'pending'
                          ? 'bg-warning/10 text-warning'
                          : company.validation_status === 'approved'
                          ? 'bg-success/10 text-success'
                          : 'bg-error/10 text-error'
                      }`}
                    >
                      {company.validation_status === 'pending'
                        ? 'Pendiente'
                        : company.validation_status === 'approved'
                        ? 'Aprobada'
                        : 'Rechazada'}
                    </span>

                    {company.validation_status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleUpdateStatus(company.id, 'approved')}
                        >
                          Aprobar
                        </Button>
                        <Button
                          variant="danger"
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
      </div>
    </div>
  );
}
