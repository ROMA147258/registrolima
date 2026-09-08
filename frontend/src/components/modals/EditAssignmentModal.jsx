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
  Sparkles,
  Video,
  FileText
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
  assignedLocales = [],
  originalSchools = [],
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

  const cleanStr = (str) =>
    (str || '')
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\bi\.?e\.?p?\b/g, "ie")
      .replace(/\binstitucion\s+educativa\b/g, "ie")
      .replace(/\bcolegio\b/g, "ie");

  // Normalizar opciones de locales
  const normalizedLocales = locales.map(loc => 
    typeof loc === 'string' ? loc : (loc.colegio || loc.nombre || loc.local || '')
  ).filter(Boolean);

  const searchKeywords = cleanStr(searchTerm)
    .split(/\s+/)
    .filter(k => k.length > 0);

  // Filtrar según el término de búsqueda (insensible a mayúsculas y acentos)
  const filteredLocales = normalizedLocales.filter(loc => {
    if (searchKeywords.length === 0) return true;
    const cleanLoc = cleanStr(loc);
    return searchKeywords.every(kw => cleanLoc.includes(kw));
  });

  const isOwnSchool = (schoolName) =>
    originalSchools.some(os => os.trim().toLowerCase() === schoolName.trim().toLowerCase());

  const toggleSchool = (schoolName) => {
    const norm = schoolName.trim();
    const isSelected = selectedList.some(s => s.toLowerCase() === norm.toLowerCase());
    const isOccupied = !isSelected && !isOwnSchool(norm) && assignedLocales.some(al => al.trim().toLowerCase() === norm.toLowerCase());

    if (isOccupied) {
      alert(`El colegio "${norm}" ya se encuentra asignado a otro Coordinador Zonal en este distrito.`);
      return;
    }

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
      const isOccupied = !isOwnSchool(loc) && assignedLocales.some(al => al.trim().toLowerCase() === loc.trim().toLowerCase());
      if (!currentSet.has(loc.toLowerCase()) && !isOccupied) {
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

  const hasMinSchools = selectedList.length >= 2;

  return (
    <div className="form-group" style={{ position: 'relative', width: '100%' }}>
      {/* Label con icono y contador */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '4px' }}>
        <label className="form-label" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#0284c7', fontSize: '0.85rem' }}>
          <School className="w-4 h-4 text-sky-400" />
          <span>Locales de Votación Asignados (Mínimo 2)</span>
          <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <span style={{ 
          fontSize: '0.74rem', 
          fontWeight: 800, 
          padding: '2px 8px', 
          borderRadius: '12px', 
          background: hasMinSchools ? 'rgba(16, 185, 129, 0.15)' : (selectedList.length === 1 ? '#fef3c7' : '#f1f5f9'),
          color: hasMinSchools ? '#047857' : (selectedList.length === 1 ? '#b45309' : '#64748b'),
          border: hasMinSchools ? '1px solid #a7f3d0' : (selectedList.length === 1 ? '1px solid #fde68a' : 'none')
        }}>
          {selectedList.length} {selectedList.length === 1 ? 'local (Mínimo 2)' : (hasMinSchools ? 'locales asignados ✓' : 'locales seleccionados')}
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
                const isOccupied = !isSelected && !isOwnSchool(school) && assignedLocales.some(al => al.trim().toLowerCase() === school.trim().toLowerCase());

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (!isOccupied) toggleSchool(school);
                    }}
                    style={{
                      padding: '10px 14px',
                      fontSize: '0.84rem',
                      fontWeight: isSelected ? 800 : 500,
                      color: isOccupied ? '#94a3b8' : (isSelected ? '#0369a1' : '#0f172a'),
                      background: isOccupied ? '#f8fafc' : (isSelected ? '#f0f9ff' : '#ffffff'),
                      cursor: isOccupied ? 'not-allowed' : 'pointer',
                      borderBottom: idx !== filteredLocales.length - 1 ? '1px solid #f1f5f9' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      opacity: isOccupied ? 0.75 : 1,
                      transition: 'all 0.1s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected && !isOccupied) {
                        e.currentTarget.style.background = '#e0f2fe';
                        e.currentTarget.style.color = '#0284c7';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected && !isOccupied) {
                        e.currentTarget.style.background = '#ffffff';
                        e.currentTarget.style.color = '#0f172a';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '9px', flex: 1, paddingRight: '8px' }}>
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-sky-600 flex-shrink-0" />
                      ) : (
                        <Square className={`w-4 h-4 ${isOccupied ? 'text-slate-300' : 'text-slate-400'} flex-shrink-0`} />
                      )}
                      <span style={{ textDecoration: isOccupied ? 'line-through' : 'none' }}>{school}</span>
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
                    {isOccupied && (
                      <span style={{ 
                        fontSize: '0.68rem', 
                        fontWeight: 800, 
                        color: '#dc2626', 
                        background: '#fee2e2', 
                        padding: '2px 6px', 
                        borderRadius: '4px' 
                      }}>
                        ⛔ Asignado a otro Zonal
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

      <span style={{ fontSize: '0.73rem', color: selectedList.length < 2 ? '#b45309' : '#0284c7', fontWeight: 600, display: 'block', marginTop: '4px' }}>
        {selectedList.length < 2 
          ? '⚠️ Mínimo 2 colegios requeridos: Marque los locales de votación que conforman la zona de este coordinador (no se pueden repetir).' 
          : '💡 Marque o desmarque los colegios que conforman la zona de este coordinador zonal.'}
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

function normalizePersoneroRole(rawRole) {
  if (!rawRole) return 'Personero de Mesa';
  const r = String(rawRole).trim().toLowerCase();
  if (r.includes('zonal') || r.includes('zona')) {
    return 'Coordinador Zonal';
  }
  if (r.includes('distrito') || r.includes('distrital')) {
    return 'Coordinador Distrital';
  }
  if (r.includes('local') || r.includes('centro') || r.includes('pcv') || r.includes('plv') || (r.includes('coordinador') && !r.includes('central'))) {
    return 'Personero de Local de Votación';
  }
  return 'Personero de Mesa';
}

export function EditAssignmentModal({ personero, mode = 'full', onClose, onSaved }) {
  const { isSuperAdmin, isCoordinadorDistrital, user: authUser } = useAuth();
  const isTrainingMode = mode === 'capacitacion';
  
  // El Coordinador Distrital puede editar y eliminar registros dentro de su distrito
  const isLimitedCoordinator = !isSuperAdmin && isCoordinadorDistrital;

  // Verificación estricta: Únicamente el usuario 'supera' (o 'admin') tiene facultad para editar progreso y credenciales
  const cleanUsername = String(authUser?.username || '').toLowerCase().trim();
  const isSuperaUser = cleanUsername === 'supera' || cleanUsername === 'admin';

  const rawMesa = personero?.['Mesa Asignada'] ?? personero?.mesaAsignada ?? personero?.mesaDeSufragio ?? personero?.['Mesa de Sufragio'] ?? '';
  const initialMesa = (rawMesa === '-' || String(rawMesa).trim().toLowerCase() === 'no aplica') ? '' : String(rawMesa);

  const initialDistrito = personero?.['Distrito Asignado'] || personero?.['Distrito donde Vota'] || personero?.distritoAsignado || personero?.distritoDondeVota || (isLimitedCoordinator ? (authUser?.['Distrito Asignado'] || authUser?.distritoAsignado || '') : '');

  const rawRole = personero?.['Rol a Desempeñar'] || 
                  personero?.['Rol a desempenar'] || 
                  personero?.rolADesempenar || 
                  personero?.rol_a_desempenar || 
                  personero?.rol || 
                  personero?.Rol || 
                  personero?.cargo || 
                  personero?.Cargo || '';

  const initialRole = normalizePersoneroRole(rawRole);
  const initialVideo = parseInt(personero?.Video ?? personero?.video ?? 0, 10) || 0;
  const initialPdf = parseInt(personero?.PDF ?? personero?.pdf ?? 0, 10) || 0;
  const initialCred = String(personero?.Credenciales ?? personero?.credenciales ?? personero?.['Estado Credencial'] ?? personero?.estadoCredencial ?? 'Bloqueado').toLowerCase() === 'confirmado' ? 'Confirmado' : 'Bloqueado';

  const [formData, setFormData] = useState({
    nombresApellidos: personero?.['Nombres y Apellidos'] || personero?.nombresApellidos || personero?.nombres_y_apellidos || '',
    celular: personero?.['Celular'] || personero?.celular || personero?.telefono || '',
    distritoAsignado: initialDistrito,
    localAsignado: personero?.['Local de Votación Asignado'] || personero?.['Local de Votación'] || personero?.localDeVotacionAsignado || personero?.localDeVotacion || '',
    mesaAsignada: initialMesa,
    rolADesempenar: initialRole,
    video: initialVideo,
    pdf: initialPdf,
    credenciales: initialCred
  });

  const [locales, setLocales] = useState([]);
  const [assignedLocales, setAssignedLocales] = useState([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const dni = personero?.['D.N.I.'] || personero?.['DNI'] || personero?.dni || personero?.dni_numero;
  const rawOriginalSchools = personero?.['Local de Votación Asignado'] || personero?.['Local de Votación'] || personero?.localDeVotacionAsignado || personero?.localDeVotacion || '';
  const originalSchools = rawOriginalSchools.split(',').map(s => s.trim()).filter(Boolean);

  const isZonal = (formData.rolADesempenar || '').toLowerCase().includes('zonal') || (formData.rolADesempenar || '').toLowerCase().includes('zona');
  const isMesa = (formData.rolADesempenar || '').toLowerCase().includes('personero') || isLimitedCoordinator;

  const isVMT = (formData.distritoAsignado || '').toUpperCase().includes('VILLA MARIA DEL TRIUNFO') || (formData.distritoAsignado || '').toUpperCase().includes('VMT');

  // Roles permitidos según nivel de usuario
  const availableRoles = isSuperAdmin
    ? ROLES
    : Array.from(new Set([
        'Personero de Mesa',
        'Personero de Local de Votación',
        ...(isVMT || isZonal ? ['Coordinador Zonal'] : []),
        initialRole
      ]));

  useEffect(() => {
    if (formData.distritoAsignado) {
      api.getLocales(formData.distritoAsignado, formData.rolADesempenar, dni)
        .then(res => {
          setLocales(res.data || []);
          setAssignedLocales(res.assignedLocales || []);
        })
        .catch(() => {
          setLocales([]);
          setAssignedLocales([]);
        });
    } else {
      setLocales([]);
      setAssignedLocales([]);
    }
  }, [formData.distritoAsignado, formData.rolADesempenar, dni]);

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

    // Validaciones específicas para Coordinador Zonal
    if (isZonal) {
      const selectedList = (formData.localAsignado || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      if (selectedList.length < 2) {
        setErrorMsg('Un Coordinador Zonal debe tener asignados como mínimo 2 colegios.');
        return;
      }

      // Validar que ningún colegio nuevo seleccionado esté ocupado por otro Coordinador Zonal
      const conflict = selectedList.find(sch => 
        !originalSchools.some(os => os.trim().toLowerCase() === sch.toLowerCase()) &&
        assignedLocales.some(al => al.trim().toLowerCase() === sch.toLowerCase())
      );
      if (conflict) {
        setErrorMsg(`El colegio "${conflict}" ya se encuentra asignado a otro Coordinador Zonal en ${formData.distritoAsignado}.`);
        return;
      }
    }

    // Comprobar si hubo cambios reales en la ficha
    const origNom = (personero?.['Nombres y Apellidos'] || personero?.nombresApellidos || '').trim();
    const origCel = (personero?.['Celular'] || personero?.celular || '').trim();
    const origDist = (initialDistrito || '').trim();
    const origLoc = (personero?.['Local de Votación Asignado'] || personero?.['Local de Votación'] || personero?.localDeVotacionAsignado || '').trim();
    const origMesa = initialMesa.trim();
    const origRol = initialRole.trim();
    const origCred = initialCred.trim();
    const origVid = initialVideo;
    const origPdf = initialPdf;

    const hasAnyChange = (
      formData.nombresApellidos.trim() !== origNom ||
      formData.celular.trim() !== origCel ||
      formData.distritoAsignado.trim() !== origDist ||
      formData.localAsignado.trim() !== origLoc ||
      formData.mesaAsignada.trim() !== origMesa ||
      formData.rolADesempenar.trim() !== origRol ||
      (isSuperaUser && (
        formData.credenciales.trim() !== origCred ||
        formData.video !== origVid ||
        formData.pdf !== origPdf
      ))
    );

    if (!hasAnyChange) {
      // Si no hubo cambios, cerrar limpiamente sin saturar la auditoría
      onClose();
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    const authorName = authUser?.fullName || authUser?.name || authUser?.['Nombres y Apellidos'] || (isSuperAdmin ? 'Superadmin' : 'Coordinador Distrital');
    const authorRoleName = isSuperAdmin ? 'Superadministrador' : `Coordinador Distrital (${authUser?.['Distrito Asignado'] || authUser?.distritoAsignado || formData.distritoAsignado})`;

    try {
      const payload = {
        nombresApellidos: formData.nombresApellidos,
        celular: formData.celular,
        distritoAsignado: formData.distritoAsignado,
        localAsignado: formData.localAsignado,
        mesaAsignada: isZonal ? 'No aplica' : formData.mesaAsignada,
        rolADesempenar: formData.rolADesempenar,
        author: authorName,
        authorRole: authorRoleName
      };

      // ÚNICAMENTE el usuario supera (o admin) puede modificar video, pdf y credenciales
      if (isSuperaUser) {
        payload.video = parseInt(formData.video, 10) || 0;
        payload.pdf = parseInt(formData.pdf, 10) || 0;
        payload.credenciales = formData.credenciales;
        if (formData.credenciales === 'Confirmado') {
          payload.preguntas = 'Aprobado (5/5)';
        }
      }

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
    const authorName = authUser?.fullName || authUser?.name || authUser?.['Nombres y Apellidos'] || (isSuperAdmin ? 'Superadmin' : 'Coordinador Distrital');
    const authorRoleName = isSuperAdmin ? 'Superadministrador' : `Coordinador Distrital (${authUser?.['Distrito Asignado'] || authUser?.distritoAsignado || formData.distritoAsignado})`;

    const confirmTitle = isSuperAdmin
      ? `⚠️ ACCIÓN DE SUPERADMINISTRADOR:\n\n¿Está seguro de eliminar definitivamente a "${formData.nombresApellidos}" (DNI: ${dni}) de la base de datos?\n\nEsta acción quedará registrada en el historial de auditoría.`
      : `⚠️ ACCIÓN DE COORDINADOR DISTRITAL:\n\n¿Está seguro de eliminar a "${formData.nombresApellidos}" (DNI: ${dni}) del padrón de ${formData.distritoAsignado}?\n\nEsta eliminación quedará registrada en el sistema.`;

    const confirmDelete = window.confirm(confirmTitle);
    if (!confirmDelete) return;

    setDeleting(true);
    setErrorMsg(null);
    try {
      await api.deletePersonero(dni, { author: authorName, authorRole: authorRoleName });
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
              <span>
                {isTrainingMode 
                  ? 'Gestión de Capacitación y Credencial' 
                  : (isSuperAdmin ? 'Gestión y Modificación de Registro (Superadmin)' : `Gestión de Personero - ${formData.distritoAsignado}`)}
              </span>
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>
              {isTrainingMode ? 'Módulo de Capacitación y Acreditación' : (isSuperAdmin ? 'Facultades globales (43 distritos de Lima)' : `Facultades distritales autorizadas`)} &bull; DNI: <strong>{dni}</strong>
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
              <strong>Panel de Coordinador Distrital:</strong> Tienes permiso para modificar los datos, centros, mesas y eliminar personeros asignados a tu distrito ({formData.distritoAsignado}).
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

          {/* Nombres (y Celular si no es modo capacitación) */}
          <div style={{ display: 'grid', gridTemplateColumns: isTrainingMode ? '1fr' : 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            <InputField
              label="Nombres y Apellidos"
              icon={User}
              name="nombresApellidos"
              value={formData.nombresApellidos}
              onChange={handleChange}
              placeholder="Nombres completos"
              required
            />
            {!isTrainingMode && (
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
            )}
          </div>

          {/* Rol a Desempeñar */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
            <SelectField
              label="Rol a Desempeñar"
              icon={Award}
              name="rolADesempenar"
              value={formData.rolADesempenar}
              onChange={handleChange}
              options={availableRoles}
              required
            />
          </div>

          {/* Panel Exclusivo para Supera: Edición de Progreso Video, PDF y Credenciales */}
          {isSuperaUser ? (
            <div style={{
              background: '#f0f9ff',
              border: '1.5px solid #0284c7',
              borderRadius: '12px',
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', fontWeight: 800, color: '#0369a1' }}>
                  <Sparkles className="w-4 h-4 text-sky-600" />
                  <span>Control de Capacitación y Credenciales (Exclusivo Supera)</span>
                </div>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, background: '#0284c7', color: '#fff', padding: '2px 8px', borderRadius: '6px' }}>
                  Master Superadmin
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
                {/* Progreso Video */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                    🎬 Progreso Videos
                  </label>
                  <select
                    name="video"
                    value={formData.video}
                    onChange={(e) => setFormData(prev => ({ ...prev, video: parseInt(e.target.value, 10) }))}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid #bae6fd',
                      background: '#ffffff',
                      color: '#0f172a',
                      fontSize: '0.82rem',
                      fontWeight: 700
                    }}
                  >
                    <option value={0}>0 / 2 (Sin avance)</option>
                    <option value={1}>1 / 2 (1 video visto)</option>
                    <option value={2}>2 / 2 (Videos completos)</option>
                  </select>
                </div>

                {/* Progreso PDF */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                    📄 Progreso Manuales PDF
                  </label>
                  <select
                    name="pdf"
                    value={formData.pdf}
                    onChange={(e) => setFormData(prev => ({ ...prev, pdf: parseInt(e.target.value, 10) }))}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid #bae6fd',
                      background: '#ffffff',
                      color: '#0f172a',
                      fontSize: '0.82rem',
                      fontWeight: 700
                    }}
                  >
                    <option value={0}>0 / 2 (Sin avance)</option>
                    <option value={1}>1 / 2 (1 PDF leído)</option>
                    <option value={2}>2 / 2 (Manuales completos)</option>
                  </select>
                </div>

                {/* Estado Credencial */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                    🛡️ Estado Credencial
                  </label>
                  <select
                    name="credenciales"
                    value={formData.credenciales}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: `1.5px solid ${formData.credenciales === 'Confirmado' ? '#10b981' : '#f87171'}`,
                      background: formData.credenciales === 'Confirmado' ? '#ecfdf5' : '#fef2f2',
                      color: formData.credenciales === 'Confirmado' ? '#047857' : '#b91c1c',
                      fontSize: '0.82rem',
                      fontWeight: 800
                    }}
                  >
                    <option value="Bloqueado">Bloqueado</option>
                    <option value="Confirmado">Confirmado</option>
                  </select>
                </div>
              </div>
            </div>
          ) : (
            /* Para Eric, Paola, Susana y Coordinadores: Solo lectura informativa del progreso */
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '8px',
              fontSize: '0.76rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontWeight: 700 }}>
                <Shield className="w-3.5 h-3.5 text-sky-600" />
                <span>ESTADO DE CAPACITACIÓN:</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: '6px', fontWeight: 800 }}>
                  🎬 Videos: {initialVideo}/2
                </span>
                <span style={{ background: '#f3e8ff', color: '#7e22ce', padding: '3px 8px', borderRadius: '6px', fontWeight: 800 }}>
                  📄 PDFs: {initialPdf}/2
                </span>
                <span style={{
                  background: initialCred === 'Confirmado' ? '#dcfce7' : '#fee2e2',
                  color: initialCred === 'Confirmado' ? '#15803d' : '#b91c1c',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontWeight: 800
                }}>
                  {initialCred === 'Confirmado' ? '✅ Credencial Confirmada' : '🔒 Credencial Bloqueada'}
                </span>
              </div>
            </div>
          )}

          {/* Distrito (Editable únicamente por Superadmin; Coordinador Distrital tiene fijado su distrito) */}
          {isSuperAdmin ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
              <SelectField
                label="Distrito Asignado (Facultad Superadmin)"
                icon={MapPin}
                name="distritoAsignado"
                value={formData.distritoAsignado}
                onChange={handleChange}
                options={DISTRITOS_LIMA}
                required
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
              <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin className="w-3.5 h-3.5 text-sky-600" /> DISTRITO DE JURISDICCIÓN
              </span>
              <strong style={{ color: '#0f172a' }}>{formData.distritoAsignado}</strong>
            </div>
          )}

          {/* Centro de Votación Asignado y Mesa (Solo en modo gestión completa) */}
          {!isTrainingMode && (
            <>
              {isZonal ? (
                <MultiSchoolSearchSelect
                  value={formData.localAsignado}
                  onChange={(newVal) => setFormData(prev => ({ ...prev, localAsignado: newVal }))}
                  locales={locales}
                  assignedLocales={assignedLocales}
                  originalSchools={originalSchools}
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

              {/* Mesa Asignada (No aplica para Coordinador Zonal) */}
              {!isZonal && (
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
              )}
            </>
          )}

          {/* Footer: Guardar y Eliminar (Habilitado para Superadmin y Coord. Distrital) */}
          <div className="modal-footer" style={{ marginTop: '16px', padding: '14px 0 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', borderTop: '1px solid #334155' }}>
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
                flex: '1 1 160px'
              }}
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Guardando cambios...' : 'Guardar Cambios'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
