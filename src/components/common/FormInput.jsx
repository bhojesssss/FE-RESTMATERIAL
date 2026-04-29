export default function FormInput({ 
  label, 
  error, 
  wrapperClass = '', 
  inputClass = '', 
  errorClass = 'field-error',
  as = 'input', 
  children, 
  id, 
  ...props 
}) {
  const Component = as
  const hasError = !!error

  return (
    <div id={id}>
      <label className={wrapperClass}>
        {label}
        {as === 'select' ? (
          <select className={`${inputClass}${hasError ? ' input-error' : ''}`} {...props}>
            {children}
          </select>
        ) : (
          <Component className={`${inputClass}${hasError ? ' input-error' : ''}`} {...props} />
        )}
      </label>
      {hasError && <p className={errorClass}>{error}</p>}
    </div>
  )
}
