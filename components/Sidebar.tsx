'use client'

import { useState, useMemo } from 'react'
import { Conversation } from '@/types/conversation'
import { useTheme } from '@/components/theme/ThemeProvider'

// Mock data con fechas fijas para evitar hydration mismatch
const mockConversations = [
  {
    id: '1',
    cliente: 'Juan Perez',
    agente: 'Carlos',
    isActive: true,
    creado_en: '2026-04-22T23:10:00.000Z',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCznmi2LZ5QSQ13UwIj63r27phRTjTPUdYeu9exSPi2T0AsiCsp_ihmdIboZdo2rpcojcnJJFL9UX03vQwz-nLFrb9S-I5B2sETPNVNT-ALqRgIhKf6M04sBpbNtAaIPCNonfZko-F33OEiJt5pjD5Gw2ozNj_OF6avOSpoas3HSKQuRPXRyvoJStzw4ArDU6AuFW38ve80OPb6AD4usLbnIIv5ov8H6XJMpS4wzbC3u1amPxM1Kn2NYBlZs_GdsdS6c9njpJRVQpw'
  },
  {
    id: '2',
    cliente: 'Maria Garcia',
    agente: 'Ana',
    isActive: false,
    creado_en: '2026-04-21T23:10:00.000Z',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDujzp4TvfniN5CQxU_MaFPyOJsla4s8nEH29Iy5aaEwIBRs3zk05moB0BPVFPxf0bXdK-gIXdrYsWgqAFiNHskKvVFlowyWEbOu2U_HJWl8thzoBUQXq_1GPTgesz-fs1c5s3lNm18LdQgF-pR5KHGSDTeLEQ13W8FKLn6pqgz4HTgiN8ppG98Wkt_URm3WBFErso_KDvVDtfwgxLIJric3NboyRkiuMVHPtxd5CqVRcRf79a9nuA_Jmm_Iv5sdLtC1Fvx8r_jtw'
  },
  {
    id: '3',
    cliente: 'Logistics Team',
    agente: 'Miguel',
    isActive: false,
    creado_en: '2026-04-22T21:00:00.000Z',
    img: undefined // Group conversation
  }
]

interface SidebarProps {
  selectedConversation: Conversation | null
  onSelectConversation: (conv: Conversation) => void
}

export default function Sidebar({ selectedConversation, onSelectConversation }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const { theme, toggleTheme, mounted } = useTheme()
  const isDarkMode = theme === 'dark'

  // Instant toggle with direct DOM manipulation
  const handleToggle = () => {
    // Toggle the dark class on html element directly
    document.documentElement.classList.toggle('dark')
    // Also toggle in React state
    toggleTheme()
  }

  // Dynamic styles based on theme
  const sidebarBg = isDarkMode ? '#1c282e' : '#ffffff'
  const sidebarBorder = isDarkMode ? '#44474a' : '#e5e7eb'
  const textPrimary = isDarkMode ? '#3de273' : '#006d2f'
  const textSecondary = isDarkMode ? '#c4c7ca' : '#5c5f61'

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) {
      return mockConversations
    }
    return mockConversations.filter(conv =>
      conv.cliente.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (conv as any).lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      // Use consistent time formatting to avoid hydration mismatch
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      return `${hours}:${minutes}`
    } else if (diffInHours < 48) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString()
    }
  }

return (
    <aside 
      className="flex flex-col h-full w-64 sm:w-72 md:w-80 lg:w-[320px] xl:w-[400px] border-r font-inter text-sm antialiased shrink-0"
      style={{ backgroundColor: sidebarBg, borderRightColor: sidebarBorder }}
    >

        {/* Header with Profile */}
        <div className="px-6 py-4 border-b" style={{ borderColor: sidebarBorder }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                alt="User Profile Avatar"
                className="w-10 h-10 rounded-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCznmi2LZ5QSQ13UwIj63r27phRTjTPUdYeu9exSPi2T0AsiCsp_ihmdIboZdo2rpcojcnJJFL9UX03vQwz-nLFrb9S-I5B2sETPNVNT-ALqRgIhKf6M04sBpbNtAaIPCNonfZko-F33OEiJt5pjD5Gw2ozNj_OF6avOSpoas3HSKQuRPXRyvoJStzw4ArDU6AuFW38ve80OPb6AD4usLbnIIv5ov8H6XJMpS4wzbC3u1amPxM1Kn2NYBlZs_GdsdS6c9njpJRVQpw"
              />
              <div className="flex flex-col">
                <span className="text-xl font-bold" style={{ color: textPrimary }}>Consola del Operador</span>
                <span className="text-xs font-medium" style={{ color: textSecondary, opacity: 0.7 }}>IA Activa</span>
              </div>
            </div>
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-4 border-b" style={{ borderColor: sidebarBorder }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: textSecondary }}>Conversaciones</h3>
            {/* Search Bar */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: isDarkMode ? '#2d3339' : '#f3f4f6' }}>
              <span className="material-symbols-outlined text-sm" style={{ color: isDarkMode ? '#6b7280' : '#9ca3af' }}>search</span>
              <input
                className="bg-transparent border-none focus:ring-0 text-sm w-full"
                style={{ color: isDarkMode ? '#e5e7eb' : '#374151' }}
                placeholder="Buscar conversaciones..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
<div className="space-y-1 p-2">
            {filteredConversations.map(conv => (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv)}
                className="flex items-center p-3 cursor-pointer rounded-lg border-l-4 transition-colors duration-200"
                style={{ 
                  backgroundColor: selectedConversation?.id === conv.id 
                    ? (isDarkMode ? '#2d3339' : '#e5eff8') 
                    : 'transparent',
                  borderColor: selectedConversation?.id === conv.id 
                    ? (isDarkMode ? '#3de273' : '#006d2f') 
                    : 'transparent'
                }}
              >
                {conv.img ? (
                  <img
                    alt={`${conv.cliente} Profile`}
                    className="w-10 h-10 rounded-full mr-3 object-cover"
                    src={conv.img}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full mr-3 flex items-center justify-center" style={{ backgroundColor: isDarkMode ? '#44474a' : '#e0e3e6' }}>
                    <span className="material-symbols-outlined text-sm" style={{ color: isDarkMode ? '#c4c7ca' : '#626567' }}>group</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className="font-semibold truncate text-sm" style={{ color: isDarkMode ? '#e5e7eb' : '#131d23' }}>
                      {conv.cliente}
                    </h3>
                    <span className="text-xs" style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}>{formatTime(conv.creado_en)}</span>
                  </div>
                  <p className="text-xs truncate" style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
                    Agente: {conv.agente}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer with Theme Toggle and Logout */}
        <div className="mt-auto px-6 py-4 border-t" style={{ borderColor: sidebarBorder }}>
          <div className="flex items-center justify-between gap-3">
            {/* Theme Toggle */}
            <button
              onClick={handleToggle}
              className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-200"
              style={{ backgroundColor: isDarkMode ? '#2d3339' : '#f3f4f6', color: textSecondary }}
              title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              <span className="material-symbols-outlined text-lg">
                {isDarkMode ? 'light_mode' : 'dark_mode'}
              </span>
            </button>

            {/* Logout Button */}
            <button 
              className="flex-1 flex items-center justify-center py-3 cursor-pointer rounded-lg transition-colors duration-200"
              style={{ color: textSecondary }}
            >
              <span className="material-symbols-outlined mr-2" data-icon="logout">
                logout
              </span>
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>
  )
}