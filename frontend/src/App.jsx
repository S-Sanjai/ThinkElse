import { useState } from 'react'
import Masthead from './components/Masthead.jsx'
import Rules from './components/Rules.jsx'
import PlayDesk from './components/PlayDesk.jsx'
import Results from './components/Results.jsx'
import EditorsNote from './components/EditorsNote.jsx'
import AlternativeUses from './components/AlternativeUses.jsx'
import './App.css'

const TESTS = [
  { id: 'distant', label: 'Test A — Distant Words' },
  { id: 'uses', label: 'Test B — Alternative Uses' },
]

export default function App() {
  const [test, setTest] = useState('distant')
  const [result, setResult] = useState(null)

  function handleReset() {
    setResult(null)
    document.getElementById('desk')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="paper">
      <Masthead />
      <nav className="test-tabs" aria-label="Tests">
        {TESTS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`test-tab ${test === t.id ? 'active' : ''}`}
            onClick={() => setTest(t.id)}
            aria-pressed={test === t.id}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main>
        {test === 'distant' && (
          <>
            <div className="game-desk-row">
              <Rules />
              <PlayDesk onScored={setResult} />
            </div>
            {result && <Results result={result} onReset={handleReset} />}
          </>
        )}

        {test === 'uses' && <AlternativeUses />}
      </main>
      <EditorsNote />
    </div>
  )
}
