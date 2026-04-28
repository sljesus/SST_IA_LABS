import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  let body: { conversationId?: unknown; isActive?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { conversationId, isActive } = body

  if (!conversationId || typeof conversationId !== 'string' || conversationId.trim() === '') {
    return NextResponse.json({ error: 'Missing or invalid "conversationId" field' }, { status: 400 })
  }
  if (typeof isActive !== 'boolean') {
    return NextResponse.json({ error: 'Missing or invalid "isActive" field (boolean required)' }, { status: 400 })
  }

  const id = conversationId.trim()
  console.log('[API toggle] Received:', { id, isActive })
  const { error } = await supabase
    .from('conversaciones')
    .update({ isActive })
    .eq('id', id)
  if (error) {
    console.error('[API toggle] Supabase error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  console.log('[API toggle] Success:', id, isActive)
  return NextResponse.json({ success: true, conversationId: id, isActive })
}