import styles from './About.module.css'

type AboutProps = {
  onBack?: () => void
  onGoToSignup?: () => void
  onGoToContact?: () => void
}

function About({ onBack, onGoToSignup, onGoToContact }: AboutProps) {
  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <div className={styles.brand}>&gt; Leeterboard</div>
        <div className={styles.navRight}>
          <button
            className={styles.textButton}
            type="button"
            onClick={() => {
              onBack?.()
            }}
          >
            back home
          </button>
          <button
            className={styles.primaryButton}
            type="button"
            onClick={() => {
              onGoToSignup?.()
            }}
          >
            <span className={styles.arrowText}>&gt;</span> start now
          </button>
        </div>
      </nav>

      <main className={styles.hero}>
        <div className={styles.header}>
          <p className={styles.kicker}>about</p>
          <h1 className={styles.title}>Leeterboard keeps your coding squad moving</h1>
          <p className={styles.subtitle}>
            Rally friends for weekly ladders, track streaks, and decorate your ShowerBot victory room.
            Leeterboard wraps practice, accountability, and playful rewards into one place.
          </p>
          <div className={styles.ctaRow}>
            <button
              className={styles.primaryButton}
              type="button"
              onClick={() => {
                onGoToSignup?.()
              }}
            >
              <span className={styles.arrowText}>&gt;</span> join the next ladder
            </button>
            <button
              className={styles.secondaryButton}
              type="button"
              onClick={() => {
                onGoToContact?.()
              }}
            >
              talk to us
            </button>
          </div>
        </div>

        <div className={styles.cardGrid}>
          <div className={styles.card}>
            <div className={styles.cardLabel}>tournaments</div>
            <h3 className={styles.cardTitle}>Weekly ladders that keep score</h3>
            <p className={styles.cardBody}>
              Join or host ladders, watch placements update, and use streak saves when life happens.
            </p>
          </div>
          <div className={styles.card}>
            <div className={styles.cardLabel}>team energy</div>
            <h3 className={styles.cardTitle}>Accountability that feels fun</h3>
            <p className={styles.cardBody}>
              Track daily solves, climb momentum charts, and celebrate streaks with your crew.
            </p>
          </div>
          <div className={styles.card}>
            <div className={styles.cardLabel}>rewards</div>
            <h3 className={styles.cardTitle}>Decorate ShowerBot&apos;s bathroom</h3>
            <p className={styles.cardBody}>
              Spend points on decor, swap room items, and show off a playful space you earn by coding more.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default About
