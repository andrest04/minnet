import { Check } from "lucide-react";

interface ProjectsSectionProps {
  projects: { id: string; name: string }[];
  selectedProjects: string[];
  error?: string;
  onToggleProject: (projectId: string) => void;
}

export default function ProjectsSection({
  projects,
  selectedProjects,
  error,
  onToggleProject,
}: ProjectsSectionProps) {
  return (
    <div className="pt-4 border-t border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-foreground">
          Proyectos Asignados <span className="text-destructive">*</span>
        </h3>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
          {selectedProjects.length} seleccionado
          {selectedProjects.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="space-y-2">
        {projects.map((project) => (
          <button
            key={project.id}
            type="button"
            onClick={() => onToggleProject(project.id)}
            className={`w-full px-4 py-3 rounded-lg text-left transition-all duration-200 flex items-center gap-3 ${
              selectedProjects.includes(project.id)
                ? "bg-primary/10 border-2 border-primary"
                : "bg-muted border-2 border-transparent hover:border-border"
            }`}
          >
            <div
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                selectedProjects.includes(project.id)
                  ? "bg-primary border-primary"
                  : "border-border"
              }`}
            >
              {selectedProjects.includes(project.id) && (
                <Check className="w-3 h-3 text-white" />
              )}
            </div>
            <span className="text-sm font-medium">{project.name}</span>
          </button>
        ))}
      </div>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  );
}
