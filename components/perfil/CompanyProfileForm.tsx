import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  COMPANY_POSITIONS,
  COMPANY_AREAS,
  USE_OBJECTIVES,
  CONSULTATION_FREQUENCIES,
} from '@/lib/validations';

interface CompanyProfileFormProps {
  formData: Record<string, unknown>;
  onChange: (field: string, value: unknown) => void;
  disabled?: boolean;
  isLoading?: boolean;
  assignedProjects?: Array<{ id: string; name: string }>;
}

const VALIDATION_STATUS_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pendiente', variant: 'secondary' },
  approved: { label: 'Aprobado', variant: 'default' },
  rejected: { label: 'Rechazado', variant: 'destructive' },
};

export function CompanyProfileForm({
  formData,
  onChange,
  disabled = false,
  isLoading = false,
  assignedProjects = [],
}: CompanyProfileFormProps) {
  const validationStatus = (formData.validation_status as string) || 'pending';
  const statusInfo = VALIDATION_STATUS_LABELS[validationStatus] || VALIDATION_STATUS_LABELS.pending;

  return (
    <div className="space-y-6">
      {/* Readonly Fields Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Información de Cuenta</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Corporativo</Label>
            <Input
              id="email"
              type="email"
              value={(formData.email as string) || ''}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Este campo no se puede modificar
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              type="text"
              value={(formData.phone as string) || ''}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Este campo no se puede modificar
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="validation_status">Estado de Validación</Label>
            <div className="flex items-center gap-2">
              <Badge variant={statusInfo.variant}>
                {statusInfo.label}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Este estado es controlado por los administradores
            </p>
          </div>

          {assignedProjects.length > 0 && (
            <div className="space-y-2 md:col-span-2">
              <Label>Proyectos Asignados</Label>
              <div className="flex flex-wrap gap-2">
                {assignedProjects.map((project) => (
                  <Badge key={project.id} variant="outline">
                    {project.name}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Los proyectos asignados son controlados por los administradores
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Editable Fields Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Información de la Empresa</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="company_name">Nombre de la Empresa</Label>
            <Input
              id="company_name"
              type="text"
              value={(formData.company_name as string) || ''}
              onChange={(e) => onChange('company_name', e.target.value)}
              disabled={disabled || isLoading}
              placeholder="Ingrese el nombre de la empresa"
            />
          </div>

          <Select
            label="Cargo"
            options={COMPANY_POSITIONS}
            value={(formData.position as string) || ''}
            onValueChange={(value) => onChange('position', value)}
            disabled={disabled || isLoading}
          />

          <Select
            label="Área Encargada"
            options={COMPANY_AREAS}
            value={(formData.responsible_area as string) || ''}
            onValueChange={(value) => onChange('responsible_area', value)}
            disabled={disabled || isLoading}
          />
        </div>
      </div>

      {/* Usage Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">
          Uso de la Plataforma
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Objetivo de Uso"
            options={USE_OBJECTIVES}
            value={(formData.use_objective as string) || ''}
            onValueChange={(value) => onChange('use_objective', value)}
            disabled={disabled || isLoading}
          />

          <Select
            label="Frecuencia de Consulta"
            options={CONSULTATION_FREQUENCIES}
            value={(formData.consultation_frequency as string) || ''}
            onValueChange={(value) => onChange('consultation_frequency', value)}
            disabled={disabled || isLoading}
          />
        </div>
      </div>
    </div>
  );
}
