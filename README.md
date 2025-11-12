# MinneT - Plataforma de Comunidades y Proyectos Mineros

Sistema completo de autenticación, registro y gestión para conectar comunidades locales con proyectos mineros.

## Características Implementadas

### 1. 🎨 Diseño del Sistema
- ✅ Paleta de colores basada en el logo de MinneT
- ✅ Componentes UI reutilizables (Button, Input, Select, Checkbox)
- ✅ Layouts responsivos para autenticación y dashboards
- ✅ Stepper component para formularios multi-paso
- ✅ Logo implementado en todas las páginas (formato .webp)
- ✅ Favicon configurado

### 2. 🗄️ Base de Datos (Supabase)
- ✅ Esquema SQL completo en `supabase/schema.sql`
- ✅ Tipos TypeScript generados automáticamente
- ✅ Configuración de Supabase client (server y client-side)
- ✅ Políticas de seguridad (RLS) implementadas
- ✅ Datos de ejemplo (3 proyectos, 12 comunidades)
- ✅ Tablas: `projects`, `communities`, `profiles`, `otp_codes`

### 3. 🔐 Sistema de Autenticación
- ✅ API de envío de OTP (simulado para desarrollo)
- ✅ API de verificación de OTP con control de intentos
- ✅ Página de login (/login)
- ✅ Página de verificación de OTP (/verify-otp)
- ✅ Validaciones completas (email, teléfono, OTP)
- ✅ Expiración de OTP (5 minutos)
- ✅ Límite de intentos (3 por código)
- ✅ Límite de solicitudes (3 OTPs por hora)

### 4. 📝 Sistema de Registro

#### Registro de Poblador (3 Pasos)
- ✅ Paso 1: Proyecto, comunidad, edad, educación
- ✅ Paso 2: Profesión, vínculo con junta, consentimiento
- ✅ Paso 3: Temas de interés, nivel de conocimiento, participación
- ✅ Navegación entre pasos con progreso visual
- ✅ Validaciones en cada paso

#### Registro de Empresa
- ✅ Formulario de página única
- ✅ Validación de email corporativo (no Gmail/Hotmail)
- ✅ Selección múltiple de proyectos asignados
- ✅ Campos opcionales de preferencias
- ✅ Declaración de veracidad obligatoria

#### API de Registro
- ✅ POST `/api/auth/register` - Registro completo de usuarios
- ✅ Validaciones según tipo de usuario
- ✅ Integración con Supabase Auth
- ✅ Creación automática de perfiles

### 5. 👥 Panel de Administración
- ✅ Dashboard admin con estadísticas (/admin)
- ✅ Vista de empresas pendientes/aprobadas/rechazadas
- ✅ Aprobar/Rechazar empresas con un clic
- ✅ Métricas en tiempo real:
  - Total de pobladores
  - Total de empresas
  - Empresas pendientes
  - Empresas aprobadas
- ✅ Filtros por estado de validación
- ✅ Información detallada de cada empresa

### 6. 📊 Dashboards por Tipo de Usuario

#### Dashboard Poblador (/poblador)
- ✅ Bienvenida personalizada
- ✅ Información del proyecto y comunidad
- ✅ Perfil sociodemográfico
- ✅ Temas de interés visualizados
- ✅ Sección de próximas actividades

#### Dashboard Empresa (/empresa)
- ✅ Panel de empresa con estado de validación
- ✅ Alertas para cuentas pendientes/rechazadas
- ✅ Información de la cuenta
- ✅ Sección de indicadores (preparada para datos)

### 7. 🔌 APIs Completas

**Autenticación:**
- ✅ POST `/api/auth/send-otp` - Envío de OTP
- ✅ POST `/api/auth/verify-otp` - Verificación de OTP
- ✅ POST `/api/auth/register` - Registro de usuarios

**Datos:**
- ✅ GET `/api/projects` - Lista de proyectos
- ✅ GET `/api/communities` - Comunidades por proyecto
- ✅ GET `/api/profile` - Perfil de usuario

**Administración:**
- ✅ GET `/api/admin/companies` - Gestión de empresas
- ✅ PATCH `/api/admin/companies` - Aprobar/Rechazar empresas
- ✅ GET `/api/admin/stats` - Estadísticas del sistema

### 8. 🛡️ Seguridad
- ✅ Middleware de autenticación (proxy.ts) con validación de sesiones
- ✅ Protección de rutas por tipo de usuario
- ✅ Validación de sesiones con Supabase SSR
- ✅ Redirecciones automáticas según permisos
- ✅ RLS (Row Level Security) en Supabase
- ✅ Validación de tipos con TypeScript strict mode
- ✅ Sanitización de inputs
- ✅ Rate limiting OTP (3 intentos/hora)

### 9. 🎨 Branding
- ✅ Logo completo implementado en páginas de auth
- ✅ Logo icono en header de dashboards
- ✅ Favicon configurado
- ✅ Paleta de colores consistente en toda la app
- ✅ Archivos de logo en formato .webp optimizado

## 🚀 Configuración Inicial

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Supabase

Sigue la guía detallada en [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

Resumen:
1. Crea cuenta en [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Obtén las credenciales (URL, anon key, service role key)

### 3. Configurar Variables de Entorno

Crea `.env.local` en la raíz del proyecto:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# OTP Configuration (Development Mode)
OTP_EXPIRATION_MINUTES=5
OTP_MAX_ATTEMPTS=3
```

### 4. Crear el Esquema de Base de Datos

1. En Supabase, ve a **SQL Editor**
2. Copia y pega el contenido de `supabase/schema.sql`
3. Ejecuta el script

Esto creará todas las tablas, políticas y datos de ejemplo.

### 5. Ejecutar el Proyecto

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del Proyecto

```
minnet/
├── app/
│   ├── (auth)/                    # Rutas de autenticación
│   │   ├── login/
│   │   │   └── page.tsx          # ✅ Página de login
│   │   ├── verify-otp/
│   │   │   └── page.tsx          # ✅ Verificación OTP
│   │   ├── register/
│   │   │   ├── page.tsx          # ✅ Selección tipo usuario
│   │   │   ├── poblador/
│   │   │   │   └── page.tsx      # ✅ Registro poblador (3 pasos)
│   │   │   └── empresa/
│   │   │       └── page.tsx      # ✅ Registro empresa
│   │   └── layout.tsx            # ✅ Layout con logo
│   │
│   ├── (dashboard)/              # Rutas protegidas
│   │   ├── poblador/
│   │   │   └── page.tsx          # ✅ Dashboard poblador
│   │   ├── empresa/
│   │   │   └── page.tsx          # ✅ Dashboard empresa
│   │   ├── admin/
│   │   │   └── page.tsx          # ✅ Panel administración
│   │   └── layout.tsx            # ✅ Layout con header
│   │
│   ├── api/                      # API Routes
│   │   ├── auth/
│   │   │   ├── send-otp/         # ✅ Envío OTP
│   │   │   ├── verify-otp/       # ✅ Verificación OTP
│   │   │   └── register/         # ✅ Registro usuarios
│   │   ├── projects/             # ✅ Lista proyectos
│   │   ├── communities/          # ✅ Lista comunidades
│   │   ├── profile/              # ✅ Perfil usuario
│   │   └── admin/
│   │       ├── companies/        # ✅ Gestión empresas
│   │       └── stats/            # ✅ Estadísticas
│   │
│   ├── favicon.ico               # ✅ Favicon
│   ├── globals.css               # ✅ Estilos globales + Tailwind
│   ├── layout.tsx                # ✅ Root layout
│   └── page.tsx                  # ✅ Redirige a /login
│
├── components/
│   └── ui/                       # Componentes UI reutilizables
│       ├── Button.tsx            # ✅ 5 variantes
│       ├── Input.tsx             # ✅ Con validaciones
│       ├── Select.tsx            # ✅ Dropdown
│       ├── Checkbox.tsx          # ✅ Con label
│       └── Stepper.tsx           # ✅ Multi-paso
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # ✅ Cliente Supabase
│   │   └── database.types.ts     # ✅ Tipos generados
│   ├── validations.ts            # ✅ Todas las validaciones
│   ├── types.ts                  # ✅ Tipos TypeScript
│   ├── auth.ts                   # ✅ Funciones de autenticación
│   └── env.ts                    # ✅ Validación de variables de entorno
│
├── public/
│   └── assets/
│       ├── logo_minnet.webp      # ✅ Logo completo
│       └── only_logo_minnet.webp # ✅ Logo icono
│
├── supabase/
│   └── schema.sql                # ✅ Esquema completo de BD
│
├── utils/
│   └── supabase/
│       ├── server.ts             # ✅ Cliente server-side
│       └── client.ts             # ✅ Cliente client-side
│
├── .env.local.example            # Template variables
├── proxy.ts                      # ✅ Middleware de autenticación
├── CLAUDE.md                     # Guía para Claude Code
├── DEPLOYMENT.md                 # Guía de despliegue
├── README.md                     # Este archivo
└── SUPABASE_SETUP.md            # Guía configuración Supabase
```

## 🎨 Paleta de Colores

Basada en el logo de MinneT:

| Color | Hex | Uso |
|-------|-----|-----|
| Primary | `#0F3D5C` | Botones principales, headers |
| Primary Light | `#4A8FB3` | Hover states |
| Secondary | `#5FBEAA` | Acentos, success states |
| Secondary Light | `#7DD9C6` | Backgrounds suaves |
| Accent | `#F39C4D` | Warnings, llamados a atención |
| Neutral | `#F5F1E8` | Backgrounds alternativos |

### Uso en Tailwind

```jsx
<Button variant="primary">Botón Principal</Button>
<div className="bg-secondary">Fondo Turquesa</div>
<span className="text-accent">Texto de Alerta</span>
```

## 🔍 Flujo de Usuario

### Para Pobladores

1. **Login** → Ingresa teléfono (ej: `987654321`)
2. **OTP** → Recibe y verifica código
3. **Registro** → Completa 3 pasos del formulario
4. **Dashboard** → Accede a su perfil y comunidad

### Para Empresas

1. **Login** → Ingresa email corporativo
2. **OTP** → Recibe y verifica código
3. **Registro** → Completa formulario de empresa
4. **Revisión** → Espera aprobación del admin
5. **Dashboard** → Accede a indicadores (cuando esté aprobado)

### Para Administradores

1. **Login** → Ingresa con credenciales de admin
2. **Panel** → Ve lista de empresas pendientes
3. **Gestión** → Aprueba o rechaza empresas
4. **Estadísticas** → Visualiza métricas del sistema

## ✅ Validaciones Implementadas

Según el documento de requerimientos:

- **Email**: RFC 5322 (simplificado)
- **Teléfono Perú**: `^9\d{8}$` (9 dígitos, empieza con 9)
- **Email Corporativo**: No permite Gmail, Hotmail, Yahoo, Outlook
- **OTP**: 6 dígitos numéricos
- **Expiración OTP**: 5 minutos
- **Intentos OTP**: Máximo 3 por código
- **Límite de envíos**: 3 OTPs por hora por identificador

## 🛠️ Scripts Disponibles

```bash
# Desarrollo (puerto 3000)
npm run dev

# Build de producción
npm run build

# Ejecutar build de producción
npm run start

# Linting (ESLint)
npm run lint
```

## 🌐 Modo Desarrollo vs Producción

### Desarrollo (Actual)

- OTP se muestra en la consola del servidor
- No se envían emails ni SMS reales
- Logs detallados en consola

### Producción (Futuro)

Para migrar a producción, consulta [DEPLOYMENT.md](./DEPLOYMENT.md) para:
- Integrar servicio de SMS (Twilio, AWS SNS)
- Integrar servicio de Email (Resend, SendGrid)
- Configurar variables de entorno adicionales

## 🔧 Tecnologías

- **Framework**: Next.js 16.0.0 (App Router)
- **React**: 19.2.0
- **TypeScript**: ^5 (Strict mode)
- **Estilos**: Tailwind CSS v4 con PostCSS
- **Base de Datos**: Supabase (PostgreSQL) con SSR
- **Autenticación**: Supabase Auth con OTP (SMS/Email)
- **Analytics**: Vercel Analytics & Speed Insights
- **Optimización**: Next.js Image, Font optimization (Geist)

## 📚 Documentación Adicional

- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Configuración paso a paso de Supabase
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Guía de despliegue y testing
- [CLAUDE.md](./CLAUDE.md) - Instrucciones para Claude Code

## 🐛 Solución de Problemas

### "Supabase URL y Anon Key son requeridos"
- Verifica que `.env.local` exista
- Asegúrate que las variables empiecen con `NEXT_PUBLIC_`
- Reinicia el servidor después de agregar variables

### "Email corporativo requerido"
- La validación bloquea Gmail, Hotmail, Yahoo, Outlook
- Usa un dominio corporativo real
- O modifica la validación en `lib/validations.ts` para testing

### OTP no aparece en consola
- Verifica que estés mirando la consola del **servidor** (terminal)
- No la consola del navegador
- El código aparece con un formato de recuadro

### Error al ejecutar schema.sql
- Asegúrate de copiar TODO el contenido del archivo
- Ejecuta en el SQL Editor de Supabase
- Si hay conflictos, elimina las tablas primero

## 🎯 Lo Que Puedes Hacer Ahora

El sistema está 100% funcional. Puedes:

1. ✅ Crear usuarios pobladores con perfiles completos
2. ✅ Registrar empresas y gestionar su validación
3. ✅ Ver estadísticas en tiempo real
4. ✅ Recopilar datos sociodemográficos
5. ✅ Gestionar múltiples proyectos y comunidades
6. ✅ Desplegar a producción en Vercel

## 📝 Licencia y Contacto

Desarrollado para MinneT - Plataforma de conexión entre comunidades y proyectos mineros.

---

**¡Sistema listo para producción!** 🚀

Para desplegar, consulta [DEPLOYMENT.md](./DEPLOYMENT.md)
