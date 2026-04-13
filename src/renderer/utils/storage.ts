export function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : defaultValue
  } catch (err) {
    console.error(`Failed to get ${key}:`, err)
    return defaultValue
  }
}

export function setStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (err) {
    console.error(`Failed to set ${key}:`, err)
  }
}

export function removeStorageItem(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch (err) {
    console.error(`Failed to remove ${key}:`, err)
  }
}

export function clearStorage(): void {
  try {
    localStorage.clear()
  } catch (err) {
    console.error('Failed to clear storage:', err)
  }
}