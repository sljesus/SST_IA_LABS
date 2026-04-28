'use client'

import { useTheme } from '@/components/theme/ThemeProvider'

interface AIActiveModalProps {
  conversationName?: string
  onLeaveAsIs: () => void
  onActivateAndLeave: () => void
}

export default function AIActiveModal({ conversationName, onLeaveAsIs, onActivateAndLeave }: AIActiveModalProps) {
  const { theme } = useTheme()
  const isDarkMode = theme === 'dark'

  const handleLeaveAsIs = (e: React.MouseEvent) => {
    e.stopPropagation()
    onLeaveAsIs()
  }

  const handleActivateAndLeave = (e: React.MouseEvent) => {
    e.stopPropagation()
    onActivateAndLeave()
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleLeaveAsIs}
    >
      <div 
        className="relative z-10 max-w-md w-full mx-4 p-6 rounded-xl"
        style={{ 
          backgroundColor: '#1c282e',
          border: '1px solid #3de273'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <span className="material-symbols-outlined text-red-400 text-3xl">
            warning
          </span>
          <h2 
            className="text-xl font-semibold"
            style={{ color: '#e5e7eb' }}
          >
            IA desactivada
          </h2>
        </div>
        
        <p 
          className="mb-6"
          style={{ color: '#9ca3af' }}
        >
          No tienes el agente IA activo en esta conversación. ¿Estás seguro de que querés dejar esta conversación?
        </p>

        <div className="flex gap-3">
          <button
            onClick={handleLeaveAsIs}
            autoFocus
            className="flex-1 px-4 py-2.5 rounded-lg font-medium transition-opacity hover:opacity-90"
            style={{ 
              backgroundColor: '#374151',
              color: '#e5e7eb'
            }}
          >
            Sí, dejar así
          </button>
          <button
            onClick={handleActivateAndLeave}
            className="flex-1 px-4 py-2.5 rounded-lg font-medium transition-opacity hover:opacity-90"
            style={{ 
              backgroundColor: '#3de273',
              color: '#0f172a'
            }}
          >
            Activar primero
          </button>
        </div>
      </div>
    </div>
  )
}