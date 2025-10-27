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
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary mb-4 shadow-lg">
            {/* Aquí puedes agregar el logo real cuando lo tengas */}
            <div className="text-secondary text-4xl font-bold">M</div>
          </div>
          <h1 className="text-3xl font-bold text-primary mb-2">MinneT</h1>
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
