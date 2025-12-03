import { useState, type FormEvent } from 'react'
import styles from './LinkLeetcode.module.css'

type LinkLeetcodeProps = {
  onBack?: () => void
  onSkip?: () => void
  onContinue?: (username: string) => void
}

function LinkLeetcode({ onBack, onSkip, onContinue }: LinkLeetcodeProps) {
  const [username, setUsername] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!username.trim()) return
    onContinue?.(username.trim())
  }

  const handleSkip = () => {
    if (onSkip) {
      onSkip()
      return
    }
    onContinue?.('')
  }

  return (
    <div className={styles.page}>
      <div className={styles.rings} />
      <div className={styles.grid} />

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
          <div className={styles.stepPill}>step 2 · connect leetcode</div>
          <h1 className={styles.title}>
            link your <span className={styles.titleAccent}>[leetcode handle]</span>
          </h1>
          <p className={styles.copy}>
            Add your username so we can sync your solved count and keep your stats current. We only read public data.
          </p>
          <div className={styles.callouts}>
            <div className={styles.callout}>
              <span className={styles.calloutDot} />
              <div className={styles.calloutText}>
                <div className={styles.calloutTitle}>live stats sync</div>
                <div className={styles.calloutSub}>pulls your latest solves + streak daily</div>
              </div>
            </div>
            <div className={styles.callout}>
              <span className={styles.calloutDot} />
              <div className={styles.calloutText}>
                <div className={styles.calloutTitle}>team ready</div>
                <div className={styles.calloutSub}>instantly share your numbers with your squad</div>
              </div>
            </div>
            <div className={styles.callout}>
              <span className={styles.calloutDot} />
              <div className={styles.calloutText}>
                <div className={styles.calloutTitle}>secure by design</div>
                <div className={styles.calloutSub}>no passwords — just your public handle</div>
              </div>
            </div>
          </div>
        </section>

        <form className={styles.card} onSubmit={handleSubmit}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>connect leetcode</div>
            <div className={styles.cardSub}>drop in your handle and we’ll start syncing</div>
          </div>

          <label className={styles.inputGroup}>
            <span>leetcode username</span>
            <div className={styles.inputRow}>
              <span className={styles.monoPrefix}>leetcode.com/u/</span>
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                name="leetcode-username"
                type="text"
                placeholder="janedoe_123"
                required
              />
            </div>
          </label>

          <div className={styles.helperRow}>
            <div className={styles.helperTitle}>we sync:</div>
            <div className={styles.helperTags}>
              <span>solved totals</span>
            </div>
          </div>

          <div className={styles.actions}>
            <button
              className={`${styles.primaryButton} ${!username.trim() ? styles.primaryDisabled : ''}`}
              type="submit"
              disabled={!username.trim()}
            >
              <span className={styles.arrowText}>&gt;</span> link &amp; continue
            </button>
            <button className={styles.linkButton} type="button" onClick={handleSkip}>
              skip for now
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

export default LinkLeetcode
