import React from 'react';

export function SelectField({
  label,
  icon: Icon,
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Seleccione una opción',
  required = false,
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
      <select
        id={name}
        name={name}
        value={value || ''}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="form-control form-select"
        style={error ? { borderColor: '#f87171' } : {}}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((opt, idx) => {
          const val = typeof opt === 'object' ? opt.value : opt;
          const labelText = typeof opt === 'object' ? opt.label : opt;
          return <option key={idx} value={val}>{labelText}</option>;
        })}
      </select>
      {error && <div style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '4px' }}>{error}</div>}
    </div>
  );
}
