import { useMemo, useState } from 'react'

function verdictFor(score) {
  if (score >= 0.85) return ['A truly wandering mind', 'Your words barely share a thought between them.']
  if (score >= 0.75) return ['Well scattered', 'A fine spread — a few neighbours nod at each other.']
  if (score >= 0.6) return ['Pleasantly uneven', 'Some pairs keep a polite distance; others gossip.']
  if (score >= 0.45) return ['Comfortably clustered', 'Your words seem to have met before.']
  return ['A tight little village', 'Ten words, one street. Think elsewhere next time.']
}

function StepwiseChart({ words, stepwise }) {
  return (
    <figure className="fig">
      <figcaption>FIG. 01 — Steps between neighbours</figcaption>
      <div className="steps">
        {stepwise.map((dist, i) => (
          <div className="step" key={i}>
            <span className="step-label">
              {words[i]} → {words[i + 1]}
            </span>
            <span className="step-track">
              <span className="step-bar" style={{ width: `${dist * 100}%` }} />
            </span>
            <span className="step-value">{dist.toFixed(4)}</span>
          </div>
        ))}
      </div>
    </figure>
  )
}

function PairwiseMatrix({ words, pairwise }) {
  const n = words.length
  const [hover, setHover] = useState(null)

  const pairs = useMemo(() => {
    const map = {}
    Object.entries(pairwise).forEach(([key, dist]) => {
      const [i, j] = key.split('|').map(Number)
      map[`${i}-${j}`] = dist
    })
    return map
  }, [pairwise])

  return (
    <figure className="fig">
      <figcaption>FIG. 02 — All {n * (n - 1) / 2} pairs, at a glance</figcaption>
      <div className="matrix-wrap">
        <div className="matrix" style={{ gridTemplateColumns: `auto repeat(${n}, 1fr)` }}>
          <span className="mx-corner" />
          {words.map((w, j) => (
            <span key={j} className="mx-label col" title={w}>
              {w.slice(0, 3)}
            </span>
          ))}
          {words.map((w, i) => (
            <FragmentRow
              key={i}
              row={i}
              words={words}
              pairs={pairs}
              hover={hover}
              setHover={setHover}
            />
          ))}
        </div>
      </div>
      <p className="matrix-readout" aria-live="polite">
        {hover
          ? `${words[hover.i]} ↔ ${words[hover.j]} — distance ${hover.dist.toFixed(4)}`
          : 'Hover a cell to read the distance between two words.'}
      </p>
      <p className="matrix-legend">
        <span>close</span>
        <span className="legend-bar" aria-hidden="true" />
        <span>far apart</span>
      </p>
    </figure>
  )
}

function FragmentRow({ row, words, pairs, hover, setHover }) {
  const n = words.length
  return (
    <>
      <span className="mx-label row" title={words[row]}>
        {words[row].slice(0, 3)}
      </span>
      {Array.from({ length: n }, (_, col) => {
        if (col === row) return <span key={col} className="mx-diag" />
        const key = row < col ? `${row}-${col}` : `${col}-${row}`
        const dist = pairs[key]
        if (dist === undefined) return <span key={col} className="mx-cell empty" />
        const active = hover && hover.key === key
        return (
          <button
            type="button"
            key={col}
            className={`mx-cell ${active ? 'active' : ''}`}
            style={{ '--heat': dist }}
            onMouseEnter={() => setHover({ key, i: Math.min(row, col), j: Math.max(row, col), dist })}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover({ key, i: Math.min(row, col), j: Math.max(row, col), dist })}
            onBlur={() => setHover(null)}
            aria-label={`distance ${dist.toFixed(4)}`}
          />
        )
      })}
    </>
  )
}

export default function Results({ result, onReset }) {
  const { score, words, stepwise, pairwise } = result
  const [headline, subline] = verdictFor(score)

  return (
    <section className="section" id="verdict">
      <div className="section-head">
        <span className="kicker">Section 03</span>
        <h2>
          The Verdict <span className="rule-line" />
        </h2>
      </div>

      <div className="verdict-grid">
        <div className="score-block">
          <p className="score-label">Mean pairwise distance</p>
          <p className="score">{score.toFixed(4)}</p>
          <p className="score-verdict">
            <strong>{headline}.</strong> {subline}
          </p>
          <p className="score-words">
            {words.map((w, i) => (
              <span key={i} className="printed-word">
                {w}
                {i < words.length - 1 ? ' · ' : ''}
              </span>
            ))}
          </p>
          <button type="button" className="press-btn ghost" onClick={onReset}>
            File a new submission
          </button>
        </div>

        <div className="figs">
          <StepwiseChart words={words} stepwise={stepwise} />
          <PairwiseMatrix words={words} pairwise={pairwise} />
        </div>
      </div>
    </section>
  )
}
