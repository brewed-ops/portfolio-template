/**
 * Two themes on one set of tokens. `data-theme` on <html> is the single
 * switch: tokens.css redefines the brand vars under [data-theme='dark'], so
 * every existing rule keeps reading --cream / --navy / --white and inverts
 * with it instead of being rewritten.
 *
 * The initial value is written by an inline script in index.html so the first
 * paint is already the right palette. Default is LIGHT: this site's identity
 * is the cream contour page, dark is the opt-in.
 *
 * HeroCanvasV2 listens for the `themechange` event and eases its uDarkMix
 * uniform from it, so the shader crosses over on its own clock.
 */
export type Theme = 'light' | 'dark'

import { motionReduced } from './a11y'

const KEY = 'theme'

export function getTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

function applyTheme(theme: Theme) {
  const root = document.documentElement
  root.dataset.theme = theme
  // The browser's own bar takes the page colour. Read from the token after
  // the switch, so tokens.css stays the one place the palette lives.
  const page = getComputedStyle(root).getPropertyValue('--cream').trim()
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', page)
  try {
    localStorage.setItem(KEY, theme)
  } catch {
    /* private mode: the theme just does not persist */
  }
  window.dispatchEvent(new CustomEvent<Theme>('themechange', { detail: theme }))
}

export type SweepOrigin = { x: number; y: number }

type WithViewTransition = Document & {
  startViewTransition?: (cb: () => void) => { finished: Promise<void> }
}

/**
 * Switch themes as a hard-edged circle growing out of the control that
 * asked for it: inside the circle is entirely the new palette, outside is
 * the old one, until the edge clears the farthest corner. View Transitions
 * API; the origin and the required radius go to global.css as custom
 * properties. The API animates between captures of the page, so what sits
 * outside the circle holds still for the 1.2s - a crisp edge instead of
 * a live wave. Browsers without it, and reduced-motion users,
 * get the instant switch.
 */
export function setTheme(theme: Theme, origin?: SweepOrigin) {
  const doc = document as WithViewTransition
  const root = document.documentElement
  const reduce =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches || motionReduced()
  if (!doc.startViewTransition || reduce || getTheme() === theme) {
    applyTheme(theme)
    return
  }
  const x = origin?.x ?? window.innerWidth / 2
  const y = origin?.y ?? window.innerHeight / 2
  const r = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  )
  root.style.setProperty('--sweep-x', `${x}px`)
  root.style.setProperty('--sweep-y', `${y}px`)
  root.style.setProperty('--sweep-r', `${r}px`)
  root.dataset.themeSweep = 'on'
  doc
    .startViewTransition(() => applyTheme(theme))
    .finished.finally(() => {
      delete root.dataset.themeSweep
    })
}

/** Pass the toggle's own element so the sweep starts under the cursor. */
export function toggleTheme(from?: Element | null): Theme {
  const next: Theme = getTheme() === 'dark' ? 'light' : 'dark'
  const r = from?.getBoundingClientRect()
  setTheme(next, r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : undefined)
  return next
}
