'use client'

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied'
  }
  return await Notification.requestPermission()
}

export function isDocumentHidden(): boolean {
  return document.hidden
}

export function canPlaySound(): boolean {
  return typeof window !== 'undefined' && 'Audio' in window
}

export function playNotificationSound(): void {
  if (!canPlaySound()) return

  const audio = new Audio('/sounds/notification.wav')
  audio.volume = 0.5
  
  audio.play().catch(err => {
    console.warn('No se pudo reproducir el sonido de notificación:', err)
  })
}

export function getTotalUnreadCount(conversations: { unread_count?: number }[]): number {
  return conversations.reduce((total, conv) => total + (conv.unread_count || 0), 0)
}

export function updateDocumentTitle(unreadCount: number): void {
  if (unreadCount > 0) {
    document.title = `(${unreadCount}) SST IA Labs`
  } else {
    document.title = 'SST IA Labs'
  }
}