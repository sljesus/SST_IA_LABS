# SPEC: Theme Consistente para SST_IA_LABS

## 1. Problema

El sistema de theme actual tiene **dos enfoques mezclados**:

### Estado actual
| Componente | approach | theme toggle? |
|-----------|----------|---------------|
| `page.tsx` | `isDarkMode` hardcoded | ❌ No responde |
| `Sidebar.tsx` | CSS variables | ✅ Sí |
| `ChatWindow.tsx` | CSS variables | ✅ Sí |
| `globals.css` | `:root` / `.dark` | ✅ |

### Síntomas
- Toggle en Sidebar cambia clase `.dark` en `document.documentElement`
- Colores de CSS variables cambian correctamente en Sidebar y ChatWindow
- `page.tsx` tiene `style={{ backgroundColor: isDarkMode ? '#0b1418' : '#f3f4f6' }}` hardcoded
- Cuando se toggla theme, página principal no cambia de color

## 2. Solución propuesta

### Arquitectura objetivo

```
┌─────────────────────────────────────────────────────┐
│                 ThemeProvider                       │
│              (components/theme/                    │
│               ThemeProvider.tsx)                   │
│                       │                            │
│     ┌────────────────┼────────────────┐        │
│     │                │                │        │
│     ▼                ▼                ▼        │
│  page.tsx      Sidebar.tsx    ChatWindow.tsx       │
│     │                │                │        │
│     └────────────────┴────────────────┘        │
│                       │                            │
│                       ▼                            │
│              globals.css                          │
│        (:root / .dark CSS variables)             │
└─────────────────────────────────────────────────────┘
```

### Reglas

1. **Ningún color hardcoded** — usar siempre `var(--color-NOMBRE)`
2. **Todosusan `useTheme()`** — para saber theme actual
3. **CSS variables centralizadas** — en `app/globals.css`
4. **Toggle global** — ThemeProvider toggla clase `.dark` en HTML

### Colores disponibles (ya existen)

```css
:root {
  --color-bg: #f5faff;
  --color-surface: #f5faff;
  --color-surface-container: #e5eff8;
  --color-on-surface: #131d23;
  --color-primary: #006d2f;
  /* ... */
}

.dark {
  --color-bg: #0b1418;
  --color-surface: #161c20;
  --color-on-surface: #e1e9ed;
  --color-primary: #3de273;
  /* ... */
}
```

## 3. Tareas

### Phase 1: Establecer baseline
- [ ] 1.1 Agregar `tsconfig.tsbuildinfo` a `.gitignore`
- [ ] 1.2 Agregar `.next/` a `.gitignore`

### Phase 2: Refactor page.tsx
- [ ] 2.1 Reemplazar `isDarkMode ? '#0b1418' : '#f3f4f6'` por `var(--color-bg)`
- [ ] 2.2 Usar CSS variables en TODOS los inline styles

### Phase 3: Consistencia global
- [ ] 3.1 Auditar TODOS los componentes por colores hardcoded
- [ ] 3.2 Reemplazar con CSS variables
- [ ] 3.3 Verificar que ThemeProvider sea usado por TODOS

### Phase 4: Testing
- [ ] 4.1 Toggle theme en Sidebar → toda la app responde
- [ ] 4.2 Verificar dark mode en todas las páginas
- [ ] 4.3 Verificar light mode en todas las páginas

## 4. Anti-patterns a evitar

```tsx
// ❌ MAL - hardcoded
style={{ backgroundColor: isDarkMode ? '#0b1418' : '#f3f4f6' }}

// ✅ BIEN - CSS variable
style={{ backgroundColor: 'var(--color-bg)' }}

// ❌ MAL - ternary hardcoded en className
className={isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}

// ✅ BIEN - usar Tailwind condark: prefix
className="bg-surface dark:bg-surface"
```

## 5. Definiciones

| Término | Definición |
|--------|-----------|
| CSS variable | Variable CSS en `app/globals.css` (ej: `var(--color-bg)`) |
| ThemeProvider | Componente React que provee theme via Context |
| useTheme() | Hook para obtener theme actual (light/dark) |
| Hardcoded | Color fijo en código (ej: `#0b1418`) |

## 6. Notas

- Los iconos de Material Symbols ya manejan theme automáticamente
- El fondo del chat tiene sus propios colores (`--color-chat-bg`, `--color-chat-sent`, `--color-chat-received`)
- No es necesario modificar el CSS base, solo dejar de usar hardcoded colors