import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  // This endpoint is protected - should only be called by admin
  // In production, add proper authentication

  try {
    // Add sender_type column if it doesn't exist
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE mensajes ADD COLUMN IF NOT EXISTS sender_type TEXT DEFAULT 'cliente' CHECK (sender_type IN ('cliente', 'agente', 'bot', 'sistema'));`
    })

    if (alterError) {
      // If RPC doesn't exist, try direct alter
      console.log('RPC alter failed, trying direct approach:', alterError)
    }

    // Check if column exists
    const { data: columns } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'mensajes')
      .eq('column_name', 'sender_type')
      .single()

    if (!columns) {
      // Column doesn't exist - return instructions
      return NextResponse.json({
        status: 'needs_migration',
        message: 'Column sender_type does not exist. Run this SQL in Supabase SQL Editor:',
        sql: `ALTER TABLE mensajes ADD COLUMN sender_type TEXT DEFAULT 'cliente' CHECK (sender_type IN ('cliente', 'agente', 'bot', 'sistema'));`
      })
    }

    return NextResponse.json({ status: 'success', message: 'Column sender_type already exists or created successfully' })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Use Supabase SQL Editor to run: ALTER TABLE mensajes ADD COLUMN sender_type TEXT DEFAULT \'cliente\' CHECK (sender_type IN (\'cliente\', \'agente\', \'bot\', \'sistema\'));'
    })
  }
}