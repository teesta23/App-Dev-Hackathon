import type { FormEvent } from 'react'
import styles from './Contact.module.css'
import homeStyles from './Home2.module.css'

type ContactProps = {
  variant: 'landing' | 'dashboard'
  onBack?: () => void
  onLogout?: () => void
  onGoToSettings?: () => void
  onGoToTournaments?: () => void
  onGoToLessons?: () => void
}

function Contact({ variant, onBack, onLogout, onGoToSettings, onGoToTournaments, onGoToLessons }: ContactProps) {
  const isDashboard = variant === 'dashboard'

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
  }

  const renderSidebar = () => (
    <aside className={homeStyles.nav}>
      <div className={homeStyles.brand}>&gt; Leeterboard</div>

      <div className={homeStyles.menu}>
        <button className={homeStyles.navItem} type="button" onClick={onBack}>
          <span className={`${homeStyles.icon} ${homeStyles['icon-home']}`} />
          Home
        </button>
        <button
          className={homeStyles.navItem}
          type="button"
          onClick={() => {
            onGoToLessons?.()
          }}
        >
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
        <button className={homeStyles.navItem} type="button">
          <span className={`${homeStyles.icon} ${homeStyles['icon-user']}`} />
          My Room
        </button>
      </div>

      <div className={homeStyles.footerMenu}>
        <button className={`${homeStyles.navItem} ${homeStyles.active}`} type="button">
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

  return (
    <div className={`${styles.page} ${isDashboard ? styles.dashboardPage : styles.landingPage}`}>
      {isDashboard ? (
        renderSidebar()
      ) : (
        <header className={styles.landingNav}>
          <div className={styles.brand}>&gt; Leeterboard</div>
          <button className={styles.ghostButton} type="button" onClick={onBack}>
            back to start
          </button>
        </header>
      )}

      <main className={`${styles.content} ${isDashboard ? styles.contentDashboard : styles.contentLanding}`}>
        <div className={styles.headerBlock}>
          <div className={styles.headerCopy}>
            <p className={styles.kicker}>need a hand?</p>
            <h1 className={styles.title}>
              contact our <span className={styles.titleAccent}>[support]</span>
            </h1>
            <p className={styles.subtitle}>
              Reach out about tournaments, lessons, or any issues you're facing. We respond fast.
            </p>
            <div className={styles.chips}>
              <span className={styles.chip}>tournament issues</span>
              <span className={styles.chip}>account help</span>
              <span className={styles.chip}>feature requests</span>
            </div>
          </div>
        </div>

        <div className={styles.contactGrid}>
          <section className={`${styles.card} ${isDashboard ? styles.cardDashboard : styles.cardLanding}`}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>choose your lane</div>
              <div className={styles.cardSub}>Pick the quickest path to answers.</div>
            </div>

            <div className={styles.contactList}>
              <div className={styles.contactRow}>
                <div>
                  <div className={styles.contactLabel}>email</div>
                  <div className={styles.contactValue}>support@leeterboard.dev</div>
                  <p className={styles.contactDesc}>For anything detailed: tournaments, billing, team invites.</p>
                </div>
                <a className={styles.pillButton} href="mailto:support@leeterboard.dev">email support</a>
              </div>

              <div className={styles.contactRow}>
                <div>
                  <div className={styles.contactLabel}>slack / discord</div>
                  <div className={styles.contactValue}>#help-and-support</div>
                  <p className={styles.contactDesc}>Drop a quick note and we’ll jump in.</p>
                </div>
                <button className={styles.pillButton} type="button">join channel</button>
              </div>
            </div>
          </section>

          <form
            className={`${styles.card} ${isDashboard ? styles.cardDashboard : styles.cardLanding}`}
            onSubmit={handleSubmit}
          >
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>send us a note</div>
              <div className={styles.cardSub}>Give us the essentials. We’ll reply in under a day.</div>
            </div>

            <div className={styles.formGrid}>
              <label className={styles.inputGroup}>
                <span>name</span>
                <input name="name" placeholder="Jane Doe" />
              </label>
              <label className={styles.inputGroup}>
                <span>email</span>
                <input name="email" type="email" placeholder="you@example.com" required />
              </label>
              <label className={styles.inputGroup}>
                <span>topic</span>
                <input name="topic" placeholder="Team setup, billing, or feedback" />
              </label>
              <label className={`${styles.inputGroup} ${styles.fullWidth}`}>
                <span>message</span>
                <textarea name="message" placeholder="Share details so we can help fast." required />
              </label>
            </div>

            <div className={styles.formFooter}>
              <div className={styles.helper}>we read every note — expect a response in a few hours.</div>
              <button className={styles.primaryButton} type="submit">
                <span className={styles.arrowText}>&gt;</span> send message
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

export default Contact
