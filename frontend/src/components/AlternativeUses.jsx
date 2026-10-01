import { useEffect, useMemo, useRef, useState } from 'react'

const DURATION = 180 // 3 minutes
const PROMPT_WORD = 'Brick'

const IDEAS_EXAMPLES = ['construction', 'paperweight', 'percussion instrument', 'garden drainage', 'heat storage', 'art pigment']

function fmt(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function AlternativeUses({ onFinished }) {
  const [ideas, setIdeas] = useState([])
  const [draft, setDraft] = useState('')
  const [secondsLeft, setSecondsLeft] = useState(DURATION)
  const [running, setRunning] = useState(false)
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (!running) return undefined
    const id = setInterval(() => {
      setSecondsLeft((t) => {
        if (t <= 1) {
          clearInterval(id)
          setRunning(false)
          setFinished(true)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [running])

  const categories = useMemo(() => new Set(ideas.map((i) => i.category.trim().toLowerCase())).size, [ideas])

  function begin() {
    setStarted(true)
    setRunning(true)
    inputRef.current?.focus()
  }

  function addIdea(event) {
    event.preventDefault()
    const text = draft.trim()
    if (!text || finished) return
    setIdeas((prev) => [...prev, { text, category: '' }])
    setDraft('')
    inputRef.current?.focus()
  }

  function finish() {
    setRunning(false)
    setFinished(true)
  }

  function reset() {
    setIdeas([])
    setDraft('')
    setSecondsLeft(DURATION)
    setRunning(false)
    setStarted(false)
    setFinished(false)
    onFinished?.(null)
  }

  const fluency = ideas.length
  const originality = ideas.filter((i) => i.category !== '').length

  return (
    <section className="section alt-section" id="alt-uses">
      <div className="alt-grid">
        <aside className="alt-side">
          <span className="kicker kicker-strong">Test B</span>
          <h2 className="alt-word">{PROMPT_WORD}</h2>
          <p className="alt-brief">
            List as many unusual uses for a brick as possible in 3 minutes.
          </p>

          <div className="alt-timer" role="timer" aria-live="off">
            <span className={`alt-clock ${secondsLeft <= 30 && started ? 'low' : ''}`}>{fmt(secondsLeft)}</span>
            <span className="alt-timer-label">{finished ? 'time is up' : running ? 'running' : started ? 'paused' : 'ready'}</span>
          </div>

          {!started && (
            <button type="button" className="press-btn alt-start" onClick={begin}>
              Start the clock
            </button>
          )}
          {started && !finished && (
            <button type="button" className="press-btn ghost alt-start" onClick={finish}>
              I&apos;m done early
            </button>
          )}
          {finished && (
            <button type="button" className="press-btn ghost alt-start" onClick={reset}>
              Take it again
            </button>
          )}

          <ul className="alt-scores">
            <li>
              <strong>{fluency}</strong>
              <span>Fluency — ideas given</span>
            </li>
            <li>
              <strong>{categories}</strong>
              <span>Flexibility — categories</span>
            </li>
            <li>
              <strong>{originality}</strong>
              <span>Originality — marked unusual</span>
            </li>
            <li>
              <strong>{ideas.reduce((n, i) => n + (i.detail ? 1 : 0), 0)}</strong>
              <span>Elaboration — ideas with detail</span>
            </li>
          </ul>
        </aside>

        <div className="alt-main">
          <p className="section-standfirst">
            One idea per line. Add it, press Enter, keep going — the clock doesn&apos;t wait.
          </p>

          <form className="alt-entry" onSubmit={addIdea}>
            <input
              ref={inputRef}
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={finished ? 'time is up' : `a use for a ${PROMPT_WORD.toLowerCase()}…`}
              disabled={!started || finished}
              autoComplete="off"
              maxLength={120}
              aria-label="New idea"
            />
            <button type="submit" className="press-btn" disabled={!started || finished || !draft.trim()}>
              Add
            </button>
          </form>

          <ol className="alt-list">
            {ideas.length === 0 && (
              <li className="alt-empty" aria-hidden="true">
                e.g. {IDEAS_EXAMPLES.slice(0, 3).join(' · ')}
              </li>
            )}
            {ideas.map((idea, i) => (
              <li key={i} className="alt-item">
                <span className="slot-n">{String(i + 1).padStart(2, '0')}</span>
                <div className="alt-item-body">
                  <span className="alt-item-text">{idea.text}</span>
                  <label className="alt-flags">
                    <span className="alt-flag">
                      <input
                        type="checkbox"
                        checked={idea.category !== ''}
                        onChange={(e) =>
                          setIdeas((prev) =>
                            prev.map((it, j) => (j === i ? { ...it, category: e.target.checked ? idea.text : '' } : it))
                          )
                        }
                      />
                      unusual
                    </span>
                    <span className="alt-flag">
                      <input
                        type="checkbox"
                        checked={idea.detail}
                        onChange={(e) =>
                          setIdeas((prev) => prev.map((it, j) => (j === i ? { ...it, detail: e.target.checked } : it)))
                        }
                      />
                      elaborated
                    </span>
                  </label>
                </div>
                <button
                  type="button"
                  className="alt-remove"
                  onClick={() => setIdeas((prev) => prev.filter((_, j) => j !== i))}
                  aria-label={`Remove ${idea.text}`}
                >
                  ✕
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
