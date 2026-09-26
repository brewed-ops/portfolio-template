import { useEffect, type RefObject } from 'react'

export type DismissReason = 'escape' | 'outside'

/**
 * Closes an open popover on Escape or on a pointer-down outside `rootRef`.
 * The reason is passed on so the caller decides focus: Escape hands focus back
 * to the trigger, an outside tap leaves it where the visitor tapped.
 *
 * `onClose` must be stable (useCallback) - it is an effect dependency, and a
 * new function every render would re-subscribe the listeners every render.
 */
export function useDismiss(
  open: boolean,
  rootRef: RefObject<HTMLElement | null>,
  onClose: (reason: DismissReason) => void,
) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose('escape')
    }
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) onClose('outside')
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onDown)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onDown)
    }
  }, [open, rootRef, onClose])
}
