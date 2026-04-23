'use client'

import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import ChatWindow from '@/components/ChatWindow'
import { Conversation } from '@/types/conversation'
import { useTheme } from '@/components/theme/ThemeProvider'

export default function WhatsAppPage() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [showSidebar, setShowSidebar] = useState(false) // Para mobile
  const { theme } = useTheme()
  const isDarkMode = theme === 'dark'

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation)
    // En mobile, ocultar sidebar después de seleccionar
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setShowSidebar(false)
    }
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: isDarkMode ? '#0b1418' : '#f3f4f6' }}>
      {/* Sidebar - responsivo */}
      <div className={`
        ${showSidebar ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 fixed lg:relative z-40 h-full transition-transform duration-300 ease-in-out
      `}>
        <Sidebar
          selectedConversation={selectedConversation}
          onSelectConversation={handleSelectConversation}
        />
      </div>

      {/* Overlay para mobile */}
      {showSidebar && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Chat Area */}
      <main className="flex flex-1 flex-col overflow-hidden relative">
        {/* Botón hamburguesa para mobile */}
        {!selectedConversation && (
          <button
            onClick={() => setShowSidebar(true)}
            className="absolute top-4 left-4 z-20 p-2 rounded-lg lg:hidden"
            style={{ backgroundColor: isDarkMode ? '#1c282e' : '#ffffff' }}
          >
            <span className="material-symbols-outlined" style={{ color: textColor(isDarkMode) }}>
              menu
            </span>
          </button>
        )}
        
        <div className="flex flex-1 overflow-hidden">
          <ChatWindow 
            conversation={selectedConversation} 
            onBack={() => setShowSidebar(true)}
            hasSelectedConversation={!!selectedConversation}
          />
        </div>
      </main>
    </div>
  )
}

function textColor(isDarkMode: boolean) {
  return isDarkMode ? '#e5e7eb' : '#111827'
}