import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CustomSelect } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AGE_RANGES,
  EDUCATION_LEVELS,
  GENDER_OPTIONS,
  PROFESSIONS,
  EMPLOYMENT_STATUS_OPTIONS,
  TRUST_LEVEL_OPTIONS,
  TOPICS_OF_INTEREST,
  KNOWLEDGE_LEVELS,
  PARTICIPATION_OPTIONS,
  JUNTA_RELATIONSHIPS,
} from '@/lib/validations';

interface ResidentProfileFormProps {
  formData: Record<string, unknown>;
  onChange: (field: string, value: unknown) => void;
  disabled?: boolean;
  isLoading?: boolean;
  regionName?: string;
  projectName?: string;
}

export function ResidentProfileForm({
  formData,
  onChange,
  disabled = false,
  isLoading = false,
  regionName,
  projectName,
}: ResidentProfileFormProps) {
  const handleTopicChange = (topic: string, checked: boolean) => {
    const currentTopics = (formData.topics_interest as string[]) || [];
    const newTopics = checked
      ? [...currentTopics, topic]
      : currentTopics.filter((t) => t !== topic);
    onChange('topics_interest', newTopics);
  };

  const handleParticipationChange = (option: string, checked: boolean) => {
    const currentOptions = (formData.participation_willingness as string[]) || [];
    const newOptions = checked
      ? [...currentOptions, option]
      : currentOptions.filter((o) => o !== option);
    onChange('participation_willingness', newOptions);
  };

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

          {regionName && (
            <div className="space-y-2">
              <Label htmlFor="region">Región</Label>
              <Input
                id="region"
                type="text"
                value={regionName}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Este campo no se puede modificar
              </p>
            </div>
          )}

          {projectName && (
            <div className="space-y-2">
              <Label htmlFor="project">Proyecto</Label>
              <Input
                id="project"
                type="text"
                value={projectName}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Este campo no se puede modificar
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Editable Fields Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Información Personal</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CustomSelect
            label="Rango de Edad"
            options={AGE_RANGES}
            value={(formData.age_range as string) || ''}
            onChange={(value) => onChange('age_range', value)}
            disabled={disabled || isLoading}
          />

          <CustomSelect
            label="Género"
            options={GENDER_OPTIONS}
            value={(formData.gender as string) || ''}
            onChange={(value) => onChange('gender', value)}
            disabled={disabled || isLoading}
          />

          <CustomSelect
            label="Nivel Educativo"
            options={EDUCATION_LEVELS}
            value={(formData.education_level as string) || ''}
            onChange={(value) => onChange('education_level', value)}
            disabled={disabled || isLoading}
          />

          <CustomSelect
            label="Profesión"
            options={PROFESSIONS}
            value={(formData.profession as string) || ''}
            onChange={(value) => onChange('profession', value)}
            disabled={disabled || isLoading}
          />

          <CustomSelect
            label="Situación Laboral"
            options={EMPLOYMENT_STATUS_OPTIONS}
            value={(formData.employment_status as string) || ''}
            onChange={(value) => onChange('employment_status', value)}
            disabled={disabled || isLoading}
          />
        </div>
      </div>

      {/* Mining Project Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">
          Información sobre el Proyecto Minero
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CustomSelect
            label="Nivel de Confianza en el Proyecto"
            options={TRUST_LEVEL_OPTIONS}
            value={(formData.trust_level as string) || ''}
            onChange={(value) => onChange('trust_level', value)}
            disabled={disabled || isLoading}
          />

          <CustomSelect
            label="Nivel de Conocimiento del Proyecto"
            options={KNOWLEDGE_LEVELS}
            value={(formData.knowledge_level as string) || ''}
            onChange={(value) => onChange('knowledge_level', value)}
            disabled={disabled || isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label>Temas de Interés</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {TOPICS_OF_INTEREST.map((topic) => (
              <div key={topic.value} className="flex items-center gap-2">
                <Checkbox
                  id={`topic-${topic.value}`}
                  checked={
                    ((formData.topics_interest as string[]) || []).includes(
                      topic.value
                    )
                  }
                  onCheckedChange={(checked) =>
                    handleTopicChange(topic.value, checked === true)
                  }
                  disabled={disabled || isLoading}
                />
                <Label
                  htmlFor={`topic-${topic.value}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {topic.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Community Involvement */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">
          Participación Comunitaria
        </h3>
        <div className="space-y-4">
          <CustomSelect
            label="¿Eres miembro o familiar de la junta directiva?"
            options={[
              { value: 'none', label: 'No' },
              { value: 'member', label: 'Soy miembro' },
              { value: 'familiar', label: 'Soy familiar de un miembro' },
            ]}
            value={(formData.junta_link as string) || 'none'}
            onChange={(value) => onChange('junta_link', value)}
            disabled={disabled || isLoading}
          />

          {formData.junta_link === 'familiar' && (
            <CustomSelect
              label="Nivel de Parentesco"
              options={JUNTA_RELATIONSHIPS}
              value={(formData.junta_relationship as string) || ''}
              onChange={(value) => onChange('junta_relationship', value)}
              disabled={disabled || isLoading}
            />
          )}

          <div className="space-y-2">
            <Label>Disposición a Participar</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {PARTICIPATION_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-center gap-2">
                  <Checkbox
                    id={`participation-${option.value}`}
                    checked={
                      (
                        (formData.participation_willingness as string[]) || []
                      ).includes(option.value)
                    }
                    onCheckedChange={(checked) =>
                      handleParticipationChange(option.value, checked === true)
                    }
                    disabled={disabled || isLoading}
                  />
                  <Label
                    htmlFor={`participation-${option.value}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
