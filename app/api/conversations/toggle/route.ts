import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  // Validate request body exists and is valid JSON
  let body: { conversationId?: unknown; isActive?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { conversationId, isActive } = body

  // Validate required fields
  if (!conversationId || typeof conversationId !== 'string' || conversationId.trim() === '') {
    return NextResponse.json({ error: 'Missing or invalid "conversationId" field (UUID required)' }, { status: 400 })
  }
  if (typeof isActive !== 'boolean') {
    return NextResponse.json({ error: 'Missing or invalid "isActive" field (boolean required)' }, { status: 400 })
  }

  const { error } = await supabase.from('conversaciones').update({ isActive }).eq('id', conversationId.trim())

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}