import { CustomSelect as Select } from "@/components/ui/select";
import { USE_OBJECTIVES, CONSULTATION_FREQUENCIES } from "@/lib/validations";

interface PreferencesSectionProps {
  formData: {
    use_objective?: string;
    consultation_frequency?: string;
  };
  onChange: (updates: Partial<PreferencesSectionProps["formData"]>) => void;
}

export default function PreferencesSection({
  formData,
  onChange,
}: PreferencesSectionProps) {
  return (
    <div className="pt-4 border-t border-border">
      <h3 className="text-base font-semibold text-foreground mb-4">
        Preferencias{" "}
        <span className="text-xs text-muted-foreground font-normal">
          (Opcional)
        </span>
      </h3>

      <div className="space-y-4">
        <Select
          label="Objetivo de uso"
          placeholder="Selecciona una opción"
          value={formData.use_objective || ""}
          onChange={(value) => onChange({ use_objective: value })}
          options={USE_OBJECTIVES}
        />

        <Select
          label="Frecuencia de consulta esperada"
          placeholder="Selecciona una opción"
          value={formData.consultation_frequency || ""}
          onChange={(value) => onChange({ consultation_frequency: value })}
          options={CONSULTATION_FREQUENCIES}
        />
      </div>
    </div>
  );
}
