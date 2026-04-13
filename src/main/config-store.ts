import Store from 'electron-store'
import { GlobalSettings } from '../shared/types'
import {
  DEFAULT_MODEL,
  DEFAULT_BASE_URL,
  DEFAULT_MAX_TRIGGERS,
  DEFAULT_PROACTIVE_INTERVAL,
  DEFAULT_PROACTIVE_ENABLED,
  DEFAULT_TEMPLATE_NAME,
  DEFAULT_THEME,
  DEFAULT_FONT_SIZE,
} from '../shared/constants'

const DEFAULT_CONFIG: GlobalSettings = {
  apiKey: '',
  model: DEFAULT_MODEL,
  baseURL: DEFAULT_BASE_URL,
  defaultTemplateName: DEFAULT_TEMPLATE_NAME,
  defaultMaxTriggers: DEFAULT_MAX_TRIGGERS,
  defaultProactiveInterval: DEFAULT_PROACTIVE_INTERVAL,
  proactiveEnabled: DEFAULT_PROACTIVE_ENABLED,
  theme: DEFAULT_THEME as 'light' | 'dark' | 'auto',
  fontSize: DEFAULT_FONT_SIZE,
}

class ConfigStore {
  private store: Store<GlobalSettings>

  constructor() {
    this.store = new Store<GlobalSettings>({
      name: 'settings',
      defaults: DEFAULT_CONFIG,
    })
  }

  get(): GlobalSettings {
    return (this.store as any).store
  }

  set(config: GlobalSettings): void {
    Object.keys(config).forEach(key => {
      (this.store as any).set(key, config[key as keyof GlobalSettings])
    })
  }
}

export const configStore = new ConfigStore()
