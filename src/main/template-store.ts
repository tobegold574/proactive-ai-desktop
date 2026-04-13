import Store from 'electron-store'
import { PromptTemplate } from '../shared/types'
import { PROMPT_TEMPLATES } from '../shared/prompt-templates'

const DEFAULT_TEMPLATES: PromptTemplate[] = Object.entries(PROMPT_TEMPLATES).map(
  ([key, value]) => ({
    id: `builtin_${key}`,
    name: value.name,
    rolePrompt: value.rolePrompt,
    isBuiltIn: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  })
)

class TemplateStore {
  private store: Store<{ templates: PromptTemplate[] }>

  constructor() {
    this.store = new Store<{ templates: PromptTemplate[] }>({
      name: 'templates',
      defaults: {
        templates: DEFAULT_TEMPLATES,
      },
    })
  }

  getAll(): PromptTemplate[] {
    return (this.store as any).get('templates') || []
  }

  get(name: string): PromptTemplate | undefined {
    const templates = this.getAll()
    return templates.find((t) => t.name === name)
  }

  getById(id: string): PromptTemplate | undefined {
    const templates = this.getAll()
    return templates.find((t) => t.id === id)
  }

  create(
    template: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>
  ): PromptTemplate {
    const templates = this.getAll()
    const newTemplate: PromptTemplate = {
      ...template,
      id: `custom_${Date.now()}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    templates.push(newTemplate)
    ;(this.store as any).set('templates', templates)
    return newTemplate
  }

  update(id: string, updates: Partial<PromptTemplate>): void {
    const templates = this.getAll()
    const index = templates.findIndex((t) => t.id === id)
    if (index !== -1) {
      templates[index] = {
        ...templates[index],
        ...updates,
        updatedAt: Date.now(),
      }
      ;(this.store as any).set('templates', templates)
    }
  }

  delete(id: string): boolean {
    const templates = this.getAll()
    const template = templates.find((t) => t.id === id)
    if (!template || template.isBuiltIn) {
      return false
    }
    const filtered = templates.filter((t) => t.id !== id)
    ;(this.store as any).set('templates', filtered)
    return true
  }

  init(): void {
    const existing = this.getAll()
    if (!existing || existing.length === 0) {
      ;(this.store as any).set('templates', DEFAULT_TEMPLATES)
    }
  }
}

export const templateStore = new TemplateStore()
