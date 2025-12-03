import styles from './Home2.module.css'

type Home2Props = {
  skillLevel?: SkillLevelOption | null
  onGoToContact?: () => void
  onGoToSettings?: () => void
  onGoToTournaments?: () => void
  onGoToLessons?: () => void
  onGoToRoom?: () => void
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
  const profileName = 'John Smith'
  const profileInitials = profileName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

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

            <div className={styles.topbarPoints}>
              <div className={styles.pointsNumber}>2876</div>
              <div className={styles.pointsLabel}>CURRENT POINTS</div>
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
              <div className={styles.tournamentHeader}>example tournament 1</div>

              <div className={styles.tableWrapper}>
                <div className={`${styles.tableRow} ${styles.tableHead}`}>
                  <span>#</span>
                  <span>PLAYERS</span>
                  <span>SOLVED TODAY</span>
                  <span>POINTS</span>
                </div>
                <div className={styles.tableBody}>
                  <div className={styles.tableRow}>
                    <span>1</span>
                    <span>username</span>
                    <span>10</span>
                    <span>2375</span>
                  </div>
                <div className={styles.tableRow}>
                  <span>2</span>
                  <span>username</span>
                  <span>5</span>
                  <span>1032</span>
                </div>
                <div className={`${styles.tableRow} ${styles.highlightRow}`}>
                  <span>3</span>
                  <span>John Smith</span>
                  <span>3</span>
                  <span>972</span>
                </div>
                <div className={styles.tableRow}>
                  <span>4</span>
                  <span>alex</span>
                  <span>2</span>
                  <span>740</span>
                </div>
              </div>
            </div>

            <div className={styles.currentStreak}>CURRENT STREAK:</div>
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
import { tracks, type LessonNode } from './Lessons.tsx'
import type { SkillLevelOption } from './SkillLevel.tsx'
