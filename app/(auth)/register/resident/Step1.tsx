"use client";

import { useState, useEffect } from "react";
import { CustomSelect as Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  AGE_RANGES,
  EDUCATION_LEVELS,
  GENDER_OPTIONS,
} from "@/lib/validations";
import type { ResidentRegistrationData } from "@/lib/types";

interface Step1Props {
  formData: Partial<ResidentRegistrationData>;
  updateFormData: (data: Partial<ResidentRegistrationData>) => void;
  onNext: () => void;
}

interface Region {
  id: string;
  name: string;
}

interface Project {
  id: string;
  region_id: string;
  name: string;
}

export const Step1 = ({ formData, updateFormData, onNext }: Step1Props) => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingRegions, setIsLoadingRegions] = useState(true);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchRegions();
  }, []);

  useEffect(() => {
    if (formData.region_id) {
      fetchProjects(formData.region_id);
    } else {
      setProjects([]);
    }
  }, [formData.region_id]);

  const fetchRegions = async () => {
    try {
      const response = await fetch("/api/regions");
      const data = await response.json();
      if (data.success) {
        setRegions(data.data);
      }
    } catch (error) {
      console.error("Error al cargar regiones:", error);
    } finally {
      setIsLoadingRegions(false);
    }
  };

  const fetchProjects = async (regionId: string) => {
    setIsLoadingProjects(true);
    try {
      const response = await fetch(`/api/projects?region_id=${regionId}`);
      const data = await response.json();
      if (data.success) {
        setProjects(data.data);
      }
    } catch (error) {
      console.error("Error al cargar proyectos:", error);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const handleRegionChange = (value: string) => {
    updateFormData({ region_id: value, project_id: "" });
    setProjects([]);
  };

  const handleProjectChange = (value: string) => {
    updateFormData({ project_id: value });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.region_id) newErrors.region_id = "Selecciona una región";
    if (!formData.project_id) newErrors.project_id = "Selecciona un proyecto";
    if (!formData.age_range)
      newErrors.age_range = "Selecciona tu rango de edad";
    if (!formData.education_level)
      newErrors.education_level = "Selecciona tu nivel educativo";
    if (!formData.gender) newErrors.gender = "Selecciona tu género";

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
        label="Región"
        placeholder="Selecciona tu región"
        value={formData.region_id || ""}
        onChange={handleRegionChange}
        options={regions.map((r) => ({ value: r.id, label: r.name }))}
        error={errors.region_id}
        disabled={isLoadingRegions}
      />

      <Select
        label="Proyecto Minero"
        placeholder="Selecciona un proyecto"
        value={formData.project_id || ""}
        onChange={handleProjectChange}
        options={projects.map((p) => ({ value: p.id, label: p.name }))}
        error={errors.project_id}
        disabled={!formData.region_id || isLoadingProjects}
        helperText={
          !formData.region_id ? "Primero selecciona una región" : undefined
        }
      />

      <Select
        label="Rango de Edad"
        placeholder="Selecciona tu edad"
        value={formData.age_range || ""}
        onChange={(value) => updateFormData({ age_range: value })}
        options={AGE_RANGES}
        error={errors.age_range}
      />

      <Select
        label="Nivel Educativo"
        placeholder="Selecciona tu nivel"
        value={formData.education_level || ""}
        onChange={(value) => updateFormData({ education_level: value })}
        options={EDUCATION_LEVELS}
        error={errors.education_level}
      />

      <Select
        label="Género"
        placeholder="Selecciona tu género"
        value={formData.gender || ""}
        onChange={(value) => updateFormData({ gender: value })}
        options={GENDER_OPTIONS}
        error={errors.gender}
      />

      <Button className="w-full" size="lg" onClick={handleNext}>
        Siguiente
      </Button>
    </div>
  );
};
