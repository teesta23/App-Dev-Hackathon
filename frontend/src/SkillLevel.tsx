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
      badge: 'zero experience',
      description: 'Never written code before? Start from scratch with simple syntax and guided setups.',
      focus: 'printing, variables, loops',
      bullets: ['hands-on walkthroughs', 'setup + tool guidance', 'first-program milestones'],
    },
    {
      id: 'intermediate',
      title: 'intermediate',
      badge: 'coding fundamentals',
      description: 'Comfortable writing code, want deeper DSA (think AP CSA+).',
      focus: 'arrays, recursion, basic trees',
      bullets: ['complexity + correctness checks', 'patterned DSA drills', 'review best practices'],
    },
    {
      id: 'advanced',
      title: 'advanced',
      badge: 'language explorer',
      description: 'Already strong in DSA, want to pick up new languages and paradigms.',
      focus: 'go, rust, typescript ramps',
      bullets: ['language-switch challenges', 'idioms + standard libs', 'paradigm comparison tasks'],
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
          <div className={styles.stepPill}>step 3 · choose your lane</div>
          <h1 className={styles.title}>
            set your <span className={styles.titleAccent}>skill level</span>
          </h1>
          <p className={styles.copy}>
            We use this to shape your lesson path from day one. This choice locks in your starting track.
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
