'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { LogOut, User, UserCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'

const USER_TYPE_LABELS = {
  resident: 'Poblador',
  company: 'Empresa',
  administrator: 'Administrador',
} as const

export function DashboardHeader() {
  const router = useRouter()
  const [userInfo, setUserInfo] = useState<{
    name: string
    type: 'resident' | 'company' | 'administrator'
  } | null>(null)

  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const supabase = createClient()

        // Obtener usuario autenticado
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return

        // Obtener perfil base del usuario
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_type, email, phone')
          .eq('id', user.id)
          .single<{ user_type: string; email: string | null; phone: string | null }>()

        if (!profile) return

        let name = 'Usuario'

        // Obtener nombre según tipo de usuario
        if (profile.user_type === 'company') {
          const { data: company } = await supabase
            .from('companies')
            .select('company_name')
            .eq('id', user.id)
            .single()

          if (company) name = company.company_name
        } else if (profile.user_type === 'administrator') {
          const { data: admin } = await supabase
            .from('administrators')
            .select('full_name')
            .eq('id', user.id)
            .single()

          if (admin) name = admin.full_name
        } else if (profile.user_type === 'resident') {
          // Residents no tienen nombre, usar email o teléfono
          name = profile.email || profile.phone || 'Poblador'
        }

        setUserInfo({
          name,
          type: profile.user_type as 'resident' | 'company' | 'administrator',
        })
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
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-white/80 backdrop-blur-md supports-backdrop-filter:bg-white/60">
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 px-3 py-1.5 h-auto hover:bg-primary/5"
                >
                  <User className="h-4 w-4 text-primary" />
                  <div className="flex flex-col items-start">
                    <span className="text-xs font-medium text-foreground hidden sm:block">
                      {userInfo.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {USER_TYPE_LABELS[userInfo.type]}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => router.push('/perfil')}>
                  <UserCircle className="h-4 w-4 mr-2" />
                  Mi Perfil
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>
      </div>
    </header>
  )
}
