'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { identifierType } from '@/lib/validations';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validar el identificador
    const type = identifierType(identifier);

    if (type === 'invalid') {
      setError(
        'Por favor, ingresa un email válido o un teléfono de 9 dígitos que empiece con 9'
      );
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al enviar código de verificación');
        setIsLoading(false);
        return;
      }

      // Redirigir a la página de verificación con el identificador
      router.push(
        `/verify-otp?identifier=${encodeURIComponent(data.identifier)}&type=${data.identifier_type}`
      );
    } catch (err) {
      console.error('Error al enviar OTP:', err);
      setError('Error de conexión. Por favor, intenta nuevamente.');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-primary mb-2">
          Iniciar sesión
        </h2>
        <p className="text-muted-foreground mb-6">
          Ingresa tu email o número de teléfono para recibir un código de
          verificación
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email o Teléfono"
            placeholder="ejemplo@correo.com o 987654321"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            error={error}
            helperText="Para teléfonos: solo números, 9 dígitos, empezando con 9"
            disabled={isLoading}
            leftIcon={
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            }
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
          >
            {isLoading ? 'Enviando código...' : 'Continuar'}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            Al continuar, aceptas nuestros{' '}
            <a href="#" className="text-primary font-medium hover:underline">
              Términos de Servicio
            </a>{' '}
            y{' '}
            <a href="#" className="text-primary font-medium hover:underline">
              Política de Privacidad
            </a>
          </p>
        </div>
      </div>

      {/* Información adicional */}
      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          ¿Primera vez aquí? No te preocupes, te guiaremos en el proceso de
          registro.
        </p>
      </div>
    </div>
  );
}
