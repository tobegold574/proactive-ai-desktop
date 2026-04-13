import { useConversationStore } from '../stores/conversationStore'

interface Conversation {
  id: string
  title: string
  createdAt: number
  updatedAt: number
}

interface UseConversationReturn {
  conversations: Conversation[]
  currentConversationId: string | null
  createConversation: () => string
  deleteConversation: (id: string) => void
  setCurrentConversation: (id: string) => void
}

export function useConversation(): UseConversationReturn {
  const { conversations, currentConversationId, createConversation, deleteConversation, setCurrentConversation, loadFromStorage, saveToStorage } = useConversationStore()

  const handleCreateConversation = () => {
    const id = createConversation()
    saveToStorage()
    return id
  }

  const handleDeleteConversation = (id: string) => {
    deleteConversation(id)
    saveToStorage()
  }

  const handleSetCurrentConversation = (id: string) => {
    setCurrentConversation(id)
    saveToStorage()
  }

  return {
    conversations,
    currentConversationId,
    createConversation: handleCreateConversation,
    deleteConversation: handleDeleteConversation,
    setCurrentConversation: handleSetCurrentConversation,
  }
}