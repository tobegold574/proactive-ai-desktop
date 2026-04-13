import { useConfigStore } from '../stores/configStore'
import { UserConfig } from '@shared'

interface UseConfigReturn {
  config: UserConfig
  updateConfig: (config: Partial<UserConfig>) => void
  resetConfig: () => void
}

export function useConfig(): UseConfigReturn {
  const { config, updateConfig, resetConfig, loadFromStorage, saveToStorage } = useConfigStore()

  const handleUpdateConfig = (newConfig: Partial<UserConfig>) => {
    updateConfig(newConfig)
    saveToStorage()
  }

  const handleResetConfig = () => {
    resetConfig()
    saveToStorage()
  }

  return {
    config,
    updateConfig: handleUpdateConfig,
    resetConfig: handleResetConfig,
  }
}