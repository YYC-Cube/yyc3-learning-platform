import { logger } from './logger'

export const storage = {
  get<T>(key: string): T | null {
    if (typeof window === "undefined") return null
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      logger.error("Error reading from localStorage", error)
      return null
    }
  },

  set<T>(key: string, value: T): void {
    if (typeof window === "undefined") return
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      logger.error("Error writing to localStorage", error)
    }
  },

  remove(key: string): void {
    if (typeof window === "undefined") return
    try {
      window.localStorage.removeItem(key)
    } catch (error) {
      logger.error("Error removing from localStorage", error)
    }
  },

  clear(): void {
    if (typeof window === "undefined") return
    try {
      window.localStorage.clear()
    } catch (error) {
      logger.error("Error clearing localStorage", error)
    }
  },
}
