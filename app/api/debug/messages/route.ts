import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Consulta mensajes de la conversación específica
    const { data, error } = await supabase
      .from('mensajes')
      .select('*')
      .eq('conversacion_id', '525612958575_5215648680084')
      .order('creado_en', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ messages: data })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}