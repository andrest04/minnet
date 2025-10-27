import Image from 'next/image';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Acceder - MinneT',
  description: 'Plataforma de comunicación entre comunidades y proyectos mineros',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral via-background to-secondary-light/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-6">
            <Image
              src="/assets/logo_minnet.webp"
              alt="MinneT Logo"
              width={200}
              height={80}
              priority
              className="object-contain"
            />
          </div>
          <p className="text-muted-foreground">
            Conectando comunidades con proyectos mineros
          </p>
        </div>

        {/* Contenido de las páginas */}
        {children}
      </div>
    </div>
  );
}
