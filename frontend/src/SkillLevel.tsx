import { useState } from 'react'
import styles from './SkillLevel.module.css'

export type SkillLevelOption = 'beginner' | 'intermediate' | 'advanced'

type SkillLevelProps = {
  onBack?: () => void
  onContinue?: (level: SkillLevelOption) => void
}

function SkillLevel({ onBack, onContinue }: SkillLevelProps) {
  const [selected, setSelected] = useState<SkillLevelOption | null>('intermediate')

  const levels: Array<{
    id: SkillLevelOption
    title: string
    badge: string
    description: string
    focus: string
    bullets: string[]
  }> = [
    {
      id: 'beginner',
      title: 'beginner',
      badge: 'new to leetcode',
      description: 'Build comfort with fundamentals, syntax, and test-driven habits.',
      focus: 'arrays, strings, linked lists',
      bullets: ['step-by-step walkthroughs', 'daily practice streaks', 'confidence-first wins'],
    },
    {
      id: 'intermediate',
      title: 'intermediate',
      badge: 'comfortable coder',
      description: 'Sharpen problem-solving patterns and speed up your submissions.',
      focus: 'two-pointers, trees, hashing',
      bullets: ['pattern drills + timers', 'compete-ready challenges', 'review best practices'],
    },
    {
      id: 'advanced',
      title: 'advanced',
      badge: 'tournament ready',
      description: 'Push into tougher categories and prep for high-pressure contests.',
      focus: 'graphs, dp, optimization',
      bullets: ['contest simulations', 'hard-mode playlists', 'coaching nudges + notes'],
    },
  ]

  const handleContinue = () => {
    if (!selected) return
    onContinue?.(selected)
  }

  return (
    <div className={styles.page}>
      <div className={styles.glowOne} />
      <div className={styles.glowTwo} />

      <header className={styles.nav}>
        <div className={`${styles.navBrand} brand`}>&gt; Leeterboard</div>
        <div className={styles.navActions}>
          <button className={styles.ghostButton} type="button" onClick={onBack}>
            back
          </button>
        </div>
      </header>

      <main className={styles.shell}>
        <section className={styles.pitch}>
          <div className={styles.stepPill}>step 2 · choose your lane</div>
          <h1 className={styles.title}>
            set your <span className={styles.titleAccent}>skill level</span>
          </h1>
          <p className={styles.copy}>
            Tailor lessons, streak goals, and tournaments to match where you are today. This choice locks in your starting track.
          </p>
        </section>

        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>pick your starting point</div>
            <div className={styles.cardSub}>this tunes your lesson plan + streak nudges</div>
          </div>

          <div className={styles.levelGrid}>
            {levels.map((level) => {
              const isActive = selected === level.id
              return (
                <button
                  key={level.id}
                  type="button"
                  className={`${styles.levelCard} ${isActive ? styles.levelActive : ''}`}
                  onClick={() => setSelected(level.id)}
                >
                  <div className={styles.levelTop}>
                    <div className={styles.levelTitle}>{level.title}</div>
                    <div className={styles.levelBadge}>{level.badge}</div>
                  </div>
                  <p className={styles.levelDesc}>{level.description}</p>
                  <div className={styles.levelFocus}>
                    <span className={styles.focusLabel}>focus</span>
                    <span className={styles.focusValue}>{level.focus}</span>
                  </div>
                  <ul className={styles.levelList}>
                    {level.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                </button>
              )
            })}
          </div>

          <div className={styles.actions}>
            <button
              className={`${styles.primaryButton} ${!selected ? styles.primaryDisabled : ''}`}
              type="button"
              onClick={handleContinue}
              disabled={!selected}
            >
              <span className={styles.arrowText}>&gt;</span> continue to lessons
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}

export default SkillLevel
