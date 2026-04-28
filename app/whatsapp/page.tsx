'use client'

import { useState, useCallback, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import ChatWindow from '@/components/ChatWindow'
import NotificationToast from '@/components/NotificationToast'
import { Conversation } from '@/types/conversation'
import { useTheme } from '@/components/theme/ThemeProvider'
import { incrementUnreadCount, clearUnreadCount, conversationService } from '@/lib/db'
import AIActiveModal from '@/components/AIActiveModal'
import { playNotificationSound, isDocumentHidden } from '@/lib/notifications'

interface ToastData {
  conversation: Conversation
  messagePreview: string
}

export default function WhatsAppPage() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [showSidebar, setShowSidebar] = useState(false)
  const [toastData, setToastData] = useState<ToastData | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoadingConversations, setIsLoadingConversations] = useState(true)
  const [showAIModal, setShowAIModal] = useState(false)
  const [pendingConversation, setPendingConversation] = useState<Conversation | null>(null)
  const { theme } = useTheme()
  const isDarkMode = theme === 'dark'

  const fetchConversations = useCallback(async () => {
    try {
      const data = await conversationService.getAll()
      setConversations(data)
    } catch (err) {
      console.error('Error fetching conversations:', err)
    } finally {
      setIsLoadingConversations(false)
    }
  }, [])

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  const handleSelectConversation = (conversation: Conversation) => {
    console.log('[page] handleSelectConversation:', {
      selectedConv: selectedConversation?.cliente,
      selectedIsActive: selectedConversation?.isActive,
      clickedConv: conversation.cliente,
      clickedIsActive: conversation.isActive,
    })
    if (
      selectedConversation &&
      selectedConversation.id !== conversation.id &&
      selectedConversation.isActive === false
    ) {
      console.log('[page] MOSTRANDO MODAL — IA desactivada al salir')
      setPendingConversation(conversation)
      setShowAIModal(true)
      return
    }
    console.log('[page] Seleccionando sin modal')
    clearUnreadCount(conversation.id)
    setConversations(prev => prev.map(c => 
      c.id === conversation.id ? { ...c, unread_count: 0 } : c
    ))
    setSelectedConversation(conversation)
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setShowSidebar(false)
    }
  }

  const handleLeaveAIDisabled = useCallback(() => {
    console.log('[page] handleLeaveAIDisabled — salir sin activar')
    setShowAIModal(false)
    if (pendingConversation) {
      // Limpiar pending ANTES de cambiar selected para evitar loop
      const dest = pendingConversation
      setPendingConversation(null)
      clearUnreadCount(dest.id)
      setConversations(prev => prev.map(c => 
        c.id === dest.id ? { ...c, unread_count: 0 } : c
      ))
      setSelectedConversation(dest)
    }
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setShowSidebar(false)
    }
  }, [pendingConversation])

  const handleActivateAndLeave = useCallback(async () => {
    if (!pendingConversation || !selectedConversation) return
    
    const currentConv = selectedConversation
    const destConv = pendingConversation
    
    try {
      await fetch('/api/conversations/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          conversationId: currentConv.id, 
          isActive: true 
        })
      })
      
      setConversations(prev => prev.map(c => 
        c.id === currentConv.id ? { ...c, isActive: true } : c
      ))
      
      // Limpiar pending ANTES de cambiar selected para evitar loop
      setShowAIModal(false)
      setPendingConversation(null)
      
      clearUnreadCount(destConv.id)
      setConversations(prev => prev.map(c => 
        c.id === destConv.id ? { ...c, unread_count: 0 } : c
      ))
      setSelectedConversation(destConv)
      
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        setShowSidebar(false)
      }
    } catch (err) {
      console.error('Error reactivando IA:', err)
      setShowAIModal(false)
      setPendingConversation(null)
      setSelectedConversation(destConv)
    }
  }, [pendingConversation, selectedConversation])

  const handleNewMessageFromOther = useCallback((conv: Conversation, messagePreview: string) => {
    incrementUnreadCount(conv.id)
    
    setConversations(prev => prev.map(c => 
      c.id === conv.id 
        ? { ...c, unread_count: (c.unread_count || 0) + 1 }
        : c
    ))
    
    const updatedConv = { ...conv, unread_count: (conv.unread_count || 0) + 1 }
    setToastData({ conversation: updatedConv, messagePreview })
    
    if (isDocumentHidden()) {
      playNotificationSound()
    } else {
      playNotificationSound()
    }
  }, [])

  const handleToastClose = useCallback(() => {
    setToastData(null)
  }, [])

  const handleToastClick = useCallback((conv: Conversation) => {
    setToastData(null)
    handleSelectConversation(conv)
  }, [handleSelectConversation])

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: isDarkMode ? '#0b1418' : '#f3f4f6' }}>
      {/* Sidebar - responsivo */}
      <div className={`
        ${showSidebar ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 fixed lg:relative z-40 h-full transition-transform duration-300 ease-in-out
      `}>
        <Sidebar
          conversations={conversations}
          isLoading={isLoadingConversations}
          selectedConversation={selectedConversation}
          onSelectConversation={handleSelectConversation}
          onRefresh={fetchConversations}
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
            onNewMessageFromOther={handleNewMessageFromOther}
            onConversationToggle={(id, isActive) => {
              console.log('[page] onConversationToggle:', id, 'isActive:', isActive)
              setConversations(prev => prev.map(c => 
                c.id === id ? { ...c, isActive } : c
              ))
              // También actualizar selectedConversation si es la misma
              if (selectedConversation?.id === id) {
                console.log('[page] Actualizando selectedConversation.isActive a:', isActive)
                setSelectedConversation(prev => prev ? { ...prev, isActive } : null)
              }
            }}
          />
        </div>
      </main>

      {/* Toast de notificación */}
      <NotificationToast
        toast={toastData}
        onClose={handleToastClose}
        onClick={handleToastClick}
      />

      {/* Modal de IA desactivada */}
      {showAIModal && (
        <AIActiveModal
          conversationName={selectedConversation?.cliente}
          onLeaveAsIs={handleLeaveAIDisabled}
          onActivateAndLeave={handleActivateAndLeave}
        />
      )}
    </div>
  )
}

function textColor(isDarkMode: boolean) {
  return isDarkMode ? '#e5e7eb' : '#111827'
}