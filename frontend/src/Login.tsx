import type { FormEvent } from 'react'
import styles from './Login.module.css'

type LoginProps = {
  onBack?: () => void
  onLogin?: () => void
  onCreateAccount?: () => void
}

function Login({ onBack, onLogin, onCreateAccount }: LoginProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onLogin?.()
  }

  return (
    <div className={styles.page}>
      <div className={styles.glowOne} />
      <div className={styles.glowTwo} />

      <header className={styles.nav}>
        <div className={`${styles.navBrand} brand`}>&gt; Leeterboard</div>
        <div className={styles.navActions}>
          <button className={styles.ghostButton} type="button" onClick={onBack}>
            back to home
          </button>
        </div>
      </header>

      <main className={styles.shell}>
        <section className={styles.pitch}>
          <p className={styles.kicker}>welcome back</p>
          <h1 className={styles.title}>
            code more <span className={styles.titleAccent}>[log in]</span>
          </h1>
          <p className={styles.copy}>
            Rally your crew and keep your streak alive. Secure entry to view your tournaments and lessons in one place.
          </p>
          <div className={styles.badges}>
            <div className={styles.badge}>secure sessions</div>
            <div className={styles.badge}>team insights</div>
            <div className={styles.badge}>instant sync</div>
          </div>
        </section>

        <form className={styles.card} onSubmit={handleSubmit}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>sign in</div>
            <div className={styles.cardSub}>unlock your leeterboard dashboard</div>
          </div>

          <label className={styles.inputGroup}>
            <span>email</span>
            <input name="email" type="email" placeholder="you@example.com" required />
          </label>

          <button className={styles.primaryButton} type="submit">
            <span className={styles.arrowText}>&gt;</span> log in
          </button>

          <div className={styles.footerRow}>
            <span>new to leeterboard?</span>
            <button className={styles.linkButton} type="button" onClick={onCreateAccount}>
              create account
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

export default Login
