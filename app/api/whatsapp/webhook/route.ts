import { NextRequest, NextResponse } from 'next/server'
import { messageService, conversationService } from '@/lib/db'
import { detectSenderType, SENDER_TYPES } from '@/lib/constants'

// Webhook verification for Meta (WhatsApp)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  // TODO: Get verify token from environment variable
  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'your_verify_token'

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('WEBHOOK_VERIFIED')
    return new NextResponse(challenge)
  } else {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
}

// Handle incoming WhatsApp messages
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('WhatsApp webhook received:', JSON.stringify(body, null, 2))

    // Check if this is a message event
    if (body.object === 'whatsapp_business_account') {
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          if (change.field === 'messages') {
            const messages = change.value.messages
            if (messages) {
              for (const message of messages) {
                await processMessage(message, change.value.contacts)
              }
            }
          }
        }
      }
    }

    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function processMessage(message: any, contacts: any[]) {
  // Extract message details
  const from = message.from // WhatsApp ID of sender
  const type = message.type
  const timestamp = message.timestamp

  let content = ''
  if (type === 'text' && message.text) {
    content = message.text.body
  } else if (type === 'image' && message.image) {
    content = '[Imagen]'
  } else {
    // Handle other types or skip
    return
  }

  // Find contact name
  const contact = contacts?.find(c => c.wa_id === from)
  const remitente = contact?.profile?.name || from // Use name if available, otherwise WA ID

  // Find or create conversation
  let conversation = await conversationService.getByWaId(from)
  if (!conversation) {
    // Create new conversation
    conversation = await conversationService.create(remitente, from, from)
  }

  // Save message
  await messageService.receive(conversation.id, content, remitente)
}