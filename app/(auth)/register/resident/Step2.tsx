"use client";

import { useState } from "react";
import { CustomSelect as Select } from "@/components/ui/select";
import { CustomCheckbox as Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { PROFESSIONS, JUNTA_RELATIONSHIPS, EMPLOYMENT_STATUS_OPTIONS } from "@/lib/validations";
import type { ResidentRegistrationData } from "@/lib/types";

interface SelectOption {
  value: string;
  label: string;
}

interface Step2Props {
  formData: Partial<ResidentRegistrationData>;
  updateFormData: (data: Partial<ResidentRegistrationData>) => void;
  onNext: () => void;
}

const JUNTA_OPTIONS: SelectOption[] = [
  { value: "member", label: "Sí, soy parte de la junta" },
  { value: "none", label: "No, no soy parte" },
  {
    value: "familiar",
    label: "Soy familiar o conocido de alguien de la junta",
  },
];

export const Step2 = ({ formData, updateFormData, onNext }: Step2Props) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [consent, setConsent] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.profession)
      newErrors.profession = "Selecciona tu profesión u oficio";
    if (!formData.employment_status)
      newErrors.employment_status = "Selecciona tu situación laboral";
    if (!formData.junta_link)
      newErrors.junta_link = "Selecciona una opción";
    if (formData.junta_link === "familiar" && !formData.junta_relationship)
      newErrors.junta_relationship = "Selecciona tu nivel de parentesco";
    if (!consent)
      newErrors.consent = "Debes aceptar los términos para continuar";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };

  return (
    <div className="space-y-5">
      <Select
        label="Profesión u Oficio"
        placeholder="Selecciona tu ocupación"
        value={formData.profession || ""}
        onChange={(value) => updateFormData({ profession: value })}
        options={PROFESSIONS}
        error={errors.profession}
      />

      <Select
        label="Situación Laboral"
        placeholder="Selecciona tu situación actual"
        value={formData.employment_status || ""}
        onChange={(value) => updateFormData({ employment_status: value })}
        options={EMPLOYMENT_STATUS_OPTIONS}
        error={errors.employment_status}
      />

      <Select
        label="¿Tienes vínculo con la junta directiva de la comunidad?"
        placeholder="Selecciona una opción"
        value={formData.junta_link || ""}
        onChange={(value) => {
          updateFormData({
            junta_link: value as "member" | "familiar" | "none",
            // Limpiar junta_relationship si no es "familiar"
            ...(value !== "familiar" && { junta_relationship: undefined })
          });
        }}
        options={JUNTA_OPTIONS}
        error={errors.junta_link}
      />

      {formData.junta_link === "familiar" && (
        <Select
          label="¿Cuál es tu nivel de parentesco?"
          placeholder="Selecciona el parentesco"
          value={formData.junta_relationship || ""}
          onChange={(value) => updateFormData({ junta_relationship: value })}
          options={JUNTA_RELATIONSHIPS}
          error={errors.junta_relationship}
        />
      )}

      <div className="pt-4 border-t border-border">
        <Checkbox
          label={
            <span className="text-sm">
              He leído y acepto los{" "}
              <a href="#" className="text-primary font-medium hover:underline">
                términos y condiciones
              </a>{" "}
              y la{" "}
              <a href="#" className="text-primary font-medium hover:underline">
                política de privacidad
              </a>
              . Autorizo el uso de mis datos para fines educativos y de análisis
              sociodemográfico.
            </span>
          }
          checked={consent}
          onChange={setConsent}
          error={errors.consent}
        />
      </div>

      <Button className="w-full" size="lg" onClick={handleNext}>
        Siguiente
      </Button>
    </div>
  );
};
