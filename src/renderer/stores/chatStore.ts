import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ChatMessage } from '@shared'

interface ChatStore {
  currentConversation: string | null
  messages: Record<string, ChatMessage[]>
  isLoading: boolean
  setCurrentConversation: (id: string) => void
  addMessage: (conversationId: string, message: ChatMessage) => void
  updateMessages: (conversationId: string, messages: ChatMessage[]) => void
  clearConversation: (conversationId: string) => void
  setLoading: (loading: boolean) => void
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      currentConversation: null,
      messages: {},
      isLoading: false,
      setCurrentConversation: (id) => set({ currentConversation: id }),
      addMessage: (conversationId, message) =>
        set((state) => ({
          messages: {
            ...state.messages,
            [conversationId]: [...(state.messages[conversationId] || []), message],
          },
        })),
      updateMessages: (conversationId, messages) =>
        set((state) => ({
          messages: {
            ...state.messages,
            [conversationId]: messages,
          },
        })),
      clearConversation: (conversationId) =>
        set((state) => ({
          messages: {
            ...state.messages,
            [conversationId]: [],
          },
        })),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'chat-storage',
    }
  )
)