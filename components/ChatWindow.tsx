'use client'

import { useEffect, useState, useRef } from 'react'
import { Conversation } from '@/types/conversation'
import { Message, SenderType } from '@/types/message'

import { messageService, realtimeService } from '@/lib/db'
import { supabase } from '@/lib/supabase'
import { SENDER_TYPES, isAgentMessage, detectSenderType } from '@/lib/constants'

interface Props {
  conversation: Conversation | null
  onBack?: () => void
  hasSelectedConversation?: boolean
}

export default function ChatWindow({ conversation, onBack, hasSelectedConversation }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [aiMode, setAiMode] = useState(conversation?.isActive ?? false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Sync aiMode when conversation changes
  useEffect(() => {
    setAiMode(conversation?.isActive ?? false)
  }, [conversation?.isActive])

  // Realtime subscription for conversation changes
  useEffect(() => {
    if (!conversation) return

    const channel = realtimeService.onConversationUpdate(conversation.id, (updated) => {
      setAiMode(updated.isActive)
    })
    channel.subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversation?.id])



  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (conversation) {
      const fetchMessages = async () => {
        const data = await messageService.getByConversationId(conversation.id)
        setMessages(data)
        setTimeout(scrollToBottom, 100)
      }
      fetchMessages()

      // Realtime subscription for messages
      const channel = realtimeService.onMessagesChange(conversation.id, (newMessage) => {
        setMessages(prev => {
          // Avoid duplicates
          if (prev.some(m => m.id === newMessage.id)) return prev
          return [...prev, newMessage].sort(
            (a, b) => new Date(a.creado_en).getTime() - new Date(b.creado_en).getTime()
          )
        })
        setTimeout(scrollToBottom, 100)
      })
      channel.subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [conversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!conversation || !newMessage.trim() || isLoading) return

    setIsLoading(true)
    const messageContent = newMessage.trim()

    try {
      // Save to database
      await messageService.send(conversation.id, messageContent)

      // Send to WhatsApp - extrae wa_id del id de conversación (antes del _)
      const waId = conversation.id.split('_')[0] // ej: "525612958575_5215648680084" -> "525612958575"
      if (!waId || waId.length < 10) {
        alert('Error: No se pudo extraer wa_id del ID de conversación.')
        return
      }
      const phoneNumber = `+${waId}` // Agrega + al wa_id
      console.log('Enviando a wa_id:', waId, 'Número formateado:', phoneNumber)
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: phoneNumber, message: messageContent })
      })

      if (response.ok) {
        setNewMessage('')
        // Refresh messages
        const data = await messageService.getByConversationId(conversation.id)
        setMessages(data)
      } else {
        const errorText = await response.text()
        console.error('WhatsApp API error:', response.status, errorText)
        alert('Error WhatsApp: ' + response.status + ' - ' + errorText)
      }
    } catch (error) {
      console.error('Send message error:', error)
      alert('Error al enviar: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    } finally {
      setIsLoading(false)
    }
  }

  const toggleAiMode = async () => {
    if (!conversation) return

    const newMode = !aiMode
    setAiMode(newMode)

    try {
      const response = await fetch('/api/conversations/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: conversation.id, isActive: newMode })
      })

      if (!response.ok) {
        // Revert on error
        setAiMode(!newMode)
      }
    } catch (error) {
      console.error('Error toggling AI mode:', error)
      // Revert on error
      setAiMode(!newMode)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!conversation) {
    return (
      <section className="flex-1 flex items-center justify-center bg-[var(--color-chat-bg)]">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-xl font-medium mb-2 text-[var(--color-on-surface)]">
            Selecciona una conversación
          </h3>
          <p className="text-[var(--color-on-surface-variant)]">
            Elige un chat de la lista para comenzar a conversar
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="flex-1 flex flex-col relative">
      {/* Chat Header */}
      <div className="h-16 px-4 md:px-6 border-b flex items-center justify-between shrink-0 bg-[var(--color-surface-container)] border-[var(--color-outline-variant)]">
        <div className="flex items-center">
          {/* Botón volver en mobile */}
          {hasSelectedConversation && (
            <button
              onClick={onBack}
              className="mr-2 p-2 rounded-lg md:hidden bg-[var(--color-surface-container-low)]"
            >
              <span className="material-symbols-outlined text-lg text-[var(--color-on-surface-variant)]">
                arrow_back
              </span>
            </button>
          )}
          <img
            alt={`${conversation.cliente} Profile`}
            className="w-10 h-10 rounded-full mr-3 object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYhipl-64MkYs2YGyJoFGFi-x_FFXgjM4qxYQuvof8AgF9wuC3-2yznG2noUmXEmJlnMPcPaoQ-fp1uwgNewwMrmX9MQEbP04S8ySTg4Wh76sicF2Ld_3ZNaXgfud9FF9-ZdW57lCP0d2X8qhqhWsdBevCS384xSdGBF2TAaBggCXW36urC2Pn-bzqnREK1fFpDU1ULEVYmzrPU6vPtEa58tLeF2eZXPhHTNgeB_iHMDdVDqnBQEwrTBjiPicQJc5XMHDOXULbZTc"
          />
          <div>
            <h2 className="text-body-base font-semibold text-[var(--color-on-surface)]">{conversation.cliente}</h2>
          </div>
        </div>
        {/* AI Toggle - oculto en mobile */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-3 pr-4 border-r border-[var(--color-outline-variant)]">
            <span className="material-symbols-outlined text-[var(--color-on-surface-variant)]">smart_toy</span>
            <span className="text-label-caps font-bold uppercase text-[var(--color-on-surface-variant)]">Modo Agente IA</span>
            <div className="relative inline-flex items-center cursor-pointer" onClick={toggleAiMode}>
              <div className="w-11 h-6 rounded-full shadow-inner bg-[var(--color-outline-variant)]"></div>
              <div className={`absolute left-1 top-1 w-4 h-4 rounded-full shadow transition-transform duration-200 ${aiMode ? 'translate-x-5' : 'translate-x-0'} bg-[var(--color-surface-container-lowest)]`}></div>
            </div>
            <span className={`text-label-caps font-bold uppercase ${aiMode ? '' : ''}`} style={{ color: aiMode ? 'var(--color-primary)' : 'var(--color-on-surface-variant)' }}>
              {aiMode ? 'ACTIVADO' : 'DESACTIVADO'}
            </span>
          </div>
          <div className="flex gap-4">
            {/* TODO: implementar búsqueda de mensajes */}
            <button 
              type="button"
              className="material-symbols-outlined cursor-pointer text-[var(--color-on-surface-variant)]"
              onClick={() => setShowSearch(!showSearch)}
              title="Buscar en conversación"
            >
              search
            </button>
            <span className="material-symbols-outlined cursor-pointer text-[var(--color-on-surface-variant)]">more_vert</span>
          </div>
        </div>
        {/* Solo íconos en mobile */}
        <div className="flex gap-2 md:hidden">
          <button 
            type="button"
            className="material-symbols-outlined p-2 cursor-pointer text-[var(--color-on-surface-variant)]"
            onClick={() => setShowSearch(!showSearch)}
          >
            search
          </button>
          <span className="material-symbols-outlined p-2 cursor-pointer text-[var(--color-on-surface-variant)]">more_vert</span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin bg-[var(--color-chat-bg)]">
        {/* TODO: input de búsqueda - mostrar cuando showSearch sea true */}
        {showSearch && (
          <div className="mb-4 flex items-center gap-2 p-2 rounded-lg bg-[var(--color-surface-container-low)]">
            <span className="material-symbols-outlined text-sm text-[var(--color-on-surface-variant)]">search</span>
            <input
              type="text"
              placeholder="Buscar mensajes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-[var(--color-on-surface)]"
              autoFocus
            />
            <button onClick={() => { setShowSearch(false); setSearchQuery('') }} className="text-[var(--color-on-surface-variant)]">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        )}
        <div className="flex justify-center mb-6">
          <span className="px-3 py-1 rounded-lg text-xs font-medium shadow-sm uppercase tracking-wide bg-[var(--color-surface-container-low)] text-[var(--color-on-surface-variant)]">
            Today
          </span>
        </div>
        {/* Filtrar mensajes según searchQuery */}
        {(searchQuery ? messages.filter(m => m.contenido.toLowerCase().includes(searchQuery.toLowerCase())) : messages).map(msg => {
          // Scalable sender detection: use sender_type if available, fallback to legacy detection
          const senderType = msg.sender_type ?? detectSenderType(msg.remitente)
          const isFromAgent = isAgentMessage(senderType, msg.remitente)
          const isSystem = senderType === SENDER_TYPES.SISTEMA
          
          return (
            <div key={msg.id} className="flex w-full">
              <div className={`flex w-full ${isSystem ? 'justify-center' : isFromAgent ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[75%] px-3 py-2 rounded-tr-xl rounded-br-xl rounded-bl-xl" style={{
                  backgroundColor: isSystem
                    ? 'var(--color-surface-container-low)'
                    : isFromAgent
                      ? 'var(--color-chat-sent)'
                      : 'var(--color-chat-received)',
                  color: 'var(--color-on-surface)'
                }}>
                  <p className="font-chat-text text-chat-text">{msg.contenido}</p>
                  <div className={`flex justify-end mt-1 ${isFromAgent ? 'items-center gap-1' : ''}`}>
                    <span className="text-[11px] text-[var(--color-on-surface-variant)]">
                      {(() => {
                        const date = new Date(msg.creado_en)
                        const formatter = new Intl.DateTimeFormat('es-MX', {
                          timeZone: 'America/Mexico_City',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false
                        })
                        return formatter.format(date)
                      })()}
                    </span>
                    {isFromAgent && (
                      <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        done_all
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Area */}
      <div className="px-6 py-4 flex items-center gap-4 shrink-0 border-t bg-[var(--color-surface-container)] border-[var(--color-outline-variant)]">
        <div className="flex gap-4">
          <span className="material-symbols-outlined cursor-pointer text-[var(--color-on-surface-variant)]">sentiment_satisfied</span>
          <span className="material-symbols-outlined cursor-pointer text-[var(--color-on-surface-variant)]">attach_file</span>
        </div>
        <div className="flex-1">
          <input
            className="w-full border-none rounded-xl px-4 py-3 focus:ring-0 text-body-base shadow-sm bg-[var(--color-surface-container-low)] text-[var(--color-on-surface)]"
            placeholder="Escribe un mensaje..."
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
        </div>
        <button
          className="w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-md disabled:opacity-50 bg-[var(--color-primary)] text-[var(--color-on-primary)]"
          onClick={sendMessage}
          disabled={!newMessage.trim() || isLoading}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            send
          </span>
        </button>
      </div>
    </section>
  )
}