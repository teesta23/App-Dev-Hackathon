import { useEffect, useMemo, useState, type FormEvent } from 'react'
import styles from './Tournaments.module.css'
import homeStyles from './Home2.module.css'
import {
  createTournament,
  fetchTournaments,
  joinTournament,
  type Tournament,
  type TournamentParticipant,
} from './api/tournaments'
import { fetchUser, purchaseStreakSaves, refreshUserPoints } from './api/users'

type TournamentsProps = {
  onBackToDashboard?: () => void
  onGoToContact?: () => void
  onGoToSettings?: () => void
  onGoToLessons?: () => void
  onGoToRoom?: () => void
  onLogout?: () => void
}

type LadderEntry = {
  rank: number
  name: string
  lcUsername?: string | null
  solvedSinceJoin: number
  points: number
  isYou?: boolean
}

const DEFAULT_DURATION_HOURS = 24 * 7

const streakOptions = [
  { label: 'single day cover', cost: 120, desc: 'Protect 1 missed day. No streak drop.', count: 1 },
  { label: 'weekend shield (2 days)', cost: 260, desc: 'Covers back-to-back misses.', count: 2 },
  { label: 'auto-protect pack (3 uses)', cost: 480, desc: 'Auto-applies to your next misses.', count: 3 },
]

const tournamentKey = (tournament: Tournament) => tournament._id ?? tournament.id ?? tournament.name

const solvedSinceJoin = (participant: TournamentParticipant) =>
  Math.max(0, (participant.currentTotalSolved ?? 0) - (participant.initialTotalSolved ?? 0))

const normalizeTournament = (tournament: Tournament): Tournament => ({
  ...tournament,
  streak: tournament.streak ?? 0,
  lastChecked: tournament.lastChecked ?? null,
  participants: [...(tournament.participants ?? [])].sort(
    (a, b) => (b.score ?? 0) - (a.score ?? 0),
  ),
})

const sortByStart = (items: Tournament[]) =>
  [...items].sort(
    (a, b) => new Date(b.startTime ?? 0).getTime() - new Date(a.startTime ?? 0).getTime(),
  )

const formatTimeRemaining = (endTime?: string) => {
  if (!endTime) return 'active'
  const end = Date.parse(endTime)
  if (Number.isNaN(end)) return 'active'

  const diff = end - Date.now()
  if (diff <= 0) return 'ended'

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diff / (1000 * 60)) % 60)

  if (days > 0) return `${days}d ${hours}h left`
  if (hours > 0) return `${hours}h ${minutes}m left`
  return `${minutes}m left`
}

function Tournaments({
  onBackToDashboard,
  onGoToContact,
  onGoToSettings,
  onGoToLessons,
  onGoToRoom,
  onLogout,
}: TournamentsProps) {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [expandedLadders, setExpandedLadders] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [createForm, setCreateForm] = useState({ name: '', password: '' })
  const [joinForm, setJoinForm] = useState({ name: '', password: '' })
  const [createError, setCreateError] = useState<string | null>(null)
  const [joinError, setJoinError] = useState<string | null>(null)
  const [createSubmitting, setCreateSubmitting] = useState(false)
  const [joinSubmitting, setJoinSubmitting] = useState(false)

  const [userId, setUserId] = useState<string | null>(null)
  const [userPoints, setUserPoints] = useState(0)
  const [userName, setUserName] = useState('Player')
  const [streakSaves, setStreakSaves] = useState(0)
  const [purchaseMessage, setPurchaseMessage] = useState<string | null>(null)
  const [purchasingCount, setPurchasingCount] = useState<number | null>(null)
  const [purchaseError, setPurchaseError] = useState(false)

  useEffect(() => {
    const storedUserId = localStorage.getItem('user_id')
    if (storedUserId) setUserId(storedUserId)
  }, [])

  useEffect(() => {
    if (!userId) return

    let cancelled = false

    const loadUser = async () => {
      try {
        const data = await refreshUserPoints(userId)
        if (cancelled) return
        setUserPoints(typeof data.points === 'number' ? data.points : 0)
        setUserName(data.username ?? 'Player')
        setStreakSaves(typeof data.streakSaves === 'number' ? data.streakSaves : 0)
      } catch (error) {
        console.error('Could not refresh user points', error)
        try {
          const data = await fetchUser(userId)
          if (cancelled) return
          setUserPoints(typeof data.points === 'number' ? data.points : 0)
          setUserName(data.username ?? 'Player')
          setStreakSaves(typeof data.streakSaves === 'number' ? data.streakSaves : 0)
        } catch (fallbackError) {
          console.error('Could not load user', fallbackError)
        }
      }
    }

    loadUser()
    return () => {
      cancelled = true
    }
  }, [userId])

  const loadTournaments = async () => {
    if (!userId) {
      setTournaments([])
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await fetchTournaments(userId)
      const normalized = data.map(normalizeTournament)
      setTournaments(sortByStart(normalized))
      try {
        const updatedUser = await fetchUser(userId)
        setUserPoints(typeof updatedUser.points === 'number' ? updatedUser.points : 0)
        setUserName(updatedUser.username ?? 'Player')
        setStreakSaves(typeof updatedUser.streakSaves === 'number' ? updatedUser.streakSaves : 0)
      } catch (userError) {
        console.error('Could not update user points after loading tournaments', userError)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not load tournaments.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTournaments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  const ladderEntries = useMemo(() => {
    const filled: Record<string, LadderEntry[]> = {}
    tournaments.forEach((tour) => {
      const key = tournamentKey(tour)
      const sorted = [...(tour.participants ?? [])].sort(
        (a, b) => (b.score ?? 0) - (a.score ?? 0),
      )
      filled[key] = sorted.map((participant, index) => ({
        rank: index + 1,
        name: participant.username || participant.lcUsername || 'player',
        lcUsername: participant.lcUsername,
        solvedSinceJoin: solvedSinceJoin(participant),
        points: participant.score ?? 0,
        isYou: Boolean(userId && participant.id === userId),
      }))
    })
    return filled
  }, [tournaments, userId])

  const handlePurchase = async (count: number) => {
    if (!userId) {
      setPurchaseError(true)
      setPurchaseMessage('Log in to buy streak saves.')
      return
    }
    setPurchaseMessage(null)
    setPurchasingCount(count)
    setPurchaseError(false)
    try {
      const updatedUser = await purchaseStreakSaves(userId, count)
      setUserPoints(typeof updatedUser.points === 'number' ? updatedUser.points : 0)
      setStreakSaves(typeof updatedUser.streakSaves === 'number' ? updatedUser.streakSaves : 0)
      setPurchaseMessage(`Purchased ${count} streak save${count > 1 ? 's' : ''}.`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not purchase streak saves.'
      setPurchaseMessage(message)
      setPurchaseError(true)
    } finally {
      setPurchasingCount(null)
    }
  }

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const name = createForm.name.trim()
    const password = createForm.password.trim()

    if (!name || !password) {
      setCreateError('Tournament name and password are required.')
      return
    }

    if (!userId) {
      setCreateError('Log in to create a tournament.')
      return
    }

    setCreateSubmitting(true)
    setCreateError(null)

    try {
      const created = normalizeTournament(
        await createTournament({ name, password, creatorId: userId, durationHours: DEFAULT_DURATION_HOURS }),
      )
      setTournaments((prev) =>
        sortByStart([created, ...prev.filter((t) => tournamentKey(t) !== tournamentKey(created))]),
      )
      setCreateForm({ name: '', password: '' })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not create tournament.'
      setCreateError(message)
    } finally {
      setCreateSubmitting(false)
    }
  }

  const handleJoin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const name = joinForm.name.trim()
    const password = joinForm.password.trim()

    if (!userId) {
      setJoinError('Log in to join a tournament.')
      return
    }

    if (!name || !password) {
      setJoinError('Tournament name and password are required.')
      return
    }

    setJoinSubmitting(true)
    setJoinError(null)

    try {
      const joined = normalizeTournament(await joinTournament({ id: userId, name, password }))
      const key = tournamentKey(joined)
      setTournaments((prev) =>
        sortByStart([joined, ...prev.filter((tour) => tournamentKey(tour) !== key)]),
      )
      setExpandedLadders((prev) => ({ ...prev, [key]: true }))
      setJoinForm({ name: '', password: '' })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not join tournament.'
      setJoinError(message)
    } finally {
      setJoinSubmitting(false)
    }
  }

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/)
    if (!parts.length) return '?'
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }

  return (
    <div className={styles.page}>
      <aside className={homeStyles.nav}>
        <div className={homeStyles.brand}>&gt; Leeterboard</div>

        <div className={homeStyles.menu}>
          <button className={homeStyles.navItem} type="button" onClick={onBackToDashboard}>
            <span className={`${homeStyles.icon} ${homeStyles['icon-home']}`} />
            Home
          </button>
          <button
            className={homeStyles.navItem}
            type="button"
            onClick={() => {
              onGoToLessons?.()
            }}
          >
            <span className={`${homeStyles.icon} ${homeStyles['icon-bookmark']}`} />
            Learn
          </button>
          <button className={`${homeStyles.navItem} ${homeStyles.active}`} type="button">
            <span className={`${homeStyles.icon} ${homeStyles['icon-calendar']}`} />
            Tournaments
          </button>
          <button
            className={homeStyles.navItem}
            type="button"
            onClick={() => {
              onGoToRoom?.()
            }}
          >
            <span className={`${homeStyles.icon} ${homeStyles['icon-user']}`} />
            My Room
          </button>
        </div>

        <div className={homeStyles.footerMenu}>
          <button
            className={homeStyles.navItem}
            type="button"
            onClick={() => {
              onGoToContact?.()
            }}
          >
            <span className={`${homeStyles.icon} ${homeStyles['icon-chat']}`} />
            support
          </button>
          <button
            className={homeStyles.navItem}
            type="button"
            onClick={() => {
              onGoToSettings?.()
            }}
          >
            <span className={`${homeStyles.icon} ${homeStyles['icon-settings']}`} />
            settings
          </button>
          <button
            className={homeStyles.navItem}
            type="button"
            onClick={() => {
              onLogout?.()
            }}
          >
            <span className={`${homeStyles.icon} ${homeStyles['icon-arrow']}`} />
            log out
          </button>
        </div>
      </aside>

      <main className={styles.content}>
        <div className={styles.headerRow}>
          <div className={styles.statStack}>
            <div className={`${homeStyles.topbarPoints} ${styles.pointsBadge}`}>
              <div className={homeStyles.pointsNumber}>{userPoints}</div>
              <div className={homeStyles.pointsLabel}>CURRENT POINTS</div>
            </div>
            <div className={styles.saveBadge}>
              <div className={styles.saveNumber}>{streakSaves}</div>
              <div className={styles.saveLabel}>STREAK SAVES READY</div>
            </div>
          </div>

          <div className={styles.headerCopy}>
            <h1 className={styles.title}>
              <span className={styles.titleAccent}>[tournaments]</span> rally your crew and build your streak
            </h1>
            <p className={styles.subtitle}>
              Create or join a ladder, keep tabs on every bracket you’re in, and spend points on streak saves
              when life gets in the way.
            </p>
            <div className={styles.tags}>
              <span className={styles.tag}>hosted by {userName}</span>
              <span className={styles.tag}>+10 easy / +20 medium / +30 hard</span>
              <span className={styles.tag}>streak checks daily</span>
            </div>
          </div>
        </div>

        <div className={styles.mainGrid}>
          <div className={styles.leftColumn}>
            <section className={`${styles.panel} ${styles.standingsPanel}`}>
              <div className={styles.panelHeader}>
                <div>
                  <div className={styles.panelKicker}>current runs</div>
                  <div className={styles.panelTitle}>your standings</div>
                </div>
                <button className={styles.secondaryButton} type="button" onClick={loadTournaments}>
                  {loading ? 'refreshing...' : 'refresh'}
                </button>
              </div>

              <div className={styles.standingList}>
                {userId === null ? (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyTitle}>log in to see your tournaments</div>
                    <div className={styles.emptySub}>We only show ladders you’ve joined. Create or join after signing in.</div>
                  </div>
                ) : error ? (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyTitle}>couldn&apos;t load tournaments</div>
                    <div className={styles.emptySub}>{error}</div>
                  </div>
                ) : loading && tournaments.length === 0 ? (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyTitle}>loading tournaments…</div>
                    <div className={styles.emptySub}>Hang tight while we sync with the backend.</div>
                  </div>
                ) : tournaments.length === 0 ? (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyTitle}>you&apos;re not in any tournaments</div>
                    <div className={styles.emptySub}>
                      Join a ladder or host your own to start competing again.
                    </div>
                  </div>
                ) : (
                  tournaments.map((tour) => {
                    const key = tournamentKey(tour)
                    const entries = ladderEntries[key] ?? []
                    const showAll = expandedLadders[key]
                    const visibleEntries = showAll ? entries : entries.slice(0, 5)
                    const streakValue = typeof tour.streak === 'number' ? tour.streak : 0
                    const streakLabel = `${streakValue}-day streak`

                    return (
                      <div key={key} className={styles.standingCard}>
                        <div className={styles.standingTop}>
                          <div>
                            <div className={styles.tourName}>{tour.name}</div>
                            <div className={styles.helper}>started {new Date(tour.startTime).toLocaleString()}</div>
                          </div>
                          <div className={styles.metaPills}>
                            <span className={styles.metaChip}>{tour.participants?.length ?? 0} players</span>
                            <span className={styles.metaChip}>{streakLabel}</span>
                            <span className={styles.metaChip}>{formatTimeRemaining(tour.endTime)}</span>
                          </div>
                        </div>

                        <div className={styles.topFiveList}>
                          {visibleEntries.map((entry) => (
                            <div
                              key={`${tour.name}-${entry.rank}-${entry.name}`}
                              className={`${styles.topRow} ${entry.isYou ? styles.ladderHighlight : ''}`}
                            >
                              <span className={styles.rank}>#{entry.rank}</span>
                              <div className={styles.playerInfo}>
                                <span className={styles.avatar}>{getInitials(entry.name)}</span>
                                <div className={styles.playerText}>
                                  <div className={styles.playerName}>
                                    {entry.name} {entry.lcUsername ? `(@${entry.lcUsername})` : ''}
                                  </div>
                                  <div className={styles.playerSub}>{entry.solvedSinceJoin} solved since join</div>
                                </div>
                              </div>
                              <div className={styles.points}>{entry.points} pts</div>
                            </div>
                          ))}
                        </div>

                        <div className={styles.cardActions}>
                          <div className={styles.statSub}>
                            Points update off your LeetCode solves: +10 easy, +20 medium, +30 hard.
                          </div>
                          <div className={styles.cardActionButtons}>
                            {entries.length > 5 && (
                              <button
                                className={styles.ghostButton}
                                type="button"
                                onClick={() =>
                                  setExpandedLadders((prev) => ({
                                    ...prev,
                                    [key]: !prev[key],
                                  }))
                                }
                              >
                                {showAll ? 'collapse' : `view all ${entries.length} placements`}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </section>
          </div>

          <div className={styles.sideColumn}>
            <section className={`${styles.panel} ${styles.formPanel}`}>
              <div className={styles.panelHeader}>
                <div>
                  <div className={styles.panelKicker}>host</div>
                  <div className={styles.panelTitle}>create a tournament</div>
                </div>
              </div>

              <form className={styles.form} onSubmit={handleCreate}>
                <label className={styles.inputGroup}>
                  <span>tournament name</span>
                  <input
                    name="tournament-name"
                    placeholder="friday night sprint or finals prep ladder"
                    value={createForm.name}
                    onChange={(event) => setCreateForm((prev) => ({ ...prev, name: event.target.value }))}
                    required
                  />
                </label>
                <label className={styles.inputGroup}>
                  <span>tournament password</span>
                  <input
                    name="tournament-password"
                    placeholder="password required to join"
                    value={createForm.password}
                    onChange={(event) => setCreateForm((prev) => ({ ...prev, password: event.target.value }))}
                    required
                  />
                </label>

                {createError ? <div className={styles.helper}>{createError}</div> : null}

                <button className={styles.primaryButton} type="submit" disabled={createSubmitting}>
                  <span className={styles.arrowText}>&gt;</span>{' '}
                  {createSubmitting ? 'creating...' : 'create tournament'}
                </button>
              </form>
            </section>

            <section className={`${styles.panel} ${styles.joinPanel}`}>
              <div className={styles.panelHeader}>
                <div>
                  <div className={styles.panelKicker}>join</div>
                  <div className={styles.panelTitle}>join a tournament</div>
                </div>
              </div>

              <form className={styles.form} onSubmit={handleJoin}>
                <label className={styles.inputGroup}>
                  <span>tournament name</span>
                  <input
                    name="join-tournament-name"
                    placeholder="e.g. friday night sprint"
                    value={joinForm.name}
                    onChange={(event) => setJoinForm((prev) => ({ ...prev, name: event.target.value }))}
                    required
                  />
                </label>
                <label className={styles.inputGroup}>
                  <span>password</span>
                  <input
                    name="join-tournament-password"
                    placeholder="host password required"
                    value={joinForm.password}
                    onChange={(event) => setJoinForm((prev) => ({ ...prev, password: event.target.value }))}
                    required
                  />
                </label>
                <div className={styles.helper}>
                  Join ladders that are less than a day old. You need a linked LeetCode account to enter.
                </div>
                {joinError ? <div className={styles.helper}>{joinError}</div> : null}

                <div className={styles.joinActions}>
                  <button className={styles.secondaryButton} type="submit" disabled={joinSubmitting}>
                    {joinSubmitting ? 'joining...' : 'join tournament'}
                  </button>
                </div>
              </form>
            </section>

            <section className={`${styles.panel} ${styles.streakPanel}`}>
              <div className={styles.panelHeader}>
                <div>
                  <div className={styles.panelKicker}>saves</div>
                  <div className={styles.panelTitle}>buy streak saves</div>
                </div>
                <div className={styles.balanceRow}>
                  <div className={styles.balancePill}>{userPoints} pts</div>
                  <div className={`${styles.balancePill} ${styles.savePill}`}>{streakSaves} saves ready</div>
                </div>
              </div>
              <p className={styles.helper}>
                Use points to auto-cover missed days and keep your streak alive across every tournament.
              </p>
              <div className={styles.helperStrong}>
                {streakSaves === 1 ? '1 streak save ready to apply.' : `${streakSaves} streak saves ready to apply.`}
              </div>
              {purchaseMessage ? (
                <div className={purchaseError ? styles.errorText : styles.helperStrong}>{purchaseMessage}</div>
              ) : null}

              <div className={styles.streakOptions}>
                {streakOptions.map((option) => (
                  <div key={option.label} className={styles.streakCard}>
                    <div>
                      <div className={styles.streakLabel}>{option.label}</div>
                      <div className={styles.streakDesc}>{option.desc}</div>
                    </div>
                    <button
                      className={styles.primaryButton}
                      type="button"
                      onClick={() => handlePurchase(option.count)}
                      disabled={purchasingCount !== null}
                    >
                      <span className={styles.arrowText}>&gt;</span>{' '}
                      {purchasingCount === option.count ? 'buying...' : `${option.cost} pts`}
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Tournaments
