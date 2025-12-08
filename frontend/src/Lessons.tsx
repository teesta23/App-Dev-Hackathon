import { useEffect, useMemo, useState } from 'react'
import homeStyles from './Home2.module.css'
import styles from './Lessons.module.css'
import type { SkillLevelOption } from './SkillLevel'
import { completeLesson, fetchLessons, type LessonTrack } from './api/users'
import { getStoredUserId } from './session'

export type LessonNode = {
  id: string
  title: string
  type: 'lesson' | 'checkpoint' | 'project'
  status: 'done' | 'current' | 'locked'
  duration: string
  points: number
  focus: string
  icon: string
  url?: string
  reward?: string
}

const LESSON_POINT_VALUE = 20

const baseTracks: Record<SkillLevelOption, LessonNode[]> = {
  beginner: [
    {
      id: 'hello-world',
      title: 'hello world + printing',
      type: 'lesson',
      status: 'current',
      duration: '8 min read',
      points: 60,
      focus: 'output + syntax',
      icon: '{}',
      url: 'https://www.freecodecamp.org/news/python-hello-world/',
    },
    {
      id: 'variables',
      title: 'variables + types',
      type: 'lesson',
      status: 'locked',
      duration: '10 min read',
      points: 70,
      focus: 'data basics',
      icon: 'Aa',
      url: 'https://www.w3schools.com/python/python_variables.asp',
    },
    {
      id: 'conditions',
      title: 'conditionals in python',
      type: 'lesson',
      status: 'locked',
      duration: '12 min read',
      points: 80,
      focus: 'logic',
      icon: '??',
      url: 'https://www.programiz.com/python-programming/if-elif-else',
    },
    {
      id: 'loops',
      title: 'loops that make sense',
      type: 'lesson',
      status: 'locked',
      duration: '12 min read',
      points: 90,
      focus: 'loops',
      icon: 'LO',
      url: 'https://realpython.com/python-for-loop/',
    },
    {
      id: 'functions',
      title: 'functions 101',
      type: 'lesson',
      status: 'locked',
      duration: '14 min read',
      points: 100,
      focus: 'functions',
      icon: 'fx',
      url: 'https://www.freecodecamp.org/news/functions-in-python-a-beginners-guide/',
    },
    {
      id: 'lists',
      title: 'lists + arrays',
      type: 'lesson',
      status: 'locked',
      duration: '14 min read',
      points: 110,
      focus: 'collections',
      icon: '[]',
      url: 'https://realpython.com/python-lists-tuples/',
      reward: 'unlock quiz',
    },
  ],
  intermediate: [
    {
      id: 'arrays',
      title: 'array and string review',
      type: 'lesson',
      status: 'current',
      duration: '12 min read',
      points: 80,
      focus: 'arrays',
      icon: 'AR',
      url: 'https://www.geeksforgeeks.org/array-data-structure/',
    },
    {
      id: 'two-pointers',
      title: 'two-pointer patterns',
      type: 'lesson',
      status: 'locked',
      duration: '14 min read',
      points: 90,
      focus: 'patterns',
      icon: '<>',
      url: 'https://www.geeksforgeeks.org/two-pointers-technique/',
    },
    {
      id: 'recursion',
      title: 'recursion drills',
      type: 'lesson',
      status: 'locked',
      duration: '16 min read',
      points: 100,
      focus: 'recursion',
      icon: 'RE',
      url: 'https://www.geeksforgeeks.org/recursion/',
    },
    {
      id: 'dfs',
      title: 'depth-first search',
      type: 'lesson',
      status: 'locked',
      duration: '15 min read',
      points: 110,
      focus: 'tree/graph traversal',
      icon: 'TR',
      url: 'https://www.programiz.com/dsa/graph-dfs',
      reward: 'streak save',
    },
    {
      id: 'bfs',
      title: 'breadth-first search',
      type: 'lesson',
      status: 'locked',
      duration: '14 min read',
      points: 120,
      focus: 'graph traversal',
      icon: 'BF',
      url: 'https://www.programiz.com/dsa/graph-bfs',
    },
    {
      id: 'dp',
      title: 'dynamic programming starter',
      type: 'lesson',
      status: 'locked',
      duration: '18 min read',
      points: 140,
      focus: 'dp',
      icon: 'DP',
      url: 'https://www.geeksforgeeks.org/dynamic-programming/',
      reward: 'bonus points',
    },
  ],
  advanced: [
    {
      id: 'goroutines',
      title: 'go routines primer',
      type: 'lesson',
      status: 'current',
      duration: '12 min read',
      points: 100,
      focus: 'concurrency',
      icon: 'GO',
      url: 'https://gobyexample.com/goroutines',
    },
    {
      id: 'channels',
      title: 'channels + pipelines',
      type: 'lesson',
      status: 'locked',
      duration: '12 min read',
      points: 110,
      focus: 'communication',
      icon: 'CH',
      url: 'https://gobyexample.com/channels',
    },
    {
      id: 'ownership',
      title: 'rust ownership',
      type: 'lesson',
      status: 'locked',
      duration: '16 min read',
      points: 120,
      focus: 'memory',
      icon: 'RS',
      url: 'https://doc.rust-lang.org/book/ch04-00-understanding-ownership.html',
    },
    {
      id: 'lifetimes',
      title: 'lifetimes by example',
      type: 'lesson',
      status: 'locked',
      duration: '14 min read',
      points: 120,
      focus: 'borrowing',
      icon: 'LT',
      url: 'https://doc.rust-lang.org/book/ch10-03-lifetime-syntax.html',
    },
    {
      id: 'ts-generics',
      title: 'typescript generics',
      type: 'lesson',
      status: 'locked',
      duration: '12 min read',
      points: 110,
      focus: 'type systems',
      icon: '<T>',
      url: 'https://www.typescriptlang.org/docs/handbook/2/generics.html',
      reward: 'badge',
    },
    {
      id: 'perf',
      title: 'concurrency patterns',
      type: 'lesson',
      status: 'locked',
      duration: '16 min read',
      points: 140,
      focus: 'performance',
      icon: 'PF',
      url: 'https://doc.rust-lang.org/book/ch16-00-concurrency.html',
      reward: 'streak save',
    },
  ],
}

export const tracks = baseTracks

const trackMeta: Record<
  SkillLevelOption,
  {
    label: string
    blurb: string
    focus: string
    target: string
  }
> = {
  beginner: {
    label: 'beginner path',
    blurb: 'Easy ramps to get you writing real code — syntax, loops, and confidence boosters.',
    focus: 'print, variables, loops',
    target: 'finish your first two articles',
  },
  intermediate: {
    label: 'intermediate path',
    blurb: 'Structured data structures and algorithms drills — arrays to recursion to trees.',
    focus: 'arrays, recursion, basic trees',
    target: 'clear the current checkpoint',
  },
  advanced: {
    label: 'advanced path',
    blurb: 'Language hopping and paradigm flips — concurrency, ownership, and performance tuning.',
    focus: 'go, rust, typescript ramps',
    target: 'ship the language swap lab',
  },
}

type LessonsProps = {
  skillLevel: SkillLevelOption | null
  onBackToDashboard?: () => void
  onGoToTournaments?: () => void
  onGoToContact?: () => void
  onGoToSettings?: () => void
  onGoToRoom?: () => void
  onLogout?: () => void
}

function Lessons({
  skillLevel,
  onBackToDashboard,
  onGoToTournaments,
  onGoToContact,
  onGoToSettings,
  onGoToRoom,
  onLogout,
}: LessonsProps) {
  const userId = getStoredUserId()
  const [lessonTrack, setLessonTrack] = useState<LessonTrack | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingLessonId, setPendingLessonId] = useState<string | null>(null)

  const activeLevel: SkillLevelOption = (lessonTrack?.skillLevel ?? skillLevel ?? 'intermediate') as SkillLevelOption
  const lessons = useMemo(
    () =>
      (lessonTrack?.lessons ?? tracks[activeLevel]).map((lesson) => ({
        type: 'lesson',
        ...lesson,
        points: LESSON_POINT_VALUE,
      })),
    [lessonTrack, activeLevel],
  )
  const meta = trackMeta[activeLevel]
  const completed = lessons.filter((node) => node.status === 'done').length
  const progress = lessons.length ? Math.round((completed / lessons.length) * 100) : 0
  const queue = lessons.filter((node) => node.status !== 'done').slice(0, 3)
  const nextLabel = queue[0]?.title ?? 'next lesson ready'
  const currentPoints = lessonTrack?.points ?? null
  const lastAwarded = lessonTrack?.pointsAwarded ?? 0

  useEffect(() => {
    if (!userId) {
      setLessonTrack(null)
      setLoading(false)
      setError(null)
      setPendingLessonId(null)
      return
    }
    let cancelled = false
    const load = async () => {
      setLoading(true)
      try {
        const data = await fetchLessons(userId)
        if (cancelled) return
        setLessonTrack(data)
        setError(null)
      } catch (err) {
        if (cancelled) return
        console.error('Could not load lessons', err)
        setError('Could not load your personalized lessons. Showing defaults.')
        setLessonTrack(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [userId])

  useEffect(() => {
    if (!pendingLessonId || !userId) return
    const handleFocus = async () => {
      try {
        const data = await completeLesson(userId, pendingLessonId)
        setLessonTrack(data)
        setError(null)
      } catch (err) {
        console.error('Could not complete lesson', err)
        setError('Could not record your reward. Click a lesson again to retry.')
      } finally {
        setPendingLessonId(null)
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [pendingLessonId, userId])

  const levelBadgeCopy: Record<SkillLevelOption, string> = {
    beginner: 'gentle onboarding',
    intermediate: 'data structures and algorithms accelerant',
    advanced: 'language explorer',
  }

  const spine = useMemo(
    () =>
      lessons.map((node, index) => {
        const side = index % 2 === 0 ? 'left' : 'right'
        return { ...node, side }
      }),
    [lessons],
  )

  const handleOpenLesson = (lesson: LessonNode) => {
    if (lesson.status === 'locked') return
    if (lesson.url) {
      window.open(lesson.url, '_blank', 'noreferrer')
    }
    if (userId) {
      setPendingLessonId(lesson.id)
    }
  }

  const renderNav = () => (
    <aside className={homeStyles.nav}>
      <div className={homeStyles.brand}>&gt; Leeterboard</div>

      <div className={homeStyles.menu}>
        <button className={homeStyles.navItem} type="button" onClick={onBackToDashboard}>
          <span className={`${homeStyles.icon} ${homeStyles['icon-home']}`} />
          Home
        </button>
        <button className={`${homeStyles.navItem} ${homeStyles.active}`} type="button">
          <span className={`${homeStyles.icon} ${homeStyles['icon-bookmark']}`} />
          Learn
        </button>
        <button
          className={homeStyles.navItem}
          type="button"
          onClick={() => {
            onGoToTournaments?.()
          }}
        >
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
  )

  const renderNode = (node: LessonNode, side: 'left' | 'right') => {
    const isLocked = node.status === 'locked'
    return (
      <div className={`${styles.nodeWrap} ${side === 'left' ? styles.left : styles.right}`} key={node.id}>
        <div
          className={`${styles.node} ${styles[node.type]} ${styles[node.status]} ${!isLocked ? styles.clickable : ''}`}
          onClick={!isLocked ? () => handleOpenLesson(node) : undefined}
          role={!isLocked ? 'button' : undefined}
          tabIndex={!isLocked ? 0 : undefined}
          onKeyDown={
            !isLocked
              ? (event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    handleOpenLesson(node)
                  }
                }
              : undefined
          }
        >
          <div className={styles.nodeIcon}>{node.icon}</div>
          <div className={styles.nodeTitle}>{node.title}</div>
          <div className={styles.nodeMeta}>
            <span>{node.focus}</span>
            <span>
              {node.duration} · {node.points} points
            </span>
          </div>
          {node.reward ? <div className={styles.nodeReward}>{node.reward}</div> : null}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      {renderNav()}

      <main className={styles.content}>
        <header className={styles.hero}>
          <div className={styles.heroLeft}>
            <h1 className={styles.title}>
              lessons tuned for <span className={styles.accent}>[{activeLevel}]</span> devs
            </h1>
            <p className={styles.subtitle}>{meta.blurb}</p>
            <div className={styles.heroBadges}>
              <div className={styles.heroBadge}>focus: {meta.focus}</div>
              <div className={styles.heroBadge}>today: {meta.target}</div>
              <div className={styles.heroBadge}>lane: {levelBadgeCopy[activeLevel]}</div>
            </div>
            {error ? <div className={styles.errorText}>{error}</div> : null}
          </div>

          <div className={styles.heroRight}>
            <div className={styles.progressCard}>
              <div className={styles.progressTop}>
                <span className={styles.progressLabel}>track progress</span>
                <span className={styles.progressValue}>{progress}%</span>
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${progress}%` }} />
              </div>
              <div className={styles.progressFoot}>
                <span>{completed} / {lessons.length} complete</span>
                <span>next: {nextLabel}</span>
              </div>
              {lastAwarded > 0 ? (
                <div className={styles.rewardNote}>+{lastAwarded} pts for your last read</div>
              ) : null}
              {currentPoints !== null ? (
                <div className={styles.rewardNoteMuted}>{currentPoints} total points</div>
              ) : null}
            </div>

            <div className={styles.badgeCard}>
              <div className={styles.badgeLabel}>skill lane</div>
              <div className={styles.badgeValue}>{levelBadgeCopy[activeLevel]}</div>
              <div className={styles.badgeSub}>we pull lessons based on your signup choice</div>
            </div>
          </div>
        </header>

        <div className={styles.grid}>
          <section className={styles.pathPanel}>
            <div className={styles.sectionHeader}>
              <div>
                <div className={styles.sectionLabel}>section 1 · unit 2</div>
                <div className={styles.sectionTitle}>keep your progress climbing</div>
                <p className={styles.sectionSub}>Duolingo-style path — finish the current bubble to unlock the reward.</p>
              </div>
              <div className={styles.sectionBadge}>streak save on checkpoints</div>
            </div>

            <div className={styles.pathGrid}>
              {spine.map((node) => (
                <div className={styles.pathRow} key={node.id}>
                  <div className={styles.pathCell}>{node.side === 'left' ? renderNode(node, 'left') : null}</div>
                  <div className={styles.spine}>
                    <div className={`${styles.spineDot} ${styles[node.status]}`} />
                  </div>
                  <div className={styles.pathCell}>{node.side === 'right' ? renderNode(node, 'right') : null}</div>
                </div>
              ))}
            </div>
          </section>

          <aside className={styles.sidePanel}>
            <div className={styles.sideCard}>
              <div className={styles.sideHeader}>
                <div className={styles.sideLabel}>next up</div>
                <div className={styles.sideSub}>auto-personalized from your skill pick</div>
              </div>
              <div className={styles.queue}>
                {loading ? (
                  <div className={styles.queueEmpty}>Loading your recommended lessons…</div>
                ) : queue.length === 0 ? (
                  <div className={styles.queueEmpty}>All caught up — pick any bubble to keep going.</div>
                ) : (
                  queue.map((item) => {
                    const isLocked = item.status === 'locked'
                    const isCurrent = item.status === 'current'
                    const ctaLabel = isLocked ? 'locked' : isCurrent ? 'continue' : 'start'
                    return (
                      <div key={item.id} className={`${styles.queueRow} ${styles[item.status]}`}>
                        <div className={styles.queueIcon}>{item.icon}</div>
                        <div className={styles.queueContent}>
                          <div className={styles.queueTitle}>{item.title}</div>
                          <div className={styles.queueMeta}>
                            {item.focus} · {item.duration} · {item.points} points
                          </div>
                        </div>
                          <div className={styles.queueRight}>
                            <div className={styles.queueStatus}>{item.status}</div>
                            <button
                              className={`${styles.queueButton} ${isLocked ? styles.queueButtonDisabled : ''}`}
                              type="button"
                              disabled={isLocked || loading}
                              onClick={() => handleOpenLesson(item)}
                            >
                              {ctaLabel}
                            </button>
                          </div>
                        </div>
                      )
                    })
                  )}
              </div>
            </div>

            <div className={styles.sideCard}>
              <div className={styles.sideHeader}>
                <div className={styles.sideLabel}>track perks</div>
                <div className={styles.sideSub}>keep momentum in your lane</div>
              </div>
              <ul className={styles.perks}>
                <li>bonus points on checkpoints</li>
                <li>streak saves for lessons matching your focus</li>
                <li>weekly recap with suggested tournaments</li>
              </ul>
              <div className={styles.sideActions}>
                <button className={styles.primaryButton} type="button" onClick={onGoToTournaments}>
                  <span className={styles.arrowText}>&gt;</span>
                  join a tournament
                </button>
                <button className={styles.ghostButton} type="button" onClick={onBackToDashboard}>
                  back to dashboard
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}

export default Lessons
