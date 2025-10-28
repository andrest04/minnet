'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Users, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { validateCorporateEmail } from '@/lib/validations';
import { toast } from 'sonner';

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const identifier = searchParams.get('identifier');
  const type = searchParams.get('type');

  useEffect(() => {
    if (!identifier || !type) {
      router.push('/login');
    }
  }, [identifier, type, router]);

  const handleUserTypeSelection = (userType: 'poblador' | 'empresa') => {
    if (userType === 'empresa' && type === 'email') {
      if (!validateCorporateEmail(identifier || '')) {
        toast.error('Para registrarte como empresa, debes usar un email corporativo (no Gmail, Hotmail, etc.)');
        return;
      }
    }

    if (userType === 'empresa' && type === 'phone') {
      toast.error('Para registrarte como empresa, debes usar un email corporativo.');
      router.push('/login');
      return;
    }

    router.push(`/register/${userType}?identifier=${encodeURIComponent(identifier!)}&type=${type}`);
  };

  return (
    <div className="w-full">
      <Card className="border-border shadow-sm">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-foreground">
            Selecciona tu tipo de cuenta
          </CardTitle>
          <CardDescription className="text-base">
            Elige la opción que mejor te represente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <button
              onClick={() => handleUserTypeSelection('poblador')}
              className="w-full p-6 rounded-xl border-2 border-border hover:border-secondary transition-all duration-200 text-left group hover:bg-secondary/5"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                  <Users className="w-6 h-6 text-secondary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    Poblador / Miembro de la Comunidad
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Eres parte de una comunidad local cercana a un proyecto minero
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleUserTypeSelection('empresa')}
              className="w-full p-6 rounded-xl border-2 border-border hover:border-primary transition-all duration-200 text-left group hover:bg-primary/5"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    Representante de Empresa
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Trabajas en una empresa minera o gestoras de proyectos sociales
                  </p>
                </div>
              </div>
            </button>
          </div>

          <Button
            variant="ghost"
            className="w-full"
            onClick={() => router.push('/login')}
          >
            Volver al inicio
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
