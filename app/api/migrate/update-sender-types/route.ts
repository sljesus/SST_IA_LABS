import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { detectSenderType } from '@/lib/constants'

export async function POST(request: NextRequest) {
  try {
    // Get all messages that need sender_type update
    // Either missing sender_type or have incorrect ones
    const { data: messages, error: fetchError } = await supabase
      .from('mensajes')
      .select('id, remitente, sender_type')
      .or('sender_type.is.null,sender_type.eq.cliente') // Messages that are null or incorrectly set as cliente

    if (fetchError) {
      throw fetchError
    }

    if (!messages || messages.length === 0) {
      return NextResponse.json({ status: 'no_updates', message: 'No messages need updating' })
    }

    let updatedCount = 0
    const updates = []

    for (const message of messages) {
      const correctSenderType = detectSenderType(message.remitente)

      // Only update if different
      if (message.sender_type !== correctSenderType) {
        updates.push({
          id: message.id,
          sender_type: correctSenderType
        })
      }
    }

    // Batch update
    if (updates.length > 0) {
      for (const update of updates) {
        const { error: updateError } = await supabase
          .from('mensajes')
          .update({ sender_type: update.sender_type })
          .eq('id', update.id)

        if (updateError) {
          console.error('Error updating message', update.id, updateError)
        } else {
          updatedCount++
        }
      }
    }

    return NextResponse.json({
      status: 'success',
      message: `Updated ${updatedCount} messages`,
      totalChecked: messages.length
    })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Failed to update sender types',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}