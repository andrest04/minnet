/**
 * Consolidated user type mappings and constants
 * Used across authentication, registration, and routing
 */

export type UserType = "poblador" | "empresa" | "admin";
export type UserTypeDB = "resident" | "company" | "administrator";

/**
 * Maps frontend user types to database user types
 */
export const USER_TYPE_TO_DB = {
  poblador: "resident",
  empresa: "company",
  admin: "administrator",
} as const;

/**
 * Maps database user types to frontend user types
 */
export const DB_TO_USER_TYPE = {
  resident: "poblador",
  company: "empresa",
  administrator: "admin",
} as const;

/**
 * Maps user types to their dashboard routes
 */
export const USER_TYPE_ROUTES = {
  poblador: "/poblador",
  empresa: "/empresa",
  admin: "/admin",
  resident: "/poblador",
  company: "/empresa",
  administrator: "/admin",
} as const;

/**
 * User type display labels
 */
export const USER_TYPE_LABELS = {
  poblador: "Poblador",
  empresa: "Empresa",
  admin: "Administrador",
  resident: "Poblador",
  company: "Empresa",
  administrator: "Administrador",
} as const;
