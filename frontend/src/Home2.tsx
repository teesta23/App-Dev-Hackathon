import './Home2.css'

type Highlight = {
  label: string
  value: string
  hint: string
}

type LeaderboardEntry = {
  rank: number
  name: string
  points: number
  delta: string
}

type ActivityItem = {
  title: string
  status: 'open' | 'in-progress' | 'done'
  detail: string
}

const highlights: Highlight[] = [
  { label: 'total points', value: '4,560', hint: '+18% vs last week' },
  { label: 'active teams', value: '18', hint: '6 matches live' },
  { label: 'daily solves', value: '72', hint: 'most: Byte Surge' },
]

const leaderboard: LeaderboardEntry[] = [
  { rank: 1, name: 'Byte Surge', points: 1420, delta: '+12' },
  { rank: 2, name: 'Null Terminators', points: 1334, delta: '+7' },
  { rank: 3, name: 'Stack Smashers', points: 1278, delta: '+9' },
  { rank: 4, name: 'Lambda Legends', points: 1188, delta: '+4' },
  { rank: 5, name: 'Runtime Terrors', points: 1106, delta: '+2' },
]

const activities: ActivityItem[] = [
  { title: 'Weekend sprint kickoff', status: 'open', detail: '4 problems released • closes Sunday' },
  { title: 'Review PRs for team challenge', status: 'in-progress', detail: 'Due tonight • 3 pending reviews' },
  { title: 'Schedule scrim vs Byte Surge', status: 'open', detail: 'Pick a slot for Thursday' },
  { title: 'Retro: optimize DFS patterns', status: 'done', detail: 'Action items posted' },
]

function Home2() {
  return (
    <div className="home2-page">
      <header className="home2-header">
        <div className="home2-brand">
          <span className="brand-mark">&gt;</span>
          <div>
            <div className="brand-title">Leeterboard</div>
            <div className="brand-sub">team coding league</div>
          </div>
        </div>
        <div className="header-actions">
          <button className="ghost-btn">view challenges</button>
          <button className="primary-btn">new team</button>
        </div>
      </header>

      <main className="home2-grid">
        <section className="panel highlights-panel">
          {highlights.map((item) => (
            <div key={item.label} className="highlight-card">
              <div className="highlight-label">{item.label}</div>
              <div className="highlight-value">{item.value}</div>
              <div className="highlight-hint">{item.hint}</div>
            </div>
          ))}
        </section>

        <section className="panel leaderboard-panel">
          <div className="panel-head">
            <div>
              <div className="panel-label">live standings</div>
              <h2 className="panel-title">Leaderboard</h2>
            </div>
            <button className="ghost-btn">export</button>
          </div>
          <div className="leaderboard-list">
            {leaderboard.map((entry) => (
              <div key={entry.rank} className="leaderboard-row">
                <div className="rank">{entry.rank}</div>
                <div className="team">
                  <div className="team-name">{entry.name}</div>
                  <div className="team-delta">{entry.delta} today</div>
                </div>
                <div className="points">{entry.points} pts</div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel activity-panel">
          <div className="panel-head">
            <div>
              <div className="panel-label">today</div>
              <h2 className="panel-title">Activity</h2>
            </div>
            <button className="ghost-btn">view all</button>
          </div>
          <div className="activity-list">
            {activities.map((item) => (
              <div key={item.title} className={`activity-card status-${item.status}`}>
                <div className="activity-top">
                  <span className="status-dot" aria-hidden />
                  <div className="activity-title">{item.title}</div>
                </div>
                <div className="activity-detail">{item.detail}</div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default Home2
