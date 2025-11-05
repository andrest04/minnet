import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Acceder - MinneT",
  description:
    "Plataforma de comunicación entre comunidades y proyectos mineros",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo y título */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center mb-2">
            <Image
              src="/assets/logo_minnet.png"
              alt="MinneT Logo"
              width={180}
              height={72}
              priority
              className="object-contain"
            />
          </div>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Conectando comunidades con proyectos mineros
          </p>
        </div>

        {/* Contenido de las páginas */}
        {children}
      </div>
    </div>
  );
}
