'use client';

import { useState } from 'react';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import {
  TOPICS_OF_INTEREST,
  KNOWLEDGE_LEVELS,
  PARTICIPATION_OPTIONS,
} from '@/lib/validations';
import type { PobladorRegistrationData } from '@/lib/types';

interface Step3Props {
  formData: Partial<PobladorRegistrationData>;
  updateFormData: (data: Partial<PobladorRegistrationData>) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export const Step3 = ({ formData, updateFormData, onSubmit, isSubmitting }: Step3Props) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleTopic = (value: string) => {
    const current = formData.topics_interest || [];
    const updated = current.includes(value)
      ? current.filter((t) => t !== value)
      : [...current, value];
    updateFormData({ topics_interest: updated });
  };

  const toggleParticipation = (value: string) => {
    const current = formData.participation_willingness || [];
    const updated = current.includes(value)
      ? current.filter((p) => p !== value)
      : [...current, value];
    updateFormData({ participation_willingness: updated });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.topics_interest || formData.topics_interest.length === 0) {
      newErrors.topics_interest = 'Selecciona al menos un tema de interés';
    }
    if (!formData.knowledge_level) {
      newErrors.knowledge_level = 'Selecciona tu nivel de conocimiento';
    }
    if (!formData.participation_willingness || formData.participation_willingness.length === 0) {
      newErrors.participation_willingness = 'Selecciona al menos una opción';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          ¿Qué temas te interesan más?
        </label>
        <div className="flex flex-wrap gap-2">
          {TOPICS_OF_INTEREST.map((topic) => (
            <button
              key={topic.value}
              type="button"
              onClick={() => toggleTopic(topic.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                formData.topics_interest?.includes(topic.value)
                  ? 'bg-primary text-white'
                  : 'bg-muted text-foreground hover:bg-primary/10'
              }`}
            >
              {topic.label}
            </button>
          ))}
        </div>
        {errors.topics_interest && (
          <p className="mt-2 text-sm text-error">{errors.topics_interest}</p>
        )}
      </div>

      <Select
        label="¿Cuánto conoces sobre el proyecto minero?"
        placeholder="Selecciona tu nivel"
        value={formData.knowledge_level || ''}
        onChange={(value) => updateFormData({ knowledge_level: value })}
        options={KNOWLEDGE_LEVELS}
        error={errors.knowledge_level}
      />

      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          ¿En qué actividades estarías dispuesto a participar?
        </label>
        <div className="space-y-2">
          {PARTICIPATION_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => toggleParticipation(option.value)}
              className={`w-full px-4 py-3 rounded-lg text-left transition-all duration-200 flex items-center gap-3 ${
                formData.participation_willingness?.includes(option.value)
                  ? 'bg-secondary/10 border-2 border-secondary'
                  : 'bg-muted border-2 border-transparent hover:border-border'
              }`}
            >
              <div
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                  formData.participation_willingness?.includes(option.value)
                    ? 'bg-secondary border-secondary'
                    : 'border-border'
                }`}
              >
                {formData.participation_willingness?.includes(option.value) && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <span className="text-sm font-medium">{option.label}</span>
            </button>
          ))}
        </div>
        {errors.participation_willingness && (
          <p className="mt-2 text-sm text-error">{errors.participation_willingness}</p>
        )}
      </div>

      <div className="pt-4">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleSubmit}
          isLoading={isSubmitting}
        >
          {isSubmitting ? 'Registrando...' : 'Completar registro'}
        </Button>
      </div>
    </div>
  );
};
