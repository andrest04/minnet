import { CustomSelect as Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { COMPANY_AREAS, COMPANY_POSITIONS } from "@/lib/validations";

interface BasicInfoSectionProps {
  formData: {
    responsible_area?: string;
    company_name?: string;
    position?: string;
  };
  errors: Record<string, string>;
  onChange: (updates: Partial<BasicInfoSectionProps["formData"]>) => void;
}

export default function BasicInfoSection({
  formData,
  errors,
  onChange,
}: BasicInfoSectionProps) {
  return (
    <div>
      <h3 className="text-base font-semibold text-foreground mb-4">
        Información Básica
      </h3>
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Área Encargada <span className="text-destructive">*</span>
          </label>
          <Select
            placeholder="Selecciona el área encargada"
            value={formData.responsible_area || ""}
            onChange={(value) => onChange({ responsible_area: value })}
            options={COMPANY_AREAS}
          />
          {errors.responsible_area && (
            <p className="mt-1 text-sm text-destructive">
              {errors.responsible_area}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Empresa / Institución <span className="text-destructive">*</span>
          </label>
          <Input
            placeholder="Ej: Minera Las Bambas S.A."
            value={formData.company_name || ""}
            onChange={(e) => onChange({ company_name: e.target.value })}
          />
          {errors.company_name && (
            <p className="mt-1 text-sm text-destructive">{errors.company_name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Cargo <span className="text-destructive">*</span>
          </label>
          <Select
            placeholder="Selecciona tu cargo"
            value={formData.position || ""}
            onChange={(value) => onChange({ position: value })}
            options={COMPANY_POSITIONS}
          />
          {errors.position && (
            <p className="mt-1 text-sm text-destructive">{errors.position}</p>
          )}
        </div>
      </div>
    </div>
  );
}
