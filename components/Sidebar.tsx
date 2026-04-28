'use client'

import { useState, useMemo, useEffect } from 'react'
import { Conversation } from '@/types/conversation'
import { useTheme } from '@/components/theme/ThemeProvider'
import { conversationService, realtimeService, clearUnreadCount } from '@/lib/db'
import { updateDocumentTitle } from '@/lib/notifications'
import { supabase } from '@/lib/supabase'
import { CONVERSATION_FIELDS } from '@/lib/constants'

interface SidebarProps {
  conversations?: Conversation[]
  isLoading?: boolean
  selectedConversation: Conversation | null
  onSelectConversation: (conv: Conversation) => void
  onRefresh?: () => Promise<void>
}

export default function Sidebar({ 
  conversations: propConversations,
  isLoading: propIsLoading,
  selectedConversation, 
  onSelectConversation,
  onRefresh 
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [localConversations, setLocalConversations] = useState<Conversation[]>([])
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { theme, toggleTheme, mounted } = useTheme()
  const isDarkMode = theme === 'dark'

  const conversations = propConversations ?? localConversations
  const isLoading = propIsLoading ?? isInitialLoading

  // Solo hacer fetch local si no nos pasan conversaciones (no usar array vacío)
  useEffect(() => {
    if (propConversations && propConversations.length > 0) return
    
    const fetchLocal = async () => {
      try {
        const data = await conversationService.getAll()
        setLocalConversations(data)
      } catch (err) {
        console.error('Error fetching conversations:', err)
      } finally {
        setIsInitialLoading(false)
      }
    }
    
    fetchLocal()

    const channel = realtimeService.onConversationsChange(() => {
      if (onRefresh) {
        onRefresh()
      } else {
        fetchLocal()
      }
    })
    channel.subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [propConversations, onRefresh])

  // Instant toggle with direct DOM manipulation
  const handleToggle = () => {
    document.documentElement.classList.toggle('dark')
    toggleTheme()
  }

  // Update document title based on total unread count
  useEffect(() => {
    const totalUnread = conversations.reduce((total, conv) => total + (conv.unread_count || 0), 0)
    updateDocumentTitle(totalUnread)
  }, [conversations])

  // Handler to select conversation and clear unread
  const handleSelectConversation = (conv: Conversation) => {
    clearUnreadCount(conv.id)
    if (!propConversations || propConversations.length === 0) {
      const updated = localConversations.map(c => 
        c.id === conv.id ? { ...c, unread_count: 0 } : c
      )
      setLocalConversations(updated)
    }
    onSelectConversation(conv)
  }

  // Dynamic styles based on theme
  const sidebarBg = isDarkMode ? '#1c282e' : '#ffffff'
  const sidebarBorder = isDarkMode ? '#44474a' : '#e5e7eb'
  const textPrimary = isDarkMode ? '#3de273' : '#006d2f'
  const textSecondary = isDarkMode ? '#c4c7ca' : '#5c5f61'
  const inputBg = isDarkMode ? '#2d3339' : '#f3f4f6'
  const iconColor = isDarkMode ? '#6b7280' : '#9ca3af'

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) {
      return conversations
    }
    return conversations.filter(conv =>
      conv.cliente?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.agente?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [conversations, searchQuery])

  const formatTime = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      const formatter = new Intl.DateTimeFormat('es-MX', {
        timeZone: 'America/Mexico_City',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
      return formatter.format(date)
    } else if (diffInHours < 48) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('es-MX', { timeZone: 'America/Mexico_City' })
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
              <div className="w-10 h-10 rounded-full bg-[var(--color-primary-container)] flex items-center justify-center">
                <span className="material-symbols-outlined text-[var(--color-on-primary-container)]">store</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold" style={{ color: textPrimary }}>SST México</span>
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
            {isInitialLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <span className="material-symbols-outlined text-3xl animate-spin" style={{ color: textSecondary }}>progress_activity</span>
                <p className="mt-2 text-sm" style={{ color: textSecondary }}>Cargando...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-8">
                <span className="material-symbols-outlined text-3xl" style={{ color: '#ef4444' }}>error</span>
                <p className="mt-2 text-sm text-center" style={{ color: '#ef4444' }}>{error}</p>
<button 
                  onClick={() => onRefresh?.()}
                  className="mt-3 px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Reintentar
                </button>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <span className="material-symbols-outlined text-3xl" style={{ color: textSecondary }}>inbox</span>
                <p className="mt-2 text-sm" style={{ color: textSecondary }}>
                  {searchQuery ? 'Sin resultados' : 'No hay conversaciones'}
                </p>
              </div>
            ) : (
filteredConversations.map(conv => (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
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
                  <div className="relative">
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
                    {(conv.unread_count || 0) > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold text-white bg-red-500 px-1">
                        {(conv.unread_count || 0) > 99 ? '99+' : conv.unread_count}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h3 className="font-semibold truncate text-sm" style={{ color: isDarkMode ? '#e5e7eb' : '#131d23' }}>
                        {conv.cliente}
                      </h3>
                      <span className="text-xs" style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}>{formatTime(conv.creado_en)}</span>
                    </div>
                    <p className="text-xs truncate" style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
                      Agente: {conv.agente || 'Sin agente'}
                    </p>
                  </div>
                </div>
              ))
            )}
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