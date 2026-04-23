-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.agentes_ia (
  id text NOT NULL,
  nombre text,
  Estado text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT agentes_ia_pkey PRIMARY KEY (id)
);
CREATE TABLE public.conversaciones (
  id text NOT NULL,
  numero_waba_id text,
  agente_ia_id text,
  creado_en timestamp with time zone DEFAULT now(),
  isActive boolean NOT NULL DEFAULT true,
  cliente text,
  agente text,
  img text,
  Id_waba_agent text,
  CONSTRAINT conversaciones_pkey PRIMARY KEY (id),
  CONSTRAINT conversaciones_agente_ia_id_fkey FOREIGN KEY (agente_ia_id) REFERENCES public.agentes_ia(id),
  CONSTRAINT conversaciones_numero_waba_id_fkey FOREIGN KEY (numero_waba_id) REFERENCES public.numeros_waba(id)
);
CREATE TABLE public.mensajes (
  id text NOT NULL,
  conversacion_id text,
  remitente text,
  contenido text,
  creado_en timestamp with time zone NOT NULL DEFAULT (now() AT TIME ZONE 'utc'::text),
  CONSTRAINT mensajes_pkey PRIMARY KEY (id),
  CONSTRAINT mensajes_conversacion_id_fkey FOREIGN KEY (conversacion_id) REFERENCES public.conversaciones(id)
);
CREATE TABLE public.numeros_waba (
  id text NOT NULL,
  nombre text,
  telefono text UNIQUE,
  CONSTRAINT numeros_waba_pkey PRIMARY KEY (id)
);
CREATE TABLE public.user_profiles (
  id uuid NOT NULL,
  email text,
  nombre text,
  rol text DEFAULT 'agent'::text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT user_profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);