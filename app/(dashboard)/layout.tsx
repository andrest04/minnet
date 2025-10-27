import Image from 'next/image';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MinneT - Dashboard',
  description: 'Panel de control - MinneT',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-16 items-center">
          <div className="flex items-center gap-3">
            <Image
              src="/assets/only_logo_minnet.webp"
              alt="MinneT"
              width={40}
              height={40}
              className="object-contain"
            />
            <span className="text-xl font-bold text-primary">MinneT</span>
          </div>

          <nav className="flex-1 flex items-center justify-end gap-6">
            {/* Navegación se agregará después según el tipo de usuario */}
            <button className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Cerrar sesión
            </button>
          </nav>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="container py-6">{children}</main>
    </div>
  );
}
