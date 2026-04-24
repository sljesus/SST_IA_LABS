import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

export async function POST(request: NextRequest) {
  // Validate request body exists and is valid JSON
  let body: { to?: unknown; message?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { to, message } = body

  // Validate required fields
  if (!to || typeof to !== 'string' || to.trim() === '') {
    return NextResponse.json({ error: 'Missing or invalid "to" field (phone number required)' }, { status: 400 })
  }

  // Check if 'to' looks like a phone number (should contain only digits, +, spaces, dashes, parentheses)
  const phoneRegex = /^[\d\s\+\-\(\)]+$/
  if (!phoneRegex.test(to.trim())) {
    return NextResponse.json({
      error: `Invalid phone number format. Expected format: +521234567890. Received: "${to}". Asegúrate de que la conversación tenga wa_id configurado en la base de datos.`,
      received: to
    }, { status: 400 })
  }
  if (!message || typeof message !== 'string' || message.trim() === '') {
    return NextResponse.json({ error: 'Missing or invalid "message" field (message content required)' }, { status: 400 })
  }

  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID

  if (!accessToken) {
    return NextResponse.json({ error: 'Missing WHATSAPP_ACCESS_TOKEN environment variable' }, { status: 500 })
  }
  if (!phoneNumberId) {
    return NextResponse.json({ error: 'Missing WHATSAPP_PHONE_NUMBER_ID environment variable' }, { status: 500 })
  }

  try {
    console.log('Enviando mensaje a WhatsApp:', {
      to: to.trim(),
      phoneNumberId,
      accessTokenPrefix: accessToken.substring(0, 10) + '...',
      messageLength: message.trim().length
    })
    const response = await axios.post(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
      messaging_product: 'whatsapp',
      to: to.trim(),
      text: { body: message.trim() }
    }, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })
    console.log('Respuesta de WhatsApp API:', {
      status: response.status,
      data: response.data,
      headers: response.headers
    })
    console.log('Mensaje enviado exitosamente desde', phoneNumberId, 'a', to.trim())
    return NextResponse.json({ success: true, data: response.data })
  } catch (error: unknown) {
    const axiosError = error as { response?: { data?: unknown, status?: number }; message?: string }
    let errorMessage = 'Unknown error'
    let statusCode = 500

    if (axiosError.response?.data) {
      const data = axiosError.response.data as any
      errorMessage = data.error?.message || data.message || JSON.stringify(data)
      statusCode = axiosError.response.status || 500

      // Provide specific guidance for common errors
      if (data.error?.code === 100) {
        errorMessage = `WhatsApp API Error: Invalid phone number ID '${phoneNumberId}'. Posibles causas:
        1. El número no está completamente verificado en WhatsApp Business
        2. El access token no tiene permisos para este número
        3. El número está en modo de prueba y necesita aprobación de WhatsApp
        Verifica en Facebook Developer Console > WhatsApp > Phone Numbers el estado de tu número.`
      } else if (data.error?.message?.includes('access token')) {
        errorMessage = `WhatsApp API Error: Invalid or expired access token. Genera un nuevo token en Facebook Developer Console > WhatsApp > API Setup.`
      } else if (data.error?.code === 200) {
        errorMessage = `WhatsApp API Error: Permission denied. Verifica que tu access token tenga permisos para WhatsApp Business API.`
      }
    } else {
      errorMessage = axiosError.message ?? 'Network error'
    }

    console.error('WhatsApp API error:', errorMessage)
    return NextResponse.json({ error: 'Failed to send message', detail: errorMessage }, { status: statusCode })
  }
}