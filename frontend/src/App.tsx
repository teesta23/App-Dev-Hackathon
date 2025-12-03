import { useState } from 'react'
import './App.css'
import Home2 from './Home2.tsx'
import Login from './Login.tsx'
import Signup from './Signup.tsx'
import LinkLeetcode from './LinkLeetcode.tsx'
import SkillLevel, { type SkillLevelOption } from './SkillLevel.tsx'

function App() {
  const [view, setView] = useState<'landing' | 'login' | 'signup' | 'link' | 'skill' | 'dashboard'>('landing')
  const [, setSkillLevel] = useState<SkillLevelOption | null>(null)
  const [, setLeetcodeUsername] = useState<string>('')

  if (view === 'dashboard') return <Home2 />
  if (view === 'login') {
    return (
      <Login
        onBack={() => setView('landing')}
        onLogin={() => setView('dashboard')}
        onCreateAccount={() => setView('signup')}
      />
    )
  }
  if (view === 'signup') {
    return (
      <Signup
        onBack={() => setView('landing')}
        onCreate={() => setView('link')}
        onLogin={() => setView('login')}
      />
    )
  }
  if (view === 'link') {
    return (
      <LinkLeetcode
        onBack={() => setView('signup')}
        onSkip={() => setView('skill')}
        onContinue={(username) => {
          setLeetcodeUsername(username)
          setView('skill')
        }}
      />
    )
  }
  if (view === 'skill') {
    return (
      <SkillLevel
        onBack={() => setView('link')}
        onContinue={(level) => {
          setSkillLevel(level)
          setView('dashboard')
        }}
      />
    )
  }

  return (
    <div className="page">
      <nav className="nav">
        <div className="brand">
          &gt; Leeterboard
        </div>
        <div className="nav-right">
          <div className="nav-links">
            <a href="#">explore</a>
            <a href="#">about</a>
            <a href="#">contact</a>
          </div>
          <button className="login" onClick={() => setView('login')}>log in</button>
        </div>
      </nav>

      <main className="hero">
        <div className="hero-title">
          <div className="title-main">code more</div>
          <div className="title-accent">[slack less]</div>
        </div>
        <p className="subtitle">
          form a team and compete for the best leetcode score blah blah
        </p>
        <button className="cta" onClick={() => setView('signup')}>
          <span>&gt;</span> get started
        </button>
      </main>
    </div>
  )
}

export default App
