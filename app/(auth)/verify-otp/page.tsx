'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { validateOTP } from '@/lib/validations';

function VerifyOTPContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const identifier = searchParams.get('identifier');
  const type = searchParams.get('type');

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!identifier || !type) {
      router.push('/login');
    }
  }, [identifier, type, router]);

  useEffect(() => {
    // Auto-focus en el primer input
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    // Solo permitir dígitos
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');

    // Auto-focus en el siguiente input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit cuando se completen los 6 dígitos
    if (newCode.every((digit) => digit !== '') && index === 5) {
      handleVerify(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);

    if (/^\d+$/.test(pastedData)) {
      const newCode = pastedData.split('').concat(Array(6).fill('')).slice(0, 6);
      setCode(newCode);
      setError('');

      // Focus en el último input completado
      const nextEmptyIndex = newCode.findIndex((digit) => digit === '');
      if (nextEmptyIndex !== -1) {
        inputRefs.current[nextEmptyIndex]?.focus();
      } else {
        handleVerify(newCode.join(''));
      }
    }
  };

  const handleVerify = async (codeToVerify?: string) => {
    const otpCode = codeToVerify || code.join('');

    if (!validateOTP(otpCode)) {
      setError('Por favor, completa los 6 dígitos');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier,
          code: otpCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al verificar código');
        setIsLoading(false);
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        return;
      }

      // Si el usuario existe, redirigir al dashboard según su tipo
      if (data.user_exists) {
        // Aquí se guardaría la sesión en localStorage o cookies
        localStorage.setItem('user_id', data.user_id);
        localStorage.setItem('user_type', data.user_type);

        // Redirigir según el tipo de usuario
        if (data.user_type === 'admin') {
          router.push('/admin');
        } else if (data.user_type === 'empresa') {
          router.push('/empresa');
        } else {
          router.push('/poblador');
        }
      } else {
        // Si no existe, redirigir al registro
        router.push(`/register?identifier=${encodeURIComponent(identifier!)}&type=${type}`);
      }
    } catch (err) {
      console.error('Error al verificar OTP:', err);
      setError('Error de conexión. Por favor, intenta nuevamente.');
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setError('');

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
        setError(data.error || 'Error al reenviar código');
        setIsResending(false);
        return;
      }

      // Limpiar código y mostrar mensaje de éxito
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      alert('Código reenviado correctamente');
    } catch (err) {
      console.error('Error al reenviar OTP:', err);
      setError('Error de conexión. Por favor, intenta nuevamente.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        {/* Botón de regresar */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Volver
        </button>

        <h2 className="text-2xl font-bold text-primary mb-2">
          Verificar código
        </h2>
        <p className="text-muted-foreground mb-8">
          Ingresa el código de 6 dígitos enviado a{' '}
          <span className="font-medium text-foreground">
            {type === 'email' ? 'tu email' : 'tu teléfono'}
          </span>
        </p>

        <div className="space-y-6">
          {/* Inputs de OTP */}
          <div className="flex gap-3 justify-center" onPaste={handlePaste}>
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={isLoading}
                className={`w-12 h-14 text-center text-2xl font-bold rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
                  error
                    ? 'border-error'
                    : digit
                    ? 'border-primary bg-primary/5'
                    : 'border-border'
                } ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
              />
            ))}
          </div>

          {error && (
            <p className="text-sm text-error text-center flex items-center justify-center gap-1">
              <svg
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </p>
          )}

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => handleVerify()}
            isLoading={isLoading}
            disabled={code.some((digit) => digit === '')}
          >
            {isLoading ? 'Verificando...' : 'Verificar código'}
          </Button>

          <div className="text-center">
            <button
              onClick={handleResend}
              disabled={isResending}
              className="text-sm text-primary font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending ? 'Reenviando...' : '¿No recibiste el código? Reenviar'}
            </button>
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="mt-6 p-4 bg-info/10 rounded-lg border border-info/20">
        <p className="text-sm text-info text-center">
          💡 En modo desarrollo, el código OTP se muestra en la consola del servidor
        </p>
      </div>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <VerifyOTPContent />
    </Suspense>
  );
}
