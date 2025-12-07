import { useEffect, useMemo, useState } from 'react'
import styles from './Home2.module.css'
import { tracks, type LessonNode } from './Lessons.tsx'
import type { SkillLevelOption } from './SkillLevel.tsx'
import { fetchTournaments, type Tournament, type TournamentParticipant } from './api/tournaments'
import { fetchUser, refreshUserPoints } from './api/users'

type LadderEntry = {
  rank: number
  name: string
  solvedSinceJoin: number
  points: number
  isYou: boolean
}

const solvedSinceJoin = (participant: TournamentParticipant) =>
  Math.max(0, (participant.currentTotalSolved ?? 0) - (participant.initialTotalSolved ?? 0))

const buildEntries = (tournament: Tournament, userId: string): { rank: number; entries: LadderEntry[] } | null => {
  const sorted = [...(tournament.participants ?? [])].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
  const entries = sorted.map((participant, index) => ({
    rank: index + 1,
    name: participant.username || participant.lcUsername || 'player',
    solvedSinceJoin: solvedSinceJoin(participant),
    points: participant.score ?? 0,
    isYou: participant.id === userId,
  }))

  const yourEntry = entries.find((entry) => entry.isYou)
  if (!yourEntry) return null

  return { rank: yourEntry.rank, entries }
}

const selectBestTournament = (tournaments: Tournament[], userId: string) => {
  let best: { tournament: Tournament; rank: number; entries: LadderEntry[] } | null = null

  tournaments.forEach((tournament) => {
    const candidate = buildEntries(tournament, userId)
    if (!candidate) return

    const startTime = Date.parse(tournament.startTime ?? '')
    if (!best) {
      best = { tournament, rank: candidate.rank, entries: candidate.entries }
      return
    }

    if (candidate.rank < best.rank) {
      best = { tournament, rank: candidate.rank, entries: candidate.entries }
      return
    }

    if (candidate.rank === best.rank) {
      const bestStart = Date.parse(best.tournament.startTime ?? '')
      if (!Number.isNaN(startTime) && (Number.isNaN(bestStart) || startTime < bestStart)) {
        best = { tournament, rank: candidate.rank, entries: candidate.entries }
      }
    }
  })

  return best
}

type Home2Props = {
  skillLevel?: SkillLevelOption | null
  onGoToContact?: () => void
  onGoToSettings?: () => void
  onGoToTournaments?: () => void
  onGoToLessons?: () => void
  onGoToRoom?: () => void
  //onGoToStore?: () => void
  onLogout?: () => void
}

function Home2({
  skillLevel,
  onGoToContact,
  onGoToSettings,
  onGoToTournaments,
  onGoToLessons,
  onGoToRoom,
  onLogout,
}: Home2Props) {
  const [profileName, setProfileName] = useState('Player')
  const [points, setPoints] = useState(0)
  const [userId, setUserId] = useState<string | null>(null)
  const [streakSaves, setStreakSaves] = useState(0)
  const [bestTournament, setBestTournament] = useState<{
    tournament: Tournament
    rank: number
    entries: Array<{ rank: number; name: string; solvedSinceJoin: number; points: number; isYou: boolean }>
  } | null>(null)
  const [tourneyLoading, setTourneyLoading] = useState(false)

  useEffect(() => {
    const userId = localStorage.getItem('user_id')
    if (userId) {
      setUserId(userId)
    }
  }, [])

  useEffect(() => {
    if (!userId) return

    let cancelled = false
    let intervalId: number | null = null

    const loadUser = async () => {
      try {
        const data = await refreshUserPoints(userId)
        if (cancelled) return
        setProfileName(data.username ?? 'Player')
        setPoints(typeof data.points === 'number' ? data.points : 0)
        setStreakSaves(typeof data.streakSaves === 'number' ? data.streakSaves : 0)
      } catch (error) {
        console.error('Could not refresh user points', error)
        try {
          const data = await fetchUser(userId)
          if (cancelled) return
          setProfileName(data.username ?? 'Player')
          setPoints(typeof data.points === 'number' ? data.points : 0)
          setStreakSaves(typeof data.streakSaves === 'number' ? data.streakSaves : 0)
        } catch (fallbackError) {
          console.error('Could not load user', fallbackError)
        }
      }
    }

    loadUser()
    intervalId = window.setInterval(loadUser, 60000)

    return () => {
      cancelled = true
      if (intervalId !== null) window.clearInterval(intervalId)
    }
  }, [userId])

  useEffect(() => {
    if (!userId) return

    const loadBestTournament = async () => {
      setTourneyLoading(true)
      try {
        const tournaments = await fetchTournaments(userId)
        const best = selectBestTournament(tournaments, userId)
        setBestTournament(best)
      } catch (error) {
        console.error('Could not load tournaments for dashboard', error)
        setBestTournament(null)
      } finally {
        setTourneyLoading(false)
      }
    }

    loadBestTournament()
  }, [userId])

  const profileInitials = useMemo(
    () =>
      profileName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase(),
    [profileName],
  )

  const activeLevel: SkillLevelOption = skillLevel ?? 'intermediate'
  const track = tracks[activeLevel]

  const firstPendingIndex = track.nodes.findIndex((node) => node.status !== 'done')
  const currentIndex = track.nodes.findIndex((node) => node.status === 'current')
  const resolvedCurrentIndex = currentIndex >= 0 ? currentIndex : firstPendingIndex >= 0 ? firstPendingIndex : 0
  const currentLesson = track.nodes[resolvedCurrentIndex] as LessonNode | undefined
  const renderLessonCard = (label: string, lesson?: LessonNode) => (
    <div className={styles.lessonCard}>
      <div className={styles.lessonLabel}>{label}</div>
      {lesson ? (
        <>
          <div className={styles.lessonTitle}>{lesson.title}</div>
          <div className={styles.lessonMeta}>
            <span>{lesson.focus}</span>
            <span>{lesson.duration}</span>
            <span>{lesson.points} pts</span>
          </div>
          <div className={`${styles.lessonStatus} ${styles[lesson.status]}`}>{lesson.status}</div>
        </>
      ) : (
          <div className={styles.lessonEmpty}>No lesson queued</div>
      )}
    </div>
  )

  const renderTournamentTable = () => {
    if (!userId) {
      return (
        <div className={styles.tableBody}>
          <div className={styles.tableRow}>
            <span>–</span>
            <span>log in to see tournaments</span>
            <span>–</span>
            <span>–</span>
          </div>
        </div>
      )
    }

    if (tourneyLoading) {
      return (
        <div className={styles.tableBody}>
          <div className={styles.tableRow}>
            <span>…</span>
            <span>loading</span>
            <span>…</span>
            <span>…</span>
          </div>
        </div>
      )
    }

    if (!bestTournament) {
      return (
        <div className={styles.tableBody}>
          <div className={styles.tableRow}>
            <span>–</span>
            <span>join a tournament to see standings</span>
            <span>–</span>
            <span>–</span>
          </div>
        </div>
      )
    }

    const entries = bestTournament.entries.slice(0, 5)

    return (
      <div className={styles.tableBody}>
        {entries.map((entry) => (
          <div
            key={`${bestTournament.tournament._id}-${entry.rank}-${entry.name}`}
            className={`${styles.tableRow} ${entry.isYou ? styles.highlightRow : ''}`}
          >
            <span>{entry.rank}</span>
            <span>{entry.name}</span>
            <span>{entry.solvedSinceJoin}</span>
            <span>{entry.points}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <aside className={styles.nav}>
        <div className={styles.brand}>&gt; Leeterboard</div>

        <div className={styles.menu}>
          <a className={`${styles.navItem} ${styles.active}`} href="#">
            <span className={`${styles.icon} ${styles['icon-home']}`} />
            Home
          </a>
          <a
            className={styles.navItem}
            href="#"
            onClick={(event) => {
              event.preventDefault()
              onGoToLessons?.()
            }}
          >
            <span className={`${styles.icon} ${styles['icon-bookmark']}`} />
            Learn
          </a>
          <a
            className={styles.navItem}
            href="#"
            onClick={(event) => {
              event.preventDefault()
              onGoToTournaments?.()
            }}
          >
            <span className={`${styles.icon} ${styles['icon-calendar']}`} />
            Tournaments
          </a>
          <a
            className={styles.navItem}
            href="#"
            onClick={(event) => {
              event.preventDefault()
              onGoToRoom?.()
            }}
          >
            <span className={`${styles.icon} ${styles['icon-user']}`} />
            My Room
          </a>

            {/* <a
              className={styles.navItem}
              href="#"
              onClick={(event) => {
              event.preventDefault()
              onGoToStore?.()
            }}
          >
            <span className={`${styles.icon} ${styles['icon-store']}`} />
            Store
            </a>
 */}


        </div>

        <div className={styles.footerMenu}>
          <a
            className={styles.navItem}
            href="#"
            onClick={(event) => {
              event.preventDefault()
              onGoToContact?.()
            }}
          >
            <span className={`${styles.icon} ${styles['icon-chat']}`} />
            support
          </a>
          <button
            className={styles.navItem}
            type="button"
            onClick={() => {
              onGoToSettings?.()
            }}
          >
            <span className={`${styles.icon} ${styles['icon-settings']}`} />
            settings
          </button>
          <a
            className={styles.navItem}
            href="#"
            onClick={(event) => {
              event.preventDefault()
              onLogout?.()
            }}
          >
            <span className={`${styles.icon} ${styles['icon-arrow']}`} />
            log out
          </a>
        </div>
      </aside>

      <main className={styles.content}>
        <div className={styles.topbar}>
          <div className={styles.topbarContent}>
            <div className={styles.topbarProfile}>
              <div className={styles.topbarAvatar}>
                {profileInitials}
              </div>
            <div className={styles.profileInfo}>
              <div className={styles.profileName}>{profileName}</div>
            </div>
          </div>

          <div className={styles.topbarStats}>
            <div className={styles.topbarPoints}>
              <div className={styles.pointsNumber}>{points}</div>
              <div className={styles.pointsLabel}>CURRENT POINTS</div>
            </div>
            <div className={styles.topbarSave}>
              <div className={styles.saveNumber}>{streakSaves}</div>
              <div className={styles.saveLabel}>STREAK SAVES</div>
            </div>
          </div>
        </div>
      </div>

        <div className={styles.sectionHeaders}>
          <div className={styles.sectionTitleTour}>[this week’s tournaments]</div>
          <div />
        </div>

        <div className={styles.mainPanels}>
          <div className={styles.tournamentShell}>
            <div className={styles.tournamentCard}>
              <div className={styles.tournamentHeader}>
                {bestTournament
                  ? `${bestTournament.tournament.name} (you’re #${bestTournament.rank})`
                  : 'no tournaments yet'}
              </div>

              <div className={styles.tableWrapper}>
                <div className={`${styles.tableRow} ${styles.tableHead}`}>
                  <span>#</span>
                  <span>PLAYERS</span>
                  <span>SOLVED TODAY</span>
                  <span>POINTS</span>
                </div>
                {renderTournamentTable()}
              </div>

              <div className={styles.currentStreak}>
                CURRENT STREAK: {bestTournament ? `${bestTournament.tournament.streak ?? 0} days` : '–'}
              </div>
            </div>
          </div>

          <div className={styles.lessonsColumn}>
            <div className={styles.lessonsHeading}>[current lesson]</div>
            {renderLessonCard('current lesson', currentLesson)}
            <button
              className={styles.lessonButton}
              onClick={(event) => {
                event.preventDefault()
                onGoToLessons?.()
              }}
              type="button"
            >
              <span className={styles.arrowText}>&gt;</span>
              all lessons
            </button>
          </div>
        </div>

        <div className={styles.actions}>
          <button
            className={styles.primaryButton}
            onClick={(event) => {
              event.preventDefault()
              onGoToTournaments?.()
            }}
            type="button"
          >
            <span className={styles.arrowText}>&gt;</span>
            view all
          </button>
        </div>
      </main>
    </div>
  )
}

export default Home2
