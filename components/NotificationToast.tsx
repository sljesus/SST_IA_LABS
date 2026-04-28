'use client'

import { useEffect, useState } from 'react'
import { Conversation } from '@/types/conversation'

interface ToastData {
  conversation: Conversation
  messagePreview: string
}

interface Props {
  toast: ToastData | null
  onClose: () => void
  onClick: (conversation: Conversation) => void
}

export default function NotificationToast({ toast, onClose, onClick }: Props) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    if (toast) {
      setIsVisible(true)
      setIsExiting(false)

      const timer = setTimeout(() => {
        handleClose()
      }, 6000)

      return () => clearTimeout(timer)
    }
  }, [toast])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      setIsVisible(false)
      onClose()
    }, 300)
  }

  if (!isVisible || !toast) return null

  return (
    <div
      className={`fixed bottom-4 right-4 max-w-sm rounded-lg shadow-lg cursor-pointer transition-all duration-300 overflow-hidden z-50 ${
        isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'
      }`}
      style={{
        backgroundColor: '#1c282e',
        borderLeft: '4px solid #3de273',
      }}
      onClick={() => onClick(toast.conversation)}
    >
      <div className="p-3">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#2d3339' }}>
            <span className="material-symbols-outlined text-lg" style={{ color: '#c4c7ca' }}>group</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-white truncate">
              {toast.conversation.cliente}
            </p>
            <p className="text-xs mt-0.5 text-gray-400 line-clamp-2">
              {toast.messagePreview}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleClose()
            }}
            className="flex-shrink-0 p-1 rounded hover:bg-gray-700 transition-colors"
          >
            <span className="material-symbols-outlined text-sm text-gray-400">close</span>
          </button>
        </div>
      </div>
    </div>
  )
}