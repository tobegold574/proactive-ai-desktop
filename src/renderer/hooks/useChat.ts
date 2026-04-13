import { useState } from 'react'
import { useChatStore } from '../stores/chatStore'
import { useConfigStore } from '../stores/configStore'
import { callAI } from '../api'
import { ChatResponse } from '@shared'

interface UseChatReturn {
  sendMessage: (content: string) => Promise<void>
  isLoading: boolean
  error: Error | null
}

export function useChat(conversationId: string): UseChatReturn {
  const { addMessage, setLoading, currentConversation } = useChatStore()
  const { config } = useConfigStore()
  const [error, setError] = useState<Error | null>(null)

  const sendMessage = async (content: string) => {
    if (!content.trim()) return

    if (!config.apiKey) {
      throw new Error('请先配置 API Key')
    }

    setLoading(true)
    setError(null)

    try {
      const response: ChatResponse = await callAI(
        content,
        [],
        [],
        config
      )

      addMessage(conversationId, {
        id: Date.now().toString(),
        role: 'assistant',
        content: response.reply,
        createdAt: Date.now(),
        extra: {
          triggers: response.triggers,
          next_api_call_seconds: response.next_api_call_seconds,
        },
      })
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    sendMessage,
    isLoading: useChatStore((state) => state.isLoading),
    error,
  }
}