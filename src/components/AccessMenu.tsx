import { useCallback, useEffect, useRef, useState } from 'react'
import { PersonArmsSpread, X, ArrowCounterClockwise } from '@/components/slab'
import { DEFAULT_PREFS, readPrefs, savePrefs, type A11yPrefs, type TextSize } from '@/lib/a11y'
import { useDismiss, type DismissReason } from '@/hooks/useDismiss'

/**
 * AccessMenu - fixed bottom-left, the mirror of the reviews widget.
 * One button opens a small panel of switches for visitors who find the page
 * hard to read: larger text, stronger contrast, motion off, underlined links.
 * Every switch is a real button with aria-pressed; Escape closes the panel.
 */
const SIZES: { value: TextSize; label: string; hint: string }[] = [
  { value: 'md', label: 'A', hint: 'Default text size' },
  { value: 'lg', label: 'A+', hint: 'Larger text' },
  { value: 'xl', label: 'A++', hint: 'Largest text' },
]

const SWITCHES: { key: 'contrast' | 'motion' | 'links'; label: string; desc: string }[] = [
  { key: 'contrast', label: 'High contrast', desc: 'Darker text, stronger edges' },
  { key: 'motion', label: 'Reduce motion', desc: 'No animation or drifting' },
  { key: 'links', label: 'Underline links', desc: 'Every link gets a line' },
]

/** Opens the panel from elsewhere - the phone's QuickMenu. `detail` is the
 *  element to hand focus back to on close, since the float button is hidden
 *  on phones. */
export const A11Y_OPEN_EVENT = 'a11y:open'

export default function AccessMenu() {
  const [open, setOpen] = useState(false)
  const [prefs, setPrefs] = useState<A11yPrefs>(readPrefs)
  const rootRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  // Where focus goes on close: the control that opened the panel from
  // elsewhere (the float button is hidden on phones), else the float button.
  const returnRef = useRef<HTMLElement | null>(null)

  const close = useCallback((reason: DismissReason | 'button') => {
    setOpen(false)
    // An outside tap leaves focus where the visitor tapped. The opener may
    // have unmounted since (Home's header menu is gone on other routes).
    if (reason !== 'outside') {
      const opener = returnRef.current
      ;(opener?.isConnected ? opener : buttonRef.current)?.focus()
    }
    returnRef.current = null
  }, [])
  useDismiss(open, rootRef, close)

  // Land keyboard and screen-reader users inside the dialog: the control that
  // opened it may have just gone inert with its own menu.
  useEffect(() => {
    if (open) panelRef.current?.focus()
  }, [open])

  useEffect(() => {
    const onOpen = (e: Event) => {
      returnRef.current = (e as CustomEvent<HTMLElement | null>).detail
      setOpen(true)
    }
    window.addEventListener(A11Y_OPEN_EVENT, onOpen)
    return () => window.removeEventListener(A11Y_OPEN_EVENT, onOpen)
  }, [])

  function update(next: A11yPrefs) {
    setPrefs(next)
    savePrefs(next)
  }

  const changed = prefs.text !== 'md' || prefs.contrast || prefs.motion || prefs.links

  return (
    <div className={`a11y${open ? ' is-open' : ''}`} data-widget="a11y" ref={rootRef}>
      <div
        className="a11y__panel"
        role="dialog"
        aria-label="Accessibility options"
        tabIndex={-1}
        ref={panelRef}
        inert={!open || undefined}
      >
        <header className="a11y__head">
          <span className="a11y__title">Accessibility</span>
          <button
            type="button"
            className="a11y__close"
            onClick={() => close('button')}
            aria-label="Close accessibility options"
          >
            <X size={16} weight="bold" aria-hidden="true" />
          </button>
        </header>

        <div className="a11y__group" role="group" aria-label="Text size">
          <span className="a11y__label">Text size</span>
          <div className="a11y__sizes">
            {SIZES.map((s) => (
              <button
                key={s.value}
                type="button"
                className={`a11y__size${prefs.text === s.value ? ' is-on' : ''}`}
                aria-pressed={prefs.text === s.value}
                aria-label={s.hint}
                onClick={() => update({ ...prefs, text: s.value })}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <ul className="a11y__list">
          {SWITCHES.map((s) => (
            <li key={s.key}>
              <button
                type="button"
                className={`a11y__switch${prefs[s.key] ? ' is-on' : ''}`}
                aria-pressed={prefs[s.key]}
                onClick={() => update({ ...prefs, [s.key]: !prefs[s.key] })}
              >
                <span className="a11y__switch-text">
                  <span className="a11y__switch-label">{s.label}</span>
                  <span className="a11y__switch-desc">{s.desc}</span>
                </span>
                <span className="a11y__toggle" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="a11y__reset"
          onClick={() => update(DEFAULT_PREFS)}
          disabled={!changed}
        >
          <ArrowCounterClockwise size={14} weight="bold" aria-hidden="true" />
          Reset to default
        </button>
      </div>

      <button
        type="button"
        className="a11y__button"
        ref={buttonRef}
        onClick={() => {
          returnRef.current = null
          setOpen((v) => !v)
        }}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Accessibility options"
        title="Accessibility options"
      >
        <PersonArmsSpread size={22} weight="fill" aria-hidden="true" />
      </button>
    </div>
  )
}
