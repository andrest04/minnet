'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { validateCorporateEmail } from '@/lib/validations';

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
        alert('Para registrarte como empresa, debes usar un email corporativo (no Gmail, Hotmail, etc.)');
        return;
      }
    }

    if (userType === 'empresa' && type === 'phone') {
      alert('Para registrarte como empresa, debes usar un email corporativo.');
      router.push('/login');
      return;
    }

    router.push(`/register/${userType}?identifier=${encodeURIComponent(identifier!)}&type=${type}`);
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-primary mb-2 text-center">
          Selecciona tu tipo de cuenta
        </h2>
        <p className="text-muted-foreground mb-8 text-center">
          Elige la opción que mejor te represente
        </p>

        <div className="space-y-4">
          <button
            onClick={() => handleUserTypeSelection('poblador')}
            className="w-full p-6 rounded-xl border-2 border-border hover:border-primary transition-all duration-200 text-left group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                <svg
                  className="w-6 h-6 text-secondary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
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
            className="w-full p-6 rounded-xl border-2 border-border hover:border-primary transition-all duration-200 text-left group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
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

        <div className="mt-6">
          <Button variant="ghost" fullWidth onClick={() => router.push('/login')}>
            Volver al inicio
          </Button>
        </div>
      </div>
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
