import { useState } from 'react'
import './App.css'
import Contact from './Contact.tsx'
import Home2 from './Home2.tsx'
import LinkLeetcode from './LinkLeetcode.tsx'
import Lessons from './Lessons.tsx'
import Login from './Login.tsx'
import Settings from './Settings.tsx'
import Signup from './Signup.tsx'
import SkillLevel, { type SkillLevelOption } from './SkillLevel.tsx'
import Tournaments from './Tournaments.tsx'
import Room from './Room.tsx'
import About from './About.tsx'
import competeFriendsImg from '../images/tourney.png'
import codeImg from '../images/coding.png'
import motivatedImg from '../images/motivated.png'
import decorateImg from '../images/decorate.png'
import streakImg from '../images/streak.png'
import { clearStoredUserId } from './session.ts'

function App() {
  const landingFeatures = [
    {
      title: 'compete with friends',
      body: 'Join tournaments with your friends to compete for the most points. The more problems you solve, the more points you’ll earn.',
      graphic: 'ladder',
      graphicImage: competeFriendsImg,
    },
    {
      title: 'learn to code',
      body: 'Whether you’re a complete beginner or an expert coder, our selected lesson plans will help you improve your coding every day.',
      graphic: 'lessons',
      graphicImage: codeImg,
    },
    {
      title: 'stay motivated',
      body: 'Daily lessons and tournament scores keep you motivated to meet your LeetCode goals.',
      graphic: 'streak',
      graphicImage: motivatedImg,
    },
    {
      title: 'decorate your room',
      body: 'Use the points you earn from lessons and tournaments to buy decorations for your space however you want.',
      graphic: 'room',
      graphicImage: decorateImg,
    },
    {
      title: 'save your streak',
      body: 'Keep your streak alive across ladders. Protect it with streak saves so you don’t have to be the one to break it.',
      graphic: 'shield',
      graphicImage: streakImg,
    },
  ]

  const [view, setView] = useState<
    'landing' |
    'about' |
    'login' |
    'signup' |
    'link' |
    'skill' |
    'dashboard' |
    'contactLanding' |
    'contactDashboard' |
    'settings' |
    'tournaments' |
    'lessons' |
    'room' 
  >('landing')
  const [skillLevel, setSkillLevel] = useState<SkillLevelOption | null>(null)
  const [, setLeetcodeUsername] = useState<string>('')
  const handleLogout = () => {
    clearStoredUserId()
    setView('landing')
  }

  if (view === 'dashboard') {
    return (
      <Home2
        skillLevel={skillLevel}
        onGoToContact={() => setView('contactDashboard')}
        onGoToSettings={() => setView('settings')}
        onGoToTournaments={() => setView('tournaments')}
        onGoToLessons={() => setView('lessons')}
        onGoToRoom={() => setView('room')}
        //onGoToStore={() => setView('store')}
        onLogout={handleLogout}
      />
    )
  }
//   if (view === 'store') {
//   return <Store onBackToDashboard={() => setView('dashboard')} />
// }

  if (view === 'lessons') {
    return (
      <Lessons
        skillLevel={skillLevel}
        onBackToDashboard={() => setView('dashboard')}
        onGoToTournaments={() => setView('tournaments')}
        onGoToContact={() => setView('contactDashboard')}
        onGoToSettings={() => setView('settings')}
        onGoToRoom={() => setView('room')}
        onLogout={handleLogout}
      />
    )
  }
  if (view === 'tournaments') {
    return (
      <Tournaments
        onBackToDashboard={() => setView('dashboard')}
        onGoToContact={() => setView('contactDashboard')}
        onGoToSettings={() => setView('settings')}
        onGoToLessons={() => setView('lessons')}
        onGoToRoom={() => setView('room')}
        onLogout={handleLogout}
      />
    )
  }
  if (view === 'contactLanding') return <Contact variant="landing" onBack={() => setView('landing')} />
  if (view === 'contactDashboard') {
    return (
      <Contact
        variant="dashboard"
        onBack={() => setView('dashboard')}
        onLogout={handleLogout}
        onGoToSettings={() => setView('settings')}
        onGoToTournaments={() => setView('tournaments')}
        onGoToLessons={() => setView('lessons')}
        onGoToRoom={() => setView('room')}
      />
    )
  }
  if (view === 'settings') {
    return (
      <Settings
        onBack={() => setView('dashboard')}
        onLogout={handleLogout}
        onGoToSupport={() => setView('contactDashboard')}
        onGoToTournaments={() => setView('tournaments')}
        onGoToLessons={() => setView('lessons')}
        onGoToRoom={() => setView('room')}
      />
    )
  }
  if (view === 'login') {
    return (
      <Login
        onBack={() => setView('landing')}
        onLogin={() => setView('dashboard')}
        onCreateAccount={() => setView('signup')}
      />
    )
  }
  if (view === 'room') {
    return (
      <Room
        onBackToDashboard={() => setView('dashboard')}
        onGoToLessons={() => setView('lessons')}
        onGoToTournaments={() => setView('tournaments')}
        onGoToContact={() => setView('contactDashboard')}
        onGoToSettings={() => setView('settings')}
        onLogout={handleLogout}
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
          setView('lessons')
        }}
      />
    )
  }
  if (view === 'about') {
    return (
      <About
        onBack={() => setView('landing')}
        onGoToSignup={() => setView('signup')}
        onGoToContact={() => setView('contactLanding')}
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
            <a
              href="#features"
              onClick={(event) => {
                event.preventDefault()
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              explore
            </a>
            <a
              href="#"
              onClick={(event) => {
                event.preventDefault()
                setView('about')
              }}
            >
              about
            </a>
            <a
              href="#"
              onClick={(event) => {
                event.preventDefault()
                setView('contactLanding')
              }}
            >
              contact
            </a>
          </div>
          <button className="login" onClick={() => setView('login')}>
            <span>&gt;</span> log in
          </button>
        </div>
      </nav>

      <main className="hero">
        <div className="hero-title">
          <div className="title-main">code more</div>
          <div className="title-accent">[slack less]</div>
        </div>
        <p className="subtitle">
          form a team and compete to solve the most leetcode problems
        </p>
        <button className="cta" onClick={() => setView('signup')}>
          <span>&gt;</span> get started
        </button>
      </main>

      <section className="feature-section" id="features">
        <div className="feature-header">
          <p className="feature-kicker">why leeterboard</p>
          <h2 className="feature-title">A playful way to get better, together</h2>
          <p className="feature-sub">
            Streaks, tournaments, lessons, and a space to show off the points you earn. Scroll to see how it works.
          </p>
        </div>

        <div className="feature-grid">
          {landingFeatures.map((feature, index) => (
            <div
              key={feature.title}
              className={`feature-row ${index % 2 === 1 ? 'feature-row--flip' : ''}`}
            >
              <div className={`feature-graphic feature-graphic--${feature.graphic}`} aria-hidden="true">
                {feature.graphicImage ? (
                  <img src={feature.graphicImage} alt={feature.title} />
                ) : (
                  <span className="feature-emoji" />
                )}
              </div>
              <div className="feature-copy">
                <h3>{feature.title}</h3>
                <p>{feature.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default App
