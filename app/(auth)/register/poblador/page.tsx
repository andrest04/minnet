'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Stepper } from '@/components/auth/Stepper';
import { Button } from '@/components/ui/Button';
import { Step1 } from './Step1';
import { Step2 } from './Step2';
import { Step3 } from './Step3';
import type { PobladorRegistrationData } from '@/lib/types';

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
        alert(data.error || 'Error al registrar');
        setIsSubmitting(false);
        return;
      }

      localStorage.setItem('user_id', data.user_id);
      localStorage.setItem('user_type', 'poblador');

      router.push('/poblador');
    } catch (error) {
      console.error('Error al registrar:', error);
      alert('Error de conexión. Intenta nuevamente.');
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
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <button
          onClick={() => router.push('/login')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver al inicio
        </button>

        <h2 className="text-2xl font-bold text-primary mb-2">Registro de Poblador</h2>
        <p className="text-muted-foreground mb-6">
          Completa tu información para acceder a la plataforma
        </p>

        <Stepper steps={steps} currentStep={currentStep} />

        <div className="mt-8">{renderStep()}</div>

        {currentStep > 0 && currentStep < 2 && (
          <div className="mt-6 pt-6 border-t border-border">
            <Button variant="ghost" onClick={handleBack} disabled={isSubmitting}>
              Atrás
            </Button>
          </div>
        )}
      </div>
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
