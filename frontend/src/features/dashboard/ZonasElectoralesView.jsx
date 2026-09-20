import React, { useState, useMemo } from 'react';
import {
  MapPin, School, Users, Layers, Building2,
  Search, ChevronDown, ChevronUp, Filter,
  Phone, Shield, CheckCircle2,
  AlertTriangle, XCircle, ExternalLink, Eye, ChevronRight
} from 'lucide-react';
import { ZONAS_CONFIG } from '../../constants/zonasCatalog.js';

const ZONA_COLORS = {
  "ZONA MARIATEGUI": { bg: "rgba(139, 92, 246, 0.12)", border: "#8b5cf6", text: "#7c3aed", light: "#ede9fe", badge: "🟣" },
  "ZONA CERCADO": { bg: "rgba(2, 132, 199, 0.12)", border: "#0284c7", text: "#0369a1", light: "#e0f2fe", badge: "🔵" },
  "ZONA INCA PACHACUTEC": { bg: "rgba(16, 185, 129, 0.12)", border: "#10b981", text: "#059669", light: "#d1fae5", badge: "🟢" },
  "ZONA NUEVA ESPERANZA": { bg: "rgba(245, 158, 11, 0.12)", border: "#f59e0b", text: "#d97706", light: "#fef3c7", badge: "🟡" },
  "ZONA NUEVO MILENIO": { bg: "rgba(244, 63, 94, 0.12)", border: "#f43f5e", text: "#e11d48", light: "#ffe4e6", badge: "🔴" },
  "ZONA JOSE GALVEZ": { bg: "rgba(99, 102, 241, 0.12)", border: "#6366f1", text: "#4f46e5", light: "#e0e7ff", badge: "🔷" },
  "ZONA TABLADA": { bg: "rgba(14, 165, 233, 0.12)", border: "#0ea5e9", text: "#0284c7", light: "#e0f2fe", badge: "🟦" }
};

export function ZonasElectoralesView({
  isDark = false,
  allPersoneros = [],
  onSelectSchoolDetail,
  onFilterByLocal,
  onSelectPersonero,
  userDistrito = 'VILLA MARIA DEL TRIUNFO'
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZonaFilter, setSelectedZonaFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'partial', 'empty', 'full'
  const [expandedZonas, setExpandedZonas] = useState(() => ({
    "ZONA MARIATEGUI": true,
    "ZONA CERCADO": true,
    "ZONA INCA PACHACUTEC": true,
    "ZONA NUEVA ESPERANZA": true,
    "ZONA NUEVO MILENIO": true,
    "ZONA JOSE GALVEZ": true,
    "ZONA TABLADA": true
  }));
  const [expandedSchools, setExpandedSchools] = useState({});

  const bgCard = isDark ? '#1e293b' : '#ffffff';
  const borderCol = isDark ? '#334155' : '#e2e8f0';
  const textTitle = isDark ? '#f8fafc' : '#0f172a';
  const textSub = isDark ? '#94a3b8' : '#64748b';

  // Normalize string helper
  const normalize = (s) => (s || '').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Z0-9]/g, ' ').replace(/\s+/g, ' ').trim();

  // Helper to check if role is PCV / Coordinator
  const isPCVRole = (rol) => {
    const r = String(rol || '').toLowerCase();
    return r.includes('centro') || r.includes('local') || r.includes('pcv') || r.includes('plv');
  };

  // Map personeros count & items by school
  const personerosBySchool = useMemo(() => {
    const map = new Map();
    allPersoneros.forEach(p => {
      const locAsig = p['Local de Votación Asignado'] || p.localDeVotacionAsignado || p.localAsignado || '';
      const locVota = p['Local de Votación'] || p.localDeVotacion || p.local || p['Colegio'] || p.colegio || '';
      const loc = locAsig || locVota;
      if (!loc) return;

      const locs = loc.includes(',') ? loc.split(',').map(s => s.trim()) : [loc];
      locs.forEach(singleLoc => {
        const norm = normalize(singleLoc);
        if (!norm) return;
        if (!map.has(norm)) {
          map.set(norm, { total: 0, acreditados: 0, items: [] });
        }
        const obj = map.get(norm);
        obj.total += 1;
        const cred = String(p.Credenciales || p.credenciales || '').toLowerCase();
        if (cred === 'confirmado') obj.acreditados += 1;
        obj.items.push(p);
      });
    });
    return map;
  }, [allPersoneros]);

  const rawZonas = ZONAS_CONFIG["VILLA MARIA DEL TRIUNFO"] || {};

  // Compute metrics per zona
  const zonasMetrics = useMemo(() => {
    const res = {};
    for (const [zonaName, colegios] of Object.entries(rawZonas)) {
      let totalMesas = 0;
      let totalPersoneros = 0;
      let totalAcreditados = 0;
      let schoolsCount = colegios.length;

      const enrichedColegios = colegios.map(col => {
        totalMesas += col.mesas;
        const norm = normalize(col.colegio);
        let pData = personerosBySchool.get(norm);
        if (!pData) {
          // fuzzy match
          for (const [k, v] of personerosBySchool.entries()) {
            if (k.includes(norm) || norm.includes(k)) {
              pData = v;
              break;
            }
          }
        }
        const assignedCount = pData ? pData.total : 0;
        const acreditadosCount = pData ? pData.acreditados : 0;
        totalPersoneros += assignedCount;
        totalAcreditados += acreditadosCount;

        const items = pData ? pData.items : [];
        const pcv = items.find(p => isPCVRole(p['Rol a Desempeñar'] || p.rolADesempenar || p.rol_electoral));

        let status = 'empty';
        if (assignedCount >= col.mesas && col.mesas > 0) {
          status = 'full';
        } else if (assignedCount > 0) {
          status = 'partial';
        }

        return {
          ...col,
          assignedCount,
          acreditadosCount,
          coveragePct: col.mesas > 0 ? Math.min(100, Math.round((assignedCount / col.mesas) * 100)) : 0,
          personeros: items,
          pcv,
          status
        };
      });

      res[zonaName] = {
        colegios: enrichedColegios,
        totalMesas,
        totalPersoneros,
        totalAcreditados,
        schoolsCount,
        coveragePct: totalMesas > 0 ? Math.min(100, Math.round((totalPersoneros / totalMesas) * 100)) : 0
      };
    }
    return res;
  }, [rawZonas, personerosBySchool]);

  // Global summary metrics
  const globalSummary = useMemo(() => {
    let totalZonas = Object.keys(rawZonas).length;
    let totalLocales = 0;
    let totalMesas = 0;
    let totalPersoneros = 0;
    let totalAcreditados = 0;
    let cubiertos = 0;
    let parciales = 0;
    let sinPersonero = 0;

    Object.values(zonasMetrics).forEach(z => {
      totalLocales += z.schoolsCount;
      totalMesas += z.totalMesas;
      totalPersoneros += z.totalPersoneros;
      totalAcreditados += z.totalAcreditados;
      z.colegios.forEach(col => {
        if (col.status === 'full') cubiertos++;
        else if (col.status === 'partial') parciales++;
        else sinPersonero++;
      });
    });

    return {
      totalZonas,
      totalLocales,
      totalMesas,
      totalPersoneros,
      totalAcreditados,
      cubiertos,
      parciales,
      sinPersonero,
      globalCoverage: totalMesas > 0 ? Math.min(100, Math.round((totalPersoneros / totalMesas) * 100)) : 0
    };
  }, [rawZonas, zonasMetrics]);

  // Filtered zonas & schools based on search, status filter and zona filter
  const filteredZonas = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const res = {};

    for (const [zonaName, zData] of Object.entries(zonasMetrics)) {
      if (selectedZonaFilter !== 'all' && selectedZonaFilter !== zonaName) {
        continue;
      }

      const filteredSchools = zData.colegios.filter(col => {
        // Status filter
        if (statusFilter !== 'all' && col.status !== statusFilter) {
          return false;
        }

        if (!q) return true;

        // Search match on school, address, zone, or personeros names/DNI
        const matchesSchool = (
          col.colegio.toLowerCase().includes(q) ||
          (col.direccion && col.direccion.toLowerCase().includes(q)) ||
          zonaName.toLowerCase().includes(q)
        );
        if (matchesSchool) return true;

        // Search inside personeros of this school
        const matchesPersonero = col.personeros.some(p => {
          const pName = String(p['Nombres y Apellidos'] || p.nombresApellidos || '').toLowerCase();
          const pDni = String(p['D.N.I.'] || p.dni || '');
          const pCel = String(p['Celular'] || p.celular || '');
          return pName.includes(q) || pDni.includes(q) || pCel.includes(q);
        });

        return matchesPersonero;
      });

      if (filteredSchools.length > 0) {
        res[zonaName] = {
          ...zData,
          colegios: filteredSchools
        };
      }
    }
    return res;
  }, [zonasMetrics, searchQuery, selectedZonaFilter, statusFilter]);

  const toggleZona = (zonaName) => {
    setExpandedZonas(prev => ({
      ...prev,
      [zonaName]: !prev[zonaName]
    }));
  };

  const toggleSchool = (schoolName) => {
    setExpandedSchools(prev => ({
      ...prev,
      [schoolName]: !prev[schoolName]
    }));
  };

  const toggleAll = (expand) => {
    const nextZonas = {};
    Object.keys(rawZonas).forEach(z => {
      nextZonas[z] = expand;
    });
    setExpandedZonas(nextZonas);

    if (!expand) {
      setExpandedSchools({});
    }
  };

  const expandAllSchoolsInZona = (colegios, expand = true) => {
    setExpandedSchools(prev => {
      const next = { ...prev };
      colegios.forEach(col => {
        next[col.colegio] = expand;
      });
      return next;
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', boxSizing: 'border-box' }}>
      {/* HEADER BANNER */}
      <div style={{
        background: isDark
          ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95))'
          : 'linear-gradient(135deg, #f0f9ff 0%, #ede9fe 100%)',
        border: `1.5px solid ${isDark ? '#334155' : '#cbd5e1'}`,
        borderRadius: '16px',
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow: isDark ? '0 10px 25px rgba(0,0,0,0.25)' : '0 10px 25px rgba(2, 132, 199, 0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #7c3aed, #0284c7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
              flexShrink: 0
            }}>
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: textTitle, margin: 0, letterSpacing: '-0.02em' }}>
                  🗺️ Mapeo y Distribución por Zonas Electorales
                </h2>
                <span style={{
                  background: '#0284c7',
                  color: '#ffffff',
                  fontSize: '0.72rem',
                  fontWeight: 900,
                  padding: '3px 9px',
                  borderRadius: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}>
                  Villa María del Triunfo
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: textSub, margin: '4px 0 0 0' }}>
                Organización territorial oficial: 7 zonas operativas, 90 locales de votación y 1,242 mesas de sufragio.
                Haz clic en el botón <strong>"Ver Personeros"</strong> de cada colegio para desplegar su lista y teléfonos de contacto.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => toggleAll(true)}
              style={{
                background: isDark ? '#334155' : '#ffffff',
                border: `1px solid ${borderCol}`,
                color: textTitle,
                fontSize: '0.74rem',
                fontWeight: 700,
                padding: '6px 12px',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              ▼ Expandir Zonas
            </button>
            <button
              onClick={() => toggleAll(false)}
              style={{
                background: isDark ? '#334155' : '#ffffff',
                border: `1px solid ${borderCol}`,
                color: textTitle,
                fontSize: '0.74rem',
                fontWeight: 700,
                padding: '6px 12px',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              ▲ Colapsar Zonas
            </button>
          </div>
        </div>

        {/* 4 STATS CARDS */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px'
        }}>
          <div style={{
            background: bgCard,
            border: `1px solid ${borderCol}`,
            borderRadius: '12px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(124, 58, 237, 0.15)', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: textSub, textTransform: 'uppercase' }}>Zonas Electorales</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#7c3aed' }}>{globalSummary.totalZonas} Zonas</div>
            </div>
          </div>

          <div style={{
            background: bgCard,
            border: `1px solid ${borderCol}`,
            borderRadius: '12px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(2, 132, 199, 0.15)', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <School className="w-5 h-5" />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: textSub, textTransform: 'uppercase' }}>Locales de Votación</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0284c7' }}>{globalSummary.totalLocales} Colegios</div>
            </div>
          </div>

          <div style={{
            background: bgCard,
            border: `1px solid ${borderCol}`,
            borderRadius: '12px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: textSub, textTransform: 'uppercase' }}>Meta de Mesas</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#10b981' }}>{globalSummary.totalMesas} Mesas</div>
            </div>
          </div>

          <div style={{
            background: bgCard,
            border: `1px solid ${borderCol}`,
            borderRadius: '12px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: textSub, textTransform: 'uppercase' }}>Personeros Registrados</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#f59e0b' }}>
                {globalSummary.totalPersoneros} <span style={{ fontSize: '0.75rem', fontWeight: 700, color: textSub }}>({globalSummary.globalCoverage}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* STATUS QUICK PILLS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', paddingTop: '4px' }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 800, color: textSub }}>Estado de Locales:</span>
          <button
            onClick={() => setStatusFilter('all')}
            style={{
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '0.72rem',
              fontWeight: 800,
              cursor: 'pointer',
              border: `1px solid ${statusFilter === 'all' ? '#0284c7' : borderCol}`,
              background: statusFilter === 'all' ? '#0284c7' : (isDark ? '#0f172a' : '#ffffff'),
              color: statusFilter === 'all' ? '#ffffff' : textTitle
            }}
          >
            Todos ({globalSummary.totalLocales})
          </button>
          <button
            onClick={() => setStatusFilter('full')}
            style={{
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '0.72rem',
              fontWeight: 800,
              cursor: 'pointer',
              border: `1px solid ${statusFilter === 'full' ? '#16a34a' : '#86efac'}`,
              background: statusFilter === 'full' ? '#16a34a' : (isDark ? 'rgba(22, 163, 74, 0.15)' : '#dcfce7'),
              color: statusFilter === 'full' ? '#ffffff' : '#15803d'
            }}
          >
            ✅ Cubiertos ({globalSummary.cubiertos})
          </button>
          <button
            onClick={() => setStatusFilter('partial')}
            style={{
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '0.72rem',
              fontWeight: 800,
              cursor: 'pointer',
              border: `1px solid ${statusFilter === 'partial' ? '#d97706' : '#fde047'}`,
              background: statusFilter === 'partial' ? '#d97706' : (isDark ? 'rgba(217, 119, 6, 0.15)' : '#fef9c3'),
              color: statusFilter === 'partial' ? '#ffffff' : '#854d0e'
            }}
          >
            ⏳ Parciales ({globalSummary.parciales})
          </button>
          <button
            onClick={() => setStatusFilter('empty')}
            style={{
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '0.72rem',
              fontWeight: 800,
              cursor: 'pointer',
              border: `1px solid ${statusFilter === 'empty' ? '#dc2626' : '#fca5a5'}`,
              background: statusFilter === 'empty' ? '#dc2626' : (isDark ? 'rgba(220, 38, 38, 0.15)' : '#fee2e2'),
              color: statusFilter === 'empty' ? '#ffffff' : '#991b1b'
            }}
          >
            ❌ Sin Personero ({globalSummary.sinPersonero})
          </button>
        </div>
      </div>

      {/* FILTER BAR & SEARCH */}
      <div style={{
        background: bgCard,
        border: `1px solid ${borderCol}`,
        borderRadius: '14px',
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Search input */}
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search className="w-4 h-4" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Buscar colegio, dirección, personero o DNI en VMT..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              borderRadius: '10px',
              border: `1px solid ${borderCol}`,
              background: isDark ? '#0f172a' : '#f8fafc',
              color: textTitle,
              fontSize: '0.82rem',
              fontWeight: 600,
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: '0.8rem'
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Zona Pills Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 800, color: textSub, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Filter className="w-3.5 h-3.5" /> Zona:
          </span>
          <button
            onClick={() => setSelectedZonaFilter('all')}
            style={{
              padding: '5px 10px',
              borderRadius: '8px',
              fontSize: '0.74rem',
              fontWeight: 800,
              cursor: 'pointer',
              border: `1px solid ${selectedZonaFilter === 'all' ? '#0284c7' : borderCol}`,
              background: selectedZonaFilter === 'all' ? '#0284c7' : (isDark ? '#0f172a' : '#f1f5f9'),
              color: selectedZonaFilter === 'all' ? '#ffffff' : textTitle
            }}
          >
            Todas ({Object.keys(rawZonas).length})
          </button>
          {Object.keys(rawZonas).map(z => {
            const isSel = selectedZonaFilter === z;
            const styleConf = ZONA_COLORS[z] || { border: '#64748b', text: '#0284c7', badge: '📍' };
            const cleanShort = z.replace('ZONA ', '');
            return (
              <button
                key={z}
                onClick={() => setSelectedZonaFilter(z)}
                style={{
                  padding: '5px 10px',
                  borderRadius: '8px',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  border: `1px solid ${isSel ? styleConf.border : borderCol}`,
                  background: isSel ? styleConf.border : (isDark ? '#0f172a' : '#f1f5f9'),
                  color: isSel ? '#ffffff' : (isDark ? '#e2e8f0' : styleConf.text)
                }}
              >
                {styleConf.badge} {cleanShort}
              </button>
            );
          })}
        </div>
      </div>

      {/* LIST OF ZONAS CARDS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {Object.entries(filteredZonas).map(([zonaName, zData]) => {
          const isExp = !!expandedZonas[zonaName];
          const styleConf = ZONA_COLORS[zonaName] || { bg: 'rgba(2,132,199,0.1)', border: '#0284c7', text: '#0284c7', light: '#e0f2fe', badge: '📍' };

          const allSchoolsInZonaExpanded = zData.colegios.length > 0 && zData.colegios.every(c => !!expandedSchools[c.colegio]);

          return (
            <div
              key={zonaName}
              style={{
                background: bgCard,
                border: `1.5px solid ${isDark ? borderCol : styleConf.border}`,
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: isDark ? 'none' : '0 4px 14px rgba(0,0,0,0.04)',
                transition: 'all 0.2s ease'
              }}
            >
              {/* ZONA HEADER ACCORDION */}
              <div
                style={{
                  padding: '14px 18px',
                  background: isDark ? 'rgba(255,255,255,0.02)' : styleConf.bg,
                  borderBottom: isExp ? `1px solid ${borderCol}` : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  userSelect: 'none',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div
                  onClick={() => toggleZona(zonaName)}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flex: 1 }}
                >
                  <span style={{ fontSize: '1.25rem' }}>{styleConf.badge}</span>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 900, color: textTitle, margin: 0 }}>
                        {zonaName}
                      </h3>
                      <span style={{
                        background: styleConf.border,
                        color: '#ffffff',
                        fontSize: '0.68rem',
                        fontWeight: 900,
                        padding: '2px 8px',
                        borderRadius: '10px'
                      }}>
                        {zData.colegios.length} Colegios
                      </span>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: textSub, marginTop: '2px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <span>Mesas: <strong style={{ color: textTitle }}>{zData.totalMesas}</strong></span>
                      <span>Personeros: <strong style={{ color: styleConf.text }}>{zData.totalPersoneros}</strong></span>
                      <span>Acreditados: <strong style={{ color: '#16a34a' }}>{zData.totalAcreditados}</strong></span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {/* Progress bar */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px', minWidth: '110px' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: textTitle }}>
                      Cobertura: {zData.coveragePct}%
                    </div>
                    <div style={{ width: '110px', height: '6px', background: isDark ? '#334155' : '#cbd5e1', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${zData.coveragePct}%`,
                        height: '100%',
                        background: zData.coveragePct >= 80 ? '#10b981' : zData.coveragePct >= 40 ? '#f59e0b' : '#ef4444',
                        borderRadius: '4px',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>

                  {/* Bulk expand schools button */}
                  {isExp && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        expandAllSchoolsInZona(zData.colegios, !allSchoolsInZonaExpanded);
                      }}
                      title={allSchoolsInZonaExpanded ? 'Plegar personeros de todos los colegios' : 'Desplegar personeros de todos los colegios'}
                      style={{
                        background: isDark ? '#334155' : '#ffffff',
                        border: `1px solid ${borderCol}`,
                        borderRadius: '8px',
                        padding: '5px 9px',
                        cursor: 'pointer',
                        color: textTitle,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Users className="w-3.5 h-3.5 text-blue-500" />
                      <span>{allSchoolsInZonaExpanded ? 'Plegar Colegios' : 'Ver Personeros'}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => toggleZona(zonaName)}
                    style={{
                      background: isDark ? '#334155' : '#ffffff',
                      border: `1px solid ${borderCol}`,
                      borderRadius: '8px',
                      padding: '5px 8px',
                      cursor: 'pointer',
                      color: textTitle,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {isExp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* ZONA CONTENT: TABLE OF SCHOOLS & ACCORDION */}
              {isExp && (
                <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                      <thead>
                        <tr style={{ borderBottom: `1.5px solid ${borderCol}`, textAlign: 'left', color: textSub }}>
                          <th style={{ padding: '8px 10px', width: '36px' }}>#</th>
                          <th style={{ padding: '8px 10px' }}>Local de Votación / Colegio</th>
                          <th style={{ padding: '8px 10px' }}>Dirección / Ubicación</th>
                          <th style={{ padding: '8px 10px', textAlign: 'center', width: '70px' }}>Mesas</th>
                          <th style={{ padding: '8px 10px', textAlign: 'center', width: '110px' }}>Personeros</th>
                          <th style={{ padding: '8px 10px', textAlign: 'center', width: '120px' }}>Estado</th>
                          <th style={{ padding: '8px 10px', textAlign: 'center', width: '180px' }}>Acción Directa</th>
                        </tr>
                      </thead>
                      <tbody>
                        {zData.colegios.map((col, cIdx) => {
                          const isSchoolExpanded = !!expandedSchools[col.colegio];
                          const hasFull = col.status === 'full';
                          const hasPartial = col.status === 'partial';
                          const hasEmpty = col.status === 'empty';

                          return (
                            <React.Fragment key={col.colegio || cIdx}>
                              {/* MAIN SCHOOL ROW (NOT clickable on row, ONLY button triggers expansion) */}
                              <tr
                                style={{
                                  borderBottom: isSchoolExpanded ? 'none' : `1px solid ${borderCol}`,
                                  background: isSchoolExpanded
                                    ? (isDark ? 'rgba(2, 132, 199, 0.12)' : '#f0f9ff')
                                    : (cIdx % 2 === 0 ? 'transparent' : (isDark ? 'rgba(255,255,255,0.015)' : '#f8fafc')),
                                  transition: 'background 0.15s'
                                }}
                              >
                                <td style={{ padding: '9px 10px', fontWeight: 800, color: textSub }}>
                                  {cIdx + 1}
                                </td>

                                <td style={{ padding: '9px 10px' }}>
                                  <div style={{ fontWeight: 800, color: textTitle, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <School className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                                    <span style={{ fontSize: '0.82rem' }}>{col.colegio}</span>
                                    {col.pcv && (
                                      <span
                                        title={`Coordinador de Local (PCV): ${col.pcv['Nombres y Apellidos'] || col.pcv.nombresApellidos || ''}`}
                                        style={{
                                          background: 'rgba(16, 185, 129, 0.15)',
                                          color: '#059669',
                                          border: '1px solid #10b981',
                                          fontSize: '0.62rem',
                                          fontWeight: 800,
                                          padding: '1px 5px',
                                          borderRadius: '4px',
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '2px'
                                        }}
                                      >
                                        <Shield className="w-2.5 h-2.5" /> PCV
                                      </span>
                                    )}
                                  </div>
                                </td>

                                <td style={{ padding: '9px 10px', color: textSub }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                    <span style={{ fontSize: '0.74rem' }}>{col.direccion || '—'}</span>
                                  </div>
                                </td>

                                <td style={{ padding: '9px 10px', textAlign: 'center' }}>
                                  <span style={{
                                    background: isDark ? 'rgba(2, 132, 199, 0.2)' : '#e0f2fe',
                                    color: '#0284c7',
                                    fontWeight: 900,
                                    fontSize: '0.74rem',
                                    padding: '2px 8px',
                                    borderRadius: '6px'
                                  }}>
                                    {col.mesas}
                                  </span>
                                </td>

                                <td style={{ padding: '9px 10px', textAlign: 'center' }}>
                                  <span style={{
                                    background: hasFull ? '#dcfce7' : hasPartial ? '#fef9c3' : (isDark ? '#334155' : '#f1f5f9'),
                                    color: hasFull ? '#166534' : hasPartial ? '#854d0e' : textSub,
                                    fontWeight: 900,
                                    fontSize: '0.76rem',
                                    padding: '2px 8px',
                                    borderRadius: '6px'
                                  }}>
                                    {col.assignedCount} / {col.mesas}
                                  </span>
                                </td>

                                <td style={{ padding: '9px 10px', textAlign: 'center' }}>
                                  <span style={{
                                    background: hasFull ? '#dcfce7' : hasPartial ? '#fef9c3' : '#fee2e2',
                                    color: hasFull ? '#166534' : hasPartial ? '#854d0e' : '#991b1b',
                                    fontSize: '0.7rem',
                                    fontWeight: 800,
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                    whiteSpace: 'nowrap',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px'
                                  }}>
                                    {hasFull && '✅ Cubierto'}
                                    {hasPartial && '⏳ Parcial'}
                                    {hasEmpty && '❌ Sin Personero'}
                                  </span>
                                </td>

                                <td style={{ padding: '9px 10px', textAlign: 'center' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                    {/* Dedicated expansion trigger button */}
                                    <button
                                      type="button"
                                      onClick={() => toggleSchool(col.colegio)}
                                      style={{
                                        background: isSchoolExpanded ? '#0284c7' : (isDark ? '#334155' : '#f1f5f9'),
                                        color: isSchoolExpanded ? '#ffffff' : textTitle,
                                        border: `1px solid ${isSchoolExpanded ? '#0284c7' : borderCol}`,
                                        borderRadius: '6px',
                                        padding: '4px 8px',
                                        fontSize: '0.71rem',
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        transition: 'all 0.15s ease'
                                      }}
                                    >
                                      <Users className="w-3 h-3" />
                                      <span>{isSchoolExpanded ? 'Ocultar' : `Ver Personeros (${col.assignedCount})`}</span>
                                      {isSchoolExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                    </button>

                                    {onFilterByLocal && (
                                      <button
                                        type="button"
                                        onClick={() => onFilterByLocal(col.colegio)}
                                        title="Abrir este colegio en el padrón general"
                                        style={{
                                          background: 'transparent',
                                          border: `1px solid ${borderCol}`,
                                          color: textSub,
                                          borderRadius: '6px',
                                          padding: '4px 6px',
                                          fontSize: '0.71rem',
                                          cursor: 'pointer',
                                          display: 'inline-flex',
                                          alignItems: 'center'
                                        }}
                                      >
                                        <ExternalLink className="w-3 h-3 text-blue-500" />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>

                              {/* EXPANDED SCHOOL DETAIL SUB-PANEL */}
                              {isSchoolExpanded && (
                                <tr>
                                  <td colSpan={7} style={{ padding: '0 0 12px 0', borderBottom: `1.5px solid ${borderCol}` }}>
                                    <div style={{
                                      background: isDark ? '#0f172a' : '#f8fafc',
                                      border: `1.5px solid ${isDark ? '#0284c7' : '#bae6fd'}`,
                                      borderRadius: '12px',
                                      margin: '4px 10px 8px 10px',
                                      padding: '16px 18px',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: '14px',
                                      boxShadow: isDark ? 'inset 0 2px 8px rgba(0,0,0,0.3)' : 'inset 0 2px 8px rgba(2,132,199,0.05)'
                                    }}>
                                      {/* SUB-HEADER: SCHOOL SUMMARY & COVERAGE BAR */}
                                      <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        flexWrap: 'wrap',
                                        gap: '10px',
                                        borderBottom: `1px solid ${borderCol}`,
                                        paddingBottom: '10px'
                                      }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(2,132,199,0.15)', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <School className="w-4 h-4" />
                                          </div>
                                          <div>
                                            <div style={{ fontWeight: 900, fontSize: '0.92rem', color: textTitle }}>
                                              {col.colegio}
                                            </div>
                                            <div style={{ fontSize: '0.74rem', color: textSub }}>
                                              {col.direccion || 'Sin dirección registrada'}
                                            </div>
                                          </div>
                                        </div>

                                        {/* Coverage Indicator */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                          <div style={{
                                            background: hasFull ? '#dcfce7' : hasPartial ? '#fef9c3' : '#fee2e2',
                                            color: hasFull ? '#166534' : hasPartial ? '#854d0e' : '#991b1b',
                                            border: `1px solid ${hasFull ? '#86efac' : hasPartial ? '#fde047' : '#fca5a5'}`,
                                            padding: '4px 10px',
                                            borderRadius: '8px',
                                            fontSize: '0.74rem',
                                            fontWeight: 800,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '5px'
                                          }}>
                                            {hasFull && <CheckCircle2 className="w-3.5 h-3.5" />}
                                            {hasPartial && <AlertTriangle className="w-3.5 h-3.5" />}
                                            {hasEmpty && <XCircle className="w-3.5 h-3.5" />}
                                            <span>
                                              {hasFull && `¡100% Cubierto! (${col.assignedCount} personeros para ${col.mesas} mesas)`}
                                              {hasPartial && `Parcial: ${col.assignedCount} de ${col.mesas} mesas cubiertas (Faltan ${col.mesas - col.assignedCount} personeros)`}
                                              {hasEmpty && `Sin personeros asignados (Meta: ${col.mesas} mesas)`}
                                            </span>
                                          </div>

                                          {onFilterByLocal && (
                                            <button
                                              type="button"
                                              onClick={() => onFilterByLocal(col.colegio)}
                                              style={{
                                                background: '#0284c7',
                                                color: '#ffffff',
                                                border: 'none',
                                                borderRadius: '8px',
                                                padding: '5px 12px',
                                                fontSize: '0.74rem',
                                                fontWeight: 800,
                                                cursor: 'pointer',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '5px'
                                              }}
                                            >
                                              <Search className="w-3.5 h-3.5" />
                                              <span>Abrir en Padrón</span>
                                            </button>
                                          )}
                                        </div>
                                      </div>

                                      {/* PCV COORDINATOR CARD */}
                                      {col.pcv ? (
                                        <div style={{
                                          background: isDark ? 'rgba(16, 185, 129, 0.12)' : '#ecfdf5',
                                          border: '1.5px solid #10b981',
                                          borderRadius: '10px',
                                          padding: '10px 14px',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'space-between',
                                          flexWrap: 'wrap',
                                          gap: '10px'
                                        }}>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{
                                              background: '#10b981',
                                              color: '#ffffff',
                                              padding: '3px 8px',
                                              borderRadius: '6px',
                                              fontSize: '0.7rem',
                                              fontWeight: 900,
                                              display: 'inline-flex',
                                              alignItems: 'center',
                                              gap: '3px'
                                            }}>
                                              <Shield className="w-3 h-3" /> Coordinador de Local (PCV)
                                            </span>
                                            <strong style={{ fontSize: '0.86rem', color: textTitle }}>
                                              {col.pcv['Nombres y Apellidos'] || col.pcv.nombresApellidos || 'Coordinador Asignado'}
                                            </strong>
                                            <span style={{ fontSize: '0.74rem', color: textSub }}>
                                              (DNI: <strong>{col.pcv['D.N.I.'] || col.pcv.dni || '—'}</strong>)
                                            </span>
                                          </div>

                                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {(col.pcv['Celular'] || col.pcv.celular) && (
                                              <a
                                                href={`https://wa.me/51${String(col.pcv['Celular'] || col.pcv.celular).replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${col.pcv['Nombres y Apellidos'] || ''}, te saludo desde la coordinación distrital de Somos Perú para coordinar sobre tu local ${col.colegio}.`)}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                style={{
                                                  background: '#16a34a',
                                                  color: '#ffffff',
                                                  padding: '4px 10px',
                                                  borderRadius: '6px',
                                                  fontSize: '0.72rem',
                                                  fontWeight: 800,
                                                  textDecoration: 'none',
                                                  display: 'inline-flex',
                                                  alignItems: 'center',
                                                  gap: '4px'
                                                }}
                                              >
                                                <Phone className="w-3 h-3" />
                                                <span>WhatsApp: {col.pcv['Celular'] || col.pcv.celular}</span>
                                              </a>
                                            )}

                                            {onSelectPersonero && (
                                              <button
                                                type="button"
                                                onClick={() => onSelectPersonero(col.pcv)}
                                                style={{
                                                  background: isDark ? '#334155' : '#ffffff',
                                                  border: `1px solid ${borderCol}`,
                                                  color: textTitle,
                                                  padding: '4px 8px',
                                                  borderRadius: '6px',
                                                  fontSize: '0.72rem',
                                                  fontWeight: 700,
                                                  cursor: 'pointer'
                                                }}
                                              >
                                                Ver Ficha
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      ) : (
                                        <div style={{
                                          background: isDark ? 'rgba(245, 158, 11, 0.08)' : '#fffbeb',
                                          border: '1px dashed #f59e0b',
                                          borderRadius: '8px',
                                          padding: '8px 12px',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '8px',
                                          fontSize: '0.76rem',
                                          color: '#d97706',
                                          fontWeight: 700
                                        }}>
                                          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                                          <span>⚠️ Este local aún no tiene un Personero de Centro (PCV / Coordinador de Local) asignado.</span>
                                        </div>
                                      )}

                                      {/* PERSONEROS LIST / TABLE */}
                                      <div>
                                        <div style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'space-between',
                                          marginBottom: '8px'
                                        }}>
                                          <span style={{ fontSize: '0.78rem', fontWeight: 900, color: textTitle, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Users className="w-4 h-4 text-blue-500" />
                                            Personeros Registrados ({col.personeros.length})
                                          </span>
                                          <span style={{ fontSize: '0.72rem', color: textSub }}>
                                            {col.acreditadosCount} acreditados con credencial confirmada
                                          </span>
                                        </div>

                                        {col.personeros.length === 0 ? (
                                          <div style={{
                                            background: isDark ? '#1e293b' : '#ffffff',
                                            border: `1px solid ${borderCol}`,
                                            borderRadius: '10px',
                                            padding: '24px 16px',
                                            textAlign: 'center',
                                            color: textSub
                                          }}>
                                            <Users className="w-7 h-7 text-slate-400 mx-auto mb-2" />
                                            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.82rem', color: textTitle }}>
                                              No hay personeros registrados en este local de votación.
                                            </p>
                                            <p style={{ margin: '4px 0 0 0', fontSize: '0.74rem' }}>
                                              Se necesitan {col.mesas} personeros de mesa para cubrir todas las mesas.
                                            </p>
                                          </div>
                                        ) : (
                                          <div style={{
                                            background: isDark ? '#1e293b' : '#ffffff',
                                            border: `1px solid ${borderCol}`,
                                            borderRadius: '10px',
                                            overflow: 'hidden'
                                          }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                                              <thead>
                                                <tr style={{ background: isDark ? '#0f172a' : '#f1f5f9', color: textSub, borderBottom: `1px solid ${borderCol}`, textAlign: 'left' }}>
                                                  <th style={{ padding: '6px 10px', width: '30px' }}>#</th>
                                                  <th style={{ padding: '6px 10px' }}>Personero</th>
                                                  <th style={{ padding: '6px 10px', width: '90px' }}>D.N.I.</th>
                                                  <th style={{ padding: '6px 10px', width: '110px', textAlign: 'center' }}>Mesa</th>
                                                  <th style={{ padding: '6px 10px', width: '140px' }}>Rol</th>
                                                  <th style={{ padding: '6px 10px', width: '100px', textAlign: 'center' }}>Credencial</th>
                                                  <th style={{ padding: '6px 10px', width: '130px', textAlign: 'center' }}>WhatsApp</th>
                                                  {onSelectPersonero && <th style={{ padding: '6px 10px', width: '70px', textAlign: 'center' }}>Ficha</th>}
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {col.personeros.map((p, pIdx) => {
                                                  const pName = p['Nombres y Apellidos'] || p.nombresApellidos || p.nombres_apellidos || '—';
                                                  const pDni = p['D.N.I.'] || p['DNI'] || p.dni || '—';
                                                  const pCel = p['Celular'] || p.celular || '';
                                                  const pMesa = p['Mesa'] || p.mesa || p['Mesa de Sufragio'] || '—';
                                                  const pRol = p['Rol a Desempeñar'] || p.rolADesempenar || p.rol_electoral || 'Personero de Mesa';
                                                  const pCred = String(p['Credenciales'] || p.credenciales || '').toLowerCase();
                                                  const isAcred = pCred === 'confirmado';
                                                  const isPCV = isPCVRole(pRol);

                                                  return (
                                                    <tr
                                                      key={pIdx}
                                                      style={{
                                                        borderBottom: pIdx === col.personeros.length - 1 ? 'none' : `1px solid ${borderCol}`,
                                                        background: pIdx % 2 === 0 ? 'transparent' : (isDark ? 'rgba(255,255,255,0.015)' : '#fafafa')
                                                      }}
                                                    >
                                                      <td style={{ padding: '7px 10px', fontWeight: 800, color: textSub }}>
                                                        {pIdx + 1}
                                                      </td>

                                                      <td style={{ padding: '7px 10px' }}>
                                                        <div style={{ fontWeight: 800, color: textTitle, display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                          <span>{pName}</span>
                                                          {isPCV && (
                                                            <span style={{
                                                              background: '#10b981',
                                                              color: '#fff',
                                                              fontSize: '0.6rem',
                                                              fontWeight: 900,
                                                              padding: '1px 4px',
                                                              borderRadius: '4px'
                                                            }}>
                                                              PCV
                                                            </span>
                                                          )}
                                                        </div>
                                                      </td>

                                                      <td style={{ padding: '7px 10px', fontWeight: 700, color: textTitle }}>
                                                        {pDni}
                                                      </td>

                                                      <td style={{ padding: '7px 10px', textAlign: 'center' }}>
                                                        <span style={{
                                                          background: pMesa && pMesa !== '—' ? (isDark ? '#334155' : '#e0f2fe') : 'transparent',
                                                          color: pMesa && pMesa !== '—' ? '#0284c7' : textSub,
                                                          fontWeight: 800,
                                                          padding: '2px 6px',
                                                          borderRadius: '4px',
                                                          fontSize: '0.71rem'
                                                        }}>
                                                          {pMesa && pMesa !== '—' ? `🗳️ Mesa ${pMesa}` : 'Sin mesa'}
                                                        </span>
                                                      </td>

                                                      <td style={{ padding: '7px 10px', color: textSub, fontSize: '0.71rem' }}>
                                                        {pRol}
                                                      </td>

                                                      <td style={{ padding: '7px 10px', textAlign: 'center' }}>
                                                        <span style={{
                                                          background: isAcred ? '#dcfce7' : '#fef9c3',
                                                          color: isAcred ? '#15803d' : '#854d0e',
                                                          border: `1px solid ${isAcred ? '#86efac' : '#fde047'}`,
                                                          fontSize: '0.65rem',
                                                          fontWeight: 800,
                                                          padding: '2px 6px',
                                                          borderRadius: '6px'
                                                        }}>
                                                          {isAcred ? '✅ Acreditado' : '⏳ Pendiente'}
                                                        </span>
                                                      </td>

                                                      <td style={{ padding: '7px 10px', textAlign: 'center' }}>
                                                        {pCel ? (
                                                          <a
                                                            href={`https://wa.me/51${String(pCel).replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${pName}, te saludo de la coordinación electoral de Somos Perú en Villa María del Triunfo para coordinar tu labor en el local ${col.colegio}.`)}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            style={{
                                                              background: '#16a34a',
                                                              color: '#ffffff',
                                                              padding: '3px 8px',
                                                              borderRadius: '6px',
                                                              fontSize: '0.68rem',
                                                              fontWeight: 800,
                                                              textDecoration: 'none',
                                                              display: 'inline-flex',
                                                              alignItems: 'center',
                                                              gap: '3px'
                                                            }}
                                                          >
                                                            <Phone className="w-2.5 h-2.5" />
                                                            <span>{pCel}</span>
                                                          </a>
                                                        ) : (
                                                          <span style={{ fontSize: '0.7rem', color: textSub }}>—</span>
                                                        )}
                                                      </td>

                                                      {onSelectPersonero && (
                                                        <td style={{ padding: '7px 10px', textAlign: 'center' }}>
                                                          <button
                                                            type="button"
                                                            onClick={() => onSelectPersonero(p)}
                                                            style={{
                                                              background: 'transparent',
                                                              border: `1px solid ${borderCol}`,
                                                              color: textTitle,
                                                              padding: '2px 6px',
                                                              borderRadius: '4px',
                                                              fontSize: '0.68rem',
                                                              cursor: 'pointer'
                                                            }}
                                                          >
                                                            <Eye className="w-3 h-3 text-blue-500" />
                                                          </button>
                                                        </td>
                                                      )}
                                                    </tr>
                                                  );
                                                })}
                                              </tbody>
                                            </table>
                                          </div>
                                        )}
                                      </div>

                                      {/* QUICK FOOTER */}
                                      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '4px' }}>
                                        {onFilterByLocal && (
                                          <button
                                            type="button"
                                            onClick={() => onFilterByLocal(col.colegio)}
                                            style={{
                                              background: 'transparent',
                                              border: 'none',
                                              color: '#0284c7',
                                              fontSize: '0.74rem',
                                              fontWeight: 800,
                                              cursor: 'pointer',
                                              display: 'inline-flex',
                                              alignItems: 'center',
                                              gap: '4px'
                                            }}
                                          >
                                            <span>Gestionar o registrar más personeros en {col.colegio}</span>
                                            <ChevronRight className="w-3.5 h-3.5" />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {Object.keys(filteredZonas).length === 0 && (
          <div style={{
            background: bgCard,
            border: `1px solid ${borderCol}`,
            borderRadius: '12px',
            padding: '40px 20px',
            textAlign: 'center',
            color: textSub
          }}>
            <Building2 className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p style={{ fontWeight: 700, margin: 0 }}>No se encontraron colegios con el filtro ingresado.</p>
          </div>
        )}
      </div>
    </div>
  );
}
