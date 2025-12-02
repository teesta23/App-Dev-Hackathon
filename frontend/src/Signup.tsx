import type { FormEvent } from 'react'
import styles from './Login.module.css'

type SignupProps = {
  onBack?: () => void
  onCreate?: () => void
  onLogin?: () => void
}

function Signup({ onBack, onCreate, onLogin }: SignupProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onCreate?.()
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
          <p className={styles.kicker}>welcome to the crew</p>
          <h1 className={styles.title}>
            code more <span className={styles.titleAccent}>[sign up]</span>
          </h1>
          <p className={styles.copy}>
            Build your leeterboard profile, invite teammates, and join tournaments with one shared streak.
          </p>
          <div className={styles.badges}>
            <div className={styles.badge}>team-ready</div>
            <div className={styles.badge}>sync rewards</div>
            <div className={styles.badge}>instant access</div>
          </div>
        </section>

        <form className={styles.card} onSubmit={handleSubmit}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>create account</div>
            <div className={styles.cardSub}>spin up your leeterboard identity</div>
          </div>

          <label className={styles.inputGroup}>
            <span>username</span>
            <input name="username" type="text" placeholder="janedoe" required />
          </label>

          <label className={styles.inputGroup}>
            <span>email</span>
            <input name="email" type="email" placeholder="you@example.com" required />
          </label>

          <button className={styles.primaryButton} type="submit">
            <span className={styles.arrowText}>&gt;</span> create account
          </button>

          <div className={styles.footerRow}>
            <span>already have an account?</span>
            <button className={styles.linkButton} type="button" onClick={onLogin}>
              log in
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

export default Signup
