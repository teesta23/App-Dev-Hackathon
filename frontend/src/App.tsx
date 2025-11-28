
import './App.css'


function App() {
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
          <button className="login">log in</button>
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
        <button className="cta">
          <span>&gt;</span> get started
        </button>
      </main>
    </div>
  )
}

export default App
