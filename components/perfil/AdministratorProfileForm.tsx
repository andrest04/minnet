import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AdministratorProfileFormProps {
  formData: Record<string, unknown>;
  onChange: (field: string, value: unknown) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export function AdministratorProfileForm({
  formData,
  onChange,
  disabled = false,
  isLoading = false,
}: AdministratorProfileFormProps) {
  return (
    <div className="space-y-6">
      {/* Readonly Fields Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Información de Cuenta</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
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
        </div>
      </div>

      {/* Editable Fields Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Información Personal</h3>
        <div className="space-y-2">
          <Label htmlFor="full_name">Nombre Completo</Label>
          <Input
            id="full_name"
            type="text"
            value={(formData.full_name as string) || ''}
            onChange={(e) => onChange('full_name', e.target.value)}
            disabled={disabled || isLoading}
            placeholder="Ingrese su nombre completo"
          />
        </div>
      </div>
    </div>
  );
}
