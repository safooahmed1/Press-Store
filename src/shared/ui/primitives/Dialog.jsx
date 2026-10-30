import { useEffect, useId, useRef } from 'react'

export function Dialog({ open, onClose, title, description, children, actions }) {
  const dialogRef = useRef(null)
  const returnFocusRef = useRef(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return undefined

    if (open && !dialog.open) {
      returnFocusRef.current = document.activeElement
      dialog.showModal()
    } else if (!open && dialog.open) {
      dialog.close()
    }

    return undefined
  }, [open])

  function handleClose() {
    onClose?.()
    if (returnFocusRef.current instanceof HTMLElement) returnFocusRef.current.focus()
  }

  function handleCancel(event) {
    event.preventDefault()
    dialogRef.current?.close()
  }

  return (
    <dialog
      ref={dialogRef}
      className="w-[min(32rem,calc(100%-2rem))] border border-line bg-canvas p-0 text-ink backdrop:bg-ink/55"
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={handleCancel}
      onClose={handleClose}
    >
      <div className="grid gap-6 p-6 sm:p-8">
        <div className="grid gap-2">
          <h2 id={titleId} className="font-display text-2xl font-bold leading-none">{title}</h2>
          {description ? <p id={descriptionId} className="text-sm leading-6 text-muted">{description}</p> : null}
        </div>
        {children ? <div className="text-sm leading-6">{children}</div> : null}
        {actions ? <div className="flex flex-wrap justify-end gap-3 border-t border-line pt-5">{actions}</div> : null}
      </div>
    </dialog>
  )
}
