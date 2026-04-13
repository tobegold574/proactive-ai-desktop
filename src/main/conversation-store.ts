import { app } from 'electron'
import path from 'path'
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import { Conversation } from '../shared/types'

interface DBSchema {
  conversations: Conversation[]
}

class ConversationStore {
  private db: Low<DBSchema> | null = null

  private async getDB(): Promise<Low<DBSchema>> {
    if (this.db) {
      return this.db
    }

    const userDataPath = app.getPath('userData')
    const dbPath = path.join(userDataPath, 'data', 'conversations.json')

    const adapter = new JSONFile<DBSchema>(dbPath)
    this.db = new Low<DBSchema>(adapter, { conversations: [] })

    await this.db.read()
    if (!this.db.data) {
      this.db.data = { conversations: [] }
    }

    return this.db
  }

  /**
   * 获取所有对话
   */
  async getAll(): Promise<Conversation[]> {
    const db = await this.getDB()
    return db.data.conversations || []
  }

  /**
   * 按ID获取对话
   */
  async get(id: string): Promise<Conversation | undefined> {
    const conversations = await this.getAll()
    return conversations.find((c) => c.id === id)
  }

  /**
   * 创建对话
   */
  async create(title: string = '新对话'): Promise<Conversation> {
    const db = await this.getDB()
    const newConversation: Conversation = {
      id: `conv_${Date.now()}`,
      title,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      memory: [],
    }
    db.data.conversations.unshift(newConversation)
    await db.write()
    return newConversation
  }

  /**
   * 更新对话
   */
  async update(
    id: string,
    updates: Partial<Conversation>
  ): Promise<void> {
    const db = await this.getDB()
    const index = db.data.conversations.findIndex((c) => c.id === id)
    if (index !== -1) {
      db.data.conversations[index] = {
        ...db.data.conversations[index],
        ...updates,
        updatedAt: Date.now(),
      }
      await db.write()
    }
  }

  /**
   * 删除对话
   */
  async delete(id: string): Promise<void> {
    const db = await this.getDB()
    db.data.conversations = db.data.conversations.filter((c) => c.id !== id)
    await db.write()
  }
}

export const conversationStore = new ConversationStore()
