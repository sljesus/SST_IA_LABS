export type SenderType = 'cliente' | 'agente' | 'bot' | 'sistema'

export interface Message {
  id: string
  conversacion_id: string
  remitente: string
  sender_type?: SenderType
  contenido: string
  creado_en: string
}