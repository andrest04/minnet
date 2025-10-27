# MinneT - Plataforma de Comunidades y Proyectos Mineros

Sistema de autenticación y registro para conectar comunidades locales con proyectos mineros.

## Estado del Proyecto

### ✅ MVP Completo

1. **Diseño del Sistema**
   - Paleta de colores basada en el logo de MinneT
   - Componentes UI reutilizables (Button, Input, Select, Checkbox)
   - Layouts para autenticación y dashboard
   - Stepper component para formularios multi-paso

2. **Base de Datos**
   - Esquema SQL completo en `supabase/schema.sql`
   - Tipos TypeScript para toda la aplicación
   - Configuración de Supabase client
   - Políticas de seguridad (RLS)
   - Datos de ejemplo (3 proyectos, 12 comunidades)

3. **Sistema de Autenticación**
   - API de envío de OTP (simulado para desarrollo)
   - API de verificación de OTP
   - Página de login
   - Página de verificación de OTP
   - Validaciones completas (email, teléfono, OTP)

4. **Sistema de Registro**
   - Registro de poblador (3 pasos)
   - Registro de empresa (página única)
   - Página de selección de tipo de usuario
   - API de registro con validaciones

5. **Panel de Administración**
   - Vista de empresas pendientes/aprobadas/rechazadas
   - Aprobar/Rechazar empresas
   - Estadísticas generales
   - Dashboard con métricas clave

6. **Dashboards**
   - Dashboard de poblador con información de comunidad y perfil
   - Dashboard de empresa con estado de validación
   - Sistema de navegación y logout

7. **APIs Completas**
   - POST `/api/auth/send-otp` - Envío de OTP
   - POST `/api/auth/verify-otp` - Verificación de OTP
   - POST `/api/auth/register` - Registro de usuarios
   - GET `/api/projects` - Lista de proyectos
   - GET `/api/communities` - Comunidades por proyecto
   - GET `/api/profile` - Perfil de usuario
   - GET `/api/admin/companies` - Gestión de empresas
   - PATCH `/api/admin/companies` - Aprobar/Rechazar empresas
   - GET `/api/admin/stats` - Estadísticas del sistema

8. **Protección de Rutas**
   - Middleware de Next.js
   - Protección en el cliente con localStorage
   - Redirecciones automáticas

## Configuración Inicial

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Ve a **Settings > API** y copia:
   - Project URL
   - Anon/Public Key
   - Service Role Key (secreto)

### 3. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

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

1. En tu proyecto de Supabase, ve a **SQL Editor**
2. Crea una nueva query
3. Copia y pega todo el contenido de `supabase/schema.sql`
4. Ejecuta la query

Esto creará:
- Tablas: `projects`, `communities`, `profiles`, `otp_codes`
- Políticas de seguridad (RLS)
- Datos iniciales (3 proyectos con 4 comunidades cada uno)

### 5. Ejecutar el Proyecto

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Flujo de Autenticación (Actual)

### Login

1. El usuario ingresa email o teléfono en `/login`
2. Se valida el formato
3. Se genera un OTP de 6 dígitos
4. Se guarda en la base de datos con expiración de 5 minutos
5. En modo dev, el código se muestra en la consola del servidor

### Verificación de OTP

1. El usuario ingresa el código de 6 dígitos en `/verify-otp`
2. Se valida el código contra la base de datos
3. Si es correcto:
   - Si el usuario existe → redirige a su dashboard
   - Si no existe → redirige a registro
4. Máximo 3 intentos por código

## Estructura del Proyecto

```
minnet/
├── app/
│   ├── (auth)/              # Rutas de autenticación
│   │   ├── login/
│   │   ├── verify-otp/
│   │   ├── register/        # [Pendiente]
│   │   └── layout.tsx
│   ├── (dashboard)/         # Rutas protegidas
│   │   ├── poblador/        # [Pendiente]
│   │   ├── empresa/         # [Pendiente]
│   │   ├── admin/           # [Pendiente]
│   │   └── layout.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   ├── send-otp/
│   │   │   └── verify-otp/
│   │   ├── projects/
│   │   └── communities/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── ui/                  # Componentes reutilizables
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Select.tsx
│       └── Checkbox.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts        # Cliente de Supabase
│   │   └── database.types.ts # Tipos de DB
│   ├── validations.ts       # Validaciones y constantes
│   └── types.ts             # Tipos TypeScript
└── supabase/
    └── schema.sql           # Esquema de base de datos
```

## Paleta de Colores

Basada en el logo de MinneT:

| Color | Valor | Uso |
|-------|-------|-----|
| Primary | `#0F3D5C` | Azul navy - Botones principales, headers |
| Primary Light | `#4A8FB3` | Azul medio - Hover states |
| Secondary | `#5FBEAA` | Turquesa - Acentos, success states |
| Secondary Light | `#7DD9C6` | Turquesa claro - Backgrounds suaves |
| Accent | `#F39C4D` | Naranja - Warnings, llamados de atención |
| Neutral | `#F5F1E8` | Beige - Backgrounds alternativos |

### Uso en Tailwind

```jsx
<Button variant="primary">Botón Principal</Button>
<div className="bg-secondary text-white">Fondo Turquesa</div>
<span className="text-accent">Texto de Alerta</span>
```

## Validaciones Implementadas

Según el documento de requerimientos:

- **Email**: RFC 5322 (simplificado)
- **Teléfono Perú**: `^9\d{8}$` (9 dígitos, empieza con 9)
- **OTP**: 6 dígitos numéricos
- **Expiración OTP**: 5 minutos
- **Intentos OTP**: Máximo 3 por código
- **Límite de envíos**: 3 OTPs por hora por identificador

## Próximos Pasos

1. **Crear formularios de registro**:
   - Poblador (3 pasos): Datos básicos → Consentimiento → Preferencias
   - Empresa: Datos corporativos → Proyectos asignados

2. **Panel de administración**:
   - Lista de empresas pendientes
   - Aprobar/Rechazar empresas

3. **Dashboards**:
   - Vista poblador: Información del proyecto, participación
   - Vista empresa: Indicadores, reportes
   - Vista admin: Gestión completa

4. **Middleware de autenticación**:
   - Proteger rutas según tipo de usuario
   - Verificar sesiones
   - Redireccionamientos automáticos

## Modo Desarrollo vs Producción

### Desarrollo (Actual)

- OTP se muestra en la consola del servidor
- No se envían emails ni SMS reales

### Producción (Futuro)

- Integrar servicio de SMS (Twilio, AWS SNS)
- Integrar servicio de Email (Resend, SendGrid)
- Variables de entorno adicionales para APIs externas

## Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build de producción
npm run build

# Ejecutar build
npm run start

# Linting
npm run lint
```

## Tecnologías

- **Framework**: Next.js 16 (App Router)
- **React**: 19.2.0
- **TypeScript**: ^5
- **Estilos**: Tailwind CSS v4
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: OTP (SMS/Email)

## Soporte

Para problemas o preguntas sobre el proyecto, consulta:
- Documento de requerimientos original
- CLAUDE.md para guías de desarrollo
- Código comentado en los archivos

---

**Nota**: Este es un MVP (Producto Mínimo Viable) enfocado en autenticación y recopilación de datos. Las funcionalidades avanzadas se implementarán en fases posteriores.
