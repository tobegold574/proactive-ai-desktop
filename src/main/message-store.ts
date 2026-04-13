import { app } from 'electron'
import path from 'path'
import fs from 'fs'
import { ChatMessage } from '../shared/types'

class MessageStore {
  private messagesDir: string

  constructor() {
    const userDataPath = app.getPath('userData')
    this.messagesDir = path.join(userDataPath, 'data', 'messages')
    if (!fs.existsSync(this.messagesDir)) {
      fs.mkdirSync(this.messagesDir, { recursive: true })
    }
  }

  private getMessagesPath(conversationId: string): string {
    return path.join(this.messagesDir, `${conversationId}.json`)
  }

  /**
   * 获取对话的所有消息
   */
  getByConversation(conversationId: string): ChatMessage[] {
    const filePath = this.getMessagesPath(conversationId)
    if (!fs.existsSync(filePath)) {
      return []
    }
    const data = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(data) as ChatMessage[]
  }

  /**
   * 添加消息到对话
   */
  add(conversationId: string, message: ChatMessage): void {
    const messages = this.getByConversation(conversationId)
    messages.push(message)
    const filePath = this.getMessagesPath(conversationId)
    fs.writeFileSync(filePath, JSON.stringify(messages, null, 2))
  }

  /**
   * 清除对话的所有消息
   */
  clear(conversationId: string): void {
    const filePath = this.getMessagesPath(conversationId)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
  }
}

export const messageStore = new MessageStore()
