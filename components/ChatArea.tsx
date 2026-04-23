'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Conversation } from '@/types/conversation'
import { Message } from '@/types/message'

interface Props {
  conversation: Conversation | null
}

export default function ChatArea({ conversation }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (conversation) {
      const fetchMessages = async () => {
        const { data } = await supabase
          .from('mensajes')
          .select('*')
          .eq('conversacion_id', conversation.id)
          .order('creado_en', { ascending: true })
        setMessages(data || [])
        setTimeout(scrollToBottom, 100)
      }
      fetchMessages()
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
      const { error: dbError } = await supabase.from('mensajes').insert({
        conversacion_id: conversation.id,
        remitente: 'agente',
        contenido: messageContent
      })

      if (dbError) {
        console.error('Database error:', dbError)
        return
      }

      // Send to WhatsApp
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: conversation.cliente, message: messageContent })
      })

      if (response.ok) {
        setNewMessage('')
        // Refresh messages
        const { data } = await supabase
          .from('mensajes')
          .select('*')
          .eq('conversacion_id', conversation.id)
          .order('creado_en', { ascending: true })
        setMessages(data || [])
      } else {
        console.error('WhatsApp API error:', await response.text())
      }
    } catch (error) {
      console.error('Send message error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleAgent = async () => {
    if (!conversation) return

    const newStatus = !conversation.isActive
    try {
      const response = await fetch('/api/conversations/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: conversation.id, isActive: newStatus })
      })

      if (response.ok) {
        conversation.isActive = newStatus
        // Force re-render by updating state
        setMessages([...messages])
      }
    } catch (error) {
      console.error('Toggle agent error:', error)
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
      <div className="flex-1 flex items-center justify-center bg-chat-background dark:bg-[#0b1013]">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-xl font-medium text-secondary-700 dark:text-gray-300 mb-2">
            Selecciona una conversación
          </h3>
          <p className="text-secondary-500 dark:text-gray-400">
            Elige un chat de la lista para comenzar a conversar
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-chat-background dark:bg-[#0b1013]">
      {/* Header */}
      <div className="bg-white dark:bg-[#1c282e] border-b border-secondary-200 dark:border-gray-700 px-6 py-4 shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-secondary-900 dark:text-gray-100">
              {conversation.cliente}
            </h2>
            <p className="text-secondary-600 dark:text-gray-400 text-sm">
              Agente: <span className="font-medium">{conversation.agente}</span>
            </p>
          </div>
          <button
            onClick={toggleAgent}
            className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
              conversation.isActive
                ? 'bg-success-500 hover:bg-success-600 text-white'
                : 'bg-danger-500 hover:bg-danger-600 text-white'
            }`}
          >
            {conversation.isActive ? '🤖 Agente Activo' : '👤 Agente Inactivo'}
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
        <div className="space-y-4">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex ${msg.remitente === 'cliente' ? 'justify-start' : 'justify-end'}`}
            >
              <div className={`message-bubble ${
                msg.remitente === 'cliente' ? 'message-received dark: bg-[#1e2830]' : 'message-sent'
              }`}>
                <p className="text-sm leading-relaxed">{msg.contenido}</p>
                <p className="text-xs text-secondary-500 dark:text-gray-400 mt-1 opacity-70">
                  {(() => {
                    const date = new Date(msg.creado_en)
                    const hours = date.getHours().toString().padStart(2, '0')
                    const minutes = date.getMinutes().toString().padStart(2, '0')
                    return `${hours}:${minutes}`
                  })()}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white dark:bg-[#1c282e] border-t border-secondary-200 dark:border-gray-700 p-4">
        <div className="flex space-x-3">
          <input
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="input-field flex-1 bg-white dark:bg-[#181f23] dark:text-gray-100 dark:border-gray-600"
            placeholder="Escribe un mensaje..."
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || isLoading}
            className={`btn-primary whitespace-nowrap ${
              (!newMessage.trim() || isLoading) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enviando...
              </span>
            ) : (
              '📤 Enviar'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}