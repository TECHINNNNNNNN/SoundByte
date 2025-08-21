import { type SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  fullWidth?: boolean
  options: Array<{ value: string | number; label: string }>
}

export default function Select({
  label,
  error,
  fullWidth = true,
  options,
  className = '',
  ...props
}: SelectProps) {
  const widthClass = fullWidth ? 'w-full' : ''
  
  return (
    <div className={widthClass}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
        </label>
      )}
      <select
        className={`px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-200 bg-white/50 backdrop-blur-sm ${widthClass} ${
          error ? 'border-red-400' : ''
        } ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}