import { useCrypt } from './useCrypt'

/**
 * useStorage
 * @param key
 * @returns
 */
export function useStorage<T = unknown>(key: string, encrypted = false) {
  const { decode, encode } = useCrypt<T>()

  function isValidJson(str: string) {
    try {
      JSON.parse(str)
      return true
    } catch (e) {
      return false
    }
  }

  return {
    get: () => {
      const data = localStorage.getItem(`${window.location.host}/${key}`)
      try {
        if (data) {
          const resp = encrypted ? decode(data) : (JSON.parse(data) as T)
          console.log({ StorageGet: resp })
          return resp
        }
        return null
      } catch (error) {
        console.log({ localStorageError: error, storageData: data })
        if (data) return isValidJson(data) ? (JSON.parse(data) as T) : null
        return null
      }
    },
    set: (data: T) => {
      const storeData = encrypted ? encode(data) : JSON.stringify(data)

      localStorage.setItem(`${window.location.host}/${key}`, storeData)

      return storeData
    },
    remove: () => localStorage.removeItem(`${window.location.host}/${key}`)
  }
}
