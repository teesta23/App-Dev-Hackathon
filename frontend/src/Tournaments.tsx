import { useMemo, useState, type FormEvent } from 'react'
import styles from './Tournaments.module.css'
import homeStyles from './Home2.module.css'

type TournamentsProps = {
  onBackToDashboard?: () => void
  onGoToContact?: () => void
  onGoToSettings?: () => void
  onLogout?: () => void
}

const activeTournaments = [
  {
    name: 'weekly sprint',
    mode: 'team ladder',
    ends: 'sun @ 11:59p',
    placement: 3,
    totalPlayers: 24,
    solved: 18,
    target: 24,
    points: 1280,
    streak: '6-day streak',
    progress: 76,
    momentum: '+2 spots',
    trend: 'up',
  },
  {
    name: 'october trio showdown',
    mode: 'trio teams',
    ends: 'wed @ 9p',
    placement: 1,
    totalPlayers: 12,
    solved: 21,
    target: 25,
    points: 2010,
    streak: '12-day streak',
    progress: 88,
    momentum: '+1 spot',
    trend: 'up',
  },
  {
    name: 'late night grinders',
    mode: 'solo ladder',
    ends: 'fri @ 1a',
    placement: 6,
    totalPlayers: 30,
    solved: 11,
    target: 20,
    points: 720,
    streak: '3-day streak',
    progress: 54,
    momentum: '-1 spot',
    trend: 'down',
  },
]

const streakOptions = [
  { label: 'single day cover', cost: 120, desc: 'Protect 1 missed day. No streak drop.' },
  { label: 'weekend shield (2 days)', cost: 260, desc: 'Covers back-to-back misses.' },
  { label: 'auto-protect pack (3 uses)', cost: 480, desc: 'Auto-applies to your next misses.' },
]

const ladderByName: Record<
  string,
  Array<{ rank: number; name: string; solvedToday: number; points: number; isYou?: boolean }>
> = {
  'weekly sprint': [
    { rank: 1, name: 'alice_w', solvedToday: 8, points: 1540 },
    { rank: 2, name: 'devon', solvedToday: 7, points: 1420 },
    { rank: 3, name: 'John Smith', solvedToday: 6, points: 1280, isYou: true },
    { rank: 4, name: 'maria', solvedToday: 5, points: 1185 },
    { rank: 5, name: 'jamal', solvedToday: 5, points: 1100 },
    { rank: 6, name: 'nina', solvedToday: 4, points: 1020 },
  ],
  'october trio showdown': [
    { rank: 1, name: 'John Smith', solvedToday: 9, points: 2010, isYou: true },
    { rank: 2, name: 'team delta', solvedToday: 8, points: 1910 },
    { rank: 3, name: 'bootcamp_bros', solvedToday: 6, points: 1715 },
    { rank: 4, name: 'no_sleep', solvedToday: 5, points: 1600 },
    { rank: 5, name: 'jetpack_trios', solvedToday: 5, points: 1550 },
    { rank: 6, name: 'lambda', solvedToday: 4, points: 1420 },
  ],
  'late night grinders': [
    { rank: 1, name: 'owen', solvedToday: 6, points: 980 },
    { rank: 2, name: 'sahana', solvedToday: 6, points: 970 },
    { rank: 3, name: 'tiff', solvedToday: 5, points: 930 },
    { rank: 4, name: 'yuki', solvedToday: 4, points: 860 },
    { rank: 5, name: 'John Smith', solvedToday: 3, points: 720, isYou: true },
    { rank: 6, name: 'max', solvedToday: 2, points: 610 },
  ],
}

function Tournaments({ onBackToDashboard, onGoToContact, onGoToSettings, onLogout }: TournamentsProps) {
  const [expandedLadders, setExpandedLadders] = useState<Record<string, boolean>>({})

  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
  }

  const handleJoin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
  }

  const ladderEntries = useMemo(() => {
    const filled: typeof ladderByName = {}

    activeTournaments.forEach((tour) => {
      const base = ladderByName[tour.name] ?? []
      const missing = Math.max(0, tour.totalPlayers - base.length)
      const filledEntries = [...base]
      const lastPoints = base[base.length - 1]?.points ?? 1200

      for (let i = 1; i <= missing; i += 1) {
        const rank = base.length + i
        filledEntries.push({
          rank,
          name: `player-${rank}`,
          solvedToday: 0,
          points: Math.max(50, lastPoints - i * 20),
        })
      }

      filled[tour.name] = filledEntries
    })

    return filled
  }, [])

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
          <button className={homeStyles.navItem} type="button">
            <span className={`${homeStyles.icon} ${homeStyles['icon-bookmark']}`} />
            Learn
          </button>
          <button className={`${homeStyles.navItem} ${homeStyles.active}`} type="button">
            <span className={`${homeStyles.icon} ${homeStyles['icon-calendar']}`} />
            Tournaments
          </button>
          <button className={homeStyles.navItem} type="button">
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
          <div className={`${homeStyles.topbarPoints} ${styles.pointsBadge}`}>
            <div className={homeStyles.pointsNumber}>2876</div>
            <div className={homeStyles.pointsLabel}>CURRENT POINTS</div>
          </div>

          <div className={styles.headerCopy}>
            <p className={styles.kicker}>tournaments</p>
            <h1 className={styles.title}>build your streak and rally your crew.</h1>
            <p className={styles.subtitle}>
              Create or join a ladder, keep tabs on every bracket you’re in, and spend points on streak saves
              when life gets in the way.
            </p>
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
                <button className={styles.secondaryButton} type="button">
                  refresh
                </button>
              </div>

              <div className={styles.standingList}>
                {activeTournaments.map((tour) => {
                  const entries = ladderEntries[tour.name] ?? []
                  const showAll = expandedLadders[tour.name]
                  const visibleEntries = showAll ? entries : entries.slice(0, 5)

                  return (
                    <div key={tour.name} className={styles.standingCard}>
                      <div className={styles.standingTop}>
                      <div>
                        <div className={styles.tourName}>{tour.name}</div>
                      </div>
                        <div className={styles.metaPills}>
                          <span className={styles.metaChip}>{tour.totalPlayers} players</span>
                          <span className={styles.metaChip}>{tour.streak}</span>
                          <span
                            className={`${styles.metaChip} ${
                              tour.trend === 'up' ? styles.momentumPositive : styles.momentumNegative
                            }`}
                          >
                            {tour.momentum}
                          </span>
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
                                <div className={styles.playerName}>{entry.name}</div>
                                <div className={styles.playerSub}>{entry.solvedToday} solved today</div>
                              </div>
                            </div>
                            <div className={styles.points}>{entry.points} pts</div>
                          </div>
                        ))}
                      </div>

                      <div className={styles.cardActions}>
                        <div className={styles.statSub}>
                          {showAll
                            ? `Showing all ${entries.length} placements.`
                            : `Showing top ${visibleEntries.length} of ${tour.totalPlayers}.`}
                        </div>
                        {entries.length > 5 && (
                          <button
                            className={styles.ghostButton}
                            type="button"
                            onClick={() =>
                              setExpandedLadders((prev) => ({
                                ...prev,
                                [tour.name]: !prev[tour.name],
                              }))
                            }
                          >
                            {showAll ? 'collapse' : 'view all placements'}
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
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
                  <input name="tournament-name" placeholder="friday night sprint or finals prep ladder" />
                </label>
                <label className={styles.inputGroup}>
                  <span>tournament password</span>
                  <input name="tournament-password" placeholder="optional password to join" />
                </label>

                <button className={styles.primaryButton} type="submit">
                  <span className={styles.arrowText}>&gt;</span> create tournament
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
                  <input name="join-tournament-name" placeholder="e.g. friday night sprint" />
                </label>
                <label className={styles.inputGroup}>
                  <span>password</span>
                  <input name="join-tournament-password" placeholder="required if host set one" />
                </label>
                <div className={styles.helper}>Join any public or password-protected tournament.</div>

                <div className={styles.joinActions}>
                  <button className={styles.secondaryButton} type="submit">
                    join tournament
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
                <div className={styles.balancePill}>2876 pts</div>
              </div>
              <p className={styles.helper}>
                Use points to auto-cover missed days and keep your streak alive across every tournament.
              </p>

              <div className={styles.streakOptions}>
                {streakOptions.map((option) => (
                  <div key={option.label} className={styles.streakCard}>
                    <div>
                      <div className={styles.streakLabel}>{option.label}</div>
                      <div className={styles.streakDesc}>{option.desc}</div>
                    </div>
                    <button className={styles.primaryButton} type="button">
                      <span className={styles.arrowText}>&gt;</span> {option.cost} pts
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
