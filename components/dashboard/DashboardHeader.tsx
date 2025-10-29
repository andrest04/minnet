'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'

const USER_TYPE_LABELS = {
  poblador: 'Poblador',
  empresa: 'Empresa',
  admin: 'Administrador',
} as const

export function DashboardHeader() {
  const router = useRouter()
  const [userInfo, setUserInfo] = useState<{
    name: string
    type: 'poblador' | 'empresa' | 'admin'
  } | null>(null)

  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const supabase = createClient()

        // Obtener usuario autenticado
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return

        // Obtener perfil del usuario
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, user_type')
          .eq('id', user.id)
          .single<{ full_name: string | null; user_type: string }>()

        if (profile) {
          setUserInfo({
            name: profile.full_name || 'Usuario',
            type: profile.user_type as 'poblador' | 'empresa' | 'admin',
          })
        }
      } catch (error) {
        console.error('Error al obtener información del usuario:', error)
      }
    }

    getUserInfo()
  }, [])

  const handleSignOut = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      toast.success('Sesión cerrada correctamente')
      router.push('/login')
      router.refresh()
    } catch {
      toast.error('Error al cerrar sesión')
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Image
            src="/assets/only_logo_minnet.png"
            alt="MinneT"
            width={40}
            height={40}
            className="object-contain"
          />
          <span className="text-xl font-bold text-primary">MinneT</span>
        </div>

        <nav className="ml-auto flex items-center gap-4">
          {userInfo && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/10">
              <User className="h-4 w-4 text-primary" />
              <div className="flex flex-col">
                <span className="text-xs font-medium text-foreground hidden sm:block">
                  {userInfo.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {USER_TYPE_LABELS[userInfo.type]}
                </span>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </Button>
        </nav>
      </div>
    </header>
  )
}
