import { useEffect } from 'react'
import { Button } from '../common/Button'

export function ConfirmDialog({ open, title, message, confirmLabel = 'Conferma', busy = false, onConfirm, onClose }) {
  useEffect(() => {
    if (!open) return undefined
    function handleKeydown(event) {
      if (event.key === 'Escape' && !busy) onClose()
    }
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [busy, onClose, open])

  if (!open) return null

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={() => !busy && onClose()}>
      <div className="modal" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" onMouseDown={(event) => event.stopPropagation()}>
        <h2 id="confirm-title">{title}</h2>
        <p>{message}</p>
        <div className="modal-actions">
          <Button type="button" variant="secondary" onClick={onClose} disabled={busy}>Annulla</Button>
          <Button type="button" onClick={onConfirm} disabled={busy}>{busy ? 'Attendi…' : confirmLabel}</Button>
        </div>
      </div>
    </div>
  )
}
