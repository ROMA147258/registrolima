import React from 'react';

export function InputField({
  label,
  icon: Icon,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  required = false,
  maxLength,
  disabled = false,
  error = null
}) {
  return (
    <div className="form-group">
      {label && (
        <label className="form-label" htmlFor={name}>
          {Icon && <Icon className="w-4 h-4 text-sky-400" />}
          <span>{label}</span>
          {required && <span style={{ color: '#f87171' }}>*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        disabled={disabled}
        className="form-control"
        style={error ? { borderColor: '#f87171' } : {}}
      />
      {error && <div style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '4px' }}>{error}</div>}
    </div>
  );
}
