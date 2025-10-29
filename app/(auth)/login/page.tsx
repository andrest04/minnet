'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { identifierType } from '@/lib/validations'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const [identifier, setIdentifier] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const type = identifierType(identifier)

    if (type === 'invalid') {
      const errorMsg =
        'Por favor, ingresa un email válido o un teléfono de 9 dígitos que empiece con 9'
      setError(errorMsg)
      toast.error(errorMsg)
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Manejo específico para rate limiting
        if (response.status === 429) {
          const errorMsg = 'Demasiados intentos. Por favor, espera un minuto antes de intentar nuevamente.'
          setError(errorMsg)
          toast.error(errorMsg, { duration: 5000 })
          setIsLoading(false)
          return
        }

        const errorMsg = data.error || 'Error al enviar código de verificación'
        setError(errorMsg)
        toast.error(errorMsg)
        setIsLoading(false)
        return
      }

      toast.success('Código enviado correctamente')
      router.push(
        `/verify-otp?identifier=${encodeURIComponent(data.identifier)}&type=${data.identifier_type}`
      )
    } catch (err) {
      console.error('Error al enviar OTP:', err)
      const errorMsg = 'Error de conexión. Por favor, intenta nuevamente.'
      setError(errorMsg)
      toast.error(errorMsg)
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full space-y-6">
      <Card className="border-border shadow-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-foreground">
            Iniciar sesión
          </CardTitle>
          <CardDescription className="text-base">
            Ingresa tu email o número de teléfono para recibir un código de
            verificación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="identifier">Email o Teléfono</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="identifier"
                  type="text"
                  placeholder="ejemplo@correo.com o 987654321"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  disabled={isLoading}
                  className="pl-10"
                  aria-invalid={!!error}
                  aria-describedby={error ? 'identifier-error' : 'identifier-help'}
                />
              </div>
              {error ? (
                <p id="identifier-error" className="text-sm text-destructive">
                  {error}
                </p>
              ) : (
                <p id="identifier-help" className="text-xs text-muted-foreground">
                  Para teléfonos: solo números, 9 dígitos, empezando con 9
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enviando código...
                </>
              ) : (
                'Continuar'
              )}
            </Button>
          </form>

          <Separator className="my-6" />

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
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground text-center">
        ¿Primera vez aquí? No te preocupes, te guiaremos en el proceso de
        registro.
      </p>
    </div>
  )
}
