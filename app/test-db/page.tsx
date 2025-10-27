import { createClient } from '@/utils/supabase/server';

export default async function TestDBPage() {
  const supabase = await createClient();

  const { data: projects, error } = await supabase
    .from('projects')
    .select('*');

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-error mb-4">Error de Conexión</h1>
        <pre className="bg-error/10 p-4 rounded-lg text-sm">
          {JSON.stringify(error, null, 2)}
        </pre>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-primary mb-4">
        ✅ Conexión a Supabase Exitosa
      </h1>
      <p className="text-muted-foreground mb-6">
        Proyectos encontrados: {projects?.length || 0}
      </p>
      <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto">
        {JSON.stringify(projects, null, 2)}
      </pre>
    </div>
  );
}
