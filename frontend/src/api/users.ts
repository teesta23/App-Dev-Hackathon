import { API_BASE_URL } from './tournaments'

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

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
  roomItems?: RoomItemState[]
}

export type RoomItemState = {
  id: string
  owned: boolean
  placed: boolean
  x?: number
  y?: number
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
    throw new ApiError(response.status, detail || 'Request failed')
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

export async function updateUser(userId: string, updates: {
  username?: string
  email?: string
  password?: string
}): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  })
  return parseResponse<User>(response)
}

export async function purchaseRoomItem(userId: string, itemId: string): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/room/purchase`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ itemId }),
  })
  return parseResponse<User>(response)
}

export async function saveRoomLayout(userId: string, items: RoomItemState[]): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/room`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  })
  return parseResponse<User>(response)
}
