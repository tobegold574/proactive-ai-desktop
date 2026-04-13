import { useSidebarStore } from '../stores/sidebarStore'

interface UseSidebarReturn {
  isOpen: boolean
  toggle: () => void
  setOpen: (open: boolean) => void
}

export function useSidebar(): UseSidebarReturn {
  const { isOpen, toggle, setOpen } = useSidebarStore()

  return {
    isOpen,
    toggle,
    setOpen,
  }
}