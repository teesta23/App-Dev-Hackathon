import homeStyles from './Home2.module.css'
import styles from './Lessons.module.css'
import type { SkillLevelOption } from './SkillLevel'

export type LessonNode = {
  id: string
  title: string
  type: 'lesson' | 'checkpoint' | 'project'
  status: 'done' | 'current' | 'locked'
  duration: string
  points: number
  focus: string
  icon: string
  reward?: string
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

export const tracks: Record<
  SkillLevelOption,
  {
    label: string
    blurb: string
    focus: string
    target: string
    nodes: LessonNode[]
  }
> = {
  beginner: {
    label: 'beginner path',
    blurb: 'Easy ramps that get you shipping quick — syntax, loops, and confidence boosters.',
    focus: 'print, variables, loops',
    target: 'finish 2 core lessons today',
    nodes: [
      { id: 'welcome', title: 'hello world', type: 'lesson', status: 'done', duration: '8 min', points: 40, focus: 'printing', icon: '{}' },
      { id: 'vars', title: 'variables + types', type: 'lesson', status: 'done', duration: '12 min', points: 60, focus: 'types', icon: 'Aa' },
      { id: 'loops', title: 'loops you can trust', type: 'lesson', status: 'current', duration: '14 min', points: 70, focus: 'loops', icon: 'LO' },
      { id: 'lists', title: 'lists + arrays', type: 'lesson', status: 'locked', duration: '15 min', points: 80, focus: 'arrays', icon: '[]', reward: 'unlock quiz' },
      { id: 'func', title: 'functions toolkit', type: 'lesson', status: 'locked', duration: '16 min', points: 90, focus: 'functions', icon: 'fx' },
      { id: 'checkpoint-1', title: 'checkpoint: basics', type: 'checkpoint', status: 'locked', duration: '10 min', points: 120, focus: 'review', icon: '**', reward: 'badge' },
      { id: 'logic', title: 'conditionals applied', type: 'lesson', status: 'locked', duration: '14 min', points: 90, focus: 'logic', icon: '?' },
      { id: 'project-1', title: 'mini project: todo app', type: 'project', status: 'locked', duration: '22 min', points: 160, focus: 'practice', icon: 'PJ' },
    ],
  },
  intermediate: {
    label: 'intermediate path',
    blurb: 'Structured data structures and algorithms drills with visuals — arrays to recursion to trees.',
    focus: 'arrays, recursion, basic trees',
    target: 'clear the current checkpoint',
    nodes: [
      { id: 'review', title: 'array patterns review', type: 'lesson', status: 'done', duration: '10 min', points: 60, focus: 'arrays', icon: 'AR' },
      { id: 'two-pointers', title: 'two-pointer drills', type: 'lesson', status: 'done', duration: '15 min', points: 80, focus: 'patterns', icon: '<>' },
      { id: 'recursion', title: 'recursion warmups', type: 'lesson', status: 'current', duration: '18 min', points: 90, focus: 'recursion', icon: 'RE' },
      { id: 'dfs', title: 'depth-first search on trees', type: 'lesson', status: 'locked', duration: '20 min', points: 110, focus: 'tree traversal', icon: 'TR', reward: 'streak save' },
      { id: 'bfs', title: 'breadth-first search on graphs', type: 'lesson', status: 'locked', duration: '18 min', points: 110, focus: 'graph traversal', icon: 'BF' },
      { id: 'checkpoint-2', title: 'checkpoint: traversal lab', type: 'checkpoint', status: 'locked', duration: '14 min', points: 140, focus: 'mixed', icon: '**', reward: 'bonus points' },
      { id: 'dp', title: 'dynamic programming starter pack', type: 'lesson', status: 'locked', duration: '22 min', points: 140, focus: 'dynamic programming', icon: 'DP' },
      { id: 'project-2', title: 'project: leaderboard api', type: 'project', status: 'locked', duration: '26 min', points: 170, focus: 'service api', icon: 'API', reward: 'streak save' },
    ],
  },
  advanced: {
    label: 'advanced path',
    blurb: 'Language hopping and paradigm flips — concurrency, ownership, and performance tuning.',
    focus: 'go, rust, typescript ramps',
    target: 'ship the language swap lab',
    nodes: [
      { id: 'golang', title: 'go routines primer', type: 'lesson', status: 'done', duration: '14 min', points: 90, focus: 'concurrency', icon: 'GO' },
      { id: 'channels', title: 'channels + pipelines', type: 'lesson', status: 'done', duration: '16 min', points: 100, focus: 'pipelines', icon: 'CH' },
      { id: 'ownership', title: 'rust ownership tour', type: 'lesson', status: 'current', duration: '20 min', points: 120, focus: 'ownership', icon: 'RS' },
      { id: 'lifetimes', title: 'lifetimes by example', type: 'lesson', status: 'locked', duration: '18 min', points: 120, focus: 'lifetimes', icon: 'LT' },
      { id: 'ts', title: 'typescript generics explained', type: 'lesson', status: 'locked', duration: '17 min', points: 110, focus: 'type systems', icon: '<T>' },
      { id: 'checkpoint-3', title: 'checkpoint: language swap', type: 'checkpoint', status: 'locked', duration: '16 min', points: 150, focus: 'mixed', icon: '**', reward: 'speed run' },
      { id: 'perf', title: 'performance sweeps', type: 'lesson', status: 'locked', duration: '20 min', points: 140, focus: 'perf', icon: 'PF' },
      { id: 'project-3', title: 'project: command-line app ship', type: 'project', status: 'locked', duration: '28 min', points: 180, focus: 'command line', icon: 'APP', reward: 'streak save' },
    ],
  },
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
  const activeLevel = skillLevel ?? 'intermediate'
  const track = tracks[activeLevel]
  const completed = track.nodes.filter((node) => node.status === 'done').length
  const progress = Math.round((completed / track.nodes.length) * 100)
  const queue = track.nodes.filter((node) => node.status !== 'done').slice(0, 3)
  const nextLabel = queue[0]?.title ?? 'next lesson ready'

  const levelBadgeCopy: Record<SkillLevelOption, string> = {
    beginner: 'gentle onboarding',
    intermediate: 'data structures and algorithms accelerant',
    advanced: 'language explorer',
  }

  const spine = track.nodes.map((node, index) => {
    const side = index % 2 === 0 ? 'left' : 'right'
    return { ...node, side }
  })

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

  const renderNode = (node: LessonNode, side: 'left' | 'right') => (
    <div className={`${styles.nodeWrap} ${side === 'left' ? styles.left : styles.right}`} key={node.id}>
      <div className={`${styles.node} ${styles[node.type]} ${styles[node.status]}`}>
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

  return (
    <div className={styles.page}>
      {renderNav()}

      <main className={styles.content}>
        <header className={styles.hero}>
          <div className={styles.heroLeft}>
            <h1 className={styles.title}>
              lessons tuned for <span className={styles.accent}>[{activeLevel}]</span> devs
            </h1>
            <p className={styles.subtitle}>{track.blurb}</p>
            <div className={styles.heroBadges}>
              <div className={styles.heroBadge}>focus: {track.focus}</div>
              <div className={styles.heroBadge}>today: {track.target}</div>
              <div className={styles.heroBadge}>lane: {levelBadgeCopy[activeLevel]}</div>
            </div>
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
                <span>{completed} / {track.nodes.length} complete</span>
                <span>next: {nextLabel}</span>
              </div>
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
                {queue.length === 0 ? (
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
                            disabled={isLocked}
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
