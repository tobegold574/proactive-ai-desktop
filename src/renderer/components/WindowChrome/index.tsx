import { Minus, Square, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

function CenteredTitle() {
  return (
    <div
      className="pointer-events-none absolute left-1/2 top-0 z-[1] flex h-full -translate-x-1/2 items-center"
      aria-hidden
    >
      <span className="text-xs font-semibold tracking-wide text-[var(--app-muted)] select-none">
        ProactiveAI
      </span>
    </div>
  )
}

/**
 * 无边框窗口顶栏：与内容区同底色、无系统菜单；Windows/Linux 控制按钮在整窗最右侧。
 * macOS：为交通灯预留左侧区域，其余为拖拽区。标题几何居中，不拦截拖拽。
 */
export default function WindowChrome() {
  const { t } = useTranslation()
  const platform = window.electronAPI.platform

  const onDoubleClickDrag = () => {
    void window.electronAPI.window.maximizeToggle()
  }

  if (platform === 'darwin') {
    return (
      <header
        className={cn(
          'relative flex h-10 shrink-0 items-stretch border-b border-[color:var(--app-border)]',
          'bg-[var(--app-bg)]'
        )}
      >
        <CenteredTitle />
        <div className="relative z-[2] flex min-h-0 w-full min-w-0">
          <div className="w-[72px] shrink-0 [-webkit-app-region:drag]" aria-hidden />
          <div
            className="min-h-0 min-w-0 flex-1 cursor-default [-webkit-app-region:drag]"
            onDoubleClick={onDoubleClickDrag}
            aria-hidden
          />
        </div>
      </header>
    )
  }

  return (
    <header
      className={cn(
        'relative flex h-9 shrink-0 items-stretch border-b border-[color:var(--app-border)]',
        'bg-[var(--app-bg)]'
      )}
    >
      <CenteredTitle />
      <div className="relative z-[2] flex min-h-0 w-full min-w-0">
        <div
          className="min-h-0 min-w-0 flex-1 cursor-default [-webkit-app-region:drag]"
          onDoubleClick={onDoubleClickDrag}
          aria-hidden
        />
        <div className="flex shrink-0 items-stretch [-webkit-app-region:no-drag]">
          <button
            type="button"
            className="flex w-[46px] items-center justify-center text-[var(--app-muted)] transition-colors hover:bg-[var(--app-hover)] hover:text-[var(--app-fg)]"
            onClick={() => void window.electronAPI.window.minimize()}
            aria-label={t('window.minimize')}
          >
            <Minus size={15} strokeWidth={2} />
          </button>
          <button
            type="button"
            className="flex w-[46px] items-center justify-center text-[var(--app-muted)] transition-colors hover:bg-[var(--app-hover)] hover:text-[var(--app-fg)]"
            onClick={() => void window.electronAPI.window.maximizeToggle()}
            aria-label={t('window.maximize')}
          >
            <Square size={12} strokeWidth={2} />
          </button>
          <button
            type="button"
            className="flex w-[46px] items-center justify-center text-[var(--app-muted)] transition-colors hover:bg-red-600/85 hover:text-white"
            onClick={() => void window.electronAPI.window.close()}
            aria-label={t('window.close')}
          >
            <X size={15} strokeWidth={2} />
          </button>
        </div>
      </div>
    </header>
  )
}
