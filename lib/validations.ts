// Validaciones según requerimientos del documento

/**
 * Validación de email según RFC 5322 (simplificada)
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email);
};

/**
 * Validación de teléfono Perú: ^9\d{8}$
 * Debe empezar con 9 y tener 9 dígitos en total
 */
export const validatePhonePeru = (phone: string): boolean => {
  const phoneRegex = /^9\d{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
};

/**
 * Lista de dominios genéricos bloqueados para empresas
 * (editable por Admin en el futuro)
 */
export const GENERIC_EMAIL_DOMAINS = [
  "gmail.com",
  "hotmail.com",
  "outlook.com",
  "yahoo.com",
  "icloud.com",
  "live.com",
  "msn.com",
  "aol.com",
  "protonmail.com",
  "mail.com",
];

/**
 * Validación de email corporativo (no dominios genéricos)
 */
export const validateCorporateEmail = (email: string): boolean => {
  if (!validateEmail(email)) return false;
  const domain = email.split("@")[1]?.toLowerCase();
  return !GENERIC_EMAIL_DOMAINS.includes(domain);
};

/**
 * Validación de código OTP
 * Debe ser exactamente 6 dígitos numéricos
 */
export const validateOTP = (code: string): boolean => {
  const otpRegex = /^\d{6}$/;
  return otpRegex.test(code);
};

/**
 * Determina si un identificador es email o teléfono
 */
export const identifierType = (
  identifier: string
): "email" | "phone" | "invalid" => {
  const cleaned = identifier.trim();

  if (validateEmail(cleaned)) return "email";
  if (validatePhonePeru(cleaned)) return "phone";

  return "invalid";
};

/**
 * Formatea un teléfono peruano para display
 * Ejemplo: 987654321 -> 987 654 321
 */
export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\s/g, "");
  if (cleaned.length !== 9) return phone;

  return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
};

/**
 * Limpia un teléfono para guardarlo en la DB
 */
export const cleanPhone = (phone: string): string => {
  return phone.replace(/\s/g, "");
};

/**
 * Genera un código OTP de 6 dígitos
 */
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Calcula la fecha de expiración del OTP
 * Default: 5 minutos desde ahora
 */
export const getOTPExpiration = (minutes: number = 5): Date => {
  const now = new Date();
  return new Date(now.getTime() + minutes * 60000);
};

/**
 * Verifica si un OTP ha expirado
 */
export const isOTPExpired = (expiresAt: Date | string): boolean => {
  const expiration =
    typeof expiresAt === "string" ? new Date(expiresAt) : expiresAt;
  return new Date() > expiration;
};

/**
 * Valida el campo de edad (rango de edad)
 */
export const AGE_RANGES = [
  { value: "18-25", label: "18-25 años" },
  { value: "26-35", label: "26-35 años" },
  { value: "36-45", label: "36-45 años" },
  { value: "46-60", label: "46-60 años" },
  { value: "60+", label: "Más de 60 años" },
];

/**
 * Niveles educativos
 */
export const EDUCATION_LEVELS = [
  { value: "primaria", label: "Primaria" },
  { value: "secundaria", label: "Secundaria" },
  { value: "tecnico", label: "Técnico" },
  { value: "superior", label: "Superior" },
];

/**
 * Opciones de género
 */
export const GENDER_OPTIONS = [
  { value: "masculino", label: "Masculino" },
  { value: "femenino", label: "Femenino" },
];
export const PROFESSIONS = [
  { value: "agricultor", label: "Agricultor/a" },
  { value: "ganadero", label: "Ganadero/a" },
  { value: "comerciante", label: "Comerciante" },
  { value: "artesano", label: "Artesano/a" },
  { value: "profesor", label: "Profesor/a" },
  { value: "minero", label: "Minero/a" },
  { value: "construccion", label: "Construcción" },
  { value: "salud", label: "Salud (enfermero, médico, etc.)" },
  { value: "transporte", label: "Transporte" },
  { value: "servicios", label: "Servicios (restaurante, hospedaje, etc.)" },
  { value: "otro", label: "Otro" },
];

/**
 * Temas de interés
 */
export const TOPICS_OF_INTEREST = [
  { value: "agua", label: "Agua" },
  { value: "empleo", label: "Empleo" },
  { value: "medioambiente", label: "Medioambiente" },
  { value: "tierra", label: "Tierra" },
  { value: "seguridad", label: "Seguridad" },
  { value: "otros", label: "Otros" },
];

/**
 * Niveles de conocimiento del proyecto
 */
export const KNOWLEDGE_LEVELS = [
  { value: "bajo", label: "Bajo" },
  { value: "medio", label: "Medio" },
  { value: "alto", label: "Alto" },
];

/**
 * Disposición a participar
 */
export const PARTICIPATION_OPTIONS = [
  { value: "asambleas", label: "Asambleas" },
  { value: "capacitaciones", label: "Capacitaciones" },
  { value: "encuestas", label: "Encuestas" },
  { value: "no_participar", label: "No deseo participar" },
];

/**
 * Cargos de empresa
 */
export const COMPANY_POSITIONS = [
  { value: "gerente_social", label: "Gerente de Responsabilidad Social" },
  { value: "gestion_social", label: "Gestión Social" },
  { value: "conflictos", label: "Resolución de Conflictos" },
  { value: "analista", label: "Analista" },
  { value: "otro", label: "Otro" },
];

/**
 * Áreas encargadas de empresa
 */
export const COMPANY_AREAS = [
  {
    value: "gerencia_general_proyecto",
    label: "Gerencia General del Proyecto",
  },
  {
    value: "gerencia_relaciones_sociales",
    label: "Gerencia de Relaciones Sociales",
  },
];

/**
 * Niveles de parentesco para junta directiva
 */
export const JUNTA_RELATIONSHIPS = [
  { value: "padres", label: "Padres" },
  { value: "hijos", label: "Hijos" },
  { value: "amigo", label: "Amigo" },
  { value: "esposo_conyugue", label: "Esposo/a o Conyugue" },
];

/**
 * Objetivos de uso (empresa)
 */
export const USE_OBJECTIVES = [
  { value: "percepciones", label: "Monitoreo de percepciones" },
  { value: "estrategias", label: "Estrategias" },
  { value: "reportes", label: "Reportes" },
  { value: "riesgos", label: "Riesgos" },
];

/**
 * Frecuencia de consulta
 */
export const CONSULTATION_FREQUENCIES = [
  { value: "semanal", label: "Semanal" },
  { value: "quincenal", label: "Quincenal" },
  { value: "mensual", label: "Mensual" },
];

/**
 * Requisitos mínimos de contraseña
 */
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

/**
 * Valida requisitos de contraseña
 */
export const validatePassword = (
  password: string
): {
  isValid: boolean;
  errors: string[];
  strength: "weak" | "medium" | "strong";
} => {
  const errors: string[] = [];

  if (!password) {
    errors.push("La contraseña es requerida");
    return { isValid: false, errors, strength: "weak" };
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`Debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`);
  }

  if (password.length > PASSWORD_MAX_LENGTH) {
    errors.push(`No puede exceder ${PASSWORD_MAX_LENGTH} caracteres`);
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Debe incluir al menos una letra mayúscula");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Debe incluir al menos una letra minúscula");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Debe incluir al menos un número");
  }

  let strength: "weak" | "medium" | "strong" = "weak";
  if (errors.length === 0) {
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    const isLong = password.length >= 12;

    if (hasSpecial && isLong) {
      strength = "strong";
    } else if (hasSpecial || isLong) {
      strength = "medium";
    } else {
      strength = "medium";
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength,
  };
};
