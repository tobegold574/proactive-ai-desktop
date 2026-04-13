import { useEffect, useRef, useCallback, useState } from 'react'
import { useChatStore } from '../stores/chatStore'
import { useConfigStore } from '../stores/configStore'
import { ChatMessage, AIResponse } from '@shared'

interface Trigger {
  seconds: number
  message: string
}

export function useProactiveChat(conversationId: string | null) {
  const { addMessage, messages } = useChatStore()
  const { config } = useConfigStore()
  const timersRef = useRef<NodeJS.Timeout[]>([])
  const triggerTimesRef = useRef<number[]>([])
  const isActiveRef = useRef(false)
  const activeConversationIdRef = useRef<string | null>(conversationId)
  const [nextTriggerAtMs, setNextTriggerAtMs] = useState<number | null>(null)

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach(timer => clearTimeout(timer))
    timersRef.current = []
    triggerTimesRef.current = []
    setNextTriggerAtMs(null)
  }, [])

  const processTriggers = useCallback((
    triggers: Trigger[],
    history: ChatMessage[],
    conversationId: string
  ) => {
    if (!config.proactiveEnabled || !conversationId) return

    clearAllTimers()
    isActiveRef.current = true
    activeConversationIdRef.current = conversationId

    const now = Date.now()
    for (const trigger of triggers) {
      const triggerAt = now + trigger.seconds * 1000
      triggerTimesRef.current.push(triggerAt)
      const timer = setTimeout(async () => {
        if (!isActiveRef.current) return
        if (activeConversationIdRef.current !== conversationId) return

        addMessage(conversationId, {
          id: `proactive_${Date.now()}_${trigger.seconds}`,
          role: 'assistant',
          content: trigger.message,
          createdAt: Date.now(),
          isProactive: true,
        })

        // Update countdown state for remaining triggers
        triggerTimesRef.current = triggerTimesRef.current.filter((t) => t !== triggerAt)
        const nextAt = triggerTimesRef.current.length > 0 ? Math.min(...triggerTimesRef.current) : null
        setNextTriggerAtMs(nextAt)

        // 注意：触发点是“预设要发送给用户的主动消息”，只需要展示/落盘即可。
        // 不要把 trigger.message 当成用户消息再去调用 sendMessage，否则会造成 AI 自己跟自己对话的循环。
      }, trigger.seconds * 1000)

      timersRef.current.push(timer)
    }

    const nextAt = triggerTimesRef.current.length > 0 ? Math.min(...triggerTimesRef.current) : null
    setNextTriggerAtMs(nextAt)
  }, [addMessage, config.proactiveEnabled, messages, clearAllTimers])

  const handleProactiveResponse = useCallback((
    response: AIResponse,
    conversationId: string
  ) => {
    if (response.triggers && response.triggers.length > 0) {
      const currentMessages = messages[conversationId] || []
      const history = currentMessages.slice(-6).filter(m => m.role !== 'system')
      processTriggers(response.triggers, history, conversationId)
    }
  }, [messages, processTriggers])

  useEffect(() => {
    return () => {
      isActiveRef.current = false
      activeConversationIdRef.current = null
      clearAllTimers()
    }
  }, [clearAllTimers])

  useEffect(() => {
    // 切换会话时必须清理旧会话的倒计时/触发点，避免跨会话残留
    activeConversationIdRef.current = conversationId
    isActiveRef.current = false
    clearAllTimers()
  }, [conversationId, clearAllTimers])

  return {
    handleProactiveResponse,
    clearProactiveTimers: clearAllTimers,
    nextTriggerAtMs,
  }
}
