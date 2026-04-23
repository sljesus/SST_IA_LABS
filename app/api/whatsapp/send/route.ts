import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

export async function POST(request: NextRequest) {
  const { to, message } = await request.json()

  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID

  if (!accessToken || !phoneNumberId) {
    return NextResponse.json({ error: 'Missing WhatsApp credentials' }, { status: 500 })
  }

  try {
    const response = await axios.post(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
      messaging_product: 'whatsapp',
      to,
      text: { body: message }
    }, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })
    return NextResponse.json({ success: true, data: response.data })
  } catch (error: any) {
    console.error('WhatsApp API error:', error.response?.data)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}