import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CompanyCardProps {
  company: {
    id: string;
    full_name: string;
    company_name: string;
    position: string;
    email: string;
    created_at: string;
    validation_status: "pending" | "approved" | "rejected";
  };
  onUpdateStatus: (id: string, status: "approved" | "rejected") => void;
}

export default function CompanyCard({ company, onUpdateStatus }: CompanyCardProps) {
  const handleReject = () => {
    if (
      confirm(
        `¿Estás seguro de eliminar la cuenta de ${company.company_name}?\n\nEsta acción eliminará permanentemente:\n- Datos de la empresa\n- Cuenta de usuario\n- Proyectos asignados\n\nEsta acción NO se puede deshacer.`
      )
    ) {
      onUpdateStatus(company.id, "rejected");
    }
  };

  return (
    <div className="border border-border rounded-lg p-4 hover:bg-accent/5 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-1">
          <h3 className="font-semibold text-foreground">{company.full_name}</h3>
          <p className="text-sm text-muted-foreground">{company.company_name}</p>
          <p className="text-sm text-muted-foreground">{company.position}</p>
          <p className="text-sm text-muted-foreground">{company.email}</p>
          <p className="text-xs text-muted-foreground">
            Registrado: {new Date(company.created_at).toLocaleDateString("es-PE")}
          </p>
        </div>

        <div className="flex flex-col items-end gap-3">
          <Badge
            variant={
              company.validation_status === "pending"
                ? "secondary"
                : company.validation_status === "approved"
                ? "default"
                : "destructive"
            }
            className={
              company.validation_status === "pending"
                ? "bg-amber-100 text-amber-900 hover:bg-amber-200"
                : ""
            }
          >
            {company.validation_status === "pending"
              ? "Pendiente"
              : company.validation_status === "approved"
              ? "Aprobada"
              : "Rechazada"}
          </Badge>

          {company.validation_status === "pending" && (
            <div className="flex gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => onUpdateStatus(company.id, "approved")}
              >
                Aprobar
              </Button>
              <Button variant="destructive" size="sm" onClick={handleReject}>
                Eliminar Cuenta
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
