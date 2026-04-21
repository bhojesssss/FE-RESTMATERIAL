export function UploadIcon({ className }) {
  return (
    <svg className={className} width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  )
}

export function SuccessCheckIcon({ className, 'aria-hidden': ariaHidden }) {
  return (
    <div className={className} aria-hidden={ariaHidden}>
      ✓
    </div>
  )
}
