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
  if (!message || typeof message !== 'string' || message.trim() === '') {
    return NextResponse.json({ error: 'Missing or invalid "message" field (message content required)' }, { status: 400 })
  }

  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID

  if (!accessToken || !phoneNumberId) {
    return NextResponse.json({ error: 'Missing WhatsApp credentials' }, { status: 500 })
  }

  try {
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
    return NextResponse.json({ success: true, data: response.data })
  } catch (error: unknown) {
    const axiosError = error as { response?: { data?: unknown }; message?: string }
    console.error('WhatsApp API error:', axiosError.response?.data ?? axiosError.message)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}