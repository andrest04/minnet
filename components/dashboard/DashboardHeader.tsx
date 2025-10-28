'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'

export function DashboardHeader() {
  const router = useRouter()

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
