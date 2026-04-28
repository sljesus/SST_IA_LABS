'use client'

import { useEffect, useRef, useState } from 'react'
import { playNotificationSound, isDocumentHidden } from '@/lib/notifications'

interface NotificationSoundProps {
  play: boolean
}

export default function NotificationSound({ play }: NotificationSoundProps) {
  const [hasPlayed, setHasPlayed] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (!play || hasPlayed) return

    if (isDocumentHidden()) {
      playNotificationSound()
      setHasPlayed(true)
    }
  }, [play, hasPlayed])

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  return null
}