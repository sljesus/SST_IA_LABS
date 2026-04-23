/**
 * Centralized constants for table names and field names.
 * Avoids magic strings scattered across the codebase.
 */

// Table names
export const TABLES = {
  CONVERSACIONES: 'conversaciones',
  MENSAJES: 'mensajes',
} as const

// Field names for conversaciones table
export const CONVERSATION_FIELDS = {
  ID: 'id',
  CLIENTE: 'cliente',
  AGENTE: 'agente',
  IMG: 'img',
  IS_ACTIVE: 'isActive',
  CREADO_EN: 'creado_en',
} as const

// Field names for mensajes table
export const MESSAGE_FIELDS = {
  ID: 'id',
  CONVERSACION_ID: 'conversacion_id',
  REMITENTE: 'remitente',
  CONTENIDO: 'contenido',
  CREADO_EN: 'creado_en',
} as const

// Sender types for scalable chat
export const SENDER_TYPES = {
  CLIENTE: 'cliente',
  AGENTE: 'agente',
  BOT: 'bot',
  SISTEMA: 'sistema',
} as const

// Known agent identifiers (these send messages on behalf of "us" - right side, green)
// These include: operator emails, n8n agent IDs, bot names
export const KNOWN_AGENTS = [
  'agente',
  'FAQs',
  'Bot',
  'bot',
  'IA',
  'AI',
  'n8n',
] as const

/**
 * Detect sender type from legacy remitente field
 * This provides backwards compatibility for messages without sender_type
 * 
 * Logic:
 * - 'agente', 'FAQs', n8n, etc. = ME (operator or n8n) -> RIGHT side (green)
 * - Email format (contains @) = ME (operator sending) -> RIGHT side (green)
 * - Any other non-customer value = ME -> RIGHT side (green)
 * - Name with spaces (like "Jesús Salazar") = CUSTOMER -> LEFT side (white)
 */
export function detectSenderType(remitente: string | undefined): typeof SENDER_TYPES.CLIENTE | typeof SENDER_TYPES.AGENTE | typeof SENDER_TYPES.BOT | typeof SENDER_TYPES.SISTEMA {
  if (!remitente) return SENDER_TYPES.CLIENTE

  const lowerRemitente = remitente.toLowerCase()
  const trimmed = remitente.trim()

  // Check if it's a known agent name
  if (lowerRemitente === 'agente' || KNOWN_AGENTS.some(agent => lowerRemitente.includes(agent.toLowerCase()))) {
    return lowerRemitente === 'agente' ? SENDER_TYPES.AGENTE : SENDER_TYPES.BOT
  }

  // Check if it's an email (contains @) - that's the operator sending
  if (trimmed.includes('@')) {
    return SENDER_TYPES.AGENTE
  }

  // Check if it looks like a system message (starts with brackets)
  if (trimmed.startsWith('[') || lowerRemitente.includes('sistema')) {
    return SENDER_TYPES.SISTEMA
  }

  // Check if it looks like a customer name (has space, like "Jesús Salazar")
  // Customer names typically have spaces, emails don't
  if (trimmed.includes(' ') && !trimmed.includes('@')) {
    return SENDER_TYPES.CLIENTE
  }

  // Default: treat as cliente (incoming message)
  return SENDER_TYPES.CLIENTE
}

// Type for sender type
export type SenderTypeKey = keyof typeof SENDER_TYPES
export type SenderTypeValue = typeof SENDER_TYPES[SenderTypeKey]

// Helper to check if message is from ME (operator or n8n agent)
export function isAgentMessage(senderType: SenderTypeValue | undefined, remitente: string | undefined): boolean {
  // First check explicit sender_type
  // Both 'agente' (operator) and 'bot' (n8n) are "my" messages -> RIGHT side
  if (senderType === SENDER_TYPES.AGENTE) return true
  if (senderType === SENDER_TYPES.BOT) return true  // n8n agent
  
  // Fallback to legacy detection: 'agente' means ME
  if (remitente === 'agente') return true

  // Default: not from me (customer message)
  return false
}

/**
 * Check if this is the customer (incoming message)
 * Used to determine if customer is typing to us
 */
export function isCustomerMessage(senderType: SenderTypeValue | undefined, remitente: string | undefined): boolean {
  if (senderType === SENDER_TYPES.CLIENTE) return true
  if (senderType === SENDER_TYPES.SISTEMA) return false
  
  // Legacy fallback: if it's not 'agente', it's likely a customer
  // (could be email, name, etc.)
  if (remitente && remitente !== 'agente') return true
  
  return false
}

// Type for table name
export type TableName = (typeof TABLES)[keyof typeof TABLES]

// Type for field name
export type FieldName = typeof CONVERSATION_FIELDS[keyof typeof CONVERSATION_FIELDS] | typeof MESSAGE_FIELDS[keyof typeof MESSAGE_FIELDS]