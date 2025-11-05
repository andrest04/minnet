'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Building2, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuthenticatedUser } from '@/lib/hooks/useAuthenticatedUser';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StatCard } from '@/components/dashboard/StatCard';
import CompanyFilters from '@/components/admin/CompanyFilters';
import CompanyCard from '@/components/admin/CompanyCard';
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
  const { checkAuth } = useAuthenticatedUser();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');

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
    const user = await checkAuth();
    if (user) {
      await fetchData();
    }
  }, [checkAuth, fetchData]);

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

  const filteredCompanies = companies
    .filter((c) => filter === 'all' || c.validation_status === filter)
    .filter((c) => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        c.full_name.toLowerCase().includes(query) ||
        c.company_name.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        c.position.toLowerCase().includes(query)
      );
    });

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
          <CompanyFilters
            filter={filter}
            searchQuery={searchQuery}
            resultCount={filteredCompanies.length}
            onFilterChange={setFilter}
            onSearchChange={setSearchQuery}
          />
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {filteredCompanies.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No hay empresas en esta categoría</p>
            ) : (
              filteredCompanies.map((company) => (
                <CompanyCard
                  key={company.id}
                  company={company}
                  onUpdateStatus={handleUpdateStatus}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
