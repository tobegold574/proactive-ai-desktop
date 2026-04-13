import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Conversation } from '@shared'
import {
  getConversations,
  getConversation,
  createConversation as createConversationAPI,
  updateConversation as updateConversationAPI,
  deleteConversation as deleteConversationAPI,
} from '../api'

interface ConversationStore {
  conversations: Conversation[]
  currentConversationId: string | null
  isLoading: boolean
  loadFromStorage: () => Promise<void>
  loadFromMain: () => Promise<void>
  createConversation: (title?: string) => Promise<string>
  deleteConversation: (id: string) => Promise<void>
  setCurrentConversation: (id: string) => void
  updateConversation: (id: string, data: Partial<Conversation>) => Promise<void>
  /** 从主进程拉取单条会话并合并进列表（用于主进程已写标题等场景） */
  refreshConversationFromMain: (id: string) => Promise<void>
}

export const useConversationStore = create<ConversationStore>()(
  persist(
    (set, get) => ({
      conversations: [],
      currentConversationId: null,
      isLoading: false,

      loadFromStorage: () => {
        const saved = localStorage.getItem('proactive-conversations')
        if (saved) {
          const conversations = JSON.parse(saved)
          set({ conversations, currentConversationId: conversations[0]?.id || null })
        }
      },

      loadFromMain: async () => {
        set({ isLoading: true })
        try {
          const conversations = await getConversations()
          set({ conversations })
          if (conversations.length > 0 && !get().currentConversationId) {
            set({ currentConversationId: conversations[0].id })
          }
        } catch (error) {
          console.error('Failed to load conversations from main:', error)
        } finally {
          set({ isLoading: false })
        }
      },

      createConversation: async (title?: string) => {
        try {
          const newConv = await createConversationAPI(title)
          set((state) => ({
            conversations: [newConv, ...state.conversations],
            currentConversationId: newConv.id,
          }))
          return newConv.id
        } catch (error) {
          console.error('Failed to create conversation:', error)
          const id = `conv_${Date.now()}`
          const newConversation: Conversation = {
            id,
            title: title || '新对话',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }
          set((state) => ({
            conversations: [newConversation, ...state.conversations],
            currentConversationId: id,
          }))
          return id
        }
      },

      deleteConversation: async (id: string) => {
        try {
          await deleteConversationAPI(id)
        } catch (error) {
          console.error('Failed to delete conversation in main:', error)
        }
        set((state) => {
          const newConversations = state.conversations.filter((c) => c.id !== id)
          const newCurrentId = state.currentConversationId === id
            ? (newConversations[0]?.id || null)
            : state.currentConversationId
          return {
            conversations: newConversations,
            currentConversationId: newCurrentId,
          }
        })
      },

      setCurrentConversation: (id: string) => {
        set({ currentConversationId: id })
      },

      updateConversation: async (id: string, data: Partial<Conversation>) => {
        try {
          await updateConversationAPI(id, data)
        } catch (error) {
          console.error('Failed to update conversation in main:', error)
        }
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, ...data, updatedAt: Date.now() } : c
          ),
        }))
      },

      refreshConversationFromMain: async (id: string) => {
        try {
          const conv = await getConversation(id)
          if (!conv) return
          set((state) => ({
            conversations: state.conversations.map((c) => (c.id === id ? conv : c)),
          }))
        } catch (error) {
          console.error('Failed to refresh conversation from main:', error)
        }
      },
    }),
    {
      name: 'conversation-storage',
      partialize: (state) => ({
        conversations: state.conversations,
        currentConversationId: state.currentConversationId,
      }),
    }
  )
)
