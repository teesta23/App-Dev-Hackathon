import { API_BASE_URL } from './tournaments'

export type User = {
  _id?: string
  id?: string
  username?: string
  email?: string
  points?: number
  streakSaves?: number
  lcUsername?: string | null
  leetcodeProfile?: Record<string, unknown> | null
  avatar?: string | null
}

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text()
  let data: any = text
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    //ignore json parse errors
  }

  if (!response.ok) {
    const detail = typeof data?.detail === 'string' ? data.detail : response.statusText
    throw new Error(detail || 'Request failed')
  }

  return data as T
}

export async function fetchUser(userId: string): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`)
  return parseResponse<User>(response)
}

export async function refreshUserPoints(userId: string): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/refresh-points`)
  return parseResponse<User>(response)
}

export async function purchaseStreakSaves(userId: string, count: number): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/streak-saves`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ count }),
  })
  return parseResponse<User>(response)
}
