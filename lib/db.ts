/**
 * Service layer for database operations.
 * Provides typed methods to avoid direct Supabase access in components.
 */

import { supabase } from './supabase'
import { TABLES, CONVERSATION_FIELDS, MESSAGE_FIELDS, SENDER_TYPES } from './constants'
import type { Conversation } from '@/types/conversation'
import type { Message } from '@/types/message'

// Helper to get unread count from localStorage
function getUnreadCountFromStorage(conversationId: string): number {
  if (typeof window === 'undefined') return 0
  const key = `unread_${conversationId}`
  const stored = localStorage.getItem(key)
  return stored ? parseInt(stored, 10) : 0
}

// Helper to set unread count in localStorage
export function setUnreadCount(conversationId: string, count: number): void {
  if (typeof window === 'undefined') return
  const key = `unread_${conversationId}`
  if (count <= 0) {
    localStorage.removeItem(key)
  } else {
    localStorage.setItem(key, count.toString())
  }
}

// Helper to increment unread count
export function incrementUnreadCount(conversationId: string): void {
  const current = getUnreadCountFromStorage(conversationId)
  setUnreadCount(conversationId, current + 1)
}

// Helper to clear unread count (mark as read)
export function clearUnreadCount(conversationId: string): void {
  setUnreadCount(conversationId, 0)
}

// Conversation operations
export const conversationService = {
  /**
   * Fetch all conversations ordered by creation date
   */
  async getAll(): Promise<Conversation[]> {
    const { data, error } = await supabase
      .from(TABLES.CONVERSACIONES)
      .select('*')
      .order(CONVERSATION_FIELDS.CREADO_EN, { ascending: false })

    if (error) {
      throw error
    }

    // Add unread count from localStorage
    return (data || []).map(conv => ({
      ...conv,
      unread_count: getUnreadCountFromStorage(conv.id)
    }))
  },

  /**
   * Fetch a single conversation by ID
   */
  async getById(id: string): Promise<Conversation | null> {
    const { data, error } = await supabase
      .from(TABLES.CONVERSACIONES)
      .select('*')
      .eq(CONVERSATION_FIELDS.ID, id)
      .single()

    if (error) {
      throw error
    }
    return data
  },

  /**
   * Update conversation's AI mode (isActive)
   */
  async toggleAi(id: string, isActive: boolean): Promise<void> {
    const { error } = await supabase
      .from(TABLES.CONVERSACIONES)
      .update({ [CONVERSATION_FIELDS.IS_ACTIVE]: isActive })
      .eq(CONVERSATION_FIELDS.ID, id)

    if (error) {
      throw error
    }
  },
}

// Message operations
export const messageService = {
  /**
   * Fetch all messages for a conversation ordered by creation date
   */
  async getByConversationId(conversationId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from(TABLES.MENSAJES)
      .select('*')
      .eq(MESSAGE_FIELDS.CONVERSACION_ID, conversationId)
      .order(MESSAGE_FIELDS.CREADO_EN, { ascending: true })

    if (error) {
      throw error
    }
    return data || []
  },

  /**
   * Send a message from the agent (operator)
   */
  async send(conversationId: string, content: string): Promise<Message> {
    const { data, error } = await supabase
      .from(TABLES.MENSAJES)
      .insert({
        [MESSAGE_FIELDS.ID]: crypto.randomUUID(),
        [MESSAGE_FIELDS.CONVERSACION_ID]: conversationId,
        [MESSAGE_FIELDS.REMITENTE]: SENDER_TYPES.AGENTE,
        sender_type: SENDER_TYPES.AGENTE,
        [MESSAGE_FIELDS.CONTENIDO]: content,
      })
      .select()
      .single()

    if (error) {
      throw error
    }
    return data
  },
}

// Realtime subscriptions
export const realtimeService = {
  /**
   * Subscribe to conversation changes
   */
  onConversationsChange(callback: () => void) {
    return supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: TABLES.CONVERSACIONES,
        },
        callback
      )
  },

  /**
   * Subscribe to messages for a specific conversation
   */
  onMessagesChange(conversationId: string, callback: (message: Message) => void) {
    return supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: TABLES.MENSAJES,
          filter: `${MESSAGE_FIELDS.CONVERSACION_ID}=eq.${conversationId}`,
        },
        (payload) => callback(payload.new as unknown as Message)
      )
  },

  /**
   * Subscribe to conversation updates (e.g., isActive toggle)
   */
  onConversationUpdate(conversationId: string, callback: (conversation: Conversation) => void) {
    return supabase
      .channel(`conversation-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: TABLES.CONVERSACIONES,
          filter: `${CONVERSATION_FIELDS.ID}=eq.${conversationId}`,
        },
        (payload) => callback(payload.new as unknown as Conversation)
      )
  },
}