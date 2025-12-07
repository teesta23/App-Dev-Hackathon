const USER_ID_KEY = 'user_id'

export function getStoredUserId(): string | null {
  const stored = localStorage.getItem(USER_ID_KEY)
  if (!stored || stored === 'null' || stored === 'undefined') return null
  return stored
}

export function setStoredUserId(userId: string) {
  localStorage.setItem(USER_ID_KEY, userId)
}

export function clearStoredUserId() {
  localStorage.removeItem(USER_ID_KEY)
}
