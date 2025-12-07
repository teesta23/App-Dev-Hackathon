import type { FormEvent } from 'react'
import { useState } from 'react'
import styles from './Login.module.css'

type LoginProps = {
  onBack?: () => void
  onLogin?: (user: { id: string; username: string; email: string }) => void
  onCreateAccount?: () => void
}

function Login({ onBack, onLogin, onCreateAccount }: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      const response = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.detail || 'Login failed')
        return
      }

      const user = await response.json()
      setError('')
      onLogin?.(user)
    } catch (err) {
      setError('Network error. Please try again.')
    }
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
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className={styles.inputGroup}>
            <span>password</span>
            <input
              name="password"
              type="password"
              placeholder="••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          {error && <p style={{ color: 'red' }}>{error}</p>}

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