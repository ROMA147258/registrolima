import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Save, 
  MapPin, 
  School, 
  Table, 
  Award, 
  Shield, 
  User, 
  Phone, 
  Trash2, 
  AlertTriangle, 
  Search, 
  Check, 
  ChevronDown, 
  CheckSquare, 
  Square,
  Sparkles
} from 'lucide-react';
import { SelectField } from '../forms/SelectField.jsx';
import { InputField } from '../forms/InputField.jsx';
import { DISTRITOS_LIMA, ROLES } from '../../constants/catalogs.js';
import { api } from '../../services/api.js';

// Componente de Selección Múltiple con Buscador y Filtro en Vivo para Coordinador Zonal
function MultiSchoolSearchSelect({
  value = '',
  onChange,
  locales = [],
  distrito = '',
  disabled = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lista de colegios seleccionados actualmente
  const selectedList = (value || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  // Normalizar opciones de locales
  const normalizedLocales = locales.map(loc => 
    typeof loc === 'string' ? loc : (loc.colegio || loc.nombre || loc.local || '')
  ).filter(Boolean);

  // Filtrar según el término de búsqueda (insensible a mayúsculas y acentos)
  const filteredLocales = normalizedLocales.filter(loc => {
    if (!searchTerm.trim()) return true;
    const cleanSearch = searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const cleanLoc = loc.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return cleanLoc.includes(cleanSearch);
  });

  const toggleSchool = (schoolName) => {
    const norm = schoolName.trim();
    const isSelected = selectedList.some(s => s.toLowerCase() === norm.toLowerCase());
    let updated;
    if (isSelected) {
      updated = selectedList.filter(s => s.toLowerCase() !== norm.toLowerCase());
    } else {
      updated = [...selectedList, norm];
    }
    onChange(updated.join(', '));
  };

  const removeTag = (schoolName, e) => {
    e.stopPropagation();
    const norm = schoolName.trim().toLowerCase();
    const updated = selectedList.filter(s => s.toLowerCase() !== norm);
    onChange(updated.join(', '));
  };

  const selectAllFiltered = (e) => {
    e.stopPropagation();
    const currentSet = new Set(selectedList.map(s => s.toLowerCase()));
    const newItems = [...selectedList];
    filteredLocales.forEach(loc => {
      if (!currentSet.has(loc.toLowerCase())) {
        currentSet.add(loc.toLowerCase());
        newItems.push(loc);
      }
    });
    onChange(newItems.join(', '));
  };

  const clearAll = (e) => {
    e.stopPropagation();
    onChange('');
  };

  return (
    <div className="form-group" style={{ position: 'relative', width: '100%' }}>
      {/* Label con icono y contador */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <label className="form-label" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#0284c7', fontSize: '0.85rem' }}>
          <School className="w-4 h-4 text-sky-400" />
          <span>Locales de Votación Asignados a la Zona</span>
          <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <span style={{ 
          fontSize: '0.74rem', 
          fontWeight: 800, 
          padding: '2px 8px', 
          borderRadius: '12px', 
          background: selectedList.length > 0 ? 'rgba(2, 132, 199, 0.15)' : '#f1f5f9',
          color: selectedList.length > 0 ? '#0284c7' : '#64748b'
        }}>
          {selectedList.length} {selectedList.length === 1 ? 'local seleccionado' : 'locales seleccionados'}
        </span>
      </div>

      <div ref={containerRef} style={{ position: 'relative' }}>
        {/* Caja de Selección Interactiva con Chips y Campo de Búsqueda */}
        <div
          onClick={() => {
            if (!disabled && distrito) {
              setIsOpen(true);
              if (searchInputRef.current) searchInputRef.current.focus();
            }
          }}
          style={{
            background: disabled ? '#f8fafc' : '#ffffff',
            border: isOpen ? '2px solid #0284c7' : '1.5px solid #cbd5e1',
            borderRadius: '10px',
            padding: '6px 36px 6px 12px',
            minHeight: '44px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '6px',
            position: 'relative',
            cursor: !distrito ? 'not-allowed' : (disabled ? 'default' : 'text'),
            boxShadow: isOpen ? '0 0 0 3px rgba(2, 132, 199, 0.15)' : 'none',
            transition: 'all 0.15s ease'
          }}
        >
          {/* Chips de locales seleccionados */}
          {selectedList.map((item, idx) => (
            <span
              key={idx}
              style={{
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#ffffff',
                fontSize: '0.74rem',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                maxWidth: '100%',
                lineHeight: '1.2',
                boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
              }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item}</span>
              {!disabled && (
                <X
                  className="w-3.5 h-3.5"
                  style={{ cursor: 'pointer', flexShrink: 0, opacity: 0.85 }}
                  onClick={(e) => removeTag(item, e)}
                  title="Quitar local"
                />
              )}
            </span>
          ))}

          {/* Input de filtro para buscar locales en vivo */}
          <div style={{ display: 'flex', alignItems: 'center', flex: '1 1 150px', minWidth: '150px', position: 'relative' }}>
            <Search className="w-3.5 h-3.5" style={{ color: '#94a3b8', marginRight: '6px', flexShrink: 0 }} />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (!isOpen) setIsOpen(true);
              }}
              onFocus={() => {
                if (distrito && !disabled) setIsOpen(true);
              }}
              placeholder={
                !distrito 
                  ? "Seleccione primero el distrito..." 
                  : (selectedList.length === 0 ? "Buscar y escoger locales del distrito..." : "Buscar para agregar otro...")
              }
              disabled={disabled || !distrito}
              autoComplete="off"
              style={{
                border: 'none',
                outline: 'none',
                fontSize: '0.84rem',
                color: '#0f172a',
                background: 'transparent',
                width: '100%',
                height: '28px',
                padding: 0
              }}
            />
          </div>

          <ChevronDown
            className="w-4 h-4"
            onClick={(e) => {
              e.stopPropagation();
              if (distrito && !disabled) setIsOpen(!isOpen);
            }}
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: `translateY(-50%) rotate(${isOpen ? 180 : 0}deg)`,
              color: '#64748b',
              cursor: distrito ? 'pointer' : 'default',
              transition: 'transform 0.2s ease'
            }}
          />
        </div>

        {/* Panel Desplegable con Filtro y Lista de Locales */}
        {isOpen && !disabled && distrito && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            background: '#ffffff',
            border: '1.5px solid #0284c7',
            borderRadius: '10px',
            boxShadow: '0 14px 35px rgba(0, 0, 0, 0.18)',
            maxHeight: '260px',
            overflowY: 'auto',
            zIndex: 1100,
            animation: 'fadeIn 0.15s ease-out'
          }}>
            {/* Header del dropdown con info y botones rápidos */}
            <div style={{
              padding: '8px 12px',
              background: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              fontSize: '0.74rem',
              fontWeight: 700,
              color: '#475569',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'sticky',
              top: 0,
              zIndex: 2
            }}>
              <span>
                {filteredLocales.length} {filteredLocales.length === 1 ? 'local disponible' : 'locales disponibles'} en {distrito}
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {filteredLocales.length > 0 && (
                  <button
                    type="button"
                    onClick={selectAllFiltered}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#0284c7',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      padding: 0,
                      textDecoration: 'underline'
                    }}
                  >
                    Marcar visibles
                  </button>
                )}
                {selectedList.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAll}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    Limpiar
                  </button>
                )}
              </div>
            </div>

            {/* Listado de Colegios con Checkboxes */}
            {filteredLocales.length > 0 ? (
              filteredLocales.map((school, idx) => {
                const isSelected = selectedList.some(s => s.toLowerCase() === school.trim().toLowerCase());
                return (
                  <div
                    key={idx}
                    onClick={() => toggleSchool(school)}
                    style={{
                      padding: '10px 14px',
                      fontSize: '0.84rem',
                      fontWeight: isSelected ? 800 : 500,
                      color: isSelected ? '#0369a1' : '#0f172a',
                      background: isSelected ? '#f0f9ff' : '#ffffff',
                      cursor: 'pointer',
                      borderBottom: idx !== filteredLocales.length - 1 ? '1px solid #f1f5f9' : 'none',
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '9px', flex: 1, paddingRight: '8px' }}>
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-sky-600 flex-shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      )}
                      <span>{school}</span>
                    </div>
                    {isSelected && (
                      <span style={{ 
                        fontSize: '0.7rem', 
                        fontWeight: 800, 
                        color: '#0284c7', 
                        background: '#e0f2fe', 
                        padding: '2px 6px', 
                        borderRadius: '4px' 
                      }}>
                        Asignado
                      </span>
                    )}
                  </div>
                );
              })
            ) : (
              <div style={{ padding: '16px', textAlign: 'center', color: '#64748b', fontSize: '0.82rem' }}>
                {searchTerm 
                  ? `No se encontró ningún colegio con "${searchTerm}"` 
                  : 'No hay colegios registrados para este distrito'}
              </div>
            )}
          </div>
        )}
      </div>

      <span style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 600, display: 'block', marginTop: '4px' }}>
        💡 Escriba en el buscador para filtrar y marque los colegios que conforman la zona de este coordinador.
      </span>
    </div>
  );
}

// Componente de Selección Simple con Buscador para otros roles
function SingleSchoolSearchSelect({
  value = '',
  onChange,
  locales = [],
  distrito = '',
  disabled = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const normalizedLocales = locales.map(loc => 
    typeof loc === 'string' ? loc : (loc.colegio || loc.nombre || loc.local || '')
  ).filter(Boolean);

  const filteredLocales = normalizedLocales.filter(loc => {
    if (!searchTerm.trim()) return true;
    const cleanSearch = searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const cleanLoc = loc.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return cleanLoc.includes(cleanSearch);
  });

  return (
    <div className="form-group" style={{ position: 'relative', width: '100%' }}>
      <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
        <School className="w-4 h-4 text-sky-400" />
        <span>Centro de Votación Asignado</span>
      </label>

      <div ref={containerRef} style={{ position: 'relative' }}>
        <div
          onClick={() => {
            if (distrito && !disabled) setIsOpen(!isOpen);
          }}
          style={{
            background: disabled ? '#f8fafc' : '#ffffff',
            border: isOpen ? '2px solid #0284c7' : '1.5px solid #cbd5e1',
            borderRadius: '10px',
            padding: '9px 36px 9px 12px',
            minHeight: '42px',
            display: 'flex',
            alignItems: 'center',
            cursor: !distrito ? 'not-allowed' : (disabled ? 'default' : 'pointer'),
            boxShadow: isOpen ? '0 0 0 3px rgba(2, 132, 199, 0.15)' : 'none',
            fontSize: '0.86rem',
            color: value ? '#0f172a' : '#94a3b8',
            fontWeight: value ? 600 : 400
          }}
        >
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
            {value || (!distrito ? "Seleccione primero el distrito..." : "Seleccionar local de votación...")}
          </span>
          <ChevronDown
            className="w-4 h-4"
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: `translateY(-50%) rotate(${isOpen ? 180 : 0}deg)`,
              color: '#64748b',
              transition: 'transform 0.2s ease'
            }}
          />
        </div>

        {isOpen && !disabled && distrito && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            background: '#ffffff',
            border: '1.5px solid #0284c7',
            borderRadius: '10px',
            boxShadow: '0 14px 35px rgba(0, 0, 0, 0.18)',
            maxHeight: '260px',
            overflowY: 'auto',
            zIndex: 1100
          }}>
            {/* Input de Búsqueda rápida */}
            <div style={{ padding: '8px 10px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', position: 'sticky', top: 0, zIndex: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '4px 8px' }}>
                <Search className="w-3.5 h-3.5 text-slate-400" style={{ marginRight: '6px' }} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Escriba para filtrar local de votación..."
                  autoFocus
                  style={{ border: 'none', outline: 'none', fontSize: '0.82rem', width: '100%', color: '#0f172a' }}
                />
              </div>
            </div>

            {filteredLocales.length > 0 ? (
              filteredLocales.map((school, idx) => {
                const isSelected = value.trim().toLowerCase() === school.trim().toLowerCase();
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      onChange(school);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    style={{
                      padding: '10px 14px',
                      fontSize: '0.84rem',
                      fontWeight: isSelected ? 800 : 500,
                      color: isSelected ? '#0369a1' : '#0f172a',
                      background: isSelected ? '#f0f9ff' : '#ffffff',
                      cursor: 'pointer',
                      borderBottom: idx !== filteredLocales.length - 1 ? '1px solid #f1f5f9' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
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
                    <span>{school}</span>
                    {isSelected && <Check className="w-4 h-4 text-sky-600" />}
                  </div>
                );
              })
            ) : (
              <div style={{ padding: '14px', textAlign: 'center', color: '#64748b', fontSize: '0.82rem' }}>
                No se encontraron locales de votación con esa búsqueda
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import { useAuth } from '../../context/AuthContext.jsx';

export function EditAssignmentModal({ personero, onClose, onSaved }) {
  const { isSuperAdmin, isCoordinadorDistrital, user: authUser } = useAuth();
  
  // El Coordinador Distrital solo puede editar Mesa y Centro de Votación dentro de su distrito
  const isLimitedCoordinator = !isSuperAdmin && isCoordinadorDistrital;

  const rawMesa = personero?.['Mesa Asignada'] ?? personero?.mesaAsignada ?? '';
  const initialMesa = (rawMesa === '-' || String(rawMesa).trim().toLowerCase() === 'no aplica') ? '' : String(rawMesa);

  const initialDistrito = personero['Distrito Asignado'] || personero['Distrito donde Vota'] || personero.distritoAsignado || (isLimitedCoordinator ? (authUser?.['Distrito Asignado'] || authUser?.distritoAsignado || '') : '');

  const [formData, setFormData] = useState({
    nombresApellidos: personero['Nombres y Apellidos'] || personero.nombresApellidos || '',
    celular: personero['Celular'] || personero.celular || '',
    distritoAsignado: initialDistrito,
    localAsignado: personero['Local de Votación Asignado'] || personero['Local de Votación'] || personero.localDeVotacionAsignado || '',
    mesaAsignada: initialMesa,
    rolADesempenar: personero['Rol a Desempeñar'] || personero.rolADesempenar || 'Personero de Mesa',
    credenciales: personero['Credenciales'] || personero.credenciales || 'Bloqueado'
  });

  const [locales, setLocales] = useState([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const dni = personero['D.N.I.'] || personero['DNI'] || personero.dni;
  const isZonal = !isLimitedCoordinator && ((formData.rolADesempenar || '').toLowerCase().includes('zonal') || (formData.rolADesempenar || '').toLowerCase().includes('zona'));
  const isMesa = (formData.rolADesempenar || '').toLowerCase().includes('personero') || isLimitedCoordinator;

  useEffect(() => {
    if (formData.distritoAsignado) {
      api.getLocales(formData.distritoAsignado)
        .then(res => setLocales(res.data || []))
        .catch(() => setLocales([]));
    } else {
      setLocales([]);
    }
  }, [formData.distritoAsignado]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'mesaAsignada') {
      const clean = value.replace(/\D/g, '').slice(0, 6);
      setFormData(prev => ({ ...prev, mesaAsignada: clean }));
      return;
    }
    if (name === 'celular') {
      const clean = value.replace(/\D/g, '').slice(0, 9);
      setFormData(prev => ({ ...prev, celular: clean }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    try {
      // Si es coordinador distrital, enviamos solo los campos que tiene permiso de modificar
      const payload = isLimitedCoordinator ? {
        localAsignado: formData.localAsignado,
        mesaAsignada: formData.mesaAsignada,
        distritoAsignado: formData.distritoAsignado
      } : formData;

      await api.updatePersonero(dni, payload);
      onSaved();
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Error al guardar cambios');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isSuperAdmin) {
      alert('Solo el Superadministrador tiene permisos para eliminar personeros del sistema.');
      return;
    }

    const confirmDelete = window.confirm(`⚠️ ACCIÓN DE SUPERADMINISTRADOR:\n\n¿Está seguro de eliminar definitivamente a "${formData.nombresApellidos}" (DNI: ${dni}) de la base de datos?\n\nEsta acción no se puede deshacer.`);
    if (!confirmDelete) return;

    setDeleting(true);
    setErrorMsg(null);
    try {
      await api.deletePersonero(dni);
      onSaved();
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Error al eliminar personero');
      setDeleting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '640px', maxHeight: '92vh', overflowY: 'auto' }}>
        
        {/* Header */}
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0284c7', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles className="w-5 h-5 text-sky-500" />
              <span>{isSuperAdmin ? 'Modificar Registro y Asignación (Superadmin)' : 'Asignar Centro de Votación y Mesa'}</span>
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>
              {isSuperAdmin ? 'Control total y eliminación de registros' : 'Panel de Coordinación Distrital'} &bull; DNI: <strong>{dni}</strong>
            </span>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Banner Informativo para Coordinador Distrital */}
        {isLimitedCoordinator && (
          <div style={{
            marginTop: '12px',
            background: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '10px',
            padding: '10px 14px',
            fontSize: '0.78rem',
            color: '#0369a1',
            lineHeight: 1.4,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Shield className="w-4 h-4 text-sky-600 flex-shrink-0" />
            <span>
              <strong>Modo Coordinador Distrital:</strong> Puedes reasignar el <strong>Centro de Votación</strong> y el <strong>Número de Mesa</strong> de los personeros de tu distrito ({formData.distritoAsignado}). Los datos personales permanecen protegidos.
            </span>
          </div>
        )}

        {/* Body */}
        <form onSubmit={handleSave} className="modal-body" style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {errorMsg && (
            <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Nombres y Celular */}
          {isSuperAdmin ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              <InputField
                label="Nombres y Apellidos"
                icon={User}
                name="nombresApellidos"
                value={formData.nombresApellidos}
                onChange={handleChange}
                placeholder="Nombres completos"
                required
              />
              <InputField
                label="Celular"
                icon={Phone}
                name="celular"
                value={formData.celular}
                onChange={handleChange}
                placeholder="9 dígitos"
                maxLength={9}
                required
              />
            </div>
          ) : (
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '12px 14px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
              fontSize: '0.8rem'
            }}>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block' }}>NOMBRES Y APELLIDOS</span>
                <strong style={{ color: '#0f172a', fontSize: '0.9rem' }}>{formData.nombresApellidos}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block' }}>CELULAR</span>
                <strong style={{ color: '#16a34a', fontSize: '0.9rem' }}>{formData.celular || 'Sin registrar'}</strong>
              </div>
            </div>
          )}

          {/* Rol y Credencial */}
          {isSuperAdmin ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              <SelectField
                label="Rol a Desempeñar"
                icon={Award}
                name="rolADesempenar"
                value={formData.rolADesempenar}
                onChange={handleChange}
                options={ROLES}
                required
              />
              <SelectField
                label="Estado de Credencial"
                icon={Shield}
                name="credenciales"
                value={formData.credenciales}
                onChange={handleChange}
                options={['Bloqueado', 'Confirmado']}
              />
            </div>
          ) : (
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '10px 14px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.78rem'
            }}>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block' }}>ROL ASIGNADO</span>
                <strong style={{ color: '#0284c7' }}>{formData.rolADesempenar}</strong>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block' }}>DISTRITO</span>
                <strong style={{ color: '#0f172a' }}>{formData.distritoAsignado}</strong>
              </div>
            </div>
          )}

          {/* Distrito para Superadmin */}
          {isSuperAdmin && (
            <div style={{ display: 'grid', gridTemplateColumns: isMesa ? 'repeat(auto-fit, minmax(220px, 1fr))' : '1fr', gap: '12px' }}>
              <SelectField
                label="Distrito Asignado"
                icon={MapPin}
                name="distritoAsignado"
                value={formData.distritoAsignado}
                onChange={handleChange}
                options={DISTRITOS_LIMA}
                required
              />
            </div>
          )}

          {/* Centro de Votación Asignado (Editable tanto para Superadmin como para Coordinador Distrital) */}
          {isZonal ? (
            <MultiSchoolSearchSelect
              value={formData.localAsignado}
              onChange={(newVal) => setFormData(prev => ({ ...prev, localAsignado: newVal }))}
              locales={locales}
              distrito={formData.distritoAsignado}
            />
          ) : (
            <SingleSchoolSearchSelect
              value={formData.localAsignado}
              onChange={(newVal) => setFormData(prev => ({ ...prev, localAsignado: newVal }))}
              locales={locales}
              distrito={formData.distritoAsignado}
            />
          )}

          {/* Mesa Asignada (Editable tanto para Superadmin como para Coordinador Distrital) */}
          <div>
            <InputField
              label="Mesa Asignada"
              icon={Table}
              name="mesaAsignada"
              value={formData.mesaAsignada}
              onChange={handleChange}
              placeholder="Ej. 064321 (6 dígitos de la mesa)"
              maxLength={6}
            />
            <span style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 600, display: 'block', marginTop: '2px' }}>
              💡 Ingrese el número de mesa de 6 dígitos asignada al personero en este centro de votación.
            </span>
          </div>

          {/* Footer: Guardar y Eliminar (Solo Superadmin puede eliminar) */}
          <div className="modal-footer" style={{ marginTop: '16px', padding: '14px 0 0 0', display: 'flex', justifyContent: isSuperAdmin ? 'space-between' : 'flex-end', alignItems: 'center', flexWrap: 'wrap', gap: '10px', borderTop: '1px solid #334155' }}>
            {isSuperAdmin && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting || saving}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: '1px solid #ef4444',
                  background: '#fef2f2',
                  color: '#dc2626',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: (deleting || saving) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease',
                  flex: '1 1 160px'
                }}
              >
                <Trash2 className="w-4 h-4" />
                <span>{deleting ? 'Eliminando de la BD...' : 'Eliminar Personero'}</span>
              </button>
            )}

            <button
              type="submit"
              disabled={saving || deleting}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '10px 24px',
                borderRadius: '8px',
                background: 'rgb(14, 165, 233)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.85rem',
                border: 'none',
                cursor: (saving || deleting) ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 8px rgba(14, 165, 233, 0.35)',
                flex: isSuperAdmin ? '1 1 160px' : '0 0 auto'
              }}
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Actualizando...' : (isSuperAdmin ? 'Guardar Cambios' : 'Actualizar Asignación')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
