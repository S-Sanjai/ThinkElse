import { useEffect, useMemo, useRef, useState } from 'react'
import { scoreSubmission, validateWord } from '../api.js'

export const WORD_COUNT = 10
const VALIDATE_DELAY = 350

const EMPTY_SLOT = () => ({ value: '', status: 'idle', reason: null })
// status: idle | checking | valid | invalid

const normalize = (word) => word.trim().toLowerCase()

function SlotStatus({ status, reason }) {
  if (status === 'checking') return <span className="slot-mark checking">⋯</span>
  if (status === 'valid') return <span className="slot-mark ok">✓</span>
  if (status === 'invalid')
    return (
      <span className="slot-mark bad" title={reason}>
        ✗
      </span>
    )
  return <span className="slot-mark" aria-hidden="true" />
}

export default function PlayDesk({ onScored }) {
  const [slots, setSlots] = useState(() => Array.from({ length: WORD_COUNT }, EMPTY_SLOT))
  const [submitting, setSubmitting] = useState(false)
  const [deskError, setDeskError] = useState(null)
  const timers = useRef({})
  const requestIds = useRef({})

  const validCount = slots.filter((s) => s.status === 'valid').length
  const allValid = validCount === WORD_COUNT

  const previousValues = useMemo(
    () => slots.map((s) => normalize(s.value)).filter(Boolean),
    [slots]
  )

  function setSlot(index, patch) {
    setSlots((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)))
  }

  function validateSlot(index, value) {
    const word = normalize(value)
    clearTimeout(timers.current[index])
    requestIds.current[index] = (requestIds.current[index] ?? 0) + 1
    const requestId = requestIds.current[index]

    if (!word) {
      setSlot(index, { status: 'idle', reason: null })
      return
    }
    if (word.length < 2) {
      setSlot(index, { status: 'invalid', reason: 'letters only, at least 2 characters' })
      return
    }

    setSlot(index, { status: 'checking', reason: null })
    timers.current[index] = setTimeout(async () => {
      try {
        const others = previousValues.filter((w) => w !== word)
        const result = await validateWord(word, others)
        if (requestIds.current[index] !== requestId) return // stale
        setSlot(index, {
          status: result.valid ? 'valid' : 'invalid',
          reason: result.valid ? null : result.reason,
        })
      } catch {
        if (requestIds.current[index] !== requestId) return
        setSlot(index, { status: 'invalid', reason: 'the press did not answer — try again' })
      }
    }, VALIDATE_DELAY)
  }

  function handleChange(index, value) {
    setDeskError(null)
    setSlot(index, { value })
    validateSlot(index, value)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!allValid || submitting) return
    setSubmitting(true)
    setDeskError(null)
    try {
      const words = slots.map((s) => normalize(s.value))
      const result = await scoreSubmission(words)
      onScored(result)
      document.getElementById('verdict')?.scrollIntoView({ behavior: 'smooth' })
    } catch (error) {
      // FastAPI 422 detail: { message, error: ["1. word: reason", ...] }
      const entries = error.detail?.error
      if (Array.isArray(entries)) {
        setSlots((prev) =>
          prev.map((slot) => {
            const hit = entries.find((entry) =>
              entry.toLowerCase().startsWith(`${prev.indexOf(slot) + 1}.`)
            )
            return hit ? { ...slot, status: 'invalid', reason: hit.split(': ').slice(1).join(': ') } : slot
          })
        )
      }
      setDeskError(error.message || 'The desk rejected the submission.')
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => () => Object.values(timers.current).forEach(clearTimeout), [])

  return (
    <section className="section" id="desk">
      <div className="section-head">
        <p className="section-standfirst">
          Please enter 10 words that are as different from each other as
          possible, in all meanings and uses of the words.
        </p>
      </div>

      <form className="desk" onSubmit={handleSubmit} noValidate>
        <ol className="slots">
          {slots.map((slot, i) => (
            <li key={i} className={`slot ${slot.status}`}>
              <span className="slot-n">{String(i + 1).padStart(2, '0')}</span>
              <input
                type="text"
                value={slot.value}
                onChange={(e) => handleChange(i, e.target.value)}
                placeholder="a word, far from the others"
                autoComplete="off"
                spellCheck="false"
                maxLength={40}
                aria-label={`Word ${i + 1}`}
                aria-invalid={slot.status === 'invalid'}
              />
              <SlotStatus status={slot.status} reason={slot.reason} />
              {slot.status === 'invalid' && slot.reason && (
                <p className="slot-reason" role="alert">
                  {slot.reason}
                </p>
              )}
            </li>
          ))}
        </ol>

        <div className="desk-foot">
          <p className="desk-count">
            <strong>
              {validCount}
              <span className="dim"> / {WORD_COUNT}</span>
            </strong>{' '}
            words cleared for press
          </p>
          {deskError && <p className="desk-error">{deskError}</p>}
          <button type="submit" className="press-btn" disabled={!allValid || submitting}>
            {submitting ? 'Setting type…' : 'Send to press'}
          </button>
        </div>
      </form>
    </section>
  )
}
