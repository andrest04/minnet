-- MinneT Database Schema - Normalized Version
-- Ejecutar este script en el SQL Editor de Supabase

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLAS PRINCIPALES
-- ============================================================================

-- Tabla de regiones del Perú
CREATE TABLE IF NOT EXISTS regions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de proyectos mineros
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  region_id UUID NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(region_id, name)
);

-- Índices para projects
CREATE INDEX IF NOT EXISTS idx_projects_region_id ON projects(region_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status) WHERE status = 'active';

-- ============================================================================
-- TABLAS DE PERFILES (NORMALIZADAS)
-- ============================================================================

-- Tabla base de perfiles (solo datos comunes)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type TEXT NOT NULL CHECK (user_type IN ('resident', 'company', 'administrator')),
  email TEXT,
  phone TEXT,
  consent_version TEXT,
  consent_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT email_or_phone_required CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

-- Índices para profiles
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone) WHERE phone IS NOT NULL;

-- Tabla de perfiles de pobladores
CREATE TABLE IF NOT EXISTS residents (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  region_id UUID NOT NULL REFERENCES regions(id),
  project_id UUID NOT NULL REFERENCES projects(id),
  age_range TEXT NOT NULL,
  education_level TEXT NOT NULL,
  gender TEXT NOT NULL,
  profession TEXT NOT NULL,
  junta_link TEXT CHECK (junta_link IN ('member', 'familiar', 'none')),
  junta_relationship TEXT,
  topics_interest TEXT[] NOT NULL DEFAULT '{}',
  knowledge_level TEXT NOT NULL,
  participation_willingness TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para residents
CREATE INDEX IF NOT EXISTS idx_residents_region_id ON residents(region_id);
CREATE INDEX IF NOT EXISTS idx_residents_project_id ON residents(project_id);
CREATE INDEX IF NOT EXISTS idx_residents_region_project ON residents(region_id, project_id);

-- Tabla de perfiles de empresas
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  responsible_area TEXT NOT NULL,
  position TEXT NOT NULL,
  validation_status TEXT CHECK (validation_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  use_objective TEXT,
  consultation_frequency TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para companies
CREATE INDEX IF NOT EXISTS idx_companies_validation_status ON companies(validation_status);
CREATE INDEX IF NOT EXISTS idx_companies_pending ON companies(validation_status) WHERE validation_status = 'pending';

-- Tabla de relación many-to-many: empresas y proyectos asignados
CREATE TABLE IF NOT EXISTS company_projects (
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (company_id, project_id)
);

-- Índices para company_projects
CREATE INDEX IF NOT EXISTS idx_company_projects_company_id ON company_projects(company_id);
CREATE INDEX IF NOT EXISTS idx_company_projects_project_id ON company_projects(project_id);

-- Tabla de perfiles de administradores
CREATE TABLE IF NOT EXISTS administrators (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- FUNCIONES Y TRIGGERS
-- ============================================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_residents_updated_at
  BEFORE UPDATE ON residents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_administrators_updated_at
  BEFORE UPDATE ON administrators
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- POLÍTICAS DE SEGURIDAD (ROW LEVEL SECURITY)
-- ============================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE residents ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE administrators ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- Políticas para REGIONS
-- ----------------------------------------------------------------------------

CREATE POLICY "Regions are viewable by everyone"
  ON regions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can insert regions"
  ON regions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'administrator'
    )
  );

CREATE POLICY "Only admins can update regions"
  ON regions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'administrator'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'administrator'
    )
  );

CREATE POLICY "Only admins can delete regions"
  ON regions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'administrator'
    )
  );

-- ----------------------------------------------------------------------------
-- Políticas para PROJECTS
-- ----------------------------------------------------------------------------

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
      AND profiles.user_type = 'administrator'
    )
  );

CREATE POLICY "Only admins can update projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'administrator'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'administrator'
    )
  );

CREATE POLICY "Only admins can delete projects"
  ON projects FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'administrator'
    )
  );

-- ----------------------------------------------------------------------------
-- Políticas para PROFILES
-- ----------------------------------------------------------------------------

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
      AND profiles.user_type = 'administrator'
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
      AND profiles.user_type = 'administrator'
    )
  );

-- ----------------------------------------------------------------------------
-- Políticas para RESIDENTS
-- ----------------------------------------------------------------------------

CREATE POLICY "Residents can view their own data"
  ON residents FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all residents"
  ON residents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'administrator'
    )
  );

CREATE POLICY "Residents can insert their own data"
  ON residents FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Residents can update their own data"
  ON residents FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can update any resident"
  ON residents FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'administrator'
    )
  );

-- ----------------------------------------------------------------------------
-- Políticas para COMPANIES
-- ----------------------------------------------------------------------------

CREATE POLICY "Companies can view their own data"
  ON companies FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all companies"
  ON companies FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'administrator'
    )
  );

CREATE POLICY "Companies can insert their own data"
  ON companies FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Companies can update their own data"
  ON companies FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can update any company"
  ON companies FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'administrator'
    )
  );

-- ----------------------------------------------------------------------------
-- Políticas para COMPANY_PROJECTS
-- ----------------------------------------------------------------------------

CREATE POLICY "Companies can view their own projects"
  ON company_projects FOR SELECT
  TO authenticated
  USING (auth.uid() = company_id);

CREATE POLICY "Admins can view all company projects"
  ON company_projects FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'administrator'
    )
  );

CREATE POLICY "Only admins can assign projects to companies"
  ON company_projects FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'administrator'
    )
  );

CREATE POLICY "Only admins can remove project assignments"
  ON company_projects FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'administrator'
    )
  );

-- ----------------------------------------------------------------------------
-- Políticas para ADMINISTRATORS
-- ----------------------------------------------------------------------------

CREATE POLICY "Admins can view their own data"
  ON administrators FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all administrators"
  ON administrators FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'administrator'
    )
  );

CREATE POLICY "Admins can insert their own data"
  ON administrators FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can update their own data"
  ON administrators FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- DATOS INICIALES (SEED DATA)
-- ============================================================================

-- Insertar las 25 regiones del Perú
INSERT INTO regions (name) VALUES
  ('Amazonas'),
  ('Áncash'),
  ('Apurímac'),
  ('Arequipa'),
  ('Ayacucho'),
  ('Cajamarca'),
  ('Cusco'),
  ('Huancavelica'),
  ('Huánuco'),
  ('Ica'),
  ('Junín'),
  ('La Libertad'),
  ('Lambayeque'),
  ('Lima (Región)'),
  ('Loreto'),
  ('Madre de Dios'),
  ('Moquegua'),
  ('Pasco'),
  ('Piura'),
  ('Puno'),
  ('San Martín'),
  ('Tacna'),
  ('Tumbes'),
  ('Ucayali'),
  ('Provincia Constitucional del Callao')
ON CONFLICT (name) DO NOTHING;

-- Insertar proyectos de ejemplo asociados a regiones
INSERT INTO projects (region_id, name, status)
SELECT r.id, p.name, p.status
FROM regions r
CROSS JOIN (
  VALUES
    ('Proyecto Las Bambas', 'active', 'Apurímac'),
    ('Proyecto Yanacocha', 'active', 'Cajamarca'),
    ('Proyecto Antamina', 'active', 'Áncash')
) AS p(name, status, region_name)
WHERE r.name = p.region_name
ON CONFLICT (region_id, name) DO NOTHING;
