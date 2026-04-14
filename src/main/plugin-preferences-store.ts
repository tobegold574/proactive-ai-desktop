import Store from 'electron-store'

const DEFAULT_ENABLED = [
  'com.proactiveai.export-markdown',
  'com.proactiveai.snippet-transform',
  'com.proactiveai.memory-notify',
] as const

export interface PluginPreferences {
  enabled: string[]
  config: Record<string, Record<string, unknown>>
}

const DEFAULTS: PluginPreferences = {
  enabled: [...DEFAULT_ENABLED],
  config: {},
}

class PluginPreferencesStore {
  private store: Store<PluginPreferences>

  constructor() {
    this.store = new Store<PluginPreferences>({
      name: 'plugin-preferences',
      defaults: DEFAULTS,
    })
  }

  get(): PluginPreferences {
    const raw = this.store.store as PluginPreferences
    if (!Array.isArray(raw.enabled)) {
      return { ...DEFAULTS }
    }
    return raw
  }

  setPluginEnabled(pluginId: string, enabled: boolean): void {
    const cur = this.get().enabled.filter(Boolean)
    if (enabled) {
      if (!cur.includes(pluginId)) {
        this.store.set('enabled', [...cur, pluginId])
      }
    } else {
      this.store.set(
        'enabled',
        cur.filter((id) => id !== pluginId)
      )
    }
  }

  isEnabled(pluginId: string): boolean {
    return this.get().enabled.includes(pluginId)
  }
}

export const pluginPreferencesStore = new PluginPreferencesStore()
export { DEFAULT_ENABLED }
