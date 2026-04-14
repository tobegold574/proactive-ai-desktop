import type { PluginHooks } from '../../../shared/types'
import type { PluginContext } from '../context'

/** 演示用片段表；后续可从 plugin-preferences config 读取 */
const SNIPS: Record<string, string> = {
  hello: '你好，',
  bye: '再见，',
  thanks: '谢谢，',
}

export function createSnippetTransformHooks(
  _ctx: PluginContext
): Partial<PluginHooks> {
  return {
    onMessageSend(message: string) {
      return message.replace(/\\snip:(\w+)\\/g, (_, key: string) => {
        return SNIPS[key] ?? `\\snip:${key}\\`
      })
    },
  }
}
