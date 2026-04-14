import type { PluginHooks } from '../../../shared/types'
import type { PluginContext } from '../context'

export function createMemoryNotifyHooks(_ctx: PluginContext): Partial<PluginHooks> {
  return {
    onMemoryUpdate(importantInfo: string[]) {
      console.log(
        `[plugin com.proactiveai.memory-notify] memory batch count=${importantInfo.length}`
      )
    },
  }
}
