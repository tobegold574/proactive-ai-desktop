import { useEffect } from 'react'
import { useConfigStore } from '@/stores/configStore'

function resolveTheme(theme: 'light' | 'dark' | 'auto' | undefined): 'light' | 'dark' {
  if (theme === 'light') return 'light'
  if (theme === 'dark' || theme === undefined) return 'dark'
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

/** 将 config.theme 同步到 document.documentElement[data-theme]，供 CSS 变量使用 */
export function useSyncDocumentTheme() {
  const theme = useConfigStore((s) => s.config.theme)

  useEffect(() => {
    const apply = () => {
      document.documentElement.setAttribute('data-theme', resolveTheme(theme))
    }
    apply()
    if (theme !== 'auto') return
    const mq = window.matchMedia('(prefers-color-scheme: light)')
    const onChange = () => apply()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [theme])
}
