import { X, Check, Loader2, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useConfigStore } from '@/stores/configStore'
import { GlobalSettings, UserSettings, PromptTemplate } from '@shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import {
  clearConversationMemory,
  createTemplate,
  deleteTemplate,
  getConversationMemory,
  getTemplates,
} from '@/api'
import { useConversationStore } from '@/stores/conversationStore'

/** 配置里可能存的是内置 key（如 default），而模板列表用展示名（如「默认助手」） */
function resolveTemplateSelectValue(
  stored: string | undefined,
  templates: PromptTemplate[]
): string {
  if (!templates.length) return ''
  if (stored) {
    const byName = templates.find((t) => t.name === stored)
    if (byName) return byName.name
    const byBuiltinId = templates.find((t) => t.id === `builtin_${stored}`)
    if (byBuiltinId) return byBuiltinId.name
  }
  return templates[0]?.name ?? ''
}

export default function Settings({ onClose }: { onClose: () => void }) {
  const { config, updateConfig, saveToMain, validateAndSave } = useConfigStore()
  const { currentConversationId } = useConversationStore()
  const [isSaving, setIsSaving] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [templates, setTemplates] = useState<PromptTemplate[]>([])
  const [isAddTemplateOpen, setIsAddTemplateOpen] = useState(false)
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false)
  const [newTemplateName, setNewTemplateName] = useState('')
  const [newRolePrompt, setNewRolePrompt] = useState('')
  const [addTemplateError, setAddTemplateError] = useState<string | null>(null)
  const [templateToDelete, setTemplateToDelete] = useState<PromptTemplate | null>(null)
  const [isDeletingTemplate, setIsDeletingTemplate] = useState(false)
  const [memoryItems, setMemoryItems] = useState<string[]>([])
  const [isMemoryLoading, setIsMemoryLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const templateSelectValue = useMemo(
    () => resolveTemplateSelectValue(config.defaultTemplateName, templates),
    [config.defaultTemplateName, templates]
  )

  useEffect(() => {
    const load = async () => {
      try {
        const list = await getTemplates()
        setTemplates(list)
      } catch (err) {
        console.error('Failed to load templates:', err)
      }
    }
    load()
  }, [])

  useEffect(() => {
    const loadMemory = async () => {
      if (!currentConversationId) {
        setMemoryItems([])
        return
      }
      setIsMemoryLoading(true)
      try {
        const items = await getConversationMemory(currentConversationId)
        setMemoryItems(items)
      } catch (err) {
        console.error('Failed to load memory:', err)
        setMemoryItems([])
      } finally {
        setIsMemoryLoading(false)
      }
    }
    loadMemory()
  }, [currentConversationId])

  const handleSave = async () => {
    setIsSaving(true)
    setMessage(null)
    try {
      const success = await saveToMain()
      if (success) {
        onClose()
      } else {
        setMessage({ type: 'error', text: '保存失败' })
      }
    } catch {
      setMessage({ type: 'error', text: '保存失败' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleValidate = async () => {
    setIsValidating(true)
    setMessage(null)
    try {
      const success = await validateAndSave()
      if (success) {
        onClose()
      } else {
        setMessage({ type: 'error', text: '配置验证失败' })
      }
    } catch {
      setMessage({ type: 'error', text: 'API 验证失败，请检查配置' })
    } finally {
      setIsValidating(false)
    }
  }

  const handleUpdateGlobal = (key: keyof GlobalSettings, value: unknown) => {
    updateConfig({ [key]: value } as Partial<GlobalSettings>)
  }

  const reloadTemplates = async (): Promise<PromptTemplate[]> => {
    const list = await getTemplates()
    setTemplates(list)
    return list
  }

  const openAddTemplate = () => {
    setAddTemplateError(null)
    setNewTemplateName('')
    setNewRolePrompt('')
    setIsAddTemplateOpen(true)
  }

  const handleCreateTemplate = async () => {
    const name = newTemplateName.trim()
    const rolePrompt = newRolePrompt.trim()
    setAddTemplateError(null)
    if (!name) {
      setAddTemplateError('请输入模板名称。')
      return
    }
    if (!rolePrompt) {
      setAddTemplateError('请输入角色提示词（rolePrompt）。')
      return
    }
    if (templates.some((t) => t.name === name)) {
      setAddTemplateError('模板名称已存在，请换一个名称。')
      return
    }

    setIsCreatingTemplate(true)
    try {
      await createTemplate({ name, rolePrompt, isBuiltIn: false })
      await reloadTemplates()
      // 立即切换到新模板（保存配置由用户点击保存按钮触发）
      handleUpdateGlobal('defaultTemplateName', name)
      setIsAddTemplateOpen(false)
    } catch (err) {
      console.error('Failed to create template:', err)
      setAddTemplateError('创建失败，请稍后重试。')
    } finally {
      setIsCreatingTemplate(false)
    }
  }

  const handleConfirmDeleteTemplate = async () => {
    if (!templateToDelete || templateToDelete.isBuiltIn) return
    const deletedName = templateToDelete.name
    const wasCurrentSelection = templateSelectValue === deletedName

    setIsDeletingTemplate(true)
    setMessage(null)
    try {
      const ok = await deleteTemplate(templateToDelete.id)
      if (!ok) {
        setMessage({ type: 'error', text: '无法删除该模板（内置模板不可删除）。' })
        return
      }
      setTemplateToDelete(null)
      const list = await reloadTemplates()
      if (wasCurrentSelection) {
        const fallback = list.find((t) => t.isBuiltIn) ?? list[0]
        handleUpdateGlobal('defaultTemplateName', fallback?.name ?? 'default')
      }
    } catch (err) {
      console.error('Failed to delete template:', err)
      setMessage({ type: 'error', text: '删除失败，请稍后重试。' })
    } finally {
      setIsDeletingTemplate(false)
    }
  }

  const handleClearMemory = async () => {
    if (!currentConversationId) return
    setIsMemoryLoading(true)
    try {
      const ok = await clearConversationMemory(currentConversationId)
      if (ok) {
        setMemoryItems([])
      }
    } catch (err) {
      console.error('Failed to clear memory:', err)
    } finally {
      setIsMemoryLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--app-overlay)] p-4 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
      onClick={onClose}
    >
      <div
        className={cn(
          'flex max-h-[min(85vh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl',
          'border border-[color:var(--app-border-strong)] bg-[var(--app-surface)] shadow-2xl shadow-[var(--app-shadow-modal)]'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[color:var(--app-border-strong)] px-5 py-4">
          <h2 id="settings-title" className="text-lg font-semibold tracking-tight text-[var(--app-fg)]">
            设置
          </h2>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 rounded-full text-[var(--app-muted)] hover:bg-[var(--app-hover-strong)] hover:text-[var(--app-fg)]"
            onClick={onClose}
            aria-label="关闭"
          >
            <X size={20} />
          </Button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">
          {message && (
            <div
              className={cn(
                'mb-5 rounded-xl border px-3 py-2.5 text-sm',
                message.type === 'success'
                  ? 'border-green-500/30 bg-green-500/10 text-green-300'
                  : 'border-red-500/30 bg-red-500/10 text-red-300'
              )}
            >
              {message.text}
            </div>
          )}

          <div className="space-y-6">
            <section className="space-y-3 rounded-xl border border-[color:var(--app-border-strong)] bg-[var(--app-subtle-section)] p-4">
              <div className="flex items-center justify-between gap-2">
                <Label className="text-[var(--app-fg)]">本会话记忆</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs text-[var(--app-muted)] hover:bg-[var(--app-hover-strong)] hover:text-[var(--app-fg)]"
                  onClick={handleClearMemory}
                  disabled={!currentConversationId || isMemoryLoading || memoryItems.length === 0}
                >
                  清空
                </Button>
              </div>
              {!currentConversationId ? (
                <p className="text-xs leading-relaxed text-[var(--app-muted)]">请选择一个对话以查看记忆。</p>
              ) : isMemoryLoading ? (
                <p className="text-xs text-[var(--app-muted)]">加载中…</p>
              ) : memoryItems.length === 0 ? (
                <p className="text-xs text-[var(--app-muted)]">暂无记忆条目。</p>
              ) : (
                <div className="max-h-36 space-y-2 overflow-y-auto pr-1">
                  {memoryItems.slice(0, 12).map((item, idx) => (
                    <div
                      key={`${idx}_${item.slice(0, 24)}`}
                      className="rounded-lg border border-[color:var(--app-border-strong)] bg-[var(--app-input-bg)] px-3 py-2 text-xs leading-snug text-[var(--app-fg)]"
                    >
                      {item}
                    </div>
                  ))}
                  {memoryItems.length > 12 && (
                    <p className="text-[11px] text-[var(--app-muted)]">
                      已显示前 12 条（共 {memoryItems.length} 条）。
                    </p>
                  )}
                </div>
              )}
            </section>

            <section className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[var(--app-fg)]">外观</Label>
                <Select
                  value={config.theme ?? 'dark'}
                  onValueChange={(value) =>
                    handleUpdateGlobal('theme', value as GlobalSettings['theme'])
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="主题" />
                  </SelectTrigger>
                  <SelectContent position="popper" sideOffset={6} align="start">
                    <SelectItem value="dark">深色</SelectItem>
                    <SelectItem value="light">浅色</SelectItem>
                    <SelectItem value="auto">跟随系统</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-[var(--app-muted)]">切换后立即生效；点「保存」可写入配置文件。</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="settings-api-key" className="text-[var(--app-fg)]">
                  API Key
                </Label>
                <Input
                  id="settings-api-key"
                  type="password"
                  value={config.apiKey}
                  onChange={(e) => handleUpdateGlobal('apiKey', e.target.value)}
                  placeholder="输入 API Key"
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="settings-model" className="text-[var(--app-fg)]">
                  模型
                </Label>
                <Input
                  id="settings-model"
                  type="text"
                  value={config.model}
                  onChange={(e) => handleUpdateGlobal('model', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="settings-base-url" className="text-[var(--app-fg)]">
                  Base URL
                </Label>
                <Input
                  id="settings-base-url"
                  type="text"
                  value={config.baseURL || ''}
                  onChange={(e) => handleUpdateGlobal('baseURL', e.target.value)}
                  placeholder="留空使用默认"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[var(--app-fg)]">AI 人设模板</Label>
                {templates.length > 0 && templateSelectValue ? (
                  <Select
                    value={templateSelectValue}
                    onValueChange={(value) => {
                      if (value === '__add_template__') {
                        openAddTemplate()
                        return
                      }
                      handleUpdateGlobal('defaultTemplateName', value)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择模板" />
                    </SelectTrigger>
                    <SelectContent position="popper" sideOffset={6} align="start" className="min-w-[var(--radix-select-trigger-width)]">
                      {templates.map((t) =>
                        t.isBuiltIn ? (
                          <SelectItem key={t.id} value={t.name}>
                            {t.name}
                          </SelectItem>
                        ) : (
                          <SelectItem
                            key={t.id}
                            value={t.name}
                            textValue={t.name}
                            trailing={
                              <button
                                type="button"
                                className="rounded-md p-1.5 text-[var(--app-muted)] outline-none transition-colors hover:bg-red-500/15 hover:text-red-400 focus-visible:ring-2 focus-visible:ring-[color:var(--app-focus-ring)] focus-visible:ring-offset-0"
                                aria-label={`删除模板「${t.name}」`}
                                onPointerDown={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                }}
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  setTemplateToDelete(t)
                                }}
                              >
                                <Trash2 size={14} strokeWidth={2} />
                              </button>
                            }
                          >
                            {t.name}
                          </SelectItem>
                        )
                      )}
                      <div className="my-1 h-px bg-[color:var(--app-border-strong)]" />
                      <SelectItem value="__add_template__">新增模板…</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-xs text-[var(--app-muted)]">正在加载模板列表…</p>
                )}
                <p className="text-xs text-[var(--app-muted)]">
                  内置模板不可删除；自定义模板在展开下拉的对应行右侧可删除。
                </p>
              </div>
            </section>

            <section className="space-y-5 border-t border-[color:var(--app-border-strong)] pt-5">
              <div className="space-y-3">
                <div className="flex items-baseline justify-between gap-2">
                  <Label className="text-[var(--app-fg)]">主动触发间隔</Label>
                  <span className="text-xs tabular-nums text-[var(--app-muted)]">
                    {config.defaultProactiveInterval || 60} 秒
                  </span>
                </div>
                <Slider
                  min={30}
                  max={300}
                  step={10}
                  value={[config.defaultProactiveInterval || 60]}
                  onValueChange={([value]) => handleUpdateGlobal('defaultProactiveInterval', value)}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-baseline justify-between gap-2">
                  <Label className="text-[var(--app-fg)]">最大触发点数量</Label>
                  <span className="text-xs tabular-nums text-[var(--app-muted)]">
                    {config.defaultMaxTriggers || 3}
                  </span>
                </div>
                <Slider
                  min={1}
                  max={5}
                  value={[config.defaultMaxTriggers || 3]}
                  onValueChange={([value]) => handleUpdateGlobal('defaultMaxTriggers', value)}
                />
              </div>

              <div className="flex items-center justify-between gap-4 rounded-xl border border-[color:var(--app-border-strong)] bg-[var(--app-subtle-section)] px-4 py-3">
                <Label htmlFor="settings-proactive" className="cursor-pointer text-[var(--app-fg)]">
                  启用主动对话
                </Label>
                <Switch
                  id="settings-proactive"
                  checked={config.proactiveEnabled ?? true}
                  onCheckedChange={(checked) => handleUpdateGlobal('proactiveEnabled', checked)}
                />
              </div>
            </section>
          </div>
        </div>

        <footer className="shrink-0 space-y-2 border-t border-[color:var(--app-border-strong)] bg-[var(--app-surface-footer)] px-5 py-4 backdrop-blur-sm">
          <Button
            type="button"
            onClick={handleValidate}
            disabled={isValidating || !config.apiKey}
            className="w-full gap-2"
          >
            {isValidating ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Check size={18} />
            )}
            验证并保存配置
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handleSave}
            disabled={isSaving}
            className="w-full"
          >
            {isSaving ? '保存中…' : '仅保存配置'}
          </Button>
        </footer>
      </div>

      {templateToDelete && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[var(--app-overlay)] p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-template-title"
          onClick={() => {
            if (!isDeletingTemplate) setTemplateToDelete(null)
          }}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl border border-[color:var(--app-border-strong)] bg-[var(--app-surface)] shadow-2xl shadow-[var(--app-shadow-modal)]"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="border-b border-[color:var(--app-border-strong)] px-5 py-4">
              <h3 id="delete-template-title" className="text-base font-semibold text-[var(--app-fg)]">
                删除模板
              </h3>
            </header>
            <div className="px-5 py-4">
              <p className="text-sm text-[var(--app-muted)]">
                确定删除「{templateToDelete.name}」？此操作不可撤销。
              </p>
            </div>
            <footer className="flex items-center justify-end gap-2 border-t border-[color:var(--app-border-strong)] bg-[var(--app-surface-footer)] px-5 py-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setTemplateToDelete(null)}
                disabled={isDeletingTemplate}
              >
                取消
              </Button>
              <Button
                type="button"
                disabled={isDeletingTemplate}
                className="bg-red-600 text-white hover:bg-red-500"
                onClick={() => void handleConfirmDeleteTemplate()}
              >
                {isDeletingTemplate ? '删除中…' : '删除'}
              </Button>
            </footer>
          </div>
        </div>
      )}

      {isAddTemplateOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[var(--app-overlay)] p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="新增模板"
          onClick={() => setIsAddTemplateOpen(false)}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-[color:var(--app-border-strong)] bg-[var(--app-surface)] shadow-2xl shadow-[var(--app-shadow-modal)]"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="flex items-center justify-between gap-3 border-b border-[color:var(--app-border-strong)] px-5 py-4">
              <h3 className="text-base font-semibold tracking-tight text-[var(--app-fg)]">
                新增模板
              </h3>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 rounded-full text-[var(--app-muted)] hover:bg-[var(--app-hover-strong)] hover:text-[var(--app-fg)]"
                onClick={() => setIsAddTemplateOpen(false)}
                aria-label="关闭"
              >
                <X size={20} />
              </Button>
            </header>

            <div className="space-y-4 px-5 py-4">
              {addTemplateError && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-300">
                  {addTemplateError}
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-[var(--app-fg)]">模板名称</Label>
                <Input
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  placeholder="例如：产品经理 / 代码审查 / 英语老师"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[var(--app-fg)]">角色提示词（rolePrompt）</Label>
                <textarea
                  value={newRolePrompt}
                  onChange={(e) => setNewRolePrompt(e.target.value)}
                  placeholder="描述这个助手的角色、语气、目标、边界等…"
                  rows={6}
                  className={cn(
                    'w-full resize-y rounded-xl border border-[color:var(--app-input-border)] bg-[var(--app-input-bg)] px-4 py-3 text-base text-[var(--app-input-fg)] outline-none placeholder:text-[var(--app-muted-fg)] transition-colors',
                    'focus-visible:ring-2 focus-visible:ring-[color:var(--app-focus-ring)] focus-visible:ring-offset-0'
                  )}
                />
                <p className="text-xs text-[var(--app-muted)]">
                  只会注入到“角色设定”部分；系统的触发点/格式要求等仍由程序统一追加，不会被覆盖。
                </p>
              </div>
            </div>

            <footer className="flex items-center justify-end gap-2 border-t border-[color:var(--app-border-strong)] bg-[var(--app-surface-footer)] px-5 py-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsAddTemplateOpen(false)}
                disabled={isCreatingTemplate}
              >
                取消
              </Button>
              <Button type="button" onClick={handleCreateTemplate} disabled={isCreatingTemplate}>
                {isCreatingTemplate ? '创建中…' : '创建并选中'}
              </Button>
            </footer>
          </div>
        </div>
      )}
    </div>
  )
}
