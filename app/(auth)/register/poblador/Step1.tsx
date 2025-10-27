'use client';

import { useState, useEffect } from 'react';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { AGE_RANGES, EDUCATION_LEVELS } from '@/lib/validations';
import type { PobladorRegistrationData } from '@/lib/types';

interface Step1Props {
  formData: Partial<PobladorRegistrationData>;
  updateFormData: (data: Partial<PobladorRegistrationData>) => void;
  onNext: () => void;
}

interface Project {
  id: string;
  name: string;
}

interface Community {
  id: string;
  name: string;
}

export const Step1 = ({ formData, updateFormData, onNext }: Step1Props) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isLoadingCommunities, setIsLoadingCommunities] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (formData.project_id) {
      fetchCommunities(formData.project_id);
    }
  }, [formData.project_id]);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      const data = await response.json();
      if (data.success) {
        setProjects(data.data);
      }
    } catch (error) {
      console.error('Error al cargar proyectos:', error);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const fetchCommunities = async (projectId: string) => {
    setIsLoadingCommunities(true);
    try {
      const response = await fetch(`/api/communities?project_id=${projectId}`);
      const data = await response.json();
      if (data.success) {
        setCommunities(data.data);
      }
    } catch (error) {
      console.error('Error al cargar comunidades:', error);
    } finally {
      setIsLoadingCommunities(false);
    }
  };

  const handleProjectChange = (value: string) => {
    updateFormData({ project_id: value, community_id: '' });
    setCommunities([]);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.project_id) newErrors.project_id = 'Selecciona un proyecto';
    if (!formData.community_id) newErrors.community_id = 'Selecciona una comunidad';
    if (!formData.age_range) newErrors.age_range = 'Selecciona tu rango de edad';
    if (!formData.education_level) newErrors.education_level = 'Selecciona tu nivel educativo';

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
        label="Proyecto Minero"
        placeholder="Selecciona un proyecto"
        value={formData.project_id || ''}
        onChange={handleProjectChange}
        options={projects.map((p) => ({ value: p.id, label: p.name }))}
        error={errors.project_id}
        disabled={isLoadingProjects}
      />

      <Select
        label="Comunidad / Centro Poblado"
        placeholder="Selecciona una comunidad"
        value={formData.community_id || ''}
        onChange={(value) => updateFormData({ community_id: value })}
        options={communities.map((c) => ({ value: c.id, label: c.name }))}
        error={errors.community_id}
        disabled={!formData.project_id || isLoadingCommunities}
        helperText={!formData.project_id ? 'Primero selecciona un proyecto' : undefined}
      />

      <Select
        label="Rango de Edad"
        placeholder="Selecciona tu edad"
        value={formData.age_range || ''}
        onChange={(value) => updateFormData({ age_range: value })}
        options={AGE_RANGES}
        error={errors.age_range}
      />

      <Select
        label="Nivel Educativo"
        placeholder="Selecciona tu nivel"
        value={formData.education_level || ''}
        onChange={(value) => updateFormData({ education_level: value })}
        options={EDUCATION_LEVELS}
        error={errors.education_level}
      />

      <Button variant="primary" size="lg" fullWidth onClick={handleNext}>
        Siguiente
      </Button>
    </div>
  );
};
