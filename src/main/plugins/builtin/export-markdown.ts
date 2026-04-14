import type { PluginContext } from '../context'
import type { PluginExportResult } from '../../../shared/types'

export async function runExportConversationMarkdown(
  conversationId: string,
  ctx: PluginContext
): Promise<PluginExportResult> {
  if (!ctx.getMessages || !ctx.writeToDownloads) {
    return { ok: false, error: 'missing_permissions' }
  }
  const msgs = ctx.getMessages(conversationId)
  const lines: string[] = ['# ProactiveAI export', '']
  for (const m of msgs) {
    const tag = m.isProactive ? `${m.role} (proactive)` : m.role
    lines.push(`## ${tag}`, '', m.content, '')
  }
  const body = lines.join('\n')
  const filename = `ProactiveAI-export-${conversationId}-${Date.now()}.md`
  await ctx.writeToDownloads(filename, body)
  return { ok: true, filename }
}
