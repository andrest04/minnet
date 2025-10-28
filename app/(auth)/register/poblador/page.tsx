'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Stepper } from '@/components/auth/Stepper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Step1 } from './Step1';
import { Step2 } from './Step2';
import { Step3 } from './Step3';
import type { PobladorRegistrationData } from '@/lib/types';
import { toast } from 'sonner';

function RegisterPobladorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const identifier = searchParams.get('identifier');
  const type = searchParams.get('type');

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<PobladorRegistrationData>>({
    identifier: identifier || '',
    identifier_type: (type as 'email' | 'phone') || 'email',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!identifier || !type) {
      router.push('/login');
    }
  }, [identifier, type, router]);

  const steps = ['Datos básicos', 'Información', 'Preferencias'];

  const updateFormData = (data: Partial<PobladorRegistrationData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          user_type: 'poblador',
          consent_version: '1.0',
          consent_date: new Date().toISOString(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || 'Error al registrar';
        toast.error(errorMsg);
        setIsSubmitting(false);
        return;
      }

      localStorage.setItem('user_id', data.user_id);
      localStorage.setItem('user_type', 'poblador');

      toast.success('Registro exitoso. Redirigiendo...');
      router.push('/poblador');
    } catch (error) {
      console.error('Error al registrar:', error);
      toast.error('Error de conexión. Intenta nuevamente.');
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <Step1 formData={formData} updateFormData={updateFormData} onNext={handleNext} />;
      case 1:
        return <Step2 formData={formData} updateFormData={updateFormData} onNext={handleNext} />;
      case 2:
        return (
          <Step3
            formData={formData}
            updateFormData={updateFormData}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <Card className="border-border shadow-sm">
        <CardHeader className="space-y-1">
          <button
            onClick={() => router.push('/login')}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </button>
          <CardTitle className="text-2xl font-bold text-foreground pt-4">
            Registro de Poblador
          </CardTitle>
          <CardDescription className="text-base">
            Completa tu información para acceder a la plataforma
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Stepper steps={steps} currentStep={currentStep} />

          <div>{renderStep()}</div>

          {currentStep > 0 && currentStep < 2 && (
            <div className="pt-6 border-t border-border">
              <Button variant="ghost" onClick={handleBack} disabled={isSubmitting}>
                Atrás
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function RegisterPobladorPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <RegisterPobladorContent />
    </Suspense>
  );
}
