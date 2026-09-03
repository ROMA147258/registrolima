import React, { useState, useEffect, useRef } from 'react';
import {
  User, CreditCard, Phone, Mail, MapPin, School, Table, Shield, Layers,
  LogOut, Check, ChevronDown, AlertCircle, Edit3, Send, CheckCircle2, X, Lock
} from 'lucide-react';
import { DISTRITOS_LIMA } from '../../constants/catalogs.js';
import { api } from '../../services/api.js';

// Componente de Dropdown Desplegable Personalizado con Fondo Blanco y Estilo Somos Perú
function CustomSearchableSelect({
  id,
  value,
  onChange,
  options = [],
  placeholder,
  icon: Icon,
  name,
  required = false,
  disabled = false,
  hasError = false,
  errorMsg = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value || '');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setSearchTerm(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const normalizedOptions = options.map(opt => typeof opt === 'string' ? opt : (opt.nombre || opt.local || ''));
  const filtered = normalizedOptions.filter(opt =>
    opt.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(
      searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    )
  );

  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    onChange({ target: { name, value: val } });
    if (!isOpen) setIsOpen(true);
  };

  const handleSelect = (selectedVal) => {
    setSearchTerm(selectedVal);
    onChange({ target: { name, value: selectedVal } });
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <div style={{ position: 'relative' }}>
        {Icon && <Icon className="w-4 h-4" style={{ position: 'absolute', left: '12px', top: '12px', color: hasError ? '#ef4444' : '#0284c7', pointerEvents: 'none' }} />}
        <input
          ref={inputRef}
          id={id || `field-${name}`}
          type="text"
          name={name}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => !disabled && setIsOpen(true)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete="off"
          className="form-control"
          style={{
            paddingLeft: Icon ? '36px' : '14px',
            paddingRight: '32px',
            background: disabled ? '#f1f5f9' : '#ffffff',
            border: hasError ? '2px solid #ef4444' : (isOpen ? '1.5px solid #0284c7' : '1.5px solid #cbd5e1'),
            color: disabled ? '#94a3b8' : '#0f172a',
            borderRadius: '10px',
            width: '100%',
            height: '42px',
            fontSize: '0.86rem',
            outline: 'none',
            boxShadow: hasError ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : (isOpen ? '0 0 0 3px rgba(2, 132, 199, 0.15)' : 'none'),
            transition: 'all 0.15s ease'
          }}
        />
        <ChevronDown
          className="w-4 h-4"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          style={{
            position: 'absolute',
            right: '12px',
            top: '13px',
            color: hasError ? '#ef4444' : '#64748b',
            cursor: disabled ? 'default' : 'pointer',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}
        />
      </div>

      {hasError && errorMsg && (
        <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Lista Desplegable Personalizada con Fondo Blanco */}
      {isOpen && !disabled && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          right: 0,
          background: '#ffffff',
          border: '1.5px solid #0284c7',
          borderRadius: '10px',
          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.15)',
          maxHeight: '220px',
          overflowY: 'auto',
          zIndex: 1000,
          animation: 'fadeIn 0.15s ease-out'
        }}>
          {filtered.length > 0 ? (
            filtered.map((item, idx) => {
              const isSelected = item.toLowerCase() === (value || '').toLowerCase();
              return (
                <div
                  key={idx}
                  onClick={() => handleSelect(item)}
                  style={{
                    padding: '9px 14px',
                    fontSize: '0.84rem',
                    fontWeight: isSelected ? 800 : 500,
                    color: isSelected ? '#ffffff' : '#0f172a',
                    background: isSelected ? '#0284c7' : '#ffffff',
                    cursor: 'pointer',
                    borderBottom: idx !== filtered.length - 1 ? '1px solid #f1f5f9' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.1s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = '#e0f2fe';
                      e.currentTarget.style.color = '#0284c7';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = '#ffffff';
                      e.currentTarget.style.color = '#0f172a';
                    }
                  }}
                >
                  <span>{item}</span>
                  {isSelected && <Check className="w-4 h-4 text-white" />}
                </div>
              );
            })
          ) : (
            <div style={{ padding: '12px', textAlign: 'center', color: '#64748b', fontSize: '0.82rem' }}>
              No se encontraron coincidencias
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Componente de Selección Múltiple con Buscador y Chips para Coordinador Zonal
function MultiSearchableSelect({
  id,
  value,
  onChange,
  options = [],
  assignedOptions = [],
  placeholder = "Buscar y seleccionar locales de votación...",
  icon: Icon = School,
  name,
  required = false,
  disabled = false,
  hasError = false,
  errorMsg = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedList = (value || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  const normalizedOptions = options.map(opt => typeof opt === 'string' ? opt : (opt.nombre || opt.colegio || opt.local || ''));
  const assignedNormalized = assignedOptions.map(opt => String(opt || '').trim().toLowerCase());

  // Filtrar colegios ya ocupados por otros coordinadores en este distrito (salvo que ya los tenga seleccionados el usuario actual)
  const availableOptions = normalizedOptions.filter(opt => {
    const cleanOpt = opt.trim().toLowerCase();
    const isAlreadySelectedByMe = selectedList.some(s => s.toLowerCase() === cleanOpt);
    return isAlreadySelectedByMe || !assignedNormalized.includes(cleanOpt);
  });

  const filtered = availableOptions.filter(opt =>
    opt.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(
      searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    )
  );

  const toggleSelect = (item) => {
    const exists = selectedList.some(s => s.toLowerCase() === item.toLowerCase());
    let updated;
    if (exists) {
      updated = selectedList.filter(s => s.toLowerCase() !== item.toLowerCase());
    } else {
      updated = [...selectedList, item];
    }
    onChange({ target: { name, value: updated.join(', ') } });
    if (inputRef.current) inputRef.current.focus();
  };

  const removeTag = (item, e) => {
    e.stopPropagation();
    const updated = selectedList.filter(s => s.toLowerCase() !== item.toLowerCase());
    onChange({ target: { name, value: updated.join(', ') } });
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {/* Contenedor principal interactivo con tags y buscador */}
      <div
        onClick={() => {
          if (!disabled) {
            setIsOpen(true);
            if (inputRef.current) inputRef.current.focus();
          }
        }}
        style={{
          background: disabled ? '#f1f5f9' : '#ffffff',
          border: hasError ? '2px solid #ef4444' : (isOpen ? '1.5px solid #0284c7' : '1.5px solid #cbd5e1'),
          borderRadius: '10px',
          padding: '6px 36px 6px 36px',
          minHeight: '44px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '6px',
          position: 'relative',
          cursor: disabled ? 'not-allowed' : 'text',
          boxShadow: hasError ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : (isOpen ? '0 0 0 3px rgba(2, 132, 199, 0.15)' : 'none'),
          transition: 'all 0.15s ease'
        }}
      >
        {Icon && (
          <Icon
            className="w-4 h-4"
            style={{
              position: 'absolute',
              left: '12px',
              top: selectedList.length > 0 ? '12px' : '50%',
              transform: selectedList.length > 0 ? 'none' : 'translateY(-50%)',
              color: hasError ? '#ef4444' : '#0284c7',
              pointerEvents: 'none'
            }}
          />
        )}

        {/* Chips de colegios seleccionados */}
        {selectedList.map((item, idx) => (
          <span
            key={idx}
            style={{
              background: '#0284c7',
              color: '#ffffff',
              fontSize: '0.74rem',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: '6px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              maxWidth: '100%',
              lineHeight: '1.2'
            }}
          >
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item}</span>
            {!disabled && (
              <X
                className="w-3.5 h-3.5"
                style={{ cursor: 'pointer', flexShrink: 0, opacity: 0.9 }}
                onClick={(e) => removeTag(item, e)}
              />
            )}
          </span>
        ))}

        {/* Input de texto para escribir y buscar */}
        <input
          ref={inputRef}
          id={id || `field-${name}`}
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => !disabled && setIsOpen(true)}
          placeholder={selectedList.length === 0 ? placeholder : "Escribir para agregar otro..."}
          disabled={disabled}
          autoComplete="off"
          style={{
            border: 'none',
            outline: 'none',
            fontSize: '0.86rem',
            color: disabled ? '#94a3b8' : '#0f172a',
            background: 'transparent',
            flex: '1 1 140px',
            minWidth: '140px',
            height: '28px',
            padding: 0
          }}
        />

        <ChevronDown
          className="w-4 h-4"
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled) setIsOpen(!isOpen);
          }}
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: `translateY(-50%) rotate(${isOpen ? 180 : 0}deg)`,
            color: hasError ? '#ef4444' : '#64748b',
            cursor: disabled ? 'default' : 'pointer',
            transition: 'transform 0.2s ease'
          }}
        />
      </div>

      {hasError && errorMsg && (
        <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Lista Desplegable con opciones disponibles */}
      {isOpen && !disabled && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          right: 0,
          background: '#ffffff',
          border: '1.5px solid #0284c7',
          borderRadius: '10px',
          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.15)',
          maxHeight: '230px',
          overflowY: 'auto',
          zIndex: 1000,
          animation: 'fadeIn 0.15s ease-out'
        }}>
          <div style={{ padding: '6px 12px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '0.73rem', fontWeight: 700, color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
            <span>{filtered.length} locales de votación disponibles</span>
            {selectedList.length > 0 && <span style={{ color: '#0284c7' }}>{selectedList.length} seleccionados</span>}
          </div>

          {filtered.length > 0 ? (
            filtered.map((item, idx) => {
              const isSelected = selectedList.some(s => s.toLowerCase() === item.toLowerCase());
              return (
                <div
                  key={idx}
                  onClick={() => toggleSelect(item)}
                  style={{
                    padding: '9px 14px',
                    fontSize: '0.84rem',
                    fontWeight: isSelected ? 800 : 500,
                    color: isSelected ? '#0369a1' : '#0f172a',
                    background: isSelected ? '#f0f9ff' : '#ffffff',
                    cursor: 'pointer',
                    borderBottom: idx !== filtered.length - 1 ? '1px solid #f1f5f9' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.1s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = '#e0f2fe';
                      e.currentTarget.style.color = '#0284c7';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = '#ffffff';
                      e.currentTarget.style.color = '#0f172a';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, paddingRight: '8px' }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      style={{ cursor: 'pointer', accentColor: '#0284c7', width: '15px', height: '15px' }}
                    />
                    <span>{item}</span>
                  </div>
                  {isSelected && <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0284c7' }}>Seleccionado</span>}
                </div>
              );
            })
          ) : (
            <div style={{ padding: '14px', textAlign: 'center', color: '#64748b', fontSize: '0.82rem' }}>
              {searchTerm ? 'No se encontraron locales de votación con esa búsqueda' : 'No hay locales de votación disponibles en este distrito'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function RegistrationView({ onShowLogin, onRegisteredSuccess }) {
  const [formData, setFormData] = useState({
    nombres_apellidos: '',
    dni: '',
    celular: '',
    correo_electronico: '',
    usa_whatsapp: 'Sí, mismo número',
    numero_whatsapp_alterno: '',
    distrito_vota: '',
    mesa_vota: 'No aplica',
    local_vota: '',
    rol_electoral: 'Personero de Mesa',
    distrito_asignado: '',
    mesa_asignada: 'No aplica',
    local_asignado: '',
    tiene_experiencia: 'No',
    cuenta_movilidad: 'No',
    se_compromete: ''
  });

  const [localesVota, setLocalesVota] = useState([]);
  const [localesAsignados, setLocalesAsignados] = useState([]);
  const [assignedLocalesAsignados, setAssignedLocalesAsignados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [distritalSuccessData, setDistritalSuccessData] = useState(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const isCoordinadorLocal = formData.rol_electoral === 'Personero de Local de Votación' || formData.rol_electoral === 'Coordinador de Local';
  const isCoordinadorZonal = formData.rol_electoral === 'Coordinador Zonal';
  const isCoordinadorDistrital = formData.rol_electoral === 'Coordinador Distrital' || formData.rol_electoral === 'Coordinador de Distritos';
  const isPersoneroMesa = formData.rol_electoral === 'Personero de Mesa';
  const isCoordinador = isCoordinadorLocal || isCoordinadorZonal || isCoordinadorDistrital;

  // Carga dinámica de colegios desde dbo.mesas / dbo.colegios en SQL Server para Sección 2
  useEffect(() => {
    if (formData.distrito_vota) {
      api.getLocales(formData.distrito_vota)
        .then(res => setLocalesVota(res.data || []))
        .catch(() => setLocalesVota([]));
    } else {
      setLocalesVota([]);
    }
  }, [formData.distrito_vota]);

  // Carga dinámica de colegios desde dbo.mesas / dbo.colegios en SQL Server para Sección 3
  useEffect(() => {
    if (formData.distrito_asignado && !isCoordinadorDistrital) {
      api.getLocales(formData.distrito_asignado, formData.rol_electoral)
        .then(res => {
          setLocalesAsignados(res.data || []);
          setAssignedLocalesAsignados(res.assignedLocales || []);
        })
        .catch(() => {
          setLocalesAsignados([]);
          setAssignedLocalesAsignados([]);
        });
    } else {
      setLocalesAsignados([]);
      setAssignedLocalesAsignados([]);
    }
  }, [formData.distrito_asignado, isCoordinadorDistrital, formData.rol_electoral]);

  // Validaciones en TIEMPO REAL de disponibilidad y no duplicidad (Nombres, DNI, Celular, Mesa, Local, Distrito)
  useEffect(() => {
    const nameTrim = (formData.nombres_apellidos || '').trim();
    if (nameTrim.length >= 4) {
      const timer = setTimeout(() => {
        api.checkAvailability({ nombres: nameTrim })
          .then(res => {
            if (res && res.available === false) {
              setFieldErrors(prev => ({ ...prev, nombres_apellidos: res.message }));
            } else {
              setFieldErrors(prev => {
                if (prev.nombres_apellidos && (prev.nombres_apellidos.includes('registrada') || prev.nombres_apellidos.includes('sistema'))) {
                  const copy = { ...prev };
                  delete copy.nombres_apellidos;
                  return copy;
                }
                return prev;
              });
            }
          })
          .catch(() => {});
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [formData.nombres_apellidos]);

  useEffect(() => {
    if (formData.dni && formData.dni.length === 8) {
      api.checkAvailability({ dni: formData.dni })
        .then(res => {
          if (res && res.available === false) {
            setFieldErrors(prev => ({ ...prev, dni: res.message }));
          } else {
            setFieldErrors(prev => {
              if (prev.dni && (prev.dni.includes('registrado') || prev.dni.includes('sistema'))) {
                const copy = { ...prev };
                delete copy.dni;
                return copy;
              }
              return prev;
            });
          }
        })
        .catch(() => {});
    }
  }, [formData.dni]);

  useEffect(() => {
    if (formData.celular && formData.celular.length === 9) {
      api.checkAvailability({ celular: formData.celular })
        .then(res => {
          if (res && res.available === false) {
            setFieldErrors(prev => ({ ...prev, celular: res.message }));
          } else {
            setFieldErrors(prev => {
              if (prev.celular && prev.celular.includes('registrado')) {
                const copy = { ...prev };
                delete copy.celular;
                return copy;
              }
              return prev;
            });
          }
        })
        .catch(() => {});
    }
  }, [formData.celular]);

  useEffect(() => {
    const emailTrim = (formData.correo_electronico || '').trim();
    if (emailTrim.length >= 5 && emailTrim.includes('@')) {
      const timer = setTimeout(() => {
        api.checkAvailability({ correo: emailTrim })
          .then(res => {
            if (res && res.available === false) {
              setFieldErrors(prev => ({ ...prev, correo_electronico: res.message }));
            } else {
              setFieldErrors(prev => {
                if (prev.correo_electronico && prev.correo_electronico.includes('registrado')) {
                  const copy = { ...prev };
                  delete copy.correo_electronico;
                  return copy;
                }
                return prev;
              });
            }
          })
          .catch(() => {});
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [formData.correo_electronico]);

  useEffect(() => {
    if (formData.usa_whatsapp === 'No, otro número' && formData.numero_whatsapp_alterno && formData.numero_whatsapp_alterno.length === 9) {
      api.checkAvailability({ whatsapp_alterno: formData.numero_whatsapp_alterno })
        .then(res => {
          if (res && res.available === false) {
            setFieldErrors(prev => ({ ...prev, numero_whatsapp_alterno: res.message }));
          } else {
            setFieldErrors(prev => {
              if (prev.numero_whatsapp_alterno && prev.numero_whatsapp_alterno.includes('registrado')) {
                const copy = { ...prev };
                delete copy.numero_whatsapp_alterno;
                return copy;
              }
              return prev;
            });
          }
        })
        .catch(() => {});
    }
  }, [formData.usa_whatsapp, formData.numero_whatsapp_alterno]);

  useEffect(() => {
    if (isPersoneroMesa && formData.mesa_asignada && formData.mesa_asignada.length === 6) {
      api.checkAvailability({ rol: formData.rol_electoral, mesa: formData.mesa_asignada })
        .then(res => {
          if (res && res.available === false) {
            setFieldErrors(prev => ({ ...prev, mesa_asignada: res.message }));
          } else {
            setFieldErrors(prev => {
              if (prev.mesa_asignada && (prev.mesa_asignada.includes('asignado') || prev.mesa_asignada.includes('asignada'))) {
                const copy = { ...prev };
                delete copy.mesa_asignada;
                return copy;
              }
              return prev;
            });
          }
        })
        .catch(() => {});
    }
  }, [isPersoneroMesa, formData.mesa_asignada, formData.rol_electoral]);

  useEffect(() => {
    if (isCoordinadorLocal && formData.distrito_asignado && formData.local_asignado) {
      api.checkAvailability({ rol: formData.rol_electoral, distrito: formData.distrito_asignado, local: formData.local_asignado })
        .then(res => {
          if (res && res.available === false) {
            setFieldErrors(prev => ({ ...prev, local_asignado: res.message }));
          } else {
            setFieldErrors(prev => {
              if (prev.local_asignado && prev.local_asignado.includes('Cupo lleno')) {
                const copy = { ...prev };
                delete copy.local_asignado;
                return copy;
              }
              return prev;
            });
          }
        })
        .catch(() => {});
    }
  }, [isCoordinadorLocal, formData.distrito_asignado, formData.local_asignado, formData.rol_electoral]);

  useEffect(() => {
    if (isCoordinadorZonal && formData.distrito_asignado && formData.local_asignado) {
      api.checkAvailability({ rol: formData.rol_electoral, distrito: formData.distrito_asignado, local: formData.local_asignado })
        .then(res => {
          if (res && res.available === false) {
            setFieldErrors(prev => ({ ...prev, local_asignado: res.message }));
          } else {
            setFieldErrors(prev => {
              if (prev.local_asignado && prev.local_asignado.includes('asignado')) {
                const copy = { ...prev };
                delete copy.local_asignado;
                return copy;
              }
              return prev;
            });
          }
        })
        .catch(() => {});
    }
  }, [isCoordinadorZonal, formData.distrito_asignado, formData.local_asignado, formData.rol_electoral]);

  useEffect(() => {
    if (isCoordinadorDistrital && formData.distrito_asignado) {
      api.checkAvailability({ rol: formData.rol_electoral, distrito: formData.distrito_asignado })
        .then(res => {
          if (res && res.available === false) {
            setFieldErrors(prev => ({ ...prev, distrito_asignado: res.message }));
          } else {
            setFieldErrors(prev => {
              if (prev.distrito_asignado && prev.distrito_asignado.includes('Coordinador')) {
                const copy = { ...prev };
                delete copy.distrito_asignado;
                return copy;
              }
              return prev;
            });
          }
        })
        .catch(() => {});
    }
  }, [isCoordinadorDistrital, formData.distrito_asignado, formData.rol_electoral]);

  // Limpieza de error en tiempo real cuando el usuario edita
  const clearFieldError = (name) => {
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    clearFieldError(name);

    // Validación numérica estricta para DNI (máx 8 dígitos)
    if (name === 'dni') {
      const clean = value.replace(/\D/g, '').slice(0, 8);
      setFormData(prev => ({ ...prev, dni: clean }));
      return;
    }

    // Validación numérica estricta para Celular (máx 9 dígitos)
    if (name === 'celular') {
      const clean = value.replace(/\D/g, '').slice(0, 9);
      setFormData(prev => ({ ...prev, celular: clean }));
      return;
    }

    // Validación numérica estricta para WhatsApp Alternativo (máx 9 dígitos)
    if (name === 'numero_whatsapp_alterno') {
      const clean = value.replace(/\D/g, '').slice(0, 9);
      setFormData(prev => ({ ...prev, numero_whatsapp_alterno: clean }));
      return;
    }

    // Validación numérica estricta para Mesas (máx 6 dígitos)
    if (name === 'mesa_vota' || name === 'mesa_asignada') {
      const clean = value.replace(/\D/g, '').slice(0, 6);
      setFormData(prev => ({ ...prev, [name]: clean }));
      return;
    }

    // Al cambiar distrito_vota o distrito_asignado, resetear el local seleccionado si cambia
    if (name === 'distrito_vota') {
      setFormData(prev => ({ ...prev, distrito_vota: value, local_vota: '' }));
      return;
    }

    if (name === 'distrito_asignado') {
      setFormData(prev => ({ ...prev, distrito_asignado: value, local_asignado: isCoordinadorDistrital ? 'No aplica' : '' }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (role) => {
    clearFieldError('rol_electoral');
    clearFieldError('mesa_asignada');
    clearFieldError('local_asignado');
    clearFieldError('distrito_asignado');
    setFormData(prev => ({
      ...prev,
      rol_electoral: role,
      mesa_asignada: 'No aplica',
      local_asignado: (role === 'Coordinador Distrital' || role === 'Coordinador de Distritos')
        ? 'No aplica' 
        : (prev.local_asignado === 'No aplica' ? '' : prev.local_asignado)
    }));
  };

  const handleToggle = (field, value) => {
    clearFieldError(field);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Función de validación estricta ("sí o sí") con redirección al primer campo faltante
  const validateForm = () => {
    const errors = {};

    // 1. Datos Personales
    if (!formData.nombres_apellidos || formData.nombres_apellidos.trim().length < 3) {
      errors.nombres_apellidos = 'Ingrese sus nombres y apellidos completos.';
    }

    if (!formData.dni || formData.dni.trim().length !== 8) {
      errors.dni = 'El DNI debe contener exactamente 8 dígitos numéricos.';
    }

    if (!formData.celular || formData.celular.trim().length !== 9) {
      errors.celular = 'El celular debe contener exactamente 9 dígitos numéricos.';
    }

    // 2. Lugar de Votación
    if (!formData.distrito_vota || formData.distrito_vota.trim() === '') {
      errors.distrito_vota = 'Seleccione el distrito donde vota.';
    }

    if (!formData.local_vota || formData.local_vota.trim() === '') {
      errors.local_vota = 'Seleccione su colegio o local de votación.';
    }

    // 3. Rol y Asignación
    if (!formData.rol_electoral) {
      errors.rol_electoral = 'Seleccione su rol electoral.';
    }

    if (!formData.distrito_asignado || formData.distrito_asignado.trim() === '') {
      errors.distrito_asignado = 'Seleccione el distrito donde será asignado.';
    }

    if (!formData.local_asignado && !isCoordinadorDistrital) {
      errors.local_asignado = 'Seleccione el local de votación asignado.';
    }

    // 4. Compromiso y Logística
    if (!formData.tiene_experiencia) {
      errors.tiene_experiencia = 'Indique si tiene experiencia previa.';
    }

    if (!formData.cuenta_movilidad) {
      errors.cuenta_movilidad = 'Indique si cuenta con movilidad propia.';
    }

    if (!formData.se_compromete || !formData.se_compromete.includes('Sí')) {
      errors.se_compromete = 'Debe marcar la casilla obligatoria de compromiso para continuar.';
    }

    // Combinar con errores de duplicidad detectados en tiempo real (Nombres, DNI, Celular, Mesa, Local, Distrito)
    Object.keys(fieldErrors).forEach(k => {
      if (fieldErrors[k]) {
        errors[k] = fieldErrors[k];
      }
    });

    setFieldErrors(errors);

    // Si hay errores, hacer scroll y focus al primer campo faltante o duplicado
    const errorKeys = Object.keys(errors);
    if (errorKeys.length > 0) {
      const firstKey = errorKeys[0];
      const targetId = `field-${firstKey}`;
      const targetEl = document.getElementById(targetId) || document.querySelector(`[name="${firstKey}"]`);

      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
          if (targetEl.focus) targetEl.focus();
        }, 250);
      }

      setErrorMsg(`No se puede avanzar: ${errors[firstKey]}`);
      return false;
    }

    setErrorMsg(null);
    return true;
  };

  // Al hacer clic en "Registrar y Acreditar", primero valida todo y luego abre la vista de revisión
  const handlePreSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setShowReviewModal(true);
    }
  };

  // Envío final a la base de datos tras confirmación
  const handleFinalSubmit = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await api.registerPersonero(formData);
      if (res && res.status === 'success') {
        setShowReviewModal(false);
        const distKey = res.data?.claveAcceso || res.data?.['Clave de Acceso'];
        if (isCoordinadorDistrital && distKey) {
          setDistritalSuccessData({
            claveAcceso: distKey,
            dni: formData.dni,
            nombres: formData.nombres_apellidos,
            distrito: formData.distrito_asignado,
            data: res.data
          });
        } else if (onRegisteredSuccess) {
          onRegisteredSuccess(res.data);
        }
      } else {
        throw new Error(res?.message || 'Error al procesar el registro.');
      }
    } catch (err) {
      setShowReviewModal(false);
      setErrorMsg(err.message || 'Error al registrar personero.');
      // Scroll al inicio para ver el error
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'rgb(193, 229, 249)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '24px 16px',
      fontFamily: "'Outfit', 'Montserrat', sans-serif"
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '560px',
        padding: '28px 24px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)',
        border: '1px solid #cbd5e1',
        animation: 'fadeIn 0.25s ease-out'
      }}>
        
        {/* Cabecera */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
              Registro
            </h1>
            <div style={{ fontSize: '0.85rem', color: '#20488e', fontWeight: 700, marginTop: '2px' }}>
              Partido Democrático Somos Perú • Elecciones Municipales 2026
            </div>
          </div>

          <button
            type="button"
            onClick={onShowLogin}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 14px',
              borderRadius: '20px',
              border: '1px solid #fecaca',
              background: '#fef2f2',
              color: '#ef4444',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Ingresar</span>
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handlePreSubmit} noValidate style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {errorMsg && (
            <div style={{
              padding: '12px 16px',
              borderRadius: '12px',
              background: '#fef2f2',
              border: '1.5px solid #f87171',
              color: '#dc2626',
              fontSize: '0.84rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              animation: 'fadeIn 0.2s ease-in-out'
            }}>
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* SECCIÓN 1: DATOS PERSONALES */}
          <div style={{ border: fieldErrors.nombres_apellidos || fieldErrors.dni || fieldErrors.celular ? '2px solid #ef4444' : '1.5px solid #bae6fd', borderRadius: '14px', padding: '16px', background: '#fafbfc', transition: 'border 0.2s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', color: '#0284c7', fontWeight: 800, fontSize: '0.85rem' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgb(14, 165, 233)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 900 }}>1</div>
              <span>DATOS PERSONALES</span>
            </div>

            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label className="form-label" style={{ color: '#1e293b', fontSize: '0.8rem', fontWeight: 700 }}>
                Nombres y Apellidos <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <User className="w-4 h-4" style={{ position: 'absolute', left: '12px', top: '12px', color: fieldErrors.nombres_apellidos ? '#ef4444' : '#0284c7' }} />
                <input
                  id="field-nombres_apellidos"
                  type="text"
                  name="nombres_apellidos"
                  value={formData.nombres_apellidos}
                  onChange={handleChange}
                  placeholder="Ej. Juan Carlos Pérez Torres"
                  required
                  className="form-control"
                  style={{
                    paddingLeft: '36px',
                    background: '#ffffff',
                    border: fieldErrors.nombres_apellidos ? '2px solid #ef4444' : '1.5px solid #cbd5e1',
                    color: '#0f172a',
                    boxShadow: fieldErrors.nombres_apellidos ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : 'none'
                  }}
                />
              </div>
              {fieldErrors.nombres_apellidos && (
                <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{fieldErrors.nombres_apellidos}</span>
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
              <div>
                <label className="form-label" style={{ color: '#1e293b', fontSize: '0.8rem', fontWeight: 700 }}>
                  D.N.I. (8 dígitos) <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <CreditCard className="w-4 h-4" style={{ position: 'absolute', left: '12px', top: '12px', color: fieldErrors.dni ? '#ef4444' : '#0284c7' }} />
                  <input
                    id="field-dni"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    name="dni"
                    value={formData.dni}
                    onChange={handleChange}
                    placeholder="Ej. 12345678"
                    maxLength={8}
                    required
                    className="form-control"
                    style={{
                      paddingLeft: '36px',
                      background: '#ffffff',
                      border: fieldErrors.dni ? '2px solid #ef4444' : '1.5px solid #cbd5e1',
                      color: '#0f172a',
                      boxShadow: fieldErrors.dni ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : 'none'
                    }}
                  />
                </div>
                {fieldErrors.dni && (
                  <div style={{ color: '#ef4444', fontSize: '0.74rem', marginTop: '4px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{fieldErrors.dni}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="form-label" style={{ color: '#1e293b', fontSize: '0.8rem', fontWeight: 700 }}>
                  Celular (9 dígitos) <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone className="w-4 h-4" style={{ position: 'absolute', left: '12px', top: '12px', color: fieldErrors.celular ? '#ef4444' : '#0284c7' }} />
                  <input
                    id="field-celular"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    name="celular"
                    value={formData.celular}
                    onChange={handleChange}
                    placeholder="Ej. 987654321"
                    maxLength={9}
                    required
                    className="form-control"
                    style={{
                      paddingLeft: '36px',
                      background: '#ffffff',
                      border: fieldErrors.celular ? '2px solid #ef4444' : '1.5px solid #cbd5e1',
                      color: '#0f172a',
                      boxShadow: fieldErrors.celular ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : 'none'
                    }}
                  />
                </div>
                {fieldErrors.celular && (
                  <div style={{ color: '#ef4444', fontSize: '0.74rem', marginTop: '4px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{fieldErrors.celular}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: MI LUGAR DE VOTACIÓN */}
          <div style={{ border: fieldErrors.distrito_vota || fieldErrors.local_vota ? '2px solid #ef4444' : '1.5px solid #bae6fd', borderRadius: '14px', padding: '16px', background: '#fafbfc', transition: 'border 0.2s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', color: '#0284c7', fontWeight: 800, fontSize: '0.85rem' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgb(14, 165, 233)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 900 }}>2</div>
              <span>MI LUGAR DE VOTACIÓN</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {/* Distrito donde Vota */}
              <div>
                <label className="form-label" style={{ color: '#1e293b', fontSize: '0.8rem', fontWeight: 700 }}>
                  Distrito donde Vota <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <CustomSearchableSelect
                  id="field-distrito_vota"
                  name="distrito_vota"
                  value={formData.distrito_vota}
                  onChange={handleChange}
                  options={DISTRITOS_LIMA}
                  placeholder="Seleccione Distrito"
                  icon={MapPin}
                  required
                  hasError={!!fieldErrors.distrito_vota}
                  errorMsg={fieldErrors.distrito_vota}
                />
              </div>

              {/* Local de Votación */}
              <div>
                <label className="form-label" style={{ color: '#1e293b', fontSize: '0.8rem', fontWeight: 700 }}>
                  Local de Votación <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <CustomSearchableSelect
                  id="field-local_vota"
                  name="local_vota"
                  value={formData.local_vota}
                  onChange={handleChange}
                  options={localesVota}
                  placeholder={formData.distrito_vota ? `Seleccione Local de Votación en ${formData.distrito_vota}` : "Primero seleccione un distrito"}
                  icon={School}
                  required
                  disabled={!formData.distrito_vota}
                  hasError={!!fieldErrors.local_vota}
                  errorMsg={fieldErrors.local_vota}
                />
              </div>
            </div>
          </div>

          {/* SECCIÓN 3: ROL Y ASIGNACIÓN ELECTORAL */}
          <div style={{ border: fieldErrors.rol_electoral || fieldErrors.distrito_asignado || fieldErrors.local_asignado ? '2px solid #ef4444' : '1.5px solid #bae6fd', borderRadius: '14px', padding: '16px', background: '#fafbfc', transition: 'border 0.2s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', color: '#0284c7', fontWeight: 800, fontSize: '0.85rem' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgb(14, 165, 233)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 900 }}>3</div>
              <span>ROL Y ASIGNACIÓN ELECTORAL</span>
            </div>

            {/* Selector de Roles: 3 Botones Simétricos y Adaptativos */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px', marginBottom: '14px' }}>
              <button
                type="button"
                onClick={() => handleRoleChange('Personero de Mesa')}
                style={{
                  minHeight: '44px',
                  padding: '10px 8px',
                  borderRadius: '10px',
                  border: isPersoneroMesa ? '1.5px solid rgb(14, 165, 233)' : '1px solid #cbd5e1',
                  background: isPersoneroMesa ? 'rgb(14, 165, 233)' : '#ffffff',
                  color: isPersoneroMesa ? '#ffffff' : '#334155',
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transform: isPersoneroMesa ? 'scale(0.99)' : 'scale(1)',
                  boxShadow: isPersoneroMesa ? '0 4px 14px rgba(14, 165, 233, 0.35)' : 'none',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <Shield className="w-4 h-4 flex-shrink-0" />
                <span>Personero de Mesa</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('Personero de Local de Votación')}
                style={{
                  minHeight: '44px',
                  padding: '10px 8px',
                  borderRadius: '10px',
                  border: isCoordinadorLocal ? '1.5px solid rgb(14, 165, 233)' : '1px solid #cbd5e1',
                  background: isCoordinadorLocal ? 'rgb(14, 165, 233)' : '#ffffff',
                  color: isCoordinadorLocal ? '#ffffff' : '#334155',
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transform: isCoordinadorLocal ? 'scale(0.99)' : 'scale(1)',
                  boxShadow: isCoordinadorLocal ? '0 4px 14px rgba(14, 165, 233, 0.35)' : 'none',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <School className="w-4 h-4 flex-shrink-0" />
                <span>Personero de Local de Votación</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('Coordinador Distrital')}
                style={{
                  minHeight: '44px',
                  padding: '10px 8px',
                  borderRadius: '10px',
                  border: isCoordinadorDistrital ? '1.5px solid rgb(14, 165, 233)' : '1px solid #cbd5e1',
                  background: isCoordinadorDistrital ? 'rgb(14, 165, 233)' : '#ffffff',
                  color: isCoordinadorDistrital ? '#ffffff' : '#334155',
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transform: isCoordinadorDistrital ? 'scale(0.99)' : 'scale(1)',
                  boxShadow: isCoordinadorDistrital ? '0 4px 14px rgba(14, 165, 233, 0.35)' : 'none',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>Coordinador Distrital</span>
              </button>
            </div>

            {/* Campos condicionales según el rol */}
            {isCoordinadorDistrital ? (
              /* Caso Coordinador de Distritos: Solo Distrito Asignado */
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ color: '#1e293b', fontSize: '0.8rem', fontWeight: 700 }}>
                  Distrito Asignado (Donde es Coordinador) <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <CustomSearchableSelect
                  id="field-distrito_asignado"
                  name="distrito_asignado"
                  value={formData.distrito_asignado}
                  onChange={handleChange}
                  options={DISTRITOS_LIMA}
                  placeholder="Seleccione Distrito del que es Coordinador"
                  icon={MapPin}
                  required
                  hasError={!!fieldErrors.distrito_asignado}
                  errorMsg={fieldErrors.distrito_asignado}
                />
              </div>
            ) : isCoordinadorZonal ? (
              /* Caso Coordinador Zonal: Solo Distrito y Colegios Asignados (Múltiples) */
              <>
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label className="form-label" style={{ color: '#1e293b', fontSize: '0.8rem', fontWeight: 700 }}>
                    Distrito Asignado <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <CustomSearchableSelect
                    id="field-distrito_asignado"
                    name="distrito_asignado"
                    value={formData.distrito_asignado}
                    onChange={handleChange}
                    options={DISTRITOS_LIMA}
                    placeholder="Seleccione Distrito de la Zona"
                    icon={MapPin}
                    required
                    hasError={!!fieldErrors.distrito_asignado}
                    errorMsg={fieldErrors.distrito_asignado}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label className="form-label" style={{ color: '#1e293b', fontSize: '0.8rem', fontWeight: 700, margin: 0 }}>
                      Colegios / Locales de la Zona <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <span style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 700 }}>
                      (Escoger de 1 a más colegios)
                    </span>
                  </div>
                  <MultiSearchableSelect
                    id="field-local_asignado"
                    name="local_asignado"
                    value={formData.local_asignado}
                    onChange={handleChange}
                    options={localesAsignados}
                    assignedOptions={assignedLocalesAsignados}
                    placeholder={formData.distrito_asignado ? `Escribir o seleccionar colegios en ${formData.distrito_asignado}` : "Primero seleccione un distrito"}
                    icon={School}
                    required
                    disabled={!formData.distrito_asignado}
                    hasError={!!fieldErrors.local_asignado}
                    errorMsg={fieldErrors.local_asignado}
                  />
                </div>
              </>
            ) : (
              /* Caso Personero de Mesa o Coordinador de Local */
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {/* Distrito Asignado */}
                <div>
                  <label className="form-label" style={{ color: '#1e293b', fontSize: '0.8rem', fontWeight: 700 }}>
                    Distrito Asignado <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <CustomSearchableSelect
                    id="field-distrito_asignado"
                    name="distrito_asignado"
                    value={formData.distrito_asignado}
                    onChange={handleChange}
                    options={DISTRITOS_LIMA}
                    placeholder="Seleccione Distrito"
                    icon={MapPin}
                    required
                    hasError={!!fieldErrors.distrito_asignado}
                    errorMsg={fieldErrors.distrito_asignado}
                  />
                </div>

                {/* Local de Votación Asignado */}
                <div>
                  <label className="form-label" style={{ color: '#1e293b', fontSize: '0.8rem', fontWeight: 700 }}>
                    Local de Votación Asignado <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <CustomSearchableSelect
                    id="field-local_asignado"
                    name="local_asignado"
                    value={formData.local_asignado}
                    onChange={handleChange}
                    options={isCoordinadorLocal
                      ? localesAsignados.filter(loc => !assignedLocalesAsignados.some(al => al.toLowerCase().trim() === loc.toLowerCase().trim()))
                      : localesAsignados
                    }
                    placeholder={formData.distrito_asignado ? `Seleccione Local de Votación en ${formData.distrito_asignado}` : "Primero seleccione un distrito"}
                    icon={School}
                    required
                    disabled={!formData.distrito_asignado}
                    hasError={!!fieldErrors.local_asignado}
                    errorMsg={fieldErrors.local_asignado}
                  />
                </div>
              </div>
            )}
          </div>

          {/* SECCIÓN 4: COMPROMISO Y LOGÍSTICA */}
          <div style={{ border: fieldErrors.tiene_experiencia || fieldErrors.cuenta_movilidad || fieldErrors.se_compromete ? '2px solid #ef4444' : '1.5px solid #bae6fd', borderRadius: '14px', padding: '16px', background: '#fafbfc', transition: 'border 0.2s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', color: '#0284c7', fontWeight: 800, fontSize: '0.85rem' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgb(14, 165, 233)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 900 }}>4</div>
              <span>COMPROMISO Y LOGÍSTICA</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
              <div id="field-tiene_experiencia">
                <label className="form-label" style={{ color: '#1e293b', fontSize: '0.78rem', fontWeight: 700 }}>
                  ¿Tiene Experiencia como Personero? <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => handleToggle('tiene_experiencia', 'Sí')}
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      border: '1px solid rgb(14, 165, 233)',
                      background: formData.tiene_experiencia === 'Sí' ? 'rgb(14, 165, 233)' : '#ffffff',
                      color: formData.tiene_experiencia === 'Sí' ? '#ffffff' : '#334155',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      transform: formData.tiene_experiencia === 'Sí' ? 'scale(0.99)' : 'scale(1)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Sí
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggle('tiene_experiencia', 'No')}
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      border: '1px solid rgb(14, 165, 233)',
                      background: formData.tiene_experiencia === 'No' ? 'rgb(14, 165, 233)' : '#ffffff',
                      color: formData.tiene_experiencia === 'No' ? '#ffffff' : '#334155',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      transform: formData.tiene_experiencia === 'No' ? 'scale(0.99)' : 'scale(1)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    No
                  </button>
                </div>
              </div>

              <div id="field-cuenta_movilidad">
                <label className="form-label" style={{ color: '#1e293b', fontSize: '0.78rem', fontWeight: 700 }}>
                  ¿Cuenta con Movilidad Propia? <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => handleToggle('cuenta_movilidad', 'Sí')}
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      border: '1px solid rgb(14, 165, 233)',
                      background: formData.cuenta_movilidad === 'Sí' ? 'rgb(14, 165, 233)' : '#ffffff',
                      color: formData.cuenta_movilidad === 'Sí' ? '#ffffff' : '#334155',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      transform: formData.cuenta_movilidad === 'Sí' ? 'scale(0.99)' : 'scale(1)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Sí
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggle('cuenta_movilidad', 'No')}
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      border: '1px solid rgb(14, 165, 233)',
                      background: formData.cuenta_movilidad === 'No' ? 'rgb(14, 165, 233)' : '#ffffff',
                      color: formData.cuenta_movilidad === 'No' ? '#ffffff' : '#334155',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      transform: formData.cuenta_movilidad === 'No' ? 'scale(0.99)' : 'scale(1)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>

            <div className="form-group" id="field-se_compromete" style={{ marginBottom: 0 }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: fieldErrors.se_compromete ? '2px solid #ef4444' : (formData.se_compromete ? '1.5px solid rgb(14, 165, 233)' : '1px solid #cbd5e1'),
                  background: formData.se_compromete ? 'rgba(14, 165, 233, 0.08)' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  userSelect: 'none'
                }}
              >
                <input
                  type="checkbox"
                  id="checkbox-se_compromete"
                  name="se_compromete"
                  checked={Boolean(formData.se_compromete && formData.se_compromete.includes('Sí'))}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setFormData(prev => ({
                      ...prev,
                      se_compromete: checked ? 'Sí, me comprometo a asistir el 4 de Octubre del 2026' : ''
                    }));
                    if (fieldErrors.se_compromete) {
                      setFieldErrors(prev => ({ ...prev, se_compromete: null }));
                    }
                  }}
                  style={{
                    width: '18px',
                    height: '18px',
                    accentColor: 'rgb(14, 165, 233)',
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                />
                <span style={{ fontSize: '0.84rem', fontWeight: 800, color: formData.se_compromete ? '#0284c7' : '#1e293b' }}>
                  Sí, me comprometo a asistir el 4 de Octubre del 2026 <span style={{ color: '#ef4444' }}>*</span>
                </span>
              </label>
              {fieldErrors.se_compromete && (
                <span style={{ color: '#ef4444', fontSize: '0.72rem', fontWeight: 700, marginTop: '4px', display: 'block' }}>
                  {fieldErrors.se_compromete}
                </span>
              )}
            </div>
          </div>

          {/* BOTÓN REGISTRAR Y ACREDITAR */}
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '14px',
              borderRadius: '12px',
              border: 'none',
              background: 'rgb(14, 165, 233)',
              color: '#ffffff',
              fontWeight: 900,
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 15px rgba(14, 165, 233, 0.45)',
              marginTop: '6px',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.98)'; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Revisar y Continuar Registro</span>
          </button>
        </form>
      </div>

      {/* MODAL DE REVISIÓN Y CONFIRMACIÓN PREVIA AL ENVÍO */}
      {showReviewModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '16px',
          zIndex: 9999,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            maxWidth: '540px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #cbd5e1',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            
            {/* Encabezado del Modal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1.5px solid #f1f5f9', paddingBottom: '12px' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>📋 Revisión de Datos</span>
                </h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                  Revise todos sus datos antes de enviarlos al sistema oficial de Somos Perú. Puede modificarlos si lo desea.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido de la Ficha Resumen */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              {/* Bloque 1: Personales */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 14px' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0284c7', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  1. Datos Personales
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.82rem' }}>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.74rem' }}>Nombres y Apellidos</span>
                    <strong style={{ color: '#0f172a' }}>{formData.nombres_apellidos}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.74rem' }}>D.N.I.</span>
                    <strong style={{ color: '#0f172a' }}>{formData.dni}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.74rem' }}>Celular Principal</span>
                    <strong style={{ color: '#0f172a' }}>{formData.celular}</strong>
                  </div>
                </div>
              </div>

              {/* Bloque 2: Lugar de Votación */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 14px' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0284c7', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  2. Lugar Donde Vota
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.82rem' }}>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.74rem' }}>Distrito</span>
                    <strong style={{ color: '#0f172a' }}>{formData.distrito_vota}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.74rem' }}>Local de Votación</span>
                    <strong style={{ color: '#0f172a' }}>{formData.local_vota}</strong>
                  </div>
                </div>
              </div>

              {/* Bloque 3: Asignación */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 14px' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0284c7', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  3. Asignación Electoral
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: isCoordinadorDistrital ? '1fr 1fr' : '1fr 1fr', gap: '8px', fontSize: '0.82rem' }}>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.74rem' }}>Rol Solicitado</span>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      background: '#e0f2fe',
                      color: '#0369a1',
                      fontWeight: 800,
                      fontSize: '0.78rem'
                    }}>
                      {formData.rol_electoral}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.74rem' }}>Distrito Asignado</span>
                    <strong style={{ color: '#0f172a' }}>{formData.distrito_asignado}</strong>
                  </div>
                  {isCoordinadorZonal ? (
                    <div style={{ gridColumn: 'span 2' }}>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '0.74rem' }}>Locales de Votación Asignados ({formData.local_asignado ? formData.local_asignado.split(',').length : 0})</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                        {(formData.local_asignado || '').split(',').map((sch, i) => (
                          <span key={i} style={{ background: '#0284c7', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                            {sch.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : !isCoordinadorDistrital ? (
                    <div style={{ gridColumn: 'span 2' }}>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '0.74rem' }}>Local Asignado</span>
                      <strong style={{ color: '#0f172a' }}>{formData.local_asignado}</strong>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Bloque 4: Compromiso */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 14px' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0284c7', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  4. Logística y Compromiso
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.82rem' }}>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.74rem' }}>¿Experiencia Previa?</span>
                    <strong style={{ color: '#0f172a' }}>{formData.tiene_experiencia}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.74rem' }}>¿Movilidad Propia?</span>
                    <strong style={{ color: '#0f172a' }}>{formData.cuenta_movilidad}</strong>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.74rem' }}>Compromiso</span>
                    <strong style={{ color: formData.se_compromete.includes('Sí') ? '#16a34a' : '#ef4444' }}>
                      {formData.se_compromete}
                    </strong>
                  </div>
                </div>
              </div>

            </div>

            {/* Botones de Acción del Modal */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px', borderTop: '1.5px solid #f1f5f9', paddingTop: '16px' }}>
              
              {/* Botón para regresar a editar en cualquier momento */}
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#334155',
                  fontWeight: 800,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
              >
                <Edit3 className="w-4 h-4 text-sky-600" />
                <span>✏️ Modificar / Editar</span>
              </button>

              {/* Botón de Confirmación y Envío Final */}
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={loading}
                style={{
                  flex: 1.3,
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'rgb(14, 165, 233)',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '0.88rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 14px rgba(14, 165, 233, 0.4)'
                }}
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'Registrando y Acreditando...' : '✅ Confirmar y Acreditar'}</span>
              </button>

            </div>

          </div>
        </div>
      )}

      {/* Modal Informativo de Clave Generada para Coordinador Distrital */}
      {distritalSuccessData && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10000,
          padding: '16px',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            maxWidth: '480px',
            width: '100%',
            padding: '28px 24px',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.3)',
            textAlign: 'center',
            border: '2px solid #0284c7'
          }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Lock className="w-8 h-8" />
            </div>

            <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0f172a', margin: '0 0 6px 0' }}>
              ¡Registro de Coordinador Distrital Exitoso!
            </h2>
            <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '0 0 18px 0' }}>
              Se ha generado tu clave de acceso personalizada para el distrito de <strong>{distritalSuccessData.distrito}</strong>.
            </p>

            <div style={{
              background: '#f8fafc',
              border: '2px dashed #0284c7',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                Tu Clave de Acceso para Iniciar Sesión:
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0284c7', letterSpacing: '2px', fontFamily: 'monospace' }}>
                {distritalSuccessData.claveAcceso}
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(distritalSuccessData.claveAcceso);
                  setCopiedKey(true);
                  setTimeout(() => setCopiedKey(false), 2000);
                }}
                style={{
                  marginTop: '10px',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#334155',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {copiedKey ? '✅ ¡Copiado!' : '📋 Copiar Clave'}
              </button>
            </div>

            <div style={{ fontSize: '0.76rem', color: '#64748b', marginBottom: '20px', lineHeight: 1.4 }}>
              ⚠️ <strong>Importante:</strong> Guarda esta clave. Para ingresar al sistema, introduce tu nombre o DNI y esta <strong>clave de acceso</strong>.
            </div>

            <button
              type="button"
              onClick={() => {
                if (onRegisteredSuccess) {
                  onRegisteredSuccess(distritalSuccessData.data);
                }
              }}
              style={{
                width: '100%',
                padding: '14px 20px',
                borderRadius: '12px',
                border: 'none',
                background: '#0284c7',
                color: '#ffffff',
                fontWeight: 900,
                fontSize: '0.92rem',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)'
              }}
            >
              🚀 Entendido, Ir a Iniciar Sesión
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default RegistrationView;
