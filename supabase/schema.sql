-- MinneT Database Schema
-- Ejecutar este script en el SQL Editor de Supabase

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de proyectos mineros
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  status TEXT CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de comunidades
CREATE TABLE IF NOT EXISTS communities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, name)
);

-- Crear índice para búsquedas por proyecto
CREATE INDEX IF NOT EXISTS idx_communities_project_id ON communities(project_id);

-- Tabla de perfiles de usuario (extiende auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type TEXT NOT NULL CHECK (user_type IN ('poblador', 'empresa', 'admin')),
  email TEXT,
  phone TEXT,

  -- Campos específicos de poblador
  project_id UUID REFERENCES projects(id),
  community_id UUID REFERENCES communities(id),
  age_range TEXT,
  education_level TEXT,
  profession TEXT,
  junta_link BOOLEAN,
  topics_interest TEXT[], -- Array de temas
  knowledge_level TEXT,
  participation_willingness TEXT[], -- Array de opciones

  -- Campos específicos de empresa
  full_name TEXT,
  company_name TEXT,
  position TEXT,
  assigned_projects TEXT[], -- Array de UUIDs de proyectos
  validation_status TEXT CHECK (validation_status IN ('pending', 'approved', 'rejected')),
  use_objective TEXT,
  consultation_frequency TEXT,
  export_format TEXT,

  -- Metadata de consentimiento
  consent_version TEXT,
  consent_date TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_project_id ON profiles(project_id);
CREATE INDEX IF NOT EXISTS idx_profiles_community_id ON profiles(community_id);
CREATE INDEX IF NOT EXISTS idx_profiles_validation_status ON profiles(validation_status);

-- Tabla de códigos OTP
CREATE TABLE IF NOT EXISTS otp_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  identifier TEXT NOT NULL, -- email o teléfono
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INT DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para búsquedas rápidas de OTP
CREATE INDEX IF NOT EXISTS idx_otp_identifier ON otp_codes(identifier, verified);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at en profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Función para limpiar OTPs expirados (se puede ejecutar con pg_cron)
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
  DELETE FROM otp_codes WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Políticas de seguridad (Row Level Security)

-- Habilitar RLS en todas las tablas
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;

-- Políticas para projects (todos pueden leer, solo admins pueden modificar)
CREATE POLICY "Projects are viewable by everyone"
  ON projects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can insert projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

-- Políticas para communities (todos pueden leer)
CREATE POLICY "Communities are viewable by everyone"
  ON communities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can insert communities"
  ON communities FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

-- Políticas para profiles
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

-- Políticas para otp_codes (solo acceso a través de funciones del servidor)
CREATE POLICY "OTP codes are only accessible by service role"
  ON otp_codes FOR ALL
  TO service_role
  USING (true);

-- Datos iniciales (seed data)

-- Insertar proyectos de ejemplo
INSERT INTO projects (name, status) VALUES
  ('Proyecto Las Bambas', 'active'),
  ('Proyecto Yanacocha', 'active'),
  ('Proyecto Antamina', 'active')
ON CONFLICT (name) DO NOTHING;

-- Insertar comunidades de ejemplo para cada proyecto
INSERT INTO communities (project_id, name)
SELECT p.id, c.name
FROM projects p
CROSS JOIN (
  VALUES
    ('Fuerabamba'),
    ('Challhuahuacho'),
    ('Huancuire'),
    ('Chicñahui')
) AS c(name)
WHERE p.name = 'Proyecto Las Bambas'
ON CONFLICT (project_id, name) DO NOTHING;

INSERT INTO communities (project_id, name)
SELECT p.id, c.name
FROM projects p
CROSS JOIN (
  VALUES
    ('Porcón'),
    ('La Jalca'),
    ('Tual'),
    ('Combayo')
) AS c(name)
WHERE p.name = 'Proyecto Yanacocha'
ON CONFLICT (project_id, name) DO NOTHING;

INSERT INTO communities (project_id, name)
SELECT p.id, c.name
FROM projects p
CROSS JOIN (
  VALUES
    ('San Marcos'),
    ('Huallanca'),
    ('Conchucos'),
    ('Ajoyanca')
) AS c(name)
WHERE p.name = 'Proyecto Antamina'
ON CONFLICT (project_id, name) DO NOTHING;

-- Nota: El usuario admin se creará a través de la interfaz después del primer registro
