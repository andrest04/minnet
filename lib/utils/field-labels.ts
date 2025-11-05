export const EDUCATION_LABELS: Record<string, string> = {
  primaria: "Primaria",
  secundaria: "Secundaria",
  tecnico: "Técnico",
  universitario: "Universitario",
  posgrado: "Posgrado",
  ninguno: "Ninguno",
};

export const AGE_RANGE_LABELS: Record<string, string> = {
  "18-25": "18-25 años",
  "26-35": "26-35 años",
  "36-45": "36-45 años",
  "46-55": "46-55 años",
  "56-65": "56-65 años",
  "65+": "65+ años",
};

export const TOPIC_LABELS: Record<string, string> = {
  empleo: "Empleo",
  salud: "Salud",
  educacion: "Educación",
  ambiente: "Medio Ambiente",
  infraestructura: "Infraestructura",
  desarrollo: "Desarrollo Comunitario",
  seguridad: "Seguridad",
};

export const POSITION_LABELS: Record<string, string> = {
  gerente_social: "Gerente de Responsabilidad Social",
  gestion_social: "Gestión Social",
  conflictos: "Resolución de Conflictos",
  analista: "Analista",
  otro: "Otro",
};

export const RESPONSIBLE_AREA_LABELS: Record<string, string> = {
  gerencia_general_proyecto: "Gerencia General del Proyecto",
  gerencia_relaciones_sociales: "Gerencia de Relaciones Sociales",
  otro: "Otro",
};

export const USE_OBJECTIVE_LABELS: Record<string, string> = {
  percepciones: "Monitoreo de Percepciones",
  estrategias: "Desarrollo de Estrategias",
  reportes: "Generación de Reportes",
  riesgos: "Gestión de Riesgos",
  otro: "Otro",
};

export const CONSULTATION_FREQUENCY_LABELS: Record<string, string> = {
  semanal: "Semanal",
  quincenal: "Quincenal",
  mensual: "Mensual",
  trimestral: "Trimestral",
};

export const KNOWLEDGE_LEVEL_LABELS: Record<string, string> = {
  nulo: "Nulo",
  basico: "Básico",
  intermedio: "Intermedio",
  avanzado: "Avanzado",
};

export const PARTICIPATION_LABELS: Record<string, string> = {
  consultas: "Participación en Consultas Públicas",
  talleres: "Asistencia a Talleres Comunitarios",
  reuniones: "Reuniones con Representantes",
  comites: "Participación en Comités Locales",
  ninguno: "Ninguna Participación Previa",
};

export const VALIDATION_STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  approved: "Aprobada",
  rejected: "Rechazada",
};

export function getLabel<T extends Record<string, string>>(
  map: T,
  key: string | undefined | null,
  fallback = "N/A"
): string {
  if (!key) return fallback;
  return map[key as keyof T] || fallback;
}
