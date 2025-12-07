export const API_BASE_URL = 'http://localhost:8000'

export type TournamentParticipant = {
  id: string
  username: string
  lcUsername?: string | null
  initialTotalSolved: number
  currentTotalSolved: number
  initialEasySolved: number
  currentEasySolved: number
  initialMediumSolved: number
  currentMediumSolved: number
  initialHardSolved: number
  currentHardSolved: number
  score: number
}

export type Tournament = {
  _id?: string
  id?: string
  name: string
  password?: string
  creatorId?: string
  startTime: string
  endTime: string
  participants: TournamentParticipant[]
  streak?: number
  lastChecked?: string | null
}

type CreateTournamentPayload = {
  name: string
  password: string
  creatorId: string
  durationHours?: number
}

type JoinTournamentPayload = {
  id: string
  name: string
  password: string
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

export async function fetchTournaments(userId?: string | null): Promise<Tournament[]> {
  const url = new URL(`${API_BASE_URL}/tournaments/`)
  if (userId) {
    url.searchParams.set('userId', userId)
  }
  const response = await fetch(url.toString())
  return parseResponse<Tournament[]>(response)
}

export async function createTournament(payload: CreateTournamentPayload): Promise<Tournament> {
  const response = await fetch(`${API_BASE_URL}/tournaments/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return parseResponse<Tournament>(response)
}

export async function joinTournament(payload: JoinTournamentPayload): Promise<Tournament> {
  const response = await fetch(`${API_BASE_URL}/tournaments/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return parseResponse<Tournament>(response)
}
