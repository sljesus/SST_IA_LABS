/**
 * Service layer for database operations.
 * Provides typed methods to avoid direct Supabase access in components.
 */

import { supabase } from './supabase'
import { TABLES, CONVERSATION_FIELDS, MESSAGE_FIELDS, SENDER_TYPES } from './constants'
import type { Conversation } from '@/types/conversation'
import type { Message, SenderType } from '@/types/message'

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
    return data || []
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
        [MESSAGE_FIELDS.CONVERSACION_ID]: conversationId,
        [MESSAGE_FIELDS.REMITENTE]: SENDER_TYPES.AGENTE,
        sender_type: SENDER_TYPES.AGENTE, // NEW: explicit sender_type for scalable UI
        [MESSAGE_FIELDS.CONTENIDO]: content,
      })
      .select()
      .single()

    if (error) {
      throw error
    }
    return data
  },

  /**
   * Send a message from the client (incoming)
   */
  async receive(conversationId: string, content: string, remitente: string = SENDER_TYPES.CLIENTE): Promise<Message> {
    const { data, error } = await supabase
      .from(TABLES.MENSAJES)
      .insert({
        [MESSAGE_FIELDS.CONVERSACION_ID]: conversationId,
        [MESSAGE_FIELDS.REMITENTE]: remitente,
        sender_type: SENDER_TYPES.CLIENTE,
        [MESSAGE_FIELDS.CONTENIDO]: content,
      })
      .select()
      .single()

    if (error) {
      throw error
    }
    return data
  },

  /**
   * Send a message from a bot (automated response)
   */
  async sendBotMessage(conversationId: string, content: string, botName: string = 'FAQs'): Promise<Message> {
    const { data, error } = await supabase
      .from(TABLES.MENSAJES)
      .insert({
        [MESSAGE_FIELDS.CONVERSACION_ID]: conversationId,
        [MESSAGE_FIELDS.REMITENTE]: botName,
        sender_type: SENDER_TYPES.BOT,
        [MESSAGE_FIELDS.CONTENIDO]: content,
      })
      .select()
      .single()

    if (error) {
      throw error
    }
    return data
  },

  /**
   * Send a system message (welcome, alerts, etc.)
   */
  async sendSystemMessage(conversationId: string, content: string): Promise<Message> {
    const { data, error } = await supabase
      .from(TABLES.MENSAJES)
      .insert({
        [MESSAGE_FIELDS.CONVERSACION_ID]: conversationId,
        [MESSAGE_FIELDS.REMITENTE]: 'Sistema',
        sender_type: SENDER_TYPES.SISTEMA,
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
      .subscribe()
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
      .subscribe()
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
      .subscribe()
  },
}