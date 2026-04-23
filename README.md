# SST IA Labs - WhatsApp Business API Admin Panel

Panel de administración para gestión de WhatsApp Business API con agentes de IA integrados. Interfaz tipo WhatsApp Web para controlar conversaciones, enviar mensajes manuales y gestionar agentes virtuales.

## 🚀 Características

### ✅ WhatsApp Business API Integration
- **Envío de mensajes**: API v19 con validación E.164
- **Control de agentes**: Toggle ON/OFF para automatización
- **Mensajes manuales**: Envío directo cuando agente desactivado
- **API Routes**: Backend integrado sin configuración CORS

### ✅ Interfaz WhatsApp Web
- **Dos columnas**: Lista de conversaciones + chat activo
- **Responsive**: Desktop completo + Mobile con drawer
- **Mensajes diferenciados**: Enviados (verde) vs Recibidos (blanco)
- **Scroll automático**: Al final del chat al seleccionar conversación

### ✅ Gestión Completa
- **Conversaciones reales**: Datos desde Supabase
- **Base de datos**: PostgreSQL con Row Level Security
- **Autenticación**: Supabase Auth integrada
- **Agentes IA**: Configuración y control de agentes virtuales

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 14.0.0 con App Router
- **Frontend**: React 18.2.0 con TypeScript 5.2.0
- **Styling**: Tailwind CSS 3.3.5
- **Backend**: API Routes de Next.js
- **Database**: Supabase (PostgreSQL)
- **WhatsApp API**: Meta WhatsApp Business Cloud API v19.0

## 📋 Requisitos Previos

### 🔧 Técnicos
- **Node.js**: 18+
- **npm** o **yarn**

### 🌐 Servicios Externos

#### 1. Supabase
- **Proyecto configurado** con base de datos PostgreSQL
- **Tablas**: `conversaciones`, `mensajes`, `agentes_ia`
- **Row Level Security** habilitado

#### 2. Meta Developer Account
- **Cuenta verificada** en [Meta for Developers](https://developers.facebook.com/)
- **App de WhatsApp Business** configurada
- **Número de teléfono** verificado para WhatsApp
- **Token de acceso permanente** generado

## 🚀 Instalación y Configuración

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno

Copia el archivo de ejemplo:
```bash
cp .env.example.staging .env.local
```

Edita `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui

# WhatsApp Business API
WHATSAPP_ACCESS_TOKEN=EAApoIVfVdboBOyFt1IZAU23A9PYeugYrZBAcapeMSvzIxZA383T06SVnUzXn8RiZBZBVtwbcJwdNkObmU1TxjlN2UjgLDrgxWXXxIZAwDycwD0kiCYqoRcNjnQ3ZC7rndiIPpZA8sfMClUOAYLoJnrRnJiN7eE36OSlpfEdZBxkZAzXYeQe9pTk73E7JbIvyMmgQZDZD
WHATSAPP_PHONE_NUMBER_ID=1041139959089092
```

### 3. Ejecutar en desarrollo
```bash
npm run dev
```

### 4. Construir para producción
```bash
npm run build
npm start
```

## 📁 Estructura del Proyecto

```
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── conversations/        # Gestión de conversaciones
│   │   │   └── toggle/route.ts   # Toggle agente ON/OFF
│   │   └── whatsapp/             # WhatsApp API
│   │       └── send/route.ts     # Envío de mensajes
│   ├── whatsapp/                 # Página principal
│   │   └── page.tsx              # Interfaz WhatsApp
│   ├── layout.tsx                # Layout raíz
│   └── page.tsx                  # Redirección a /whatsapp
├── components/                   # Componentes React
│   ├── CombinedSidebar.tsx       # Sidebar unificado con navegación y conversaciones
│   ├── ChatWindow.tsx            # Ventana de chat con mensajes y input
│   └── ChatArea.tsx              # Componente legacy de chat
├── lib/                          # Utilidades
│   └── supabase.ts               # Cliente Supabase
├── types/                        # Tipos TypeScript
│   ├── conversation.ts           # Tipo Conversation
│   └── message.ts                # Tipo Message
└── ...
```

## 🔧 Desarrollo

### Scripts disponibles
```bash
npm run dev          # Servidor de desarrollo
npm run build        # Construir para producción
npm run start        # Ejecutar en producción
npm run lint         # Ejecutar ESLint
npm run type-check   # Verificar tipos TypeScript
```

### Arquitectura de Componentes
- **CombinedSidebar**: Sidebar fijo con navegación y lista de conversaciones
- **ChatWindow**: Área de chat completa con mensajes, input y toggle de IA
- **API Routes**: Endpoints para WhatsApp API y gestión de conversaciones

## 🚀 Despliegue

### Vercel (Recomendado)
1. Conectar repositorio a Vercel
2. Configurar variables de entorno en Vercel
3. Deploy automático

### Variables de Entorno Requeridas
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`

## 📝 Notas de Desarrollo

- **Límite de archivos**: Máximo 500 líneas por archivo
- **TypeScript**: Tipado estricto habilitado
- **Tailwind**: Clases utilitarias para styling
- **Supabase**: Cliente configurado en `lib/supabase.ts`

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.