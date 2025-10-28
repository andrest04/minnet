"use client";

import { useState } from "react";
import { CustomSelect as Select } from "@/components/ui/select";
import { CustomCheckbox as Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { PROFESSIONS } from "@/lib/validations";
import type { PobladorRegistrationData } from "@/lib/types";

interface SelectOption {
  value: string;
  label: string;
}

interface Step2Props {
  formData: Partial<PobladorRegistrationData>;
  updateFormData: (data: Partial<PobladorRegistrationData>) => void;
  onNext: () => void;
}

const JUNTA_OPTIONS: SelectOption[] = [
  { value: "true", label: "Sí, soy parte de la junta" },
  { value: "false", label: "No, no soy parte" },
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
    if (formData.junta_link === undefined)
      newErrors.junta_link = "Selecciona una opción";
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
        label="¿Tienes vínculo con la junta directiva de la comunidad?"
        placeholder="Selecciona una opción"
        value={
          formData.junta_link === true
            ? "true"
            : formData.junta_link === false
            ? "false"
            : formData.junta_link === undefined
            ? ""
            : "familiar"
        }
        onChange={(value) => {
          if (value === "true") updateFormData({ junta_link: true });
          else if (value === "false") updateFormData({ junta_link: false });
        }}
        options={JUNTA_OPTIONS}
        error={errors.junta_link}
      />

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
