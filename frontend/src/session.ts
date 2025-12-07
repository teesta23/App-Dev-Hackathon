const USER_ID_KEY = 'user_id'

export function getStoredUserId(): string | null {
  const stored = sessionStorage.getItem(USER_ID_KEY)
  if (!stored || stored === 'null' || stored === 'undefined') return null
  return stored
}

export function setStoredUserId(userId: string) {
  sessionStorage.setItem(USER_ID_KEY, userId)
  //clear any legacy localStorage copy so tabs stay isolated
  localStorage.removeItem(USER_ID_KEY)
}

export function clearStoredUserId() {
  sessionStorage.removeItem(USER_ID_KEY)
  localStorage.removeItem(USER_ID_KEY)
}
